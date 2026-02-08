import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Demandée', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400' },
  confirmed: { label: 'Acceptée', className: 'bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400' },
  cancelled: { label: 'Refusée', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  completed: { label: 'Réalisée', className: 'bg-primary/15 text-primary border-primary/30' },
};

interface VisitStatusBadgeProps {
  status: string;
}

export function VisitStatusBadge({ status }: VisitStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
