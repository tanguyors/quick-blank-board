import { Link } from 'react-router-dom';
import { Heart, Shield, FileText, Bell, Star, Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Heart,
    title: 'Swipe Immobilier',
    description: 'Parcourez les biens comme sur Tinder. Swipez à droite pour liker, à gauche pour passer. Simple et intuitif.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Shield,
    title: 'Transactions Sécurisées',
    description: 'Messagerie protégée, détection anti-fraude IA, et traçabilité complète de chaque étape.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: FileText,
    title: 'Documents Automatiques',
    description: "LOI, contrats, term sheets — tout est généré automatiquement. Validez depuis votre téléphone.",
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Bell,
    title: 'Notifications Intelligentes',
    description: 'Rappels de visite J-1 et H-2, relances automatiques, notifications push en temps réel.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Star,
    title: 'Score de Fiabilité',
    description: "Chaque utilisateur a un score de confiance basé sur son historique. Badge 'Client Certifié' après un deal réussi.",
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Eye,
    title: 'Gestion des Visites',
    description: 'Proposez, confirmez et validez les visites directement dans l\'app. Suivi des no-shows.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border">
        <Link to="/" className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="flex-1 text-center font-semibold text-lg text-foreground">Fonctionnalités</span>
        <div className="w-8" />
      </div>

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
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center shrink-0`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
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