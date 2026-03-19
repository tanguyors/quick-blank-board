import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function CGV() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Conditions Générales de Vente</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-2">Dernière mise à jour : 19 mars 2026</p>
        <p className="text-xs text-muted-foreground mb-8 italic">
          Conforme au droit indonésien — UU No. 8/1999 (Perlindungan Konsumen), PP No. 80/2019 (PMSE), UU No. 27/2022 (PDP)
        </p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 1 – OBJET</h2>
            <p className="text-muted-foreground">
              Les présentes Conditions Générales de Vente (ci-après les « CGV ») ont pour objet de définir les conditions dans lesquelles SOMA GATE propose des services payants optionnels sur sa plateforme de mise en relation immobilière, conformément au PP No. 80/2019 relatif au commerce via systèmes électroniques (PMSE).
            </p>
            <p className="text-muted-foreground mt-2">
              Les CGV complètent les Conditions Générales d'Utilisation (CGU), qui demeurent applicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 2 – SERVICES PAYANTS</h2>
            <p className="text-muted-foreground">SOMA GATE peut proposer des services payants, notamment :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>abonnements premium (boost de visibilité, fonctionnalités avancées),</li>
              <li>options de mise en avant d'annonces,</li>
              <li>outils d'analyse et de statistiques avancés,</li>
              <li>services digitaux liés à la visibilité ou à l'expérience utilisateur.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Les services payants sont optionnels et ne conditionnent pas l'accès aux fonctionnalités gratuites de base, conformément au principe de transparence de l'UU No. 8/1999.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 3 – NATURE DES SERVICES (CLAUSE ESSENTIELLE)</h2>
            <p className="text-muted-foreground">Les services payants portent exclusivement sur l'accès à des fonctionnalités numériques.</p>
            <p className="text-muted-foreground mt-2">Conformément à l'article 7 de l'UU No. 8/1999, SOMA GATE informe clairement que :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>aucune transaction immobilière n'est garantie,</li>
              <li>aucun résultat commercial n'est garanti,</li>
              <li>SOMA GATE n'intervient pas dans les négociations, ventes ou locations,</li>
              <li>le paiement d'un service n'emporte aucune obligation de résultat.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 4 – INFORMATION PRÉ-CONTRACTUELLE</h2>
            <p className="text-muted-foreground">
              Conformément à l'article 9 du PP No. 80/2019, avant toute souscription, l'utilisateur reçoit les informations suivantes :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>description détaillée du service,</li>
              <li>prix total incluant toutes les taxes applicables,</li>
              <li>durée de l'engagement,</li>
              <li>conditions de renouvellement et de résiliation,</li>
              <li>identité de l'éditeur de la plateforme.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 5 – TARIFS</h2>
            <p className="text-muted-foreground">
              Les prix des services payants sont indiqués en Rupiah indonésienne (IDR) ou en devise internationale, toutes taxes comprises (PPN incluse le cas échéant, conformément à la UU No. 7/2021 sur l'harmonisation fiscale).
            </p>
            <p className="text-muted-foreground mt-2">
              SOMA GATE se réserve le droit de modifier ses tarifs à tout moment. Les services déjà souscrits restent facturés au tarif en vigueur au moment de l'achat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 6 – MODALITÉS DE PAIEMENT</h2>
            <p className="text-muted-foreground">Les paiements sont effectués :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>via les systèmes de paiement intégrés aux stores (Apple App Store, Google Play),</li>
              <li>ou via des prestataires de paiement agréés par Bank Indonesia (BI).</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              SOMA GATE ne conserve aucune donnée bancaire ou de carte de crédit. Le paiement est exigible immédiatement lors de la souscription. Un reçu électronique est automatiquement envoyé conformément au PP No. 80/2019.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 7 – ABONNEMENTS</h2>
            <p className="text-muted-foreground">Lorsque les services sont proposés sous forme d'abonnement :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>l'abonnement est conclu pour la durée indiquée (mensuel, trimestriel ou annuel),</li>
              <li>le renouvellement peut être automatique, avec notification préalable,</li>
              <li>l'utilisateur peut gérer ou résilier son abonnement depuis son compte Apple, Google ou la plateforme.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Les conditions détaillées des abonnements sont définies dans les CGV Abonnement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 8 – DROIT DE RÉTRACTATION</h2>
            <p className="text-muted-foreground">
              Conformément aux pratiques applicables aux contenus et services numériques en Indonésie, et dans le respect de l'UU No. 8/1999 :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>le droit de rétractation peut ne pas s'appliquer dès que l'exécution du service numérique a commencé,</li>
              <li>en souscrivant, l'utilisateur reconnaît expressément être informé de cette limitation,</li>
              <li>l'utilisateur dispose toutefois d'un droit de réclamation via les canaux de support SOMA GATE.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 9 – POLITIQUE DE REMBOURSEMENT</h2>
            <p className="text-muted-foreground">
              Sauf disposition légale impérative (UU No. 8/1999, art. 19) ou erreur technique avérée imputable à SOMA GATE :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>aucun remboursement n'est accordé pour les services consommés,</li>
              <li>en cas de dysfonctionnement technique empêchant l'accès au service, SOMA GATE s'engage à fournir une compensation appropriée (extension d'abonnement ou remboursement),</li>
              <li>les demandes de remboursement via stores sont soumises aux politiques d'Apple ou Google.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 10 – RESPONSABILITÉ</h2>
            <p className="text-muted-foreground">
              Dans les limites autorisées par l'UU No. 8/1999, SOMA GATE ne saurait être tenue responsable :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>de l'absence de résultats commerciaux,</li>
              <li>du manque de contacts ou d'opportunités,</li>
              <li>des décisions prises par l'utilisateur.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              En tout état de cause, la responsabilité de SOMA GATE est limitée au montant payé par l'utilisateur pour le service concerné.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 11 – SUSPENSION DES SERVICES</h2>
            <p className="text-muted-foreground">
              SOMA GATE se réserve le droit de suspendre ou résilier l'accès à un service payant en cas de non-respect des CGU ou CGV, d'usage frauduleux, ou de comportement contraire à la loi. Aucun remboursement ne sera dû en cas de suspension pour faute de l'utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 12 – MODIFICATION DES SERVICES</h2>
            <p className="text-muted-foreground">
              SOMA GATE peut faire évoluer, modifier ou interrompre un service payant pour des raisons techniques ou commerciales. Les utilisateurs seront informés au moins 14 jours avant toute modification substantielle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 13 – DONNÉES PERSONNELLES</h2>
            <p className="text-muted-foreground">
              Les données personnelles collectées dans le cadre des services payants sont traitées conformément à la <strong>UU No. 27/2022 (UU PDP)</strong>. Les modalités sont précisées dans la Politique de Confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 14 – PROPRIÉTÉ INTELLECTUELLE</h2>
            <p className="text-muted-foreground">
              Les services payants n'emportent aucun transfert de droits de propriété intellectuelle protégés par la UU No. 28/2014 (Hak Cipta). Toute reproduction ou exploitation non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 15 – RÉSOLUTION DES LITIGES</h2>
            <p className="text-muted-foreground">
              Les présentes CGV sont régies par le droit de la République d'Indonésie. En cas de litige :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>résolution amiable dans un délai de 30 jours,</li>
              <li>médiation via le BPSK (Badan Penyelesaian Sengketa Konsumen) conformément à l'UU No. 8/1999,</li>
              <li>à défaut, compétence du Pengadilan Negeri de Denpasar, Bali.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 16 – CONTACT</h2>
            <p className="text-muted-foreground">
              Toute question relative aux services payants peut être adressée à :
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