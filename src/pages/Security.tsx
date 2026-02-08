import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shield, Lock, Eye, AlertTriangle, UserCheck, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SECURITY_ITEMS = [
  {
    icon: Lock,
    title: 'Messagerie Protégée',
    description: "Les numéros de téléphone sont automatiquement bloqués dans les messages. Toute tentative de partage d'information de contact est détectée et empêchée.",
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Eye,
    title: 'Détection Anti-Fraude',
    description: "Notre système IA analyse chaque message pour détecter les comportements suspects : arnaques, tentatives de virement hors plateforme, liens malveillants.",
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: UserCheck,
    title: 'Score de Fiabilité',
    description: "Chaque utilisateur a un score de 0 à 100 basé sur son comportement : transactions réussies, présence aux visites, respect des engagements.",
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: FileCheck,
    title: 'Traçabilité Complète',
    description: "Chaque action est enregistrée dans un journal d'audit : changements de statut, messages, validations. Rien n'échappe au suivi.",
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Shield,
    title: 'Validation Croisée',
    description: "Les documents doivent être validés par les deux parties avant de passer à l'étape suivante. Aucun engagement unilatéral possible.",
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: AlertTriangle,
    title: 'Alertes de Sécurité',
    description: "Des messages d'avertissement contextuels s'affichent à chaque étape critique : anti-arnaque, rappels de vigilance, protection des données.",
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
];

const TIPS = [
  "Ne partagez jamais vos coordonnées bancaires en dehors de la plateforme.",
  "Méfiez-vous des offres trop belles pour être vraies.",
  "Effectuez toujours une visite physique du bien avant de vous engager.",
  "N'envoyez jamais d'argent avant d'avoir signé les documents officiels.",
  "Vérifiez les documents de propriété (titre foncier, bail, délibération).",
];

export default function Security() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border">
        <Link to="/" className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="flex-1 text-center font-semibold text-lg text-foreground">Sécurité</span>
        <div className="w-8" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Votre sécurité, notre priorité</h1>
          <p className="text-muted-foreground text-base">
            SomaGate met en place de nombreuses mesures pour protéger chaque transaction immobilière.
          </p>
        </div>

        {/* Security features */}
        <div className="grid gap-4">
          {SECURITY_ITEMS.map((item) => (
            <div key={item.title} className="bg-card border border-border rounded-2xl p-5 flex gap-4">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Conseils de vigilance
          </h2>
          <ul className="space-y-3">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Button asChild className="h-14 px-8 rounded-2xl text-base font-semibold">
            <Link to="/auth">
              Rejoindre SomaGate
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}