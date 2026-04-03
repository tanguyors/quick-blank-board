import { Shield, AlertTriangle, Info } from 'lucide-react';
import { SECURITY_MESSAGES, SecurityMessageType } from '@/types/workflow';
import { useTranslation } from 'react-i18next';

const SECURITY_I18N_KEYS: Record<SecurityMessageType, string> = {
  anti_scam: 'security.antiScam',
  no_phone_exchange: 'security.keepOnPlatform',
  no_show_warning: 'security.respectTime',
  visit_refusal_warning: 'security.refusalImpact',
  litigation_protection: 'security.historyKept',
};

interface SecurityBannerProps {
  type: SecurityMessageType;
}

export function SecurityBanner({ type }: SecurityBannerProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-xl p-3 flex items-start gap-3">
      <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-800 dark:text-amber-200/80 leading-relaxed">
        {t(SECURITY_I18N_KEYS[type])}
      </p>
    </div>
  );
}

interface SecurityAlertProps {
  type: 'warning' | 'info' | 'danger';
  title: string;
  message: string;
}

export function SecurityAlert({ type, title, message }: SecurityAlertProps) {
  const styles = {
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    danger: 'bg-red-500/10 border-red-500/30 text-red-400',
  };

  const Icon = type === 'danger' ? AlertTriangle : type === 'warning' ? AlertTriangle : Info;

  return (
    <div className={`border rounded-xl p-4 flex items-start gap-3 ${styles[type]}`}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs mt-1 opacity-80">{message}</p>
      </div>
    </div>
  );
}
