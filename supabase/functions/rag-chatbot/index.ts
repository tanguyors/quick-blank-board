import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es l'assistant IA de SOMA GATE, la première plateforme d'intelligence immobilière à Bali.

RÈGLES STRICTES :
- Réponds TOUJOURS dans la langue de l'utilisateur
- Sois concis, professionnel et bienveillant
- Si tu ne sais pas, dis-le honnêtement
- Ne donne JAMAIS de conseil juridique ou financier direct
- Redirige vers un professionnel (notaire, avocat) pour les questions légales complexes
- Mentionne que SomaGate peut mettre en relation avec un conseiller si nécessaire
- Base tes réponses sur le CONTEXTE fourni ci-dessous, ne fabrique pas d'informations

CONTEXTE (extraits de la base de connaissances SomaGate) :
{context}

Si le contexte ne contient pas l'information demandée, réponds avec tes connaissances générales en le précisant.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // RAG: Search relevant documents
    let context = "";
    try {
      const { data: docs } = await supabase.rpc("search_rag_documents", {
        query_text: lastMessage,
        match_count: 5,
      });

      if (docs && docs.length > 0) {
        context = docs
          .map(
            (d: any) =>
              `[${d.category.toUpperCase()}] ${d.title}\n${d.content}`
          )
          .join("\n\n---\n\n");
      }
    } catch (e) {
      console.error("RAG search error:", e);
    }

    // If no docs found, provide a minimal context
    if (!context) {
      context =
        "Aucun document spécifique trouvé. Réponds avec tes connaissances générales sur l'immobilier à Bali.";
    }

    // Build system prompt with context
    const systemPrompt = SYSTEM_PROMPT.replace("{context}", context);

    // Try Claude API first, fallback to Lovable/Gemini
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (anthropicKey) {
      // Use Claude API
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: systemPrompt,
          messages: messages.map((m: any) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
          stream: true,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Claude API error:", response.status, errText);
        throw new Error(`Claude API error: ${response.status}`);
      }

      // Transform Claude SSE stream to OpenAI-compatible format (for the existing frontend)
      const reader = response.body!.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  continue;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                    // Convert to OpenAI-compatible format
                    const chunk = {
                      choices: [{
                        delta: { content: parsed.delta.text },
                        index: 0,
                      }],
                    };
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
                    );
                  }
                  if (parsed.type === "message_stop") {
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  }
                } catch {}
              }
            }
          } catch (e) {
            console.error("Stream error:", e);
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else if (lovableKey) {
      // Fallback to Lovable/Gemini gateway
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages,
            ],
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Trop de requêtes." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error(`Lovable API error: ${response.status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else {
      throw new Error("No AI API key configured (ANTHROPIC_API_KEY or LOVABLE_API_KEY)");
    }
  } catch (e) {
    console.error("rag-chatbot error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Erreur inconnue",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
