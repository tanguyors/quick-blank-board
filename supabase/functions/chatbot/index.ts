import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHAT_API_URL = "https://apichatbot-proxy.vercel.app/api/chat";
const CHAT_API_KEY = "MonSecret-Chatbot-2026-SOMA";

const SYSTEM_CONTEXT = `Tu es l'assistant IA de SomaGate, la première plateforme d'intelligence immobilière à Bali.
Règles :
- Réponds dans la langue de l'utilisateur
- Sois concis, professionnel et utile
- Si tu ne sais pas, dis-le honnêtement
- Ne donne jamais de conseil juridique ou financier
- Mentionne que SomaGate peut mettre en relation avec un professionnel si nécessaire
- Base tes réponses sur le contexte fourni ci-dessous quand il est pertinent`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, messages } = await req.json();
    const userMessage = message || messages?.[messages.length - 1]?.content || "";
    if (!userMessage) throw new Error("No message provided");

    // RAG: Search relevant documents
    let ragContext = "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase.rpc("search_rag_documents", {
          query_text: userMessage,
          match_count: 4,
        });
        if (data?.length) {
          ragContext = data.map((d: any) => `[${d.category}] ${d.title}: ${d.content}`).join("\n\n");
        }
      }
    } catch (e) {
      console.error("RAG search error:", e);
    }

    // Build enriched message with RAG context
    const enrichedMessage = ragContext
      ? `${SYSTEM_CONTEXT}\n\n[CONTEXTE SOMAGATE]\n${ragContext}\n\n[QUESTION]\n${userMessage}`
      : `${SYSTEM_CONTEXT}\n\n[QUESTION]\n${userMessage}`;

    // Call external chatbot API
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CHAT_API_KEY,
      },
      body: JSON.stringify({ message: enrichedMessage }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Chatbot API error:", response.status, errorText);
      return new Response(JSON.stringify({
        reply: "Désolé, je suis temporairement indisponible. Veuillez réessayer dans quelques instants."
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ reply: data.reply || data.message || data.response || "Pas de réponse" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chatbot error:", e);
    return new Response(JSON.stringify({ reply: "Erreur de connexion. Veuillez réessayer." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
