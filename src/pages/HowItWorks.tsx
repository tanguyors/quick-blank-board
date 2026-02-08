import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart, Calendar, FileText, CheckCircle, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    number: '01',
    icon: Heart,
    title: 'Swipez & Matchez',
    description: "Parcourez les biens disponibles en swipant. Quand un bien vous plaît, swipez à droite. Un match est créé et une transaction démarre.",
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    number: '02',
    icon: Calendar,
    title: 'Organisez une visite',
    description: "Demandez une visite, le vendeur propose des créneaux, vous choisissez celui qui vous convient. Rappels automatiques J-1 et H-2.",
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    number: '03',
    icon: FileText,
    title: 'Faites une offre',
    description: "Exprimez votre intention puis faites une offre. Les documents (LOI, contrat, term sheet) sont générés automatiquement.",
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Validez les documents',
    description: "Acheteur et vendeur valident chaque document. La validation croisée garantit l'accord mutuel sur les termes.",
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    number: '05',
    icon: PartyPopper,
    title: 'Finalisez le deal',
    description: "Une fois tout validé, le deal est finalisé. Vous obtenez le badge 'Client Certifié' et un questionnaire d'expérience.",
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border">
        <Link to="/" className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="flex-1 text-center font-semibold text-lg text-foreground">Comment ça marche</span>
        <div className="w-8" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-foreground">5 étapes simples</h1>
          <p className="text-muted-foreground text-base">
            De la découverte du bien à la signature, SomaGate vous accompagne à chaque étape.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {STEPS.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border -mb-6 h-full" />
              )}
              <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center shrink-0`}>
                  <step.icon className={`h-6 w-6 ${step.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Étape {step.number}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mt-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Button asChild className="h-14 px-8 rounded-2xl text-base font-semibold">
            <Link to="/auth">
              Commencer maintenant
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}