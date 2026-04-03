import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicNavBar } from '@/components/layout/PublicNavBar';

import iconAssurance from '@/assets/icons/assurance.png';
import iconSecurity from '@/assets/icons/security.png';
import iconAccueil from '@/assets/icons/accueil.png';
import iconDocsign from '@/assets/icons/docsign.png';
import iconSearch from '@/assets/icons/search.png';

const SECURITY_ITEMS = [
  {
    icon: iconAssurance,
    title: 'Messagerie Protégée',
    description: "Les numéros de téléphone sont automatiquement bloqués dans les messages. Toute tentative de partage d'information de contact est détectée et empêchée.",
  },
  {
    icon: iconSecurity,
    title: 'Détection Anti-Fraude',
    description: "Notre système IA analyse chaque message pour détecter les comportements suspects : arnaques, tentatives de virement hors plateforme, liens malveillants.",
  },
  {
    icon: iconAccueil,
    title: 'Score de Fiabilité',
    description: "Chaque utilisateur a un score de 0 à 100 basé sur son comportement : transactions réussies, présence aux visites, respect des engagements.",
  },
  {
    icon: iconDocsign,
    title: 'Traçabilité Complète',
    description: "Chaque action est enregistrée dans un journal d'audit : changements de statut, messages, validations. Rien n'échappe au suivi.",
  },
  {
    icon: iconSearch,
    title: 'Validation Croisée',
    description: "Les documents doivent être validés par les deux parties avant de passer à l'étape suivante. Aucun engagement unilatéral possible.",
  },
  {
    icon: iconAssurance,
    title: 'Alertes de Sécurité',
    description: "Des messages d'avertissement contextuels s'affichent à chaque étape critique : anti-arnaque, rappels de vigilance, protection des données.",
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
      <PublicNavBar title="Sécurité" />

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
            <img src={iconAssurance} alt="" className="h-14 w-14 object-contain" />
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
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0">
                <img src={item.icon} alt="" className="h-12 w-12 object-contain" />
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
            <img src={iconAssurance} alt="" className="h-6 w-6 object-contain" />
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
