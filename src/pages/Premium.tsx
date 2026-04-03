import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { Button } from '@/components/ui/button';
import { Crown, Check, Star, Rocket, Shield, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

const PLANS = [
  {
    name: 'Gratuit',
    price: '0',
    current: true,
    features: [
      'Swipe et exploration illimités',
      'Messagerie sécurisée',
      'Jusqu\'à 3 matchs/jour',
      'Score de confiance',
    ],
  },
  {
    name: 'Pro',
    price: '29',
    popular: true,
    features: [
      'Tout le plan Gratuit',
      'Matchs illimités',
      'Super Like illimités',
      'Boost 1x/semaine',
      'Alertes prioritaires',
      'Badge Pro sur le profil',
      'Accès aux stats détaillées',
    ],
  },
  {
    name: 'Business',
    price: '79',
    features: [
      'Tout le plan Pro',
      'Boost quotidien',
      'Mise en relation avocats/notaires',
      'ROI détaillé par bien',
      'Collections partagées',
      'Support prioritaire',
      'Accès anticipé nouvelles features',
    ],
  },
];

export default function Premium() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <AppLayout>
      <PageTopBar>
        <span className="text-lg font-semibold text-foreground">SomaGate Premium</span>
      </PageTopBar>

      <div className="space-y-6 p-4 pb-6">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t('premium.goToNextLevel')}</h2>
          <p className="text-sm text-muted-foreground">Débloquez toutes les fonctionnalités de SomaGate et trouvez votre bien idéal plus rapidement.</p>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl border-2 p-5 relative ${
                plan.popular
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                  <p className="text-2xl font-bold text-foreground">
                    {plan.price}€<span className="text-sm font-normal text-muted-foreground">/mois</span>
                  </p>
                </div>
                {plan.name === 'Pro' && <Star className="h-6 w-6 text-amber-400 fill-amber-400" />}
                {plan.name === 'Business' && <Rocket className="h-6 w-6 text-primary" />}
                {plan.name === 'Gratuit' && <Shield className="h-6 w-6 text-muted-foreground" />}
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className={`h-4 w-4 flex-shrink-0 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-foreground">{feat}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.current ? 'outline' : plan.popular ? 'default' : 'secondary'}
                disabled={plan.current}
              >
                {plan.current ? t('premium.currentPlan') : t('premium.comingSoon')}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-foreground">{t('premium.faq')}</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-foreground">Quand les abonnements seront-ils disponibles ?</p>
              <p className="text-xs text-muted-foreground">Les abonnements seront activés dans une prochaine mise à jour. Vous serez notifié dès qu'ils seront disponibles.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Puis-je annuler à tout moment ?</p>
              <p className="text-xs text-muted-foreground">Oui, vous pouvez annuler votre abonnement à tout moment directement depuis vos paramètres.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
