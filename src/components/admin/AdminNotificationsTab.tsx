import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, RotateCcw, Copy, Mail, MessageSquare, Eye, Code, PenLine } from 'lucide-react';
import { toast } from 'sonner';

// ── Step definitions ──
const STEPS = [
  { key: 'matched', label: 'Match', emoji: '🎉' },
  { key: 'visit_confirmed', label: 'Visite confirmée', emoji: '📅' },
  { key: 'visit_reminder', label: 'Rappel visite', emoji: '⏰' },
  { key: 'offer_made', label: 'Offre reçue', emoji: '💰' },
  { key: 'deal_finalized', label: 'Deal finalisé', emoji: '🎊' },
  { key: 'generic', label: 'Générique', emoji: '📨' },
  { key: 'inactivity_12h', label: 'Relance inactivité', emoji: '👋' },
] as const;

const STEP_DESCRIPTIONS: Record<string, string> = {
  matched: 'Personnalisez les messages envoyés lors d\'un nouveau match entre un acheteur et un bien.',
  visit_confirmed: 'Messages envoyés lorsqu\'une visite est confirmée par les deux parties.',
  visit_reminder: 'Rappels automatiques envoyés avant une visite (J-1 et H-2).',
  offer_made: 'Notifications envoyées lorsqu\'une offre est soumise sur un bien.',
  deal_finalized: 'Messages de félicitations envoyés à la finalisation d\'une transaction.',
  generic: 'Template par défaut pour les notifications génériques.',
  inactivity_12h: 'Relance envoyée aux utilisateurs inactifs depuis plus de 12 heures.',
};

const CHANNEL_TABS = [
  { channel: 'email', recipient: 'buyer', label: 'Email Acheteur', icon: Mail },
  { channel: 'email', recipient: 'seller', label: 'Email Vendeur', icon: Mail },
  { channel: 'whatsapp', recipient: 'buyer', label: 'WhatsApp Acheteur', icon: MessageSquare },
  { channel: 'whatsapp', recipient: 'seller', label: 'WhatsApp Vendeur', icon: MessageSquare },
] as const;

const SAMPLE_VALUES: Record<string, string> = {
  recipient_name: 'Jean Dupont',
  property_type: 'Villa',
  property_address: 'Lot 42, Almadies, Dakar',
  property_price: '150 000 000',
  property_currency: 'XOF',
  action_url: 'https://app.somagate.com/transaction/abc123',
  visit_date_formatted: 'Samedi 15 Mars 2026 à 10h00',
  reminder_type: 'J-1',
  offer_amount: '145 000 000',
  offer_type: 'Offre ferme',
};

