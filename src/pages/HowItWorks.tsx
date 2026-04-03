import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicNavBar } from '@/components/layout/PublicNavBar';

import iconAppsearch from '@/assets/icons/appsearch.png';
import iconPlanning from '@/assets/icons/planning.png';
import iconContrat from '@/assets/icons/contrat.png';
import iconDocsign from '@/assets/icons/docsign.png';
import iconDeal from '@/assets/icons/deal.png';

const STEPS = [
  {
    number: '01',
    icon: iconAppsearch,
    title: 'Swipez & Matchez',
    description: "Parcourez les biens disponibles en swipant. Quand un bien vous plaît, swipez à droite. Un match est créé et une transaction démarre.",
  },
  {
    number: '02',
    icon: iconPlanning,
    title: 'Organisez une visite',
    description: "Demandez une visite, le vendeur propose des créneaux, vous choisissez celui qui vous convient. Rappels automatiques J-1 et H-2.",
  },
  {
    number: '03',
    icon: iconContrat,
    title: 'Faites une offre',
    description: "Exprimez votre intention puis faites une offre. Les documents (LOI, contrat, term sheet) sont générés automatiquement.",
  },
  {
    number: '04',
    icon: iconDocsign,
    title: 'Validez les documents',
    description: "Acheteur et vendeur valident chaque document. La validation croisée garantit l'accord mutuel sur les termes.",
  },
  {
    number: '05',
    icon: iconDeal,
    title: 'Finalisez le deal',
    description: "Une fois tout validé, le deal est finalisé. Vous obtenez le badge 'Client Certifié' et un questionnaire d'expérience.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavBar title="Comment ça marche" />

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
                <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-border -mb-6 h-full" />
              )}
              <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 relative z-10">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0">
                  <img src={step.icon} alt="" className="h-12 w-12 object-contain" />
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
