import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CertifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CertifiedBadge({ className, size = 'sm', showLabel = true }: CertifiedBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        sizeClasses[size],
        className
      )}
    >
      <Shield className={iconSizes[size]} />
      {showLabel && 'Client Certifié'}
    </span>
  );
}