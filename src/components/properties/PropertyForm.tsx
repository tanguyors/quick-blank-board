import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useCreateProperty, useUpdateProperty } from '@/hooks/useProperties';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Upload, X, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import type { Tables } from '@/integrations/supabase/types';
import { useProfile } from '@/hooks/useProfile';
import { CURRENCIES, convertCurrency, getCurrencyInfo } from '@/lib/currencies';

/* ── Type mappings ── */
const PROPERTY_TYPES = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
  { value: 'maison', label: 'Maison' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'entrepot', label: 'Entrepôt' },
  { value: 'commercial', label: 'Local commercial' },
  { value: 'construction', label: 'Construction' },
  { value: 'maison_a_renover', label: 'Maison à rénover' },
  { value: 'colocation_longue', label: 'Colocation longue durée' },
  { value: 'colocation_courte', label: 'Colocation courte durée' },
  { value: 'hebergement_service', label: 'Hébergement contre service' },
  { value: 'hebergement_animaux', label: 'Hébergement pour animaux' },
  { value: 'guesthouse', label: 'Guesthouse' },
] as const;

const DROITS = [
  { value: 'titre_foncier', label: 'Titre foncier' },
  { value: 'bail', label: 'Bail' },
  { value: 'deliberation', label: 'Délibération' },
  { value: 'freehold', label: 'Freehold (Propriété totale)' },
  { value: 'leasehold', label: 'Leasehold (Bail longue durée)' },
] as const;

const OPERATIONS = [
  { value: 'achat', label: 'Achat' },
  { value: 'location', label: 'Location' },
  { value: 'vente', label: 'Vente' },
] as const;

/* Currencies imported from @/lib/currencies */

/* ── Per-type field config ── */
interface TypeConfig {
  showRooms: boolean;
  showBathrooms: boolean;
  showDroit: boolean;
  showEquipements: boolean;
  equipementCategories: { title: string; items: string[] }[];
  allowedOperations: string[];
}

const EQ_RESIDENTIAL: TypeConfig['equipementCategories'] = [
  { title: 'Très demandés', items: ['Jacuzzi', 'Lave-linge', 'Cuisine', 'Wifi', 'Barbecue', 'Piscine'] },
  { title: 'Produits et services de base', items: ['Sèche-linge', 'Climatisation', 'Chauffage', 'Espace de travail dédié', 'Télévision', 'Sèche-cheveux', 'Fer à repasser'] },
  { title: 'Caractéristiques', items: ['Parking gratuit', 'Station de recharge pour véhicules électriques', 'Lit pour bébé', 'Lit king size', 'Salle de sport', 'Petit déjeuner', 'Cheminée', 'Logement fumeur'] },
  { title: 'Sécurité', items: ['Détecteur de fumée', 'Détecteur de monoxyde de carbone'] },
];

const EQ_COMMERCIAL: TypeConfig['equipementCategories'] = [
  { title: 'Équipements', items: ['Climatisation', 'Parking gratuit', 'Ascenseur', 'Gardien', 'Alarme', 'Accès handicapé', 'Espace de travail dédié', 'Wifi'] },
  { title: 'Sécurité', items: ['Détecteur de fumée', 'Détecteur de monoxyde de carbone'] },
];

const EQ_TERRAIN: TypeConfig['equipementCategories'] = [
  { title: 'Caractéristiques', items: ['Clôturé', 'Viabilisé', 'Accès goudronné', 'Eau courante', 'Électricité', 'Gardien'] },
];

const EQ_COLOCATION: TypeConfig['equipementCategories'] = [
  { title: 'Très demandés', items: ['Lave-linge', 'Cuisine', 'Wifi', 'Piscine'] },
  { title: 'Produits et services de base', items: ['Sèche-linge', 'Climatisation', 'Chauffage', 'Espace de travail dédié', 'Télévision', 'Sèche-cheveux', 'Fer à repasser'] },
  { title: 'Caractéristiques', items: ['Parking gratuit', 'Lit king size', 'Salle de sport', 'Petit déjeuner', 'Logement fumeur'] },
  { title: 'Sécurité', items: ['Détecteur de fumée', 'Détecteur de monoxyde de carbone'] },
];

const EQ_GUESTHOUSE: TypeConfig['equipementCategories'] = [
  { title: 'Très demandés', items: ['Jacuzzi', 'Lave-linge', 'Cuisine', 'Wifi', 'Barbecue', 'Piscine'] },
  { title: 'Produits et services de base', items: ['Sèche-linge', 'Climatisation', 'Chauffage', 'Télévision', 'Sèche-cheveux', 'Fer à repasser'] },
  { title: 'Caractéristiques', items: ['Parking gratuit', 'Lit king size', 'Salle de sport', 'Petit déjeuner', 'Cheminée'] },
  { title: 'Sécurité', items: ['Détecteur de fumée', 'Détecteur de monoxyde de carbone'] },
];

