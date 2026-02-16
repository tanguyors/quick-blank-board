import {
  BedDouble, Bath, Sofa, CookingPot, Waves, TreePalm, Fence,
  ShieldCheck, DoorOpen, ParkingSquare, Heater, Package, UtensilsCrossed,
  Warehouse, Refrigerator, Tv, Wifi, AirVent, WashingMachine, Droplets
} from 'lucide-react';
import { cn } from '@/lib/utils';

const equipmentIconMap: Record<string, { icon: any; emoji: string }> = {
  // Rooms
  chambre: { icon: BedDouble, emoji: '🛏️' },
  bedroom: { icon: BedDouble, emoji: '🛏️' },
  salon: { icon: Sofa, emoji: '🛋️' },
  'living room': { icon: Sofa, emoji: '🛋️' },
  séjour: { icon: Sofa, emoji: '🛋️' },

  // Bathroom
  'salle de bain': { icon: Bath, emoji: '🛁' },
  bathroom: { icon: Bath, emoji: '🛁' },
  toilette: { icon: Droplets, emoji: '🚿' },
  toilet: { icon: Droplets, emoji: '🚿' },
  douche: { icon: Droplets, emoji: '🚿' },

  // Kitchen
  cuisine: { icon: CookingPot, emoji: '🍳' },
  kitchen: { icon: CookingPot, emoji: '🍳' },
  'cuisine équipée': { icon: CookingPot, emoji: '🍳' },
  réfrigérateur: { icon: Refrigerator, emoji: '🧊' },

  // Outdoor
  piscine: { icon: Waves, emoji: '🏊' },
  swimming: { icon: Waves, emoji: '🏊' },
  jardin: { icon: TreePalm, emoji: '🌴' },
  garden: { icon: TreePalm, emoji: '🌴' },
  terrasse: { icon: Fence, emoji: '☀️' },
  balcon: { icon: Fence, emoji: '🌿' },
  balcony: { icon: Fence, emoji: '🌿' },

  // Security & access
  sécurité: { icon: ShieldCheck, emoji: '🛡️' },
  security: { icon: ShieldCheck, emoji: '🛡️' },
  ascenseur: { icon: DoorOpen, emoji: '🛗' },
  elevator: { icon: DoorOpen, emoji: '🛗' },
  parking: { icon: ParkingSquare, emoji: '🅿️' },
  garage: { icon: ParkingSquare, emoji: '🚗' },

  // Comfort
  chauffage: { icon: Heater, emoji: '🔥' },
  heating: { icon: Heater, emoji: '🔥' },
  climatisation: { icon: AirVent, emoji: '❄️' },
  'air conditionné': { icon: AirVent, emoji: '❄️' },
  wifi: { icon: Wifi, emoji: '📶' },
  tv: { icon: Tv, emoji: '📺' },
  'lave-linge': { icon: WashingMachine, emoji: '🧺' },

  // Storage & misc
  rangement: { icon: Package, emoji: '📦' },
  storage: { icon: Package, emoji: '📦' },
  buanderie: { icon: Warehouse, emoji: '🏠' },
  'salle à manger': { icon: UtensilsCrossed, emoji: '🍽️' },
  meublé: { icon: Sofa, emoji: '🪑' },
};

function findEquipment(name: string) {
  const lower = name.toLowerCase().trim();
  if (equipmentIconMap[lower]) return equipmentIconMap[lower];
  for (const key of Object.keys(equipmentIconMap)) {
    if (lower.includes(key) || key.includes(lower)) return equipmentIconMap[key];
  }
  return null;
}

interface EquipmentIconProps {
  name: string;
  className?: string;
}

export function EquipmentIcon({ name, className }: EquipmentIconProps) {
  const match = findEquipment(name);

  return (
    <div className={cn(
      "flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary/10 border border-primary/20 min-w-[80px]",
      className
    )}>
      <span className="text-2xl">
        {match?.emoji || '🏠'}
      </span>
      <span className="text-xs font-medium text-foreground text-center leading-tight capitalize">
        {name}
      </span>
    </div>
  );
}

interface EquipmentGridProps {
  equipments: string[];
  className?: string;
}

export function EquipmentGrid({ equipments, className }: EquipmentGridProps) {
  if (!equipments || equipments.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-semibold text-foreground">Équipements</h3>
      <div className="flex flex-wrap gap-2">
        {equipments.map((eq) => (
          <EquipmentIcon key={eq} name={eq} />
        ))}
      </div>
    </div>
  );
}
