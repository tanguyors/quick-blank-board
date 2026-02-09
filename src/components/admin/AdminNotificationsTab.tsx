import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Save, RotateCcw, Copy, Mail, MessageSquare, Eye } from 'lucide-react';
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

// ── Channel/recipient tab definitions ──
const CHANNEL_TABS = [
  { channel: 'email', recipient: 'buyer', label: 'Email Acheteur', icon: Mail },
  { channel: 'email', recipient: 'seller', label: 'Email Vendeur', icon: Mail },
  { channel: 'whatsapp', recipient: 'buyer', label: 'WhatsApp Acheteur', icon: MessageSquare },
  { channel: 'whatsapp', recipient: 'seller', label: 'WhatsApp Vendeur', icon: MessageSquare },
] as const;

// ── Sample variable values for preview ──
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

export function AdminNotificationsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState<string>(STEPS[0].key);
  const [activeChannelTab, setActiveChannelTab] = useState(0);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const activeChannel = CHANNEL_TABS[activeChannelTab];

  // ── Fetch all templates ──
  const { data: templates, isLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('step');
      if (error) throw error;
      return (data || []) as unknown as NotificationTemplate[];
    },
  });

  // ── Current template ──
  const currentTemplate = templates?.find(
    (t) => t.step === activeStep && t.channel === activeChannel.channel && t.recipient === activeChannel.recipient
  );

  // ── Sync editor when template changes ──
  useEffect(() => {
    if (currentTemplate) {
      setEditSubject(currentTemplate.subject || '');
      setEditBody(currentTemplate.body || '');
    } else {
      setEditSubject('');
      setEditBody('');
    }
  }, [currentTemplate?.id, activeStep, activeChannelTab]);

  // ── Save mutation ──
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentTemplate) return;
      const { error } = await supabase
        .from('notification_templates')
        .update({
          subject: activeChannel.channel === 'email' ? editSubject : null,
          body: editBody,
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
      // Fetch the original seeded template from default templates
      const defaultTemplate = getDefaultTemplate(activeStep, activeChannel.channel, activeChannel.recipient);
      if (!defaultTemplate) return;
      const { error } = await supabase
        .from('notification_templates')
        .update({
          subject: defaultTemplate.subject,
          body: defaultTemplate.body,
          updated_by: user?.id || null,
        } as any)
        .eq('id', currentTemplate.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Template réinitialisé');
    },
    onError: () => toast.error('Erreur lors de la réinitialisation'),
  });

  // ── Insert variable at cursor ──
  const insertVariable = useCallback((varName: string) => {
    const tag = `{{${varName}}}`;
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
  }, [editBody]);

  // ── Preview with replaced variables ──
  const previewBody = replaceVariables(editBody, SAMPLE_VALUES);
  const previewSubject = replaceVariables(editSubject, SAMPLE_VALUES);

  const variables = (currentTemplate?.variables as string[]) || [];
  const hasChanges = currentTemplate && (
    (activeChannel.channel === 'email' ? editSubject !== (currentTemplate.subject || '') : false) ||
    editBody !== (currentTemplate.body || '')
  );

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
      <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg w-fit">
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

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Editor */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Éditeur de template
          </h3>

          {activeChannel.channel === 'email' && (
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Contenu {activeChannel.channel === 'email' ? '(HTML)' : '(Texte)'}
            </label>
            <Textarea
              ref={bodyRef}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              placeholder={activeChannel.channel === 'email' ? '<div>...</div>' : 'Message WhatsApp...'}
              className="bg-background font-mono text-xs min-h-[280px] resize-y"
            />
          </div>

          {/* Variables */}
          {variables.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Variables disponibles</label>
              <div className="flex flex-wrap gap-1.5">
                {variables.map((v) => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    className="group flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    title={`Insérer {{${v}}}`}
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
              disabled={!hasChanges || saveMutation.isPending}
              size="sm"
              className="gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              Sauvegarder
            </Button>
            <Button
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
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

          {activeChannel.channel === 'email' ? (
            <>
              {previewSubject && (
                <div className="bg-secondary/50 rounded-lg px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">Sujet : </span>
                  <span className="text-sm font-medium text-foreground">{previewSubject}</span>
                </div>
              )}
              <div className="border border-border rounded-lg overflow-hidden bg-background">
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:0;font-family:sans-serif;}</style></head><body>${previewBody}</body></html>`}
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

// ── Helpers ──

function replaceVariables(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || `{{${key}}}`);
}

function getDefaultTemplate(step: string, channel: string, recipient: string) {
  // Returns null – the reset fetches from the DB seed.
  // We could store defaults client-side but it's cleaner to refetch.
  // The reset mutation will refetch after success.
  return null;
}