const EQ_HEBERGEMENT_ANIMAUX: TypeConfig['equipementCategories'] = [
  { title: 'Caractéristiques', items: ['Clôturé', 'Jardin', 'Eau courante', 'Électricité', 'Gardien', 'Parking gratuit'] },
];

const TYPE_CONFIGS: Record<string, TypeConfig> = {
  appartement:        { showRooms: true,  showBathrooms: true,  showDroit: true,  showEquipements: true,  equipementCategories: EQ_RESIDENTIAL, allowedOperations: ['achat', 'location', 'vente'] },
  studio:             { showRooms: true,  showBathrooms: true,  showDroit: true,  showEquipements: true,  equipementCategories: EQ_RESIDENTIAL, allowedOperations: ['achat', 'location', 'vente'] },
  villa:              { showRooms: true,  showBathrooms: true,  showDroit: true,  showEquipements: true,  equipementCategories: EQ_RESIDENTIAL, allowedOperations: ['achat', 'location', 'vente'] },
  maison:             { showRooms: true,  showBathrooms: true,  showDroit: true,  showEquipements: true,  equipementCategories: EQ_RESIDENTIAL, allowedOperations: ['achat', 'location', 'vente'] },
  maison_a_renover:   { showRooms: true,  showBathrooms: true,  showDroit: true,  showEquipements: false, equipementCategories: [],              allowedOperations: ['achat', 'vente'] },
  terrain:            { showRooms: false, showBathrooms: false, showDroit: true,  showEquipements: true,  equipementCategories: EQ_TERRAIN,      allowedOperations: ['achat', 'vente'] },
  bureau:             { showRooms: false, showBathrooms: true,  showDroit: true,  showEquipements: true,  equipementCategories: EQ_COMMERCIAL,   allowedOperations: ['achat', 'location', 'vente'] },
  commerce:           { showRooms: false, showBathrooms: true,  showDroit: true,  showEquipements: true,  equipementCategories: EQ_COMMERCIAL,   allowedOperations: ['achat', 'location', 'vente'] },
  entrepot:           { showRooms: false, showBathrooms: false, showDroit: true,  showEquipements: true,  equipementCategories: EQ_COMMERCIAL,   allowedOperations: ['achat', 'location', 'vente'] },
  commercial:         { showRooms: false, showBathrooms: true,  showDroit: true,  showEquipements: true,  equipementCategories: EQ_COMMERCIAL,   allowedOperations: ['achat', 'location', 'vente'] },
  construction:       { showRooms: false, showBathrooms: false, showDroit: true,  showEquipements: false, equipementCategories: [],              allowedOperations: ['achat', 'vente'] },
  colocation_longue:  { showRooms: true,  showBathrooms: true,  showDroit: false, showEquipements: true,  equipementCategories: EQ_COLOCATION,   allowedOperations: ['location'] },
  colocation_courte:  { showRooms: true,  showBathrooms: true,  showDroit: false, showEquipements: true,  equipementCategories: EQ_COLOCATION,   allowedOperations: ['location'] },
  hebergement_service:{ showRooms: true,  showBathrooms: true,  showDroit: false, showEquipements: true,  equipementCategories: EQ_COLOCATION,   allowedOperations: ['location'] },
  hebergement_animaux:{ showRooms: false, showBathrooms: false, showDroit: false, showEquipements: true,  equipementCategories: EQ_HEBERGEMENT_ANIMAUX, allowedOperations: ['location'] },
  guesthouse:         { showRooms: true,  showBathrooms: true,  showDroit: true,  showEquipements: true,  equipementCategories: EQ_GUESTHOUSE,   allowedOperations: ['achat', 'location', 'vente'] },
};

function getConfig(type: string): TypeConfig {
  return TYPE_CONFIGS[type] || TYPE_CONFIGS['appartement'];
}

/* ── Props ── */
interface PropertyFormProps {
  property?: Tables<'properties'> | null;
  existingMedia?: any[];
  onSuccess?: (id: string) => void;
}

export function PropertyForm({ property, existingMedia = [], onSuccess }: PropertyFormProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preferredCurrency = (profile.data as any)?.preferred_currency || 'EUR';

  const [form, setForm] = useState({
    type: (property?.type || 'appartement') as string,
    droit: (property?.droit || '') as string,
    secteur: property?.secteur || '',
    adresse: property?.adresse || '',
    prix: property?.prix?.toString() || '',
    prix_currency: property?.prix_currency || preferredCurrency,
    surface: property?.surface?.toString() || '',
    chambres: property?.chambres?.toString() || '1',
    salles_bain: property?.salles_bain?.toString() || '1',
    description: property?.description || '',
    operations: (property?.operations || 'vente') as string,
    equipements: (property?.equipements as string[]) || [],
    is_published: property?.is_published ?? false,
  });

  const [media, setMedia] = useState<any[]>(existingMedia);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleTypeChange = (type: string) => {
    setForm(prev => {
      const cfg = getConfig(type);
      const newForm = { ...prev, type };
      if (!cfg.showRooms) newForm.chambres = '0';
      if (!cfg.showBathrooms) newForm.salles_bain = '0';
      if (!cfg.showDroit) newForm.droit = '';
      // Reset equipements that don't apply to the new type
      const allValidItems = cfg.equipementCategories.flatMap(c => c.items);
      newForm.equipements = prev.equipements.filter((eq: string) => allValidItems.includes(eq));
      // Reset operation if not allowed
      if (!cfg.allowedOperations.includes(prev.operations)) {
        newForm.operations = cfg.allowedOperations[0];
      }
      return newForm;
    });
  };

  /* ── Media: select files (pending for new, direct upload for existing) ── */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (property) {
      handleUploadToProperty(property.id, Array.from(files));
    } else {
      setPendingFiles(prev => [...prev, ...Array.from(files)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadToProperty = async (propertyId: string, files: File[]) => {
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const path = `${propertyId}/${Date.now()}-${i}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('property-media').upload(path, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('property-media').getPublicUrl(path);
        const { data, error } = await supabase
          .from('property_media')
          .insert({
            property_id: propertyId,
            url: publicUrl,
            type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
            position: media.length + i,
            is_primary: media.length === 0 && i === 0,
          })
          .select().single();
        if (error) throw error;
        setMedia(prev => [...prev, data]);
      }
      toast.success('Photos uploadées');
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteMedia = async (mediaItem: any) => {
    try {
      await supabase.from('property_media').delete().eq('id', mediaItem.id);
      setMedia(prev => prev.filter(m => m.id !== mediaItem.id));
      toast.success('Photo supprimée');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSetPrimary = async (mediaItem: any) => {
    if (!property) return;
    try {
      await supabase.from('property_media').update({ is_primary: false }).eq('property_id', property.id);
      await supabase.from('property_media').update({ is_primary: true }).eq('id', mediaItem.id);
      setMedia(prev => prev.map(m => ({ ...m, is_primary: m.id === mediaItem.id })));
      toast.success('Image principale définie');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!form.adresse.trim()) { toast.error('L\'adresse est requise'); return; }
    if (!form.prix || Number(form.prix) <= 0) { toast.error('Le prix est requis'); return; }
    if (!form.secteur.trim()) { toast.error('Le secteur est requis'); return; }

    try {
      const submitCfg = getConfig(form.type);
      const payload = {
        type: form.type as any,
        operations: form.operations as any,
        adresse: form.adresse,
        secteur: form.secteur || null,
        surface: form.surface ? Number(form.surface) : null,
        chambres: submitCfg.showRooms ? Number(form.chambres) : 0,
        salles_bain: submitCfg.showBathrooms ? Number(form.salles_bain) : 0,
        prix: Number(form.prix),
        prix_currency: form.prix_currency,
        droit: (form.droit || null) as any,
        description: form.description || null,
        equipements: form.equipements,
        is_published: form.is_published,
      };

      if (property) {
        await updateProperty.mutateAsync({ id: property.id, ...payload });
        toast.success('Bien mis à jour');
        onSuccess?.(property.id);
      } else {
        const data = await createProperty.mutateAsync({ ...payload, owner_id: user!.id });
        // Upload pending files after creation
        if (pendingFiles.length > 0) {
          await handleUploadToProperty(data.id, pendingFiles);
          setPendingFiles([]);
        }
        toast.success('Bien créé');
        onSuccess?.(data.id);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const isPending = createProperty.isPending || updateProperty.isPending;

  const cfg = getConfig(form.type);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Type de bien */}
      <div>
        <Label className="text-sm font-semibold">Type de bien *</Label>
        <Select value={form.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Droit - conditionnel */}
      {cfg.showDroit && (
        <div>
          <Label className="text-sm font-semibold">Droit</Label>
          <Select value={form.droit || undefined} onValueChange={v => update('droit', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              {DROITS.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Secteur */}
      <div>
        <Label className="text-sm font-semibold">Secteur *</Label>
        <Input className="mt-1" value={form.secteur} onChange={e => update('secteur', e.target.value)} placeholder="Ex: Plateau, Cocody, Dakar..." />
      </div>

      {/* Adresse */}
      <div>
        <Label className="text-sm font-semibold">Adresse</Label>
        <Input className="mt-1" value={form.adresse} onChange={e => update('adresse', e.target.value)} placeholder="Adresse complète" />
      </div>

      {/* Prix + Devise */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold">Prix *</Label>
          <Input className="mt-1" type="number" value={form.prix} onChange={e => update('prix', e.target.value)} placeholder="0" />
        </div>
        <div>
          <Label className="text-sm font-semibold">Devise</Label>
          <Select value={form.prix_currency} onValueChange={v => {
            // Auto-convert the price when switching currency
            const currentPrice = Number(form.prix);
            if (currentPrice > 0) {
              const converted = convertCurrency(currentPrice, form.prix_currency, v);
              update('prix', converted.toString());
            }
            update('prix_currency', v);
          }}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Surface / Chambres / Salles de bain - conditionnel */}
      <div className={`grid gap-4 ${cfg.showRooms && cfg.showBathrooms ? 'grid-cols-3' : cfg.showRooms || cfg.showBathrooms ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div>
          <Label className="text-sm font-semibold">Surface (m²)</Label>
          <Input className="mt-1" type="number" value={form.surface} onChange={e => update('surface', e.target.value)} placeholder="0" />
        </div>
        {cfg.showRooms && (
          <div>
            <Label className="text-sm font-semibold">Chambres</Label>
            <Input className="mt-1" type="number" value={form.chambres} onChange={e => update('chambres', e.target.value)} placeholder="0" />
          </div>
        )}
        {cfg.showBathrooms && (
          <div>
            <Label className="text-sm font-semibold">Salles de bain</Label>
            <Input className="mt-1" type="number" value={form.salles_bain} onChange={e => update('salles_bain', e.target.value)} placeholder="0" />
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <Label className="text-sm font-semibold">Description</Label>
        <Textarea className="mt-1" value={form.description} onChange={e => update('description', e.target.value)} rows={4} placeholder="Description détaillée du bien" />
      </div>

      {/* Opérations - filtrées selon le type */}
      <div>
        <Label className="text-sm font-semibold">Opérations *</Label>
        <div className="flex gap-6 mt-2">
          {OPERATIONS.filter(op => cfg.allowedOperations.includes(op.value)).map(op => (
            <label key={op.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.operations === op.value}
                onCheckedChange={(checked) => {
                  if (checked) update('operations', op.value);
                }}
              />
              {op.label}
            </label>
          ))}
        </div>
      </div>

      {/* Équipements - conditionnel avec catégories spécifiques au type */}
      {cfg.showEquipements && cfg.equipementCategories.length > 0 && (
        <div>
          <Label className="text-lg font-bold">Équipements</Label>
          {cfg.equipementCategories.map(cat => (
            <div key={cat.title} className="mt-4">
              <h4 className="text-sm font-semibold mb-2">{cat.title}</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {cat.items.map(eq => (
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
          ))}
        </div>
      )}

      {/* Photos du bien */}
      <div>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Photos du bien</Label>
          <div>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileSelect} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />{uploading ? 'Upload...' : 'Ajouter des photos'}
            </Button>
          </div>
        </div>

        {/* Existing uploaded media (edit mode) */}
        {media.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {media.map((m: any) => (
              <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={m.url} alt="" className="w-full h-full object-cover" />
                {m.is_primary && <div className="absolute top-1 left-1"><Star className="h-4 w-4 text-accent fill-accent" /></div>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-primary-foreground" onClick={() => handleSetPrimary(m)}><Star className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-primary-foreground" onClick={() => handleDeleteMedia(m)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending files preview (create mode) */}
        {pendingFiles.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {pendingFiles.map((file, index) => (
              <div key={`pending-${index}`} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                {index === 0 && <div className="absolute top-1 left-1"><Star className="h-4 w-4 text-accent fill-accent" /></div>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-primary-foreground" onClick={() => removePendingFile(index)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {media.length === 0 && pendingFiles.length === 0 && (
          <div className="mt-3 rounded-lg bg-muted/50 p-6 text-center text-sm text-muted-foreground">
            Aucune photo
          </div>
        )}
      </div>

      {/* Publié toggle */}
      <div className="flex items-center justify-between py-2">
        <div>
          <Label className="text-sm font-semibold">Publié</Label>
          <p className="text-xs text-muted-foreground">Le bien sera visible aux utilisateurs</p>
        </div>
        <Switch checked={form.is_published} onCheckedChange={v => update('is_published', v)} />
      </div>

      {/* Submit */}
      <Button type="button" onClick={handleSubmit} className="w-full" size="lg" disabled={isPending}>
        {isPending ? 'En cours...' : property ? 'Mettre à jour' : 'Créer le bien'}
      </Button>
    </div>
  );
}
