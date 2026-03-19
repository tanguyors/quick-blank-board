import { ArrowLeft, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function CGVAbonnement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Crown className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Conditions Générales de Vente — Abonnements</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-2">Dernière mise à jour : 19 mars 2026</p>
        <p className="text-xs text-muted-foreground mb-8 italic">
          Conforme au droit indonésien — UU No. 8/1999 (Perlindungan Konsumen), PP No. 80/2019 (PMSE), UU No. 27/2022 (PDP)
        </p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 1 – OBJET</h2>
            <p className="text-muted-foreground">
              Les présentes Conditions Générales de Vente Abonnement (ci-après « CGV Abonnement ») définissent les modalités de souscription, d'utilisation et de résiliation des abonnements payants proposés par la plateforme SOMA GATE, conformément au PP No. 80/2019 relatif au commerce électronique (PMSE).
            </p>
            <p className="text-muted-foreground mt-2">
              Elles complètent les CGU et les CGV, qui restent pleinement applicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 2 – DESCRIPTION DES ABONNEMENTS</h2>
            <p className="text-muted-foreground">SOMA GATE propose des abonnements premium donnant accès à :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>visibilité accrue des annonces (boost, mise en avant),</li>
              <li>accès à des fonctionnalités avancées (analytics, filtres premium),</li>
              <li>outils d'optimisation de recherche et de mise en relation,</li>
              <li>options exclusives aux membres abonnés.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Conformément à l'article 7 de l'UU No. 8/1999, les abonnements n'incluent aucune prestation immobilière, aucune garantie de transaction, aucun accompagnement juridique ou financier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 3 – ABSENCE D'OBLIGATION DE RÉSULTAT</h2>
            <p className="text-muted-foreground">
              Les abonnements sont des services digitaux d'accès à des fonctionnalités. SOMA GATE ne garantit en aucun cas :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>la réalisation d'une vente, d'une location ou d'une transaction,</li>
              <li>un nombre minimum de contacts ou de mises en relation,</li>
              <li>un retour sur investissement ou un résultat commercial.</li>
            </ul>
            <p className="text-muted-foreground mt-2">La souscription n'emporte aucune obligation de résultat.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 4 – INFORMATION PRÉ-CONTRACTUELLE</h2>
            <p className="text-muted-foreground">
              Avant toute souscription, conformément au PP No. 80/2019, l'utilisateur reçoit une information claire et complète comprenant :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>la description précise des fonctionnalités incluses,</li>
              <li>le prix total TTC (PPN incluse le cas échéant),</li>
              <li>la durée de l'engagement et les conditions de renouvellement,</li>
              <li>les modalités de résiliation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 5 – TARIFS</h2>
            <p className="text-muted-foreground">
              Les tarifs sont indiqués clairement au moment de la souscription, en IDR ou devise internationale. Les abonnements peuvent être mensuels, trimestriels ou annuels.
            </p>
            <p className="text-muted-foreground mt-2">
              SOMA GATE se réserve le droit de modifier ses tarifs. Toute modification n'affecte pas les abonnements en cours jusqu'à leur échéance. Les utilisateurs seront notifiés au moins 14 jours avant l'entrée en vigueur de nouveaux tarifs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 6 – MODALITÉS DE PAIEMENT</h2>
            <p className="text-muted-foreground">Le paiement des abonnements est effectué :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>via l'Apple App Store ou le Google Play Store,</li>
              <li>ou via un prestataire de paiement agréé par Bank Indonesia (BI).</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              SOMA GATE ne conserve aucune donnée bancaire. Un reçu électronique est automatiquement fourni.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 7 – DURÉE ET RENOUVELLEMENT</h2>
            <p className="text-muted-foreground">Les abonnements sont souscrits pour la durée choisie. Sauf mention contraire :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>les abonnements sont renouvelés automatiquement à l'échéance,</li>
              <li>une notification de renouvellement est envoyée au moins 7 jours avant l'échéance,</li>
              <li>l'utilisateur peut désactiver le renouvellement depuis son compte Apple, Google ou SOMA GATE.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 8 – RÉSILIATION PAR L'UTILISATEUR</h2>
            <p className="text-muted-foreground">L'utilisateur peut résilier son abonnement à tout moment :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>via les paramètres de son compte Apple ou Google,</li>
              <li>via les paramètres de l'application SOMA GATE,</li>
              <li>par email à contact@somagate.com.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              La résiliation prend effet à la fin de la période en cours. L'accès aux fonctionnalités premium est maintenu jusqu'à cette date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 9 – DROIT DE RÉTRACTATION</h2>
            <p className="text-muted-foreground">
              Conformément aux pratiques des services numériques en Indonésie :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>l'exécution du service commence immédiatement après la souscription,</li>
              <li>l'utilisateur en est expressément informé avant la souscription,</li>
              <li>le droit de rétractation est limité par l'accès immédiat aux fonctionnalités.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 10 – POLITIQUE DE REMBOURSEMENT</h2>
            <p className="text-muted-foreground">
              Conformément à l'article 19 de l'UU No. 8/1999 sur la protection des consommateurs :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>en cas de dysfonctionnement technique avéré empêchant l'accès au service, SOMA GATE s'engage à fournir une compensation (extension ou remboursement),</li>
              <li>hors cas de dysfonctionnement, aucun remboursement n'est accordé pour les périodes entamées,</li>
              <li>les demandes de remboursement via stores sont soumises aux politiques d'Apple ou de Google.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 11 – SUSPENSION OU RÉSILIATION PAR SOMA GATE</h2>
            <p className="text-muted-foreground">SOMA GATE se réserve le droit de suspendre ou résilier un abonnement sans remboursement en cas de :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>non-respect des CGU, CGV ou CGV Abonnement,</li>
              <li>usage frauduleux ou abusif,</li>
              <li>comportement contraire à la loi indonésienne (notamment UU ITE).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 12 – ÉVOLUTION DES SERVICES</h2>
            <p className="text-muted-foreground">
              SOMA GATE peut faire évoluer le contenu des abonnements pour des raisons techniques ou commerciales. Les modifications substantielles seront notifiées 14 jours à l'avance. En cas de suppression d'une fonctionnalité majeure, l'utilisateur peut résilier sans frais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 13 – RESPONSABILITÉ</h2>
            <p className="text-muted-foreground">
              Dans les limites de l'UU No. 8/1999, SOMA GATE ne saurait être tenue responsable de l'absence de résultats, de décisions de l'utilisateur, ou de pertes financières. La responsabilité de SOMA GATE est limitée au montant de l'abonnement en cours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 14 – DONNÉES PERSONNELLES</h2>
            <p className="text-muted-foreground">
              Les données collectées dans le cadre des abonnements sont traitées conformément à la <strong>UU No. 27/2022 (UU PDP)</strong>. L'utilisateur dispose de tous les droits prévus au Chapitre IV de la UU PDP (accès, correction, suppression, portabilité, retrait du consentement). Voir la Politique de Confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 15 – PROPRIÉTÉ INTELLECTUELLE</h2>
            <p className="text-muted-foreground">
              La souscription n'emporte aucun transfert de droits de propriété intellectuelle. Tous les éléments de SOMA GATE sont protégés par la UU No. 28/2014 (Hak Cipta) et la UU No. 20/2016 (Merek).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 16 – RÉSOLUTION DES LITIGES</h2>
            <p className="text-muted-foreground">
              Les présentes CGV Abonnement sont régies par le droit indonésien. En cas de litige :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>résolution amiable (30 jours),</li>
              <li>médiation via le BPSK conformément à l'UU No. 8/1999,</li>
              <li>compétence du Pengadilan Negeri de Denpasar, Bali.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 17 – CONTACT</h2>
            <p className="text-muted-foreground">
              Toute question relative aux abonnements :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Email :</strong> contact@somagate.com</li>
              <li><strong>Support :</strong> disponible via l'application</li>
            </ul>
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