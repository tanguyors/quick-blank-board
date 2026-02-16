import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuyerPreferences, type BuyerPreferencesData } from '@/hooks/useBuyerPreferences';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronLeft, ChevronRight, Heart, Save,
  Home, Building2, Wrench, TreePine, Store, HardHat,
  Users, User, Handshake, PawPrint, Hotel,
  Warehouse,
} from 'lucide-react';
import { toast } from 'sonner';
import { getCurrencyInfo } from '@/lib/currencies';

const PROPERTY_TYPES = [
  { value: 'villa', label: 'Villa', icon: Home },
  { value: 'appartement', label: 'Appartement', icon: Building2 },
  { value: 'maison_a_renover', label: 'À rénover', icon: Wrench },
  { value: 'terrain', label: 'Terrain', icon: TreePine },
  { value: 'commercial', label: 'Commercial', icon: Store },
  { value: 'construction', label: 'En construction', icon: HardHat },
  { value: 'entrepot', label: 'Entrepôt', icon: Warehouse },
  { value: 'colocation_longue', label: 'Colocation longue durée', icon: Users },
  { value: 'colocation_courte', label: 'Colocation courte durée', icon: User },
  { value: 'hebergement_service', label: 'Hébergement contre service', icon: Handshake },
  { value: 'hebergement_animaux', label: 'Hébergement pour animaux', icon: PawPrint },
  { value: 'guesthouse', label: 'Guesthouse', icon: Hotel },
];

const OPERATIONS = [
  { value: 'freehold', label: 'Freehold' },
  { value: 'leasehold', label: 'Leasehold' },
  { value: 'location', label: 'Location' },
];

const SECTORS = [
  'Amed', 'Balangan', 'Balian', 'Bangli', 'Batubelig', 'Batu Bolong', 'Berawa', 'Bingin',
  'Bukit', 'Candidasa', 'Canggu', 'Denpasar', 'Echo Beach', 'Gianyar', 'Jatiluwih',
  'Jimbaran', 'Karangasem', 'Keramas', 'Kerobokan', 'Klungkung', 'Kuta', 'Legian',
  'Lembongan', 'Lovina', 'Medewi', 'Mengwi', 'Munduk', 'Negara', 'Nusa Ceningan',
  'Nusa Dua', 'Nusa Penida', 'Padang Padang', 'Pecatu', 'Pemuteran', 'Pererenan',
  'Sanur', 'Selemadeg', 'Seminyak', 'Sidemen', 'Singaraja', 'Tabanan', 'Tanah Lot',
  'Tegallalang', 'Tibubeneng', 'Ubud', 'Uluwatu', 'Ungasan',
];

const STATUSES = [
  { value: 'available', label: 'Disponible' },
  { value: 'construction', label: 'En construction' },
  { value: 'renovation', label: 'À rénover' },
];

const INTENTIONS = [
  { value: 'vivre', label: 'Vivre' },
  { value: 'investir', label: 'Investir' },
  { value: 'les_deux', label: 'Les deux' },
];

const PAYMENT_OPTIONS = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
  { value: 'besoin_aide', label: "Besoin d'aide" },
];

const CASH_OPTIONS = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
  { value: 'en_preparation', label: 'En préparation' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'matins', label: 'Matins (8h-12h)', icon: '☀️' },
  { value: 'apres_midi', label: 'Après-midi/Soirs (14h-19h)', icon: '🌆' },
  { value: 'weekends', label: 'Week-ends', icon: '📅' },
  { value: 'flexible', label: 'Je reste flexible', icon: '✨' },
];

const TOTAL_SECTIONS = 6;

export function BuyerPreferencesWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { preferences, upsertPreferences } = useBuyerPreferences();
  const [step, setStep] = useState(0);

  const currency = profile.data?.preferred_currency || 'EUR';
  const currencyInfo = getCurrencyInfo(currency);

  const [form, setForm] = useState<Omit<BuyerPreferencesData, 'id' | 'user_id'>>({
    preferred_types: [],
    preferred_operation: null,
    preferred_chambres: [],
    preferred_salles_bain: [],
    preferred_sectors: [],
    custom_sector: null,
    receive_alerts: true,
    preferred_status: null,
    budget_min: null,
    budget_max: null,
    budget_currency: currency,
    intention: null,
    wants_advisor: false,
    payment_knowledge: null,
    cash_available: null,
    visit_availability: [],
    is_complete: false,
  });

  useEffect(() => {
    if (preferences.data) {
      const p = preferences.data;
      setForm({
        preferred_types: p.preferred_types || [],
        preferred_operation: p.preferred_operation,
        preferred_chambres: p.preferred_chambres || [],
        preferred_salles_bain: p.preferred_salles_bain || [],
        preferred_sectors: p.preferred_sectors || [],
        custom_sector: p.custom_sector,
        receive_alerts: p.receive_alerts ?? true,
        preferred_status: p.preferred_status,
        budget_min: p.budget_min,
        budget_max: p.budget_max,
        budget_currency: p.budget_currency || currency,
        intention: p.intention,
        wants_advisor: p.wants_advisor ?? false,
        payment_knowledge: p.payment_knowledge,
        cash_available: p.cash_available,
        visit_availability: p.visit_availability || [],
        is_complete: p.is_complete ?? false,
      });
    }
  }, [preferences.data, currency]);

  const toggleArrayItem = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const progress = Math.round(((step + 1) / TOTAL_SECTIONS) * 100);

  const handleSave = async (complete = false) => {
    if (complete) {
      // Show patience screen before saving
      setStep(TOTAL_SECTIONS); // go to patience screen
      try {
        await upsertPreferences.mutateAsync({
          ...form,
          budget_currency: currency,
          is_complete: true,
        });
        // Wait 3 seconds then navigate
        setTimeout(() => {
          toast.success('Préférences enregistrées !');
          navigate('/explore');
        }, 3000);
      } catch (e: any) {
        toast.error(e.message || 'Erreur lors de la sauvegarde');
        setStep(TOTAL_SECTIONS - 1);
      }
      return;
    }
    try {
      await upsertPreferences.mutateAsync({
        ...form,
        budget_currency: currency,
        is_complete: false,
      });
      toast.success('Brouillon sauvegardé');
      navigate('/profile');
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la sauvegarde');
    }
  };

  const canNext = (): boolean => {
    switch (step) {
      case 0:
        return form.preferred_types.length > 0 && !!form.preferred_operation
          && form.preferred_chambres.length > 0 && form.preferred_salles_bain.length > 0;
      case 1:
        return form.preferred_sectors.length > 0;
      case 2:
        return true; // optional
      case 3:
        return true; // Budget and intention are now optional
      case 4:
        return true; // optional
      case 5:
        return form.visit_availability.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Section {step + 1} / {TOTAL_SECTIONS}</span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {step <= TOTAL_SECTIONS - 1 && (
          <div className="bg-card border border-border rounded-2xl p-6 mt-4">
            {step === 0 && <Step1 form={form} setForm={setForm} toggleArrayItem={toggleArrayItem} />}
            {step === 1 && <Step2 form={form} setForm={setForm} toggleArrayItem={toggleArrayItem} />}
            {step === 2 && <Step3 form={form} setForm={setForm} />}
            {step === 3 && <Step4 form={form} setForm={setForm} currencySymbol={currencyInfo.symbol} />}
            {step === 4 && <Step5 form={form} setForm={setForm} />}
            {step === 5 && <Step6 form={form} setForm={setForm} />}
          </div>
        )}

        {/* Patience / validation screen */}
        {step === TOTAL_SECTIONS && (
          <div className="flex flex-col items-center justify-center text-center mt-16 px-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
              <Heart className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Toutes les maisons ne sont pas faites pour tout le monde.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Nous cherchons votre future connexion.
            </p>
            <div className="mt-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </div>
        )}
      </div>

      {/* Footer nav — hidden on patience screen */}
      {step < TOTAL_SECTIONS && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Précédent
          </Button>
          <Button variant="ghost" onClick={() => handleSave(false)} className="gap-1">
            <Save className="h-4 w-4" /> Sauvegarder
          </Button>
          {step < TOTAL_SECTIONS - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="gap-1">
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => handleSave(true)} disabled={!canNext()} className="gap-1">
              Terminer <Heart className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Shared chip components ─── */
function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors w-full text-center ${
        selected
          ? 'bg-foreground text-background border-foreground'
          : 'bg-background text-foreground border-border hover:border-foreground/30'
      }`}
    >
      {children}
    </button>
  );
}

function NumberChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-colors min-w-[48px] ${
        selected
          ? 'bg-foreground text-background border-foreground'
          : 'bg-background text-foreground border-border hover:border-foreground/30'
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Step Components ─── */
type FormState = Omit<BuyerPreferencesData, 'id' | 'user_id'>;
type SetForm = React.Dispatch<React.SetStateAction<FormState>>;
type ToggleFn = <T>(arr: T[], item: T) => T[];

function Step1({ form, setForm, toggleArrayItem }: { form: FormState; setForm: SetForm; toggleArrayItem: ToggleFn }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Type de bien recherché</h2>
        <p className="text-muted-foreground mt-1">Sélectionnez les types de biens qui vous intéressent</p>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Types de bien *</h3>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map(t => (
            <Chip
              key={t.value}
              selected={form.preferred_types.includes(t.value)}
              onClick={() => setForm(f => ({ ...f, preferred_types: toggleArrayItem(f.preferred_types, t.value) }))}
            >
              <t.icon className="h-4 w-4 inline-block mr-1.5 -mt-0.5" /> {t.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Type d'opération *</h3>
        <div className="grid grid-cols-3 gap-2">
          {OPERATIONS.map(o => (
            <Chip
              key={o.value}
              selected={form.preferred_operation === o.value}
              onClick={() => setForm(f => ({ ...f, preferred_operation: o.value }))}
            >
              {o.label}
            </Chip>
          ))}
        </div>
        {(form.preferred_operation === 'freehold' || form.preferred_operation === 'leasehold') && (
          <div className="mt-3 p-3 bg-secondary/50 rounded-xl text-sm text-foreground border border-border">
            <p className="font-semibold mb-1">💡 Leasehold ou Freehold ?</p>
            <p className="mb-1"><strong>Freehold</strong> — Vous possédez le bien et le terrain pour toujours. Pas de loyer foncier. Liberté totale.</p>
            <p><strong>Leasehold</strong> — Vous possédez uniquement les murs pour une durée limitée (20-40 ans). Le terrain appartient à un tiers. Paiement d'un ground rent.</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Nombre de chambres *</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <NumberChip
              key={n}
              selected={form.preferred_chambres.includes(n)}
              onClick={() => setForm(f => ({ ...f, preferred_chambres: toggleArrayItem(f.preferred_chambres, n) }))}
            >
              {n}
            </NumberChip>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Salles de bain *</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <NumberChip
              key={n}
              selected={form.preferred_salles_bain.includes(n)}
              onClick={() => setForm(f => ({ ...f, preferred_salles_bain: toggleArrayItem(f.preferred_salles_bain, n) }))}
            >
              {n}
            </NumberChip>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2({ form, setForm, toggleArrayItem }: { form: FormState; setForm: SetForm; toggleArrayItem: ToggleFn }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Localisation</h2>
        <p className="text-muted-foreground mt-1">Où souhaitez-vous chercher ?</p>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Secteurs préférés *</h3>
        <div className="grid grid-cols-2 gap-2">
          {SECTORS.map(s => (
            <Chip
              key={s}
              selected={form.preferred_sectors.includes(s)}
              onClick={() => setForm(f => ({ ...f, preferred_sectors: toggleArrayItem(f.preferred_sectors, s) }))}
            >
              {s}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-foreground mb-2">Autre secteur</h3>
        <Input
          value={form.custom_sector || ''}
          onChange={e => setForm(f => ({ ...f, custom_sector: e.target.value || null }))}
          placeholder="Ex: Tabanan, Candidasa..."
          className="bg-background"
        />
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          checked={form.receive_alerts}
          onCheckedChange={v => setForm(f => ({ ...f, receive_alerts: !!v }))}
        />
        <span className="text-sm text-foreground">Recevoir des alertes lorsqu'un nouveau bien correspond à mes critères</span>
      </div>
    </div>
  );
}

function Step3({ form, setForm }: { form: FormState; setForm: SetForm }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Détails du bien</h2>
        <p className="text-muted-foreground mt-1">Précisez vos critères</p>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Statut du bien</h3>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map(s => (
            <Chip
              key={s.value}
              selected={form.preferred_status === s.value}
              onClick={() => setForm(f => ({ ...f, preferred_status: f.preferred_status === s.value ? null : s.value }))}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4({ form, setForm, currencySymbol }: { form: FormState; setForm: SetForm; currencySymbol: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Budget</h2>
        <p className="text-muted-foreground mt-1">Définissez votre budget</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Budget min ({currencySymbol})</label>
          <Input
            type="number"
            value={form.budget_min ?? ''}
            onChange={e => setForm(f => ({ ...f, budget_min: e.target.value ? Number(e.target.value) : null }))}
            placeholder="150000"
            className="mt-1 bg-background"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Budget max ({currencySymbol})</label>
          <Input
            type="number"
            value={form.budget_max ?? ''}
            onChange={e => setForm(f => ({ ...f, budget_max: e.target.value ? Number(e.target.value) : null }))}
            placeholder="500000"
            className="mt-1 bg-background"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Intention</h3>
        <div className="grid grid-cols-3 gap-2">
          {INTENTIONS.map(i => (
            <Chip
              key={i.value}
              selected={form.intention === i.value}
              onClick={() => setForm(f => ({ ...f, intention: i.value }))}
            >
              {i.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          checked={form.wants_advisor}
          onCheckedChange={v => setForm(f => ({ ...f, wants_advisor: !!v }))}
        />
        <span className="text-sm text-foreground">Je souhaite être contacté par un conseiller pour discuter de mon projet</span>
      </div>
    </div>
  );
}

function Step5({ form, setForm }: { form: FormState; setForm: SetForm }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Financement (optionnel)</h2>
        <p className="text-muted-foreground mt-1">Informations sur votre capacité de financement</p>
        <p className="text-sm text-muted-foreground mt-2">Cette section est optionnelle mais nous aide à mieux vous accompagner.</p>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Connaissez-vous les modes de paiement à Bali ?</h3>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_OPTIONS.map(o => (
            <Chip
              key={o.value}
              selected={form.payment_knowledge === o.value}
              onClick={() => setForm(f => ({ ...f, payment_knowledge: f.payment_knowledge === o.value ? null : o.value }))}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Cash disponible ?</h3>
        <div className="grid grid-cols-3 gap-2">
          {CASH_OPTIONS.map(o => (
            <Chip
              key={o.value}
              selected={form.cash_available === o.value}
              onClick={() => setForm(f => ({ ...f, cash_available: f.cash_available === o.value ? null : o.value }))}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step6({ form, setForm }: { form: FormState; setForm: SetForm }) {
  const toggle = (value: string) => {
    setForm(f => ({
      ...f,
      visit_availability: f.visit_availability.includes(value)
        ? f.visit_availability.filter(v => v !== value)
        : [...f.visit_availability, value],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Disponibilités</h2>
        <p className="text-muted-foreground mt-1">Quand êtes-vous disponible pour les visites ?</p>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-4">Quand êtes-vous disponible pour les visites ? *</h3>
        <div className="space-y-3">
          {AVAILABILITY_OPTIONS.map(o => (
            <label
              key={o.value}
              className="flex items-center gap-3 cursor-pointer"
            >
              <Checkbox
                checked={form.visit_availability.includes(o.value)}
                onCheckedChange={() => toggle(o.value)}
              />
              <span className="text-foreground">{o.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
