import { ArrowLeft, Crown } from 'lucide-react';
import { useAllowScroll } from '@/hooks/useAllowScroll';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LanguageButtons } from '@/components/ui/LanguageButtons';

export default function CGVAbonnement() {
  useAllowScroll();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 py-8 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          <LanguageButtons dense className="max-w-full overflow-x-auto" />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <Crown className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Conditions Générales de Vente — Abonnements</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 18 décembre 2025</p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 1 – OBJET</h2>
            <p className="text-muted-foreground">
              Les présentes Conditions Générales de Vente Abonnement (ci-après « CGV Abonnement ») définissent les modalités de souscription, d'utilisation et de résiliation des abonnements payants proposés par la plateforme SOMA GATE.
            </p>
            <p className="text-muted-foreground mt-2">
              Elles complètent les Conditions Générales d'Utilisation (CGU), qui restent pleinement applicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 2 – DESCRIPTION DES ABONNEMENTS</h2>
            <p className="text-muted-foreground">SOMA GATE propose des abonnements donnant accès à des fonctionnalités numériques premium, notamment (liste non exhaustive) :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>visibilité accrue des annonces,</li>
              <li>accès à des fonctionnalités avancées,</li>
              <li>outils d'optimisation de recherche ou de mise en relation,</li>
              <li>options réservées aux membres abonnés.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Les abonnements n'incluent aucune prestation immobilière, aucune garantie de transaction, aucun accompagnement juridique ou financier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 3 – ABSENCE D'OBLIGATION DE RÉSULTAT</h2>
            <p className="text-muted-foreground">
              Les abonnements proposés par SOMA GATE sont des services digitaux d'accès à des fonctionnalités.
            </p>
            <p className="text-muted-foreground mt-2">SOMA GATE ne garantit en aucun cas :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>la réalisation d'une vente ou d'une location,</li>
              <li>le nombre de contacts ou de mises en relation,</li>
              <li>un retour sur investissement,</li>
              <li>un résultat commercial ou financier.</li>
            </ul>
            <p className="text-muted-foreground mt-2">La souscription à un abonnement n'emporte aucune obligation de résultat.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 4 – TARIFS</h2>
            <p className="text-muted-foreground">
              Les tarifs des abonnements sont indiqués clairement au moment de la souscription, dans la devise applicable.
            </p>
            <p className="text-muted-foreground mt-2">Les prix peuvent être :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>mensuels,</li>
              <li>trimestriels,</li>
              <li>annuels.</li>
            </ul>
            <p className="text-muted-foreground mt-2">SOMA GATE se réserve le droit de modifier ses tarifs à tout moment.</p>
            <p className="text-muted-foreground mt-2">Toute modification n'affecte pas les abonnements déjà en cours.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 5 – MODALITÉS DE PAIEMENT</h2>
            <p className="text-muted-foreground">Le paiement des abonnements est effectué :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>via l'Apple App Store ou le Google Play Store,</li>
              <li>ou via un prestataire de paiement agréé.</li>
            </ul>
            <p className="text-muted-foreground mt-2">SOMA GATE ne conserve aucune donnée bancaire.</p>
            <p className="text-muted-foreground mt-2">Le paiement est exigible immédiatement lors de la souscription.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 6 – DURÉE ET RENOUVELLEMENT</h2>
            <p className="text-muted-foreground">Les abonnements sont souscrits pour la durée choisie par l'utilisateur.</p>
            <p className="text-muted-foreground mt-2">Sauf mention contraire :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>les abonnements sont renouvelés automatiquement à l'échéance,</li>
              <li>l'utilisateur peut gérer ou désactiver le renouvellement automatique directement depuis son compte Apple ou Google.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 7 – DROIT DE RÉTRACTATION</h2>
            <p className="text-muted-foreground">Conformément aux règles applicables aux services numériques :</p>
            <p className="text-muted-foreground mt-2">En souscrivant à un abonnement et en accédant immédiatement aux fonctionnalités, l'utilisateur :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>reconnaît que l'exécution du service commence immédiatement,</li>
              <li>accepte expressément la perte de son droit de rétractation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 8 – POLITIQUE DE REMBOURSEMENT</h2>
            <p className="text-muted-foreground">Sauf disposition légale impérative ou dysfonctionnement technique avéré imputable à SOMA GATE :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>aucun remboursement n'est accordé,</li>
              <li>les périodes d'abonnement entamées sont dues.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Toute demande de remboursement effectuée via un store est soumise aux politiques de remboursement d'Apple ou de Google.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 9 – SUSPENSION OU RÉSILIATION DE L'ABONNEMENT</h2>
            <p className="text-muted-foreground">SOMA GATE se réserve le droit de suspendre ou résilier un abonnement sans remboursement en cas de :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>non-respect des CGU ou CGV,</li>
              <li>usage frauduleux,</li>
              <li>comportement contraire à la loi ou aux règles de la plateforme.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 10 – ÉVOLUTION DES SERVICES</h2>
            <p className="text-muted-foreground">
              SOMA GATE peut faire évoluer le contenu des abonnements, ajouter ou retirer des fonctionnalités, pour des raisons techniques ou commerciales.
            </p>
            <p className="text-muted-foreground mt-2">Ces évolutions ne donnent lieu à aucun remboursement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 11 – RESPONSABILITÉ</h2>
            <p className="text-muted-foreground">SOMA GATE ne saurait être tenue responsable :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>de l'absence de résultats,</li>
              <li>de décisions prises par l'utilisateur,</li>
              <li>de pertes financières ou commerciales.</li>
            </ul>
            <p className="text-muted-foreground mt-2">L'abonnement constitue un outil d'accès, non une garantie.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 12 – DONNÉES PERSONNELLES</h2>
            <p className="text-muted-foreground">
              Les données personnelles collectées dans le cadre des abonnements sont traitées conformément à la Loi indonésienne n°27 de 2022 sur la protection des données personnelles (PDP Law).
            </p>
            <p className="text-muted-foreground mt-2">Les modalités sont détaillées dans la Politique de confidentialité.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 13 – PROPRIÉTÉ INTELLECTUELLE</h2>
            <p className="text-muted-foreground">
              La souscription à un abonnement n'emporte aucun transfert de droits de propriété intellectuelle.
            </p>
            <p className="text-muted-foreground mt-2">Tous les éléments de SOMA GATE demeurent la propriété exclusive de la plateforme.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 14 – DROIT APPLICABLE ET JURIDICTION</h2>
            <p className="text-muted-foreground">Les présentes CGV Abonnement sont régies par le droit indonésien.</p>
            <p className="text-muted-foreground mt-2">
              En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 15 – CONTACT</h2>
            <p className="text-muted-foreground">
              Toute question relative aux abonnements peut être adressée via les coordonnées indiquées sur la plateforme.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground tracking-wider">
            SOMA GATE — PLATFORM INTELIGENSI PROPERTI
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Terdaftar sebagai Penyelenggara Sistem Elektronik (PSE) — Republik Indonesia
          </p>
        </div>
      </div>
    </div>
  );
}
