import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicNavBar } from '@/components/layout/PublicNavBar';

import iconAppsearch from '@/assets/icons/appsearch.png';
import iconAssurance from '@/assets/icons/assurance.png';
import iconDocsign from '@/assets/icons/docsign.png';
import iconPlanning from '@/assets/icons/planning.png';
import iconAccueil from '@/assets/icons/accueil.png';
import iconMap from '@/assets/icons/map.png';

const FEATURES = [
  {
    icon: iconAppsearch,
    title: 'Exploration Intelligente',
    description: 'Parcourez les biens en un geste. Likez pour sauvegarder, passez pour continuer. Simple et intuitif.',
  },
  {
    icon: iconAssurance,
    title: 'Transactions Sécurisées',
    description: 'Messagerie protégée, détection anti-fraude IA, et traçabilité complète de chaque étape.',
  },
  {
    icon: iconDocsign,
    title: 'Documents Automatiques',
    description: "LOI, contrats, term sheets — tout est généré automatiquement. Validez depuis votre téléphone.",
  },
  {
    icon: iconPlanning,
    title: 'Notifications Intelligentes',
    description: 'Rappels de visite J-1 et H-2, relances automatiques, notifications push en temps réel.',
  },
  {
    icon: iconAccueil,
    title: 'Score de Fiabilité',
    description: "Chaque utilisateur a un score de confiance basé sur son historique. Badge 'Client Certifié' après un deal réussi.",
  },
  {
    icon: iconMap,
    title: 'Gestion des Visites',
    description: 'Proposez, confirmez et validez les visites directement dans l\'app. Suivi des no-shows.',
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavBar title="Fonctionnalités" />

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Tout pour réussir votre transaction</h1>
          <p className="text-muted-foreground text-base">
            SomaGate réunit toutes les fonctionnalités dont vous avez besoin pour acheter, vendre ou louer en toute confiance.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="bg-card border border-border rounded-2xl p-5 flex gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0">
                <img src={feature.icon} alt="" className="h-12 w-12 object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{feature.description}</p>
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
