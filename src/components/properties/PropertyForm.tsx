import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateProperty, useUpdateProperty } from '@/hooks/useProperties';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const PROPERTY_TYPES = ['villa', 'appartement', 'terrain', 'studio', 'maison', 'bureau', 'commerce', 'entrepot'] as const;
const OPERATIONS = ['vente', 'location'] as const;
const DROITS = ['titre_foncier', 'bail', 'deliberation'] as const;
const CURRENCIES = ['EUR', 'XOF', 'USD'];
const EQUIPEMENTS = ['Climatisation', 'Piscine', 'Jardin', 'Garage', 'Ascenseur', 'Balcon', 'Terrasse', 'Meublé', 'Gardien', 'Parking'];

interface PropertyFormProps {
  property?: Tables<'properties'> | null;
  onSuccess?: (id: string) => void;
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const { user } = useAuth();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    type: (property?.type || 'villa') as any,
    operations: (property?.operations || 'vente') as any,
    adresse: property?.adresse || '',
    secteur: property?.secteur || '',
    surface: property?.surface?.toString() || '',
    chambres: property?.chambres?.toString() || '0',
    salles_bain: property?.salles_bain?.toString() || '0',
    prix: property?.prix?.toString() || '',
    prix_currency: property?.prix_currency || 'XOF',
    droit: (property?.droit || '') as any,
    description: property?.description || '',
    equipements: (property?.equipements as string[]) || [],
    latitude: property?.latitude?.toString() || '',
    longitude: property?.longitude?.toString() || '',
  });

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    try {
      const payload = {
        type: form.type, operations: form.operations, adresse: form.adresse,
        secteur: form.secteur || null, surface: form.surface ? Number(form.surface) : null,
        chambres: Number(form.chambres), salles_bain: Number(form.salles_bain),
        prix: Number(form.prix), prix_currency: form.prix_currency,
        droit: form.droit || null, description: form.description || null,
        equipements: form.equipements,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      };
      if (property) {
        await updateProperty.mutateAsync({ id: property.id, ...payload });
        toast.success('Bien mis à jour');
        onSuccess?.(property.id);
      } else {
        const data = await createProperty.mutateAsync({ ...payload, owner_id: user!.id });
        toast.success('Bien créé');
        onSuccess?.(data.id);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label>Type de bien</Label>
            <Select value={form.type} onValueChange={v => update('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Opération</Label>
            <div className="flex gap-2">
              {OPERATIONS.map(op => (
                <Button key={op} type="button" variant={form.operations === op ? 'default' : 'outline'} className="flex-1" onClick={() => update('operations', op)}>
                  {op === 'vente' ? 'Vente' : 'Location'}
                </Button>
              ))}
            </div>
          </div>
          <div><Label>Adresse</Label><Input value={form.adresse} onChange={e => update('adresse', e.target.value)} required /></div>
          <div><Label>Secteur</Label><Input value={form.secteur} onChange={e => update('secteur', e.target.value)} /></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Surface (m²)</Label><Input type="number" value={form.surface} onChange={e => update('surface', e.target.value)} /></div>
            <div><Label>Chambres</Label><Input type="number" value={form.chambres} onChange={e => update('chambres', e.target.value)} /></div>
            <div><Label>Salles de bain</Label><Input type="number" value={form.salles_bain} onChange={e => update('salles_bain', e.target.value)} /></div>
            <div><Label>Prix</Label><Input type="number" value={form.prix} onChange={e => update('prix', e.target.value)} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Devise</Label>
              <Select value={form.prix_currency} onValueChange={v => update('prix_currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Droit foncier</Label>
              <Select value={form.droit} onValueChange={v => update('droit', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>{DROITS.map(d => <SelectItem key={d} value={d}>{d.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Latitude</Label><Input type="number" step="any" value={form.latitude} onChange={e => update('latitude', e.target.value)} /></div>
            <div><Label>Longitude</Label><Input type="number" step="any" value={form.longitude} onChange={e => update('longitude', e.target.value)} /></div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} /></div>
          <div>
            <Label>Équipements</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {EQUIPEMENTS.map(eq => (
                <label key={eq} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.equipements.includes(eq)}
                    onCheckedChange={checked => {
                      if (checked) update('equipements', [...form.equipements, eq]);
                      else update('equipements', form.equipements.filter((e: string) => e !== eq));
                    }}
                  />
                  {eq}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-6">
        {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">Précédent</Button>}
        {step < 3 ? (
          <Button type="button" onClick={() => setStep(s => s + 1)} className="flex-1">Suivant</Button>
        ) : (
          <Button type="button" onClick={handleSubmit} className="flex-1" disabled={createProperty.isPending || updateProperty.isPending}>
            {property ? 'Mettre à jour' : 'Créer le bien'}
          </Button>
        )}
      </div>
    </div>
  );
}
