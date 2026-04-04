import { calculatePointsPerNight } from '@/lib/pointsCalculation';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  capacity: number;
  chambres: number;
  equipements: string[];
  className?: string;
  precomputed?: number;
}

export function PointsPerNightDisplay({ capacity, chambres, equipements, className, precomputed }: Props) {
  const { t } = useTranslation();
  const points = precomputed ?? calculatePointsPerNight(capacity, chambres, equipements);

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold text-amber-600", className)}>
      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
      {points} {t('homeExchange.pointsPerNight')}
    </span>
  );
}
