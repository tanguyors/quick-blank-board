const PREMIUM_ITEMS = ['Jacuzzi', 'Piscine', 'Salle de sport'];
const GOOD_ITEMS = ['Climatisation', 'Lave-linge', 'Wifi', 'Cuisine', 'Parking gratuit'];

export function calculatePointsPerNight(
  capacity: number,
  chambres: number,
  equipements: string[]
): number {
  const base = 50;
  const capBonus = (capacity || 0) * 5;
  const roomBonus = (chambres || 0) * 10;

  let premiumCount = 0;
  let goodCount = 0;
  for (const eq of equipements) {
    if (PREMIUM_ITEMS.includes(eq)) premiumCount++;
    if (GOOD_ITEMS.includes(eq)) goodCount++;
  }

  const standing = premiumCount >= 2 ? 40 : goodCount >= 3 ? 20 : 0;
  return base + capBonus + roomBonus + standing;
}
