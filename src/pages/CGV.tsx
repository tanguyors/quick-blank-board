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
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 18 décembre 2025</p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 1 – OBJET</h2>
            <p className="text-muted-foreground">
              Les présentes Conditions Générales de Vente (ci-après les « CGV ») ont pour objet de définir les conditions dans lesquelles SOMA GATE propose des services payants optionnels sur sa plateforme de mise en relation immobilière.
            </p>
            <p className="text-muted-foreground mt-2">
              Les CGV complètent les Conditions Générales d'Utilisation (CGU), qui demeurent applicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 2 – SERVICES PAYANTS</h2>
            <p className="text-muted-foreground">SOMA GATE peut proposer, à tout moment, des services payants, notamment :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>abonnements premium,</li>
              <li>options de mise en avant d'annonces,</li>
              <li>fonctionnalités avancées,</li>
              <li>services digitaux liés à la visibilité ou à l'expérience utilisateur.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Les services payants sont optionnels et ne conditionnent pas l'accès aux fonctionnalités gratuites de base.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 3 – NATURE DES SERVICES (CLAUSE ESSENTIELLE)</h2>
            <p className="text-muted-foreground">Les services payants proposés par SOMA GATE portent exclusivement sur :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>l'accès à des fonctionnalités numériques,</li>
              <li>l'amélioration de la visibilité,</li>
              <li>l'optimisation de l'expérience utilisateur.</li>
            </ul>
            <p className="text-muted-foreground mt-2">SOMA GATE :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>ne garantit aucune transaction,</li>
              <li>ne garantit aucun résultat commercial,</li>
              <li>n'intervient pas dans les négociations,</li>
              <li>n'intervient pas dans les ventes ou locations.</li>
            </ul>
            <p className="text-muted-foreground mt-2">Le paiement d'un service n'emporte aucune obligation de résultat.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 4 – TARIFS</h2>
            <p className="text-muted-foreground">
              Les prix des services payants sont indiqués en devise locale ou internationale, toutes taxes comprises lorsque applicable.
            </p>
            <p className="text-muted-foreground mt-2">SOMA GATE se réserve le droit de modifier ses tarifs à tout moment.</p>
            <p className="text-muted-foreground mt-2">Les services déjà souscrits restent facturés au tarif en vigueur au moment de l'achat.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 5 – MODALITÉS DE PAIEMENT</h2>
            <p className="text-muted-foreground">Les paiements sont effectués :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>via les systèmes de paiement intégrés aux stores (Apple App Store, Google Play),</li>
              <li>ou via des prestataires de paiement agréés.</li>
            </ul>
            <p className="text-muted-foreground mt-2">SOMA GATE ne conserve aucune donnée bancaire.</p>
            <p className="text-muted-foreground mt-2">Le paiement est exigible immédiatement lors de la souscription.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 6 – ABONNEMENTS</h2>
            <p className="text-muted-foreground">Lorsque les services sont proposés sous forme d'abonnement :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>l'abonnement est conclu pour la durée indiquée,</li>
              <li>il peut être mensuel, trimestriel ou annuel,</li>
              <li>le renouvellement peut être automatique selon les paramètres du store.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              L'utilisateur peut gérer ou résilier son abonnement directement depuis son compte Apple ou Google.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 7 – DROIT DE RÉTRACTATION</h2>
            <p className="text-muted-foreground">Conformément aux règles applicables aux contenus et services numériques :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>le droit de rétractation peut ne pas s'appliquer dès lors que l'exécution du service a commencé,</li>
              <li>en souscrivant, l'utilisateur reconnaît expressément renoncer à son droit de rétractation lorsque le service est activé immédiatement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 8 – ABSENCE DE REMBOURSEMENT</h2>
            <p className="text-muted-foreground">Sauf disposition légale impérative ou erreur technique avérée :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>aucun remboursement n'est accordé,</li>
              <li>les services utilisés ou en cours ne peuvent être annulés rétroactivement.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Les demandes de remboursement liées aux paiements via stores sont soumises aux politiques d'Apple ou Google.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 9 – RESPONSABILITÉ</h2>
            <p className="text-muted-foreground">SOMA GATE ne saurait être tenue responsable :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>de l'absence de résultats commerciaux,</li>
              <li>du manque de contacts ou d'opportunités,</li>
              <li>des décisions prises par l'utilisateur.</li>
            </ul>
            <p className="text-muted-foreground mt-2">L'utilisateur reconnaît que les services payants sont des outils, non des garanties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 10 – SUSPENSION DES SERVICES</h2>
            <p className="text-muted-foreground">SOMA GATE se réserve le droit de suspendre ou résilier l'accès à un service payant en cas de :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>non-respect des CGU ou CGV,</li>
              <li>usage frauduleux,</li>
              <li>comportement contraire à la loi.</li>
            </ul>
            <p className="text-muted-foreground mt-2">Aucun remboursement ne sera dû en cas de suspension pour faute.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 11 – MODIFICATION DES SERVICES</h2>
            <p className="text-muted-foreground">
              SOMA GATE peut faire évoluer, modifier ou interrompre un service payant pour des raisons techniques ou commerciales.
            </p>
            <p className="text-muted-foreground mt-2">Lorsque possible, l'utilisateur sera informé à l'avance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 12 – DONNÉES PERSONNELLES</h2>
            <p className="text-muted-foreground">
              Les données personnelles collectées dans le cadre des services payants sont traitées conformément à la Loi indonésienne n°27 de 2022 sur la protection des données personnelles (PDP Law).
            </p>
            <p className="text-muted-foreground mt-2">Les modalités sont précisées dans la Politique de confidentialité.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 13 – PROPRIÉTÉ INTELLECTUELLE</h2>
            <p className="text-muted-foreground">Les services payants n'emportent aucun transfert de droits de propriété intellectuelle.</p>
            <p className="text-muted-foreground mt-2">Toute reproduction ou exploitation non autorisée des éléments de SOMA GATE est interdite.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 14 – DURÉE ET RÉSILIATION</h2>
            <p className="text-muted-foreground">Les CGV s'appliquent pendant toute la durée d'utilisation des services payants.</p>
            <p className="text-muted-foreground mt-2">
              L'utilisateur peut mettre fin à son abonnement selon les modalités prévues par le store utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 15 – DROIT APPLICABLE ET JURIDICTION</h2>
            <p className="text-muted-foreground">Les présentes CGV sont régies par le droit indonésien.</p>
            <p className="text-muted-foreground mt-2">
              En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 16 – CONTACT</h2>
            <p className="text-muted-foreground">
              Toute question relative aux services payants peut être adressée via les coordonnées indiquées sur la plateforme.
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