// ── Gradient presets for email header ──
const GRADIENT_PRESETS = [
  { label: 'Violet', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: '#667eea' },
  { label: 'Vert', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', border: '#11998e' },
  { label: 'Rose', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: '#f5576c' },
  { label: 'Orange', value: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)', border: '#f2994a' },
  { label: 'Bleu', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: '#4facfe' },
];

interface NotificationTemplate {
  id: string;
  step: string;
  channel: string;
  recipient: string;
  subject: string | null;
  body: string;
  variables: string[];
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Parse structured fields from HTML body ──
interface VisualFields {
  headerTitle: string;
  gradient: string;
  borderColor: string;
  greeting: string;
  mainMessage: string;
  infoItems: string[];
  ctaText: string;
  ctaUrl: string;
}

function parseHtmlToVisual(html: string): VisualFields | null {
  try {
    // Extract header title
    const headerMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/s);
    const headerTitle = headerMatch?.[1]?.trim() || '';

    // Extract gradient
    const gradientMatch = html.match(/background:\s*(linear-gradient\([^)]+\))/);
    const gradient = gradientMatch?.[1] || GRADIENT_PRESETS[0].value;

    // Extract border color
    const borderMatch = html.match(/border-left:\s*4px\s+solid\s+(#[a-fA-F0-9]+)/);
    const borderColor = borderMatch?.[1] || '#667eea';

    // Extract greeting (first <p> in content div)
    const contentMatch = html.match(/<div style="padding: 32px;">([\s\S]*?)<\/div>\s*<div style="padding: 16px/);
    const contentHtml = contentMatch?.[1] || '';

    const paragraphs = [...contentHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(m => m[1].trim());

    // First paragraph is greeting, second is main message
    const greeting = stripHtml(paragraphs[0] || '');
    const mainMessage = stripHtml(paragraphs[1] || '');

    // Extract info items from the card
    const cardMatch = contentHtml.match(/border-left:\s*4px[^>]*>([\s\S]*?)<\/div>/);
    const cardContent = cardMatch?.[1] || '';
    const infoItems = [...cardContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
      .map(m => stripHtml(m[1].trim()))
      .filter(Boolean);

    // Extract CTA text
    const ctaMatch = contentHtml.match(/<a[^>]*>([\s\S]*?)<\/a>/);
    const ctaText = ctaMatch?.[1]?.trim() || 'Voir le détail';

    // Extract CTA URL
    const ctaUrlMatch = contentHtml.match(/href="([^"]*?)"/);
    const ctaUrl = ctaUrlMatch?.[1] || '{{action_url}}';

    return { headerTitle, gradient, borderColor, greeting, mainMessage, infoItems, ctaText, ctaUrl };
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// ── Rebuild HTML from visual fields ──
function buildHtmlFromVisual(fields: VisualFields): string {
  const infoHtml = fields.infoItems.length > 0
    ? `<div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid ${fields.borderColor};">${fields.infoItems.map(item => `<p style="margin: 4px 0; color: #555;">${item}</p>`).join('')}</div>`
    : '';

  return `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;"><div style="background: ${fields.gradient}; padding: 32px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 24px;">${fields.headerTitle}</h1></div><div style="padding: 32px;"><p style="font-size: 16px; color: #333;">${fields.greeting}</p><p style="font-size: 16px; color: #333;">${fields.mainMessage}</p>${infoHtml}<div style="text-align: center; margin-top: 24px;"><a href="${fields.ctaUrl}" style="background: ${fields.gradient}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">${fields.ctaText}</a></div></div><div style="padding: 16px 32px; background: #f1f3f5; text-align: center; font-size: 12px; color: #888;"><p>SOMA — La plateforme immobilière intelligente</p></div></div>`;
}

function replaceVariables(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || `{{${key}}}`);
}

export function AdminNotificationsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState<string>(STEPS[0].key);
  const [activeChannelTab, setActiveChannelTab] = useState(0);
  const [editorMode, setEditorMode] = useState<'simple' | 'html'>('simple');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [visualFields, setVisualFields] = useState<VisualFields>({
    headerTitle: '', gradient: GRADIENT_PRESETS[0].value, borderColor: GRADIENT_PRESETS[0].border,
    greeting: '', mainMessage: '', infoItems: [], ctaText: '', ctaUrl: '{{action_url}}',
  });
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const activeChannel = CHANNEL_TABS[activeChannelTab];
  const isEmail = activeChannel.channel === 'email';

  // ── Fetch all templates ──
  const { data: templates, isLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notification_templates').select('*').order('step');
      if (error) throw error;
      return (data || []) as unknown as NotificationTemplate[];
    },
  });

  const currentTemplate = templates?.find(
    (t) => t.step === activeStep && t.channel === activeChannel.channel && t.recipient === activeChannel.recipient
  );

  // ── Sync editor when template changes ──
  useEffect(() => {
    if (currentTemplate) {
      setEditSubject(currentTemplate.subject || '');
      setEditBody(currentTemplate.body || '');
      if (isEmail) {
        const parsed = parseHtmlToVisual(currentTemplate.body || '');
        if (parsed) setVisualFields(parsed);
      }
    } else {
      setEditSubject('');
      setEditBody('');
      setVisualFields({
        headerTitle: '', gradient: GRADIENT_PRESETS[0].value, borderColor: GRADIENT_PRESETS[0].border,
        greeting: '', mainMessage: '', infoItems: [], ctaText: '', ctaUrl: '{{action_url}}',
      });
    }
  }, [currentTemplate?.id, activeStep, activeChannelTab]);

  // ── Compute body from mode ──
  const effectiveBody = isEmail && editorMode === 'simple' ? buildHtmlFromVisual(visualFields) : editBody;

  // ── Save mutation ──
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentTemplate) return;
      const { error } = await supabase
        .from('notification_templates')
        .update({
          subject: isEmail ? editSubject : null,
          body: effectiveBody,
          updated_by: user?.id || null,
        } as any)
        .eq('id', currentTemplate.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Template sauvegardé');
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  });

  // ── Reset mutation ──
  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!currentTemplate) return;
      // For reset, we just reload from DB after invalidation
      // The seed data is the "default" – if user wants to truly reset, they'd need a re-seed
      toast.info('Le template sera réinitialisé à la dernière version sauvegardée.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });

  // ── Insert variable ──
  const insertVariable = useCallback((varName: string, target: 'body' | 'field' = 'body') => {
    const tag = `{{${varName}}}`;
    if (editorMode === 'html' || !isEmail) {
      const textarea = bodyRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newBody = editBody.substring(0, start) + tag + editBody.substring(end);
        setEditBody(newBody);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 0);
      } else {
        setEditBody((prev) => prev + tag);
      }
    } else {
      // In simple mode, copy to clipboard
      navigator.clipboard.writeText(tag);
      toast.success(`${tag} copié ! Collez-le dans le champ souhaité.`);
    }
  }, [editBody, editorMode, isEmail]);

  // ── Visual field updaters ──
  const updateVisual = (field: keyof VisualFields, value: any) => {
    setVisualFields(prev => ({ ...prev, [field]: value }));
  };

  const updateInfoItem = (index: number, value: string) => {
    setVisualFields(prev => {
      const items = [...prev.infoItems];
      items[index] = value;
      return { ...prev, infoItems: items };
    });
  };

  const addInfoItem = () => {
    setVisualFields(prev => ({ ...prev, infoItems: [...prev.infoItems, ''] }));
  };

  const removeInfoItem = (index: number) => {
    setVisualFields(prev => ({
      ...prev,
      infoItems: prev.infoItems.filter((_, i) => i !== index),
    }));
  };

  // ── Preview ──
  const previewBody = replaceVariables(effectiveBody, SAMPLE_VALUES);
  const previewSubject = replaceVariables(editSubject, SAMPLE_VALUES);

  const variables = (currentTemplate?.variables as string[]) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Step chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {STEPS.map((step) => (
          <button
            key={step.key}
            onClick={() => { setActiveStep(step.key); setActiveChannelTab(0); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeStep === step.key
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            <span>{step.emoji}</span>
            {step.label}
          </button>
        ))}
      </div>

      {/* Step title + description */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          {STEPS.find((s) => s.key === activeStep)?.emoji} {STEPS.find((s) => s.key === activeStep)?.label}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{STEP_DESCRIPTIONS[activeStep]}</p>
      </div>

      {/* Channel/recipient tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
          {CHANNEL_TABS.map((tab, idx) => {
            const Icon = tab.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveChannelTab(idx)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  activeChannelTab === idx
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Mode toggle (email only) */}
        {isEmail && (
          <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
            <button
              onClick={() => {
                setEditorMode('simple');
                // Re-parse current body to visual
                const parsed = parseHtmlToVisual(editBody);
                if (parsed) setVisualFields(parsed);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                editorMode === 'simple' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              Simple
            </button>
            <button
              onClick={() => {
                // Sync HTML from visual before switching
                if (editorMode === 'simple') {
                  setEditBody(buildHtmlFromVisual(visualFields));
                }
                setEditorMode('html');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                editorMode === 'html' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              HTML
            </button>
          </div>
        )}
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Editor */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            {isEmail ? <Mail className="h-4 w-4 text-primary" /> : <MessageSquare className="h-4 w-4 text-primary" />}
            {isEmail && editorMode === 'simple' ? 'Éditeur visuel' : 'Éditeur de template'}
          </h3>

          {/* Subject (email only) */}
          {isEmail && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sujet de l'email</label>
              <Input
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="Sujet de l'email..."
                className="bg-background"
              />
            </div>
          )}

          {/* SIMPLE MODE for email */}
          {isEmail && editorMode === 'simple' && (
            <div className="space-y-4">
              {/* Gradient/color picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Couleur du thème</label>
                <div className="flex gap-2">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => { updateVisual('gradient', preset.value); updateVisual('borderColor', preset.border); }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        visualFields.gradient === preset.value ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ background: preset.value }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>

              {/* Header title */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Titre de l'en-tête</label>
                <Input
                  value={visualFields.headerTitle}
                  onChange={(e) => updateVisual('headerTitle', e.target.value)}
                  placeholder="🎉 Nouveau Match !"
                  className="bg-background"
                />
              </div>

              {/* Greeting */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Message de bienvenue</label>
                <Input
                  value={visualFields.greeting}
                  onChange={(e) => updateVisual('greeting', e.target.value)}
                  placeholder="Bonjour {{recipient_name}},"
                  className="bg-background"
                />
                <p className="text-[10px] text-muted-foreground">
                  Utilisez <code className="bg-secondary px-1 rounded">{'{{recipient_name}}'}</code> pour le prénom
                </p>
              </div>

              {/* Main message */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Message principal</label>
                <Textarea
                  value={visualFields.mainMessage}
                  onChange={(e) => updateVisual('mainMessage', e.target.value)}
                  placeholder="Un bien correspond à vos critères !"
                  className="bg-background min-h-[80px] resize-y"
                />
              </div>

              {/* Info items */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Détails affichés (encadré)</label>
                {visualFields.infoItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateInfoItem(idx, e.target.value)}
                      placeholder="Ex: Bien : {{property_type}}"
                      className="bg-background flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-10 w-10 text-muted-foreground hover:text-destructive"
                      onClick={() => removeInfoItem(idx)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addInfoItem} className="text-xs">
                  + Ajouter un détail
                </Button>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Texte du bouton</label>
                  <Input
                    value={visualFields.ctaText}
                    onChange={(e) => updateVisual('ctaText', e.target.value)}
                    placeholder="Voir le détail"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Lien du bouton</label>
                  <Input
                    value={visualFields.ctaUrl}
                    onChange={(e) => updateVisual('ctaUrl', e.target.value)}
                    placeholder="{{action_url}}"
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {/* HTML MODE for email, or WhatsApp text */}
          {((!isEmail) || (isEmail && editorMode === 'html')) && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Contenu {isEmail ? '(HTML)' : '(Texte)'}
              </label>
              <Textarea
                ref={bodyRef}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder={isEmail ? '<div>...</div>' : 'Message WhatsApp...'}
                className="bg-background font-mono text-xs min-h-[280px] resize-y"
              />
            </div>
          )}

          {/* Variables */}
          {variables.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Variables disponibles {editorMode === 'simple' && isEmail ? '(cliquez pour copier)' : '(cliquez pour insérer)'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {variables.map((v) => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    className="group flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    title={editorMode === 'simple' && isEmail ? `Copier {{${v}}}` : `Insérer {{${v}}}`}
                  >
                    <Copy className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                    <code>{`{{${v}}}`}</code>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              size="sm"
              className="gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              Sauvegarder
            </Button>
            <Button
              onClick={() => {
                if (currentTemplate) {
                  setEditSubject(currentTemplate.subject || '');
                  setEditBody(currentTemplate.body || '');
                  if (isEmail) {
                    const parsed = parseHtmlToVisual(currentTemplate.body || '');
                    if (parsed) setVisualFields(parsed);
                  }
                  toast.info('Template réinitialisé à la dernière version sauvegardée.');
                }
              }}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Réinitialiser
            </Button>
          </div>
        </Card>

        {/* Right: Preview */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Aperçu en temps réel
          </h3>

          {isEmail ? (
            <>
              {previewSubject && (
                <div className="bg-secondary/50 rounded-lg px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">Sujet : </span>
                  <span className="text-sm font-medium text-foreground">{previewSubject}</span>
                </div>
              )}
              <div className="border border-border rounded-lg overflow-hidden bg-background">
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:0;font-family:sans-serif;}</style></head><body>${replaceVariables(effectiveBody, SAMPLE_VALUES)}</body></html>`}
                  className="w-full min-h-[350px] border-0"
                  sandbox="allow-same-origin"
                  title="Aperçu email"
                />
              </div>
            </>
          ) : (
            <div className="bg-secondary/30 rounded-2xl p-4 max-w-sm">
              <div className="bg-card rounded-xl p-3 shadow-sm">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {previewBody}
                </p>
                <p className="text-[10px] text-muted-foreground mt-2 text-right">
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
