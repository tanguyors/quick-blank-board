import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function CGU() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Conditions Générales d'Utilisation</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-2">Dernière mise à jour : 19 mars 2026</p>
        <p className="text-xs text-muted-foreground mb-8 italic">
          Conforme au droit indonésien — UU No. 11/2008 jo. UU No. 19/2016 (ITE), UU No. 27/2022 (PDP), PP No. 71/2019 (PSTE), PP No. 80/2019 (PMSE), UU No. 8/1999 (Perlindungan Konsumen)
        </p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 1 – IDENTITÉ DE L'ÉDITEUR</h2>
            <p className="text-muted-foreground">
              La plateforme SOMA GATE est éditée et exploitée depuis la République d'Indonésie.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Dénomination :</strong> SOMA GATE</li>
              <li><strong>Siège opérationnel :</strong> Bali, Indonésie</li>
              <li><strong>Contact :</strong> contact@somagate.com</li>
              <li><strong>Statut PSE :</strong> Plateforme enregistrée conformément au Permenkominfo No. 5/2020 relatif aux Penyelenggara Sistem Elektronik (PSE)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 2 – PRÉSENTATION DE LA PLATEFORME</h2>
            <p className="text-muted-foreground">
              SOMA GATE est une application mobile et web ayant pour objet la mise en relation immobilière entre utilisateurs (propriétaires, investisseurs, acheteurs, locataires ou personnes intéressées par un projet immobilier) sur le territoire indonésien et à l'international.
            </p>
            <p className="text-muted-foreground mt-2">SOMA GATE permet :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>la consultation d'annonces immobilières,</li>
              <li>la mise en relation entre utilisateurs via un système de matching,</li>
              <li>l'échange d'informations et de messages sécurisés,</li>
              <li>le suivi du cycle de transaction immobilière.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 3 – NATURE DES SERVICES (CLAUSE FONDAMENTALE)</h2>
            <p className="text-muted-foreground">
              SOMA GATE agit exclusivement en tant que plateforme de mise en relation numérique au sens du PP No. 80/2019 relatif au Perdagangan Melalui Sistem Elektronik (PMSE).
            </p>
            <p className="text-muted-foreground mt-2">SOMA GATE :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>n'est pas un agent immobilier (agen properti),</li>
              <li>n'est pas un promoteur (pengembang),</li>
              <li>n'est pas un courtier (pialang/broker),</li>
              <li>n'est pas un notaire (notaris/PPAT),</li>
              <li>n'est pas un conseiller juridique ou financier,</li>
              <li>n'est pas un intermédiaire de paiement.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              SOMA GATE n'intervient dans aucune transaction, négociation, signature ou paiement entre les utilisateurs. Conformément à l'article 65 alinéa 5 de la Loi sur le Commerce (UU No. 7/2014), la plateforme ne peut être tenue responsable des accords conclus entre ses utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 4 – CADRE JURIDIQUE APPLICABLE</h2>
            <p className="text-muted-foreground">La plateforme est exploitée conformément aux lois et règlements indonésiens, notamment :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>UU No. 11/2008</strong> jo. <strong>UU No. 19/2016</strong> — Loi relative à l'information et aux transactions électroniques (UU ITE),</li>
              <li><strong>UU No. 27/2022</strong> — Loi sur la protection des données personnelles (UU PDP),</li>
              <li><strong>PP No. 71/2019</strong> — Règlement gouvernemental sur la mise en œuvre des systèmes et transactions électroniques (PSTE),</li>
              <li><strong>PP No. 80/2019</strong> — Règlement gouvernemental sur le commerce via systèmes électroniques (PMSE),</li>
              <li><strong>Permenkominfo No. 5/2020</strong> — Enregistrement des opérateurs de systèmes électroniques (PSE),</li>
              <li><strong>UU No. 8/1999</strong> — Loi sur la protection des consommateurs (Perlindungan Konsumen),</li>
              <li><strong>UU No. 7/2014</strong> — Loi sur le commerce.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 5 – ACCÈS À LA PLATEFORME</h2>
            <p className="text-muted-foreground">
              L'accès à SOMA GATE est gratuit. Certaines fonctionnalités nécessitent la création d'un compte utilisateur. L'utilisateur reconnaît disposer des moyens techniques nécessaires pour accéder à la plateforme.
            </p>
            <p className="text-muted-foreground mt-2">
              Conformément au PP No. 71/2019, SOMA GATE s'engage à assurer un fonctionnement fiable de son système électronique et à informer les utilisateurs en cas d'interruption planifiée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 6 – CRÉATION DE COMPTE ET CONSENTEMENT</h2>
            <p className="text-muted-foreground">
              Lors de la création de compte, l'utilisateur s'engage à fournir des informations exactes, sincères et à jour, conformément à l'article 28 de l'UU ITE.
            </p>
            <p className="text-muted-foreground mt-2">L'utilisateur est seul responsable :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>de la confidentialité de ses identifiants,</li>
              <li>de l'utilisation de son compte,</li>
              <li>de l'exactitude des informations fournies.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              En créant un compte, l'utilisateur donne son consentement explicite au traitement de ses données personnelles conformément à l'UU PDP No. 27/2022 et à la Politique de Confidentialité de SOMA GATE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 7 – OBLIGATIONS DES UTILISATEURS</h2>
            <p className="text-muted-foreground">L'utilisateur s'engage à :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>utiliser la plateforme de manière loyale et conforme à la loi indonésienne,</li>
              <li>ne pas publier de contenu frauduleux, trompeur, diffamatoire ou illégal au sens de l'UU ITE,</li>
              <li>ne pas distribuer de contenu interdit (art. 27-29 UU ITE),</li>
              <li>respecter les droits des autres utilisateurs,</li>
              <li>ne pas détourner la plateforme de son objet,</li>
              <li>ne pas tenter d'accéder de manière non autorisée aux systèmes (art. 30 UU ITE).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 8 – PUBLICATION DES ANNONCES</h2>
            <p className="text-muted-foreground">
              Les annonces sont publiées sous la seule responsabilité de leurs auteurs, conformément au PP No. 80/2019.
            </p>
            <p className="text-muted-foreground mt-2">L'annonceur déclare et garantit :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>être autorisé à publier le bien concerné,</li>
              <li>disposer des droits nécessaires (titre foncier/SHM, HGB, bail/leasehold, etc.),</li>
              <li>fournir des informations sincères et non trompeuses,</li>
              <li>respecter les réglementations locales (IMB/PBG, zonage, restrictions étrangères).</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              SOMA GATE ne garantit ni la disponibilité, ni l'exactitude, ni la conformité juridique des biens publiés. L'utilisateur acheteur/locataire doit effectuer ses propres vérifications (due diligence) auprès des autorités compétentes (BPN, notaire/PPAT).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 9 – DOCUMENTS IMMOBILIERS</h2>
            <p className="text-muted-foreground">
              Les documents éventuellement fournis (sertifikat tanah, IMB/PBG, contrats, licences, etc.) sont communiqués à titre purement informatif.
            </p>
            <p className="text-muted-foreground mt-2">SOMA GATE :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>ne vérifie pas l'authenticité des documents,</li>
              <li>ne valide pas leur conformité légale,</li>
              <li>recommande expressément de faire vérifier tout document par un notaire (PPAT) ou un avocat agréé.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 10 – MODÉRATION DES CONTENUS</h2>
            <p className="text-muted-foreground">
              Conformément au PP No. 71/2019 et au Permenkominfo No. 5/2020, SOMA GATE procède à une modération des contenus pour vérifier leur conformité avec les règles de la plateforme et la législation applicable.
            </p>
            <p className="text-muted-foreground mt-2">
              Cette modération ne constitue en aucun cas une validation juridique, financière ou commerciale du contenu publié. SOMA GATE se réserve le droit de retirer tout contenu contraire à la loi indonésienne dans un délai de 4x24 heures après signalement, conformément aux obligations PSE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 11 – MISE EN RELATION ET COMMUNICATION</h2>
            <p className="text-muted-foreground">
              SOMA GATE met à disposition des outils de communication sécurisés entre utilisateurs. SOMA GATE n'intervient pas dans les échanges et ne peut être tenue responsable :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>du contenu des messages échangés,</li>
              <li>des engagements pris entre utilisateurs,</li>
              <li>des tentatives de fraude ou d'arnaque entre utilisateurs.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              La plateforme dispose d'un système de détection automatique des échanges de coordonnées hors plateforme à des fins de sécurité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 12 – TRANSACTIONS ET PAIEMENTS</h2>
            <p className="text-muted-foreground">
              SOMA GATE ne gère aucun paiement, acompte ou flux financier entre utilisateurs. Toute transaction financière est réalisée en dehors de la plateforme, sous la responsabilité exclusive des parties concernées.
            </p>
            <p className="text-muted-foreground mt-2">
              SOMA GATE recommande vivement de passer par un notaire/PPAT agréé pour toute transaction immobilière en Indonésie, conformément aux dispositions du Code Civil indonésien (KUHPerdata) et de la Loi Agraire (UUPA No. 5/1960).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 13 – LIMITATION DE RESPONSABILITÉ</h2>
            <p className="text-muted-foreground">
              Conformément à l'UU No. 8/1999 sur la protection des consommateurs et dans les limites permises par la loi, SOMA GATE ne saurait être tenue responsable :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>des informations publiées par les utilisateurs,</li>
              <li>des décisions prises par les utilisateurs sur la base de ces informations,</li>
              <li>des litiges, fraudes ou pertes financières résultant d'interactions entre utilisateurs,</li>
              <li>des dommages directs ou indirects liés à l'utilisation de la plateforme,</li>
              <li>de l'indisponibilité temporaire de la plateforme pour raison de force majeure.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              L'utilisateur reconnaît utiliser la plateforme à ses propres risques et sous sa propre responsabilité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 14 – DONNÉES PERSONNELLES</h2>
            <p className="text-muted-foreground">
              Les données personnelles sont collectées et traitées conformément à la <strong>Loi UU No. 27/2022 sur la Protection des Données Personnelles (UU PDP)</strong> et à la Politique de Confidentialité de SOMA GATE.
            </p>
            <p className="text-muted-foreground mt-2">L'utilisateur dispose des droits suivants (Chapitre IV UU PDP) :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>droit d'information sur le traitement de ses données,</li>
              <li>droit d'accès à ses données personnelles,</li>
              <li>droit de correction des données inexactes,</li>
              <li>droit de suppression de ses données,</li>
              <li>droit de retrait du consentement,</li>
              <li>droit d'opposition au traitement automatisé,</li>
              <li>droit à la portabilité des données.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 15 – PROPRIÉTÉ INTELLECTUELLE</h2>
            <p className="text-muted-foreground">
              L'ensemble des éléments composant SOMA GATE (marque, logo, interface, algorithmes, contenus, fonctionnalités) est protégé par la <strong>UU No. 28/2014</strong> sur les droits d'auteur et la <strong>UU No. 20/2016</strong> sur les marques en Indonésie. Toute reproduction, représentation ou exploitation non autorisée est interdite et constitue une infraction pénale.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 16 – SUSPENSION ET RÉSILIATION</h2>
            <p className="text-muted-foreground">
              SOMA GATE se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU, d'usage frauduleux ou de contenu contraire à la loi indonésienne (notamment les articles 27-29 UU ITE).
            </p>
            <p className="text-muted-foreground mt-2">
              L'utilisateur peut demander la suppression de son compte à tout moment. La suppression entraîne l'effacement des données personnelles conformément à l'UU PDP, sous réserve des obligations légales de conservation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 17 – MODIFICATION DES CGU</h2>
            <p className="text-muted-foreground">
              SOMA GATE se réserve le droit de modifier les présentes CGU à tout moment. La version en vigueur est celle accessible sur la plateforme. Conformément à l'UU No. 8/1999 sur la protection des consommateurs, les utilisateurs seront notifiés de toute modification substantielle au moins 14 jours avant son entrée en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 18 – RÉSOLUTION DES LITIGES</h2>
            <p className="text-muted-foreground">
              Les présentes CGU sont régies par le droit de la République d'Indonésie.
            </p>
            <p className="text-muted-foreground mt-2">En cas de litige :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Phase 1 :</strong> Résolution amiable — les parties s'engagent à rechercher un accord à l'amiable dans un délai de 30 jours,</li>
              <li><strong>Phase 2 :</strong> Médiation — en cas d'échec, recours à la médiation via le Badan Penyelesaian Sengketa Konsumen (BPSK) conformément à l'UU No. 8/1999,</li>
              <li><strong>Phase 3 :</strong> Juridiction — à défaut, le litige sera soumis au Pengadilan Negeri (tribunal de première instance) compétent à Denpasar, Bali.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 19 – DISPOSITIONS GÉNÉRALES</h2>
            <p className="text-muted-foreground">
              Si l'une des clauses des présentes CGU était déclarée nulle ou inapplicable, les autres clauses demeureraient en vigueur. Le fait pour SOMA GATE de ne pas exercer un droit prévu aux présentes ne constitue pas une renonciation à ce droit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">ARTICLE 20 – CONTACT</h2>
            <p className="text-muted-foreground">
              Toute question relative aux présentes CGU peut être adressée à :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Email :</strong> contact@somagate.com</li>
              <li><strong>Protection des données :</strong> privacy@somagate.com</li>
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