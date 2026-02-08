import { Bell, Smartphone, Mail, MessageSquare, Newspaper } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface NotificationPrefs {
  notif_push: boolean;
  notif_email: boolean;
  notif_whatsapp: boolean;
  notif_newsletter: boolean;
}

interface NotificationSettingsProps {
  prefs: NotificationPrefs;
  onToggle: (key: keyof NotificationPrefs, value: boolean) => void;
}

const NOTIFICATION_OPTIONS: {
  key: keyof NotificationPrefs;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'notif_push',
    label: 'Notifications Mobile (Push)',
    description: 'Recevez des alertes directement sur votre téléphone',
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    key: 'notif_email',
    label: 'Notifications Email',
    description: 'Recevez des notifications par email',
    icon: <Mail className="h-4 w-4" />,
  },
  {
    key: 'notif_whatsapp',
    label: 'Notifications WhatsApp',
    description: 'Recevez des messages via WhatsApp',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    key: 'notif_newsletter',
    label: 'Newsletter',
    description: 'Offres et actualités par email',
    icon: <Newspaper className="h-4 w-4" />,
  },
];

export function NotificationSettings({ prefs, onToggle }: NotificationSettingsProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-bold text-foreground">Notifications</h3>
      </div>
      <p className="text-sm text-muted-foreground -mt-2">
        Gérez vos préférences de notifications
      </p>

      <div className="space-y-1">
        {NOTIFICATION_OPTIONS.map((opt, idx) => (
          <div
            key={opt.key}
            className={`flex items-center justify-between py-3 ${
              idx < NOTIFICATION_OPTIONS.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground mt-0.5">{opt.icon}</span>
              <div>
                <p className="font-medium text-foreground text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
            </div>
            <Switch
              checked={prefs[opt.key]}
              onCheckedChange={(checked) => onToggle(opt.key, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
