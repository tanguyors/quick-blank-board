import { cn } from '@/lib/utils';
import { Home } from 'lucide-react';
import iconLit from '@/assets/icons/lit.png';
import iconLitBebe from '@/assets/icons/lit_bebe.png';
import iconParking from '@/assets/icons/parking.png';
import iconSecurity from '@/assets/icons/security.png';
import iconShield from '@/assets/icons/shield_check.png';
import iconKey from '@/assets/icons/key.png';
import iconHomeGarage from '@/assets/icons/home_garage.png';
import iconWifi from '@/assets/icons/wifi.png';
import iconJacuzzi from '@/assets/icons/jacuzzi.png';
import iconLaveLinge from '@/assets/icons/lave_linge.png';
import iconCuisine from '@/assets/icons/cuisine.png';
import iconBarbecue from '@/assets/icons/barbecue.png';
import iconPiscine from '@/assets/icons/piscine.png';
import iconTv from '@/assets/icons/tv.png';
import iconSecheLinge from '@/assets/icons/seche_linge.png';
import iconClimatisation from '@/assets/icons/climatisation.png';
import iconChauffage from '@/assets/icons/chauffage.png';
import iconEspaceTravail from '@/assets/icons/espace_travail.png';
import iconSecheCheveux from '@/assets/icons/seche_cheveux.png';
import iconFerRepasser from '@/assets/icons/fer_repasser.png';
import iconStationRecharge from '@/assets/icons/station_recharge.png';
import iconSalleSport from '@/assets/icons/salle_sport.png';
import iconPetitDejeuner from '@/assets/icons/petit_dejeuner.png';
import iconCheminee from '@/assets/icons/cheminee.png';
import iconLogementFumeur from '@/assets/icons/logement_fumeur.png';
import iconAscenseur from '@/assets/icons/ascenseur.png';
import iconGardien from '@/assets/icons/gardien.png';
import iconAlarme from '@/assets/icons/alarme.png';
import iconAccesHandicape from '@/assets/icons/acces_handicape.png';
import iconJardin from '@/assets/icons/jardin.png';
import iconEauCourante from '@/assets/icons/eau_courante.png';
import iconElectricite from '@/assets/icons/electricite.png';
import iconCloture from '@/assets/icons/cloture.png';
import iconViabilise from '@/assets/icons/viabilise.png';
import iconAccesGoudronne from '@/assets/icons/acces_goudronne.png';
import iconBain from '@/assets/icons/bain.png';

const equipmentMap: Record<string, string> = {
  // Rooms & beds
  'chambre': iconLit,
  'bedroom': iconLit,
  'lit king size': iconLit,
  'lit pour bébé': iconLitBebe,
  'espace de travail dédié': iconEspaceTravail,

  // Bathroom & water
  'salle de bain': iconBain,
  'bathroom': iconBain,
  'jacuzzi': iconJacuzzi,
  'eau courante': iconEauCourante,

  // Kitchen
  'cuisine': iconCuisine,
  'kitchen': iconCuisine,
  'cuisine équipée': iconCuisine,
  'petit déjeuner': iconPetitDejeuner,

  // Outdoor
  'piscine': iconPiscine,
  'swimming': iconPiscine,
  'jardin': iconJardin,
  'garden': iconJardin,
  'barbecue': iconBarbecue,
  'clôturé': iconCloture,
  'viabilisé': iconViabilise,
  'accès goudronné': iconAccesGoudronne,
  'électricité': iconElectricite,

  // Security
  'sécurité': iconSecurity,
  'security': iconSecurity,
  'détecteur de fumée': iconShield,
  'détecteur de monoxyde de carbone': iconShield,
  'alarme': iconAlarme,
  'gardien': iconGardien,

  // Access
  'ascenseur': iconAscenseur,
  'elevator': iconAscenseur,
  'parking': iconParking,
  'parking gratuit': iconParking,
  'garage': iconHomeGarage,
  'station de recharge pour véhicules électriques': iconStationRecharge,
  'accès handicapé': iconAccesHandicape,
  'clé': iconKey,

  // Comfort
  'chauffage': iconChauffage,
  'heating': iconChauffage,
  'climatisation': iconClimatisation,
  'air conditionné': iconClimatisation,
  'wifi': iconWifi,
  'télévision': iconTv,
  'tv': iconTv,
  'cheminée': iconCheminee,
  'salle de sport': iconSalleSport,
  'logement fumeur': iconLogementFumeur,

  // Laundry
  'lave-linge': iconLaveLinge,
  'sèche-linge': iconSecheLinge,
  'fer à repasser': iconFerRepasser,
  'sèche-cheveux': iconSecheCheveux,
};

function findEquipment(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (equipmentMap[lower]) return equipmentMap[lower];
  for (const key of Object.keys(equipmentMap)) {
    if (lower === key) return equipmentMap[key];
  }
  for (const key of Object.keys(equipmentMap)) {
    if (lower.includes(key) || key.includes(lower)) return equipmentMap[key];
  }
  return null;
}

interface EquipmentIconProps {
  name: string;
  className?: string;
}

export function EquipmentIcon({ name, className }: EquipmentIconProps) {
  const png = findEquipment(name);

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-primary/10 border border-primary/20 min-w-[80px] min-h-[80px]",
      className
    )}>
      {png ? (
        <img src={png} alt="" className="h-10 w-10 object-contain" />
      ) : (
        <Home className="h-7 w-7 text-primary" strokeWidth={1.75} />
      )}
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
