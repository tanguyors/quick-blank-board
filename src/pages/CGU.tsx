import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LanguageButtons } from '@/components/ui/LanguageButtons';

export default function CGU() {
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
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Conditions Générales d'Utilisation</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 18 décembre 2025</p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 1 – PRÉSENTATION DE LA PLATEFORME</h2>
            <p className="text-muted-foreground">
              SOMA GATE est une application mobile et web exploitée depuis l'Indonésie, ayant pour objet la mise en relation immobilière entre utilisateurs (propriétaires, investisseurs, acheteurs, locataires ou personnes intéressées par un projet immobilier).
            </p>
            <p className="text-muted-foreground mt-2">SOMA GATE est une plateforme technologique permettant :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>la consultation d'annonces immobilières,</li>
              <li>la mise en relation entre utilisateurs,</li>
              <li>l'échange d'informations et de messages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 2 – NATURE DES SERVICES (CLAUSE FONDAMENTALE)</h2>
            <p className="text-muted-foreground">SOMA GATE agit exclusivement en tant que plateforme de mise en relation.</p>
            <p className="text-muted-foreground mt-2">SOMA GATE :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>n'est pas un agent immobilier,</li>
              <li>n'est pas un promoteur,</li>
              <li>n'est pas un courtier,</li>
              <li>n'est pas un notaire,</li>
              <li>n'est pas un conseiller juridique ou financier,</li>
              <li>n'est pas un intermédiaire de paiement.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              SOMA GATE n'intervient dans aucune transaction, négociation, signature ou paiement entre les utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 3 – CADRE JURIDIQUE APPLICABLE</h2>
            <p className="text-muted-foreground">La plateforme est exploitée conformément :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>à la Loi indonésienne n°11 de 2008 relative aux systèmes électroniques et aux transactions électroniques (ITE), telle que modifiée,</li>
              <li>à la Loi n°27 de 2022 sur la protection des données personnelles (PDP Law),</li>
              <li>aux réglementations applicables aux Plateformes de Systèmes Électroniques (PSE).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 4 – ACCÈS À LA PLATEFORME</h2>
            <p className="text-muted-foreground">L'accès à SOMA GATE est gratuit.</p>
            <p className="text-muted-foreground mt-2">Certaines fonctionnalités nécessitent la création d'un compte utilisateur.</p>
            <p className="text-muted-foreground mt-2">L'utilisateur reconnaît disposer des moyens techniques nécessaires pour accéder à la plateforme.</p>
            <p className="text-muted-foreground mt-2">SOMA GATE se réserve le droit de suspendre temporairement l'accès pour maintenance ou raisons de sécurité.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 5 – CRÉATION DE COMPTE</h2>
            <p className="text-muted-foreground">
              Lors de la création de compte, l'utilisateur s'engage à fournir des informations exactes, sincères et à jour.
            </p>
            <p className="text-muted-foreground mt-2">L'utilisateur est seul responsable :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>de la confidentialité de ses identifiants,</li>
              <li>de l'utilisation de son compte.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 6 – OBLIGATIONS DES UTILISATEURS</h2>
            <p className="text-muted-foreground">L'utilisateur s'engage à :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>utiliser la plateforme de manière loyale et conforme à la loi,</li>
              <li>ne pas publier de contenu frauduleux, trompeur ou illégal,</li>
              <li>respecter les droits des autres utilisateurs,</li>
              <li>ne pas détourner la plateforme de son objet.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 7 – PUBLICATION DES ANNONCES</h2>
            <p className="text-muted-foreground">Les annonces sont publiées sous la seule responsabilité de leurs auteurs.</p>
            <p className="text-muted-foreground mt-2">L'annonceur déclare :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>être autorisé à publier le bien concerné,</li>
              <li>disposer des droits nécessaires,</li>
              <li>fournir des informations sincères.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              SOMA GATE ne garantit ni la disponibilité, ni l'exactitude, ni la conformité des biens publiés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 8 – DOCUMENTS IMMOBILIERS</h2>
            <p className="text-muted-foreground">
              Les documents éventuellement fournis (titres de propriété, contrats de location, permis de construire, zonage, licences, etc.) sont communiqués à titre informatif uniquement.
            </p>
            <p className="text-muted-foreground mt-2">SOMA GATE :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>ne vérifie pas l'authenticité des documents,</li>
              <li>ne valide pas leur conformité.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 9 – MODÉRATION DES CONTENUS</h2>
            <p className="text-muted-foreground">
              SOMA GATE peut procéder à une modération des contenus afin de vérifier leur conformité avec les règles de la plateforme.
            </p>
            <p className="text-muted-foreground mt-2">
              Cette modération vise à limiter les abus, contenus inappropriés ou manifestement trompeurs.
            </p>
            <p className="text-muted-foreground mt-2">
              Elle ne constitue en aucun cas une validation juridique, financière ou commerciale.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 10 – MISE EN RELATION ET COMMUNICATION</h2>
            <p className="text-muted-foreground">SOMA GATE met à disposition des outils de communication entre utilisateurs.</p>
            <p className="text-muted-foreground mt-2">SOMA GATE n'intervient pas dans les échanges et ne peut être tenue responsable :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>du contenu des messages,</li>
              <li>des engagements pris entre utilisateurs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 11 – TRANSACTIONS ET PAIEMENTS</h2>
            <p className="text-muted-foreground">SOMA GATE ne gère aucun paiement, acompte ou flux financier.</p>
            <p className="text-muted-foreground mt-2">
              Toute transaction financière est réalisée en dehors de la plateforme, sous la responsabilité exclusive des parties concernées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 12 – LIMITATION DE RESPONSABILITÉ</h2>
            <p className="text-muted-foreground">SOMA GATE ne saurait être tenue responsable :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>des informations publiées par les utilisateurs,</li>
              <li>des décisions prises par les utilisateurs,</li>
              <li>des litiges, fraudes ou pertes financières,</li>
              <li>des dommages directs ou indirects.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              L'utilisateur reconnaît utiliser la plateforme à ses propres risques.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 13 – DONNÉES PERSONNELLES</h2>
            <p className="text-muted-foreground">
              Les données personnelles sont traitées conformément à la Loi PDP indonésienne et à la Politique de confidentialité de SOMA GATE.
            </p>
            <p className="text-muted-foreground mt-2">
              L'utilisateur dispose de droits d'accès, de rectification et de suppression de ses données.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 14 – PROPRIÉTÉ INTELLECTUELLE</h2>
            <p className="text-muted-foreground">
              L'ensemble des éléments composant SOMA GATE (marque, logo, interface, contenus, fonctionnalités) est protégé par les lois relatives à la propriété intellectuelle.
            </p>
            <p className="text-muted-foreground mt-2">Toute reproduction non autorisée est interdite.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 15 – SUSPENSION ET RÉSILIATION</h2>
            <p className="text-muted-foreground">
              SOMA GATE se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU.
            </p>
            <p className="text-muted-foreground mt-2">
              L'utilisateur peut demander la suppression de son compte à tout moment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 16 – MODIFICATION DES CGU</h2>
            <p className="text-muted-foreground">
              SOMA GATE se réserve le droit de modifier les présentes CGU à tout moment.
            </p>
            <p className="text-muted-foreground mt-2">
              La version en vigueur est celle accessible sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 17 – DROIT APPLICABLE ET JURIDICTION</h2>
            <p className="text-muted-foreground">Les présentes CGU sont régies par le droit indonésien.</p>
            <p className="text-muted-foreground mt-2">
              En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 18 – CONTACT</h2>
            <p className="text-muted-foreground">
              Toute question relative aux présentes CGU peut être adressée via les coordonnées indiquées dans l'application.
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
