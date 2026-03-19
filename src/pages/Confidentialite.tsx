import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Confidentialite() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Lock className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Politique de Confidentialité</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-2">Dernière mise à jour : 19 mars 2026</p>
        <p className="text-xs text-muted-foreground mb-8 italic">
          Conforme à la UU No. 27/2022 sur la Protection des Données Personnelles (Undang-Undang Pelindungan Data Pribadi / UU PDP) — République d'Indonésie
        </p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Responsable du traitement (Pengendali Data Pribadi)</h2>
            <p className="text-muted-foreground">
              Au sens de l'article 1 alinéa 4 de la UU PDP, le responsable du traitement des données personnelles est :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Dénomination :</strong> SOMA GATE</li>
              <li><strong>Siège opérationnel :</strong> Bali, Indonésie</li>
              <li><strong>Délégué à la protection des données (DPO) :</strong> privacy@somagate.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Base juridique du traitement (Dasar Hukum)</h2>
            <p className="text-muted-foreground">
              Conformément à l'article 20 de la UU PDP, le traitement des données personnelles repose sur les bases juridiques suivantes :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Consentement explicite</strong> (Persetujuan) — art. 20 al. 2a : donné lors de la création du compte et pouvant être retiré à tout moment,</li>
              <li><strong>Exécution d'un contrat</strong> — art. 20 al. 2b : traitement nécessaire à la fourniture des services SOMA GATE,</li>
              <li><strong>Obligation légale</strong> — art. 20 al. 2c : obligations comptables, fiscales et de conservation prévues par la loi indonésienne,</li>
              <li><strong>Intérêt légitime</strong> — art. 20 al. 2f : amélioration et sécurisation de la plateforme.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Catégories de données collectées</h2>
            <p className="text-muted-foreground"><strong>Données personnelles générales (Data Pribadi Umum) :</strong></p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>Nom complet et informations de profil</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone / WhatsApp</li>
              <li>Date de naissance</li>
              <li>Nationalité</li>
              <li>Photo de profil</li>
              <li>Informations professionnelles (nom et adresse de l'entreprise)</li>
            </ul>
            <p className="text-muted-foreground mt-3"><strong>Données d'utilisation :</strong></p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>Préférences immobilières (types de biens, budget, secteurs, filtres)</li>
              <li>Historique des interactions (swipes, matchs, favoris)</li>
              <li>Messages échangés sur la plateforme</li>
              <li>Données de géolocalisation (avec autorisation explicite)</li>
              <li>Données de connexion (adresse IP, type d'appareil, navigateur)</li>
              <li>Données de transaction (historique du workflow)</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              <strong>Données sensibles (Data Pribadi Spesifik) :</strong> SOMA GATE ne collecte aucune donnée sensible au sens de l'article 4 alinéa 2 de la UU PDP (données biométriques, données de santé, données financières bancaires, opinions politiques/religieuses, données génétiques, casier judiciaire).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Finalités du traitement (Tujuan Pemrosesan)</h2>
            <p className="text-muted-foreground">
              Conformément à l'article 16 de la UU PDP, les données sont traitées pour des finalités précises, limitées et légitimes :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>Mise en relation entre acheteurs et vendeurs (matching immobilier),</li>
              <li>Personnalisation de l'expérience utilisateur,</li>
              <li>Envoi de notifications pertinentes (matchs, visites, messages),</li>
              <li>Sécurisation des échanges et détection de fraude,</li>
              <li>Suivi du cycle de transaction immobilière,</li>
              <li>Amélioration continue des services de la plateforme,</li>
              <li>Communication avec les utilisateurs (assistance, informations),</li>
              <li>Respect des obligations légales et fiscales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Durée de conservation (Retensi Data)</h2>
            <p className="text-muted-foreground">
              Conformément à l'article 25 de la UU PDP, les données personnelles sont conservées selon les durées suivantes :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Données de compte actif :</strong> pendant toute la durée d'utilisation du compte,</li>
              <li><strong>Données après suppression du compte :</strong> maximum 30 jours (période de grâce pour récupération), puis suppression définitive,</li>
              <li><strong>Données après inactivité :</strong> maximum 3 ans après la dernière activité, puis suppression automatique,</li>
              <li><strong>Données de transaction :</strong> 5 ans conformément aux obligations fiscales indonésiennes (UU No. 28/2007),</li>
              <li><strong>Logs de sécurité :</strong> 1 an conformément au PP No. 71/2019.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              À l'expiration de la durée de conservation, les données sont définitivement effacées ou anonymisées de manière irréversible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Partage et transfert des données</h2>
            <p className="text-muted-foreground"><strong>Les données personnelles ne sont jamais vendues à des tiers.</strong></p>
            <p className="text-muted-foreground mt-2">Les données peuvent être partagées uniquement :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Avec les autres utilisateurs :</strong> dans le cadre d'une mise en relation immobilière (match, visite, transaction), avec le consentement de l'utilisateur,</li>
              <li><strong>Avec les prestataires techniques :</strong> hébergement (Supabase), email, analytics — accès limité aux données strictement nécessaires, sous contrat de traitement (Perjanjian Pemrosesan Data),</li>
              <li><strong>Avec les autorités :</strong> sur demande légale conformément à la législation indonésienne.</li>
            </ul>
            <p className="text-muted-foreground mt-3"><strong>Transfert international de données :</strong></p>
            <p className="text-muted-foreground mt-1">
              Conformément à l'article 56 de la UU PDP, les données personnelles peuvent être transférées vers des pays tiers uniquement si le pays de destination assure un niveau de protection adéquat ou si des garanties appropriées sont mises en place. SOMA GATE utilise des prestataires certifiés assurant un niveau de protection conforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Droits des utilisateurs (Hak Subjek Data Pribadi)</h2>
            <p className="text-muted-foreground">
              Conformément au Chapitre IV de la UU PDP (articles 5 à 16), chaque utilisateur dispose des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Droit d'information (Hak atas Informasi) :</strong> être informé de la collecte et du traitement de ses données — art. 5,</li>
              <li><strong>Droit d'accès (Hak Akses) :</strong> obtenir une copie de ses données personnelles — art. 6,</li>
              <li><strong>Droit de rectification (Hak Koreksi) :</strong> corriger des données inexactes ou incomplètes — art. 7,</li>
              <li><strong>Droit de suppression (Hak Penghapusan) :</strong> demander l'effacement de ses données — art. 8,</li>
              <li><strong>Droit de retrait du consentement (Hak Penarikan Persetujuan) :</strong> retirer son consentement au traitement à tout moment — art. 9,</li>
              <li><strong>Droit d'opposition (Hak Keberatan) :</strong> s'opposer au traitement automatisé — art. 10,</li>
              <li><strong>Droit à la portabilité (Hak Portabilitas) :</strong> récupérer ses données dans un format structuré et lisible — art. 13,</li>
              <li><strong>Droit de restriction :</strong> demander la limitation du traitement — art. 11,</li>
              <li><strong>Droit de réclamation :</strong> déposer une plainte auprès de l'autorité compétente — art. 16.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              <strong>Délai de réponse :</strong> SOMA GATE s'engage à traiter toute demande dans un délai de 3x24 heures conformément à l'article 14 de la UU PDP.
            </p>
            <p className="text-muted-foreground mt-2">
              Pour exercer ces droits : <strong>privacy@somagate.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Sécurité des données (Keamanan Data)</h2>
            <p className="text-muted-foreground">
              Conformément à l'article 35 de la UU PDP, SOMA GATE met en œuvre des mesures de sécurité techniques et organisationnelles appropriées :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>Chiffrement des données en transit (TLS/SSL) et au repos,</li>
              <li>Authentification sécurisée avec option 2FA,</li>
              <li>Contrôle d'accès basé sur les rôles (RBAC),</li>
              <li>Politiques de sécurité au niveau des lignes (Row-Level Security),</li>
              <li>Surveillance et journalisation des accès,</li>
              <li>Sauvegardes régulières et plan de continuité.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Notification de violation de données (Notifikasi Pelanggaran)</h2>
            <p className="text-muted-foreground">
              Conformément à l'article 46 de la UU PDP, en cas de violation de données personnelles (kebocoran data), SOMA GATE s'engage à :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>notifier l'autorité compétente dans un délai de 3x24 heures,</li>
              <li>informer les utilisateurs concernés dans le même délai,</li>
              <li>fournir les informations relatives à la nature de la violation, les données concernées, et les mesures correctives prises.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Cookies et technologies de suivi</h2>
            <p className="text-muted-foreground">SOMA GATE utilise :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Cookies essentiels :</strong> session, authentification, préférences de langue — nécessaires au fonctionnement de la plateforme,</li>
              <li><strong>Stockage local (localStorage) :</strong> préférences utilisateur, thème, devise.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Aucun cookie publicitaire ou de traçage comportemental n'est utilisé. Aucun cookie de tiers n'est déposé sans le consentement explicite de l'utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">11. Traitement des données de mineurs</h2>
            <p className="text-muted-foreground">
              SOMA GATE est destiné aux utilisateurs majeurs (18 ans minimum). Conformément à l'article 25 de la UU PDP relatif à la protection des données des mineurs, aucune donnée d'un mineur n'est collectée intentionnellement. Si un tel cas était identifié, les données seraient immédiatement supprimées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">12. Profilage et décision automatisée</h2>
            <p className="text-muted-foreground">
              SOMA GATE utilise des algorithmes de matching pour suggérer des biens immobiliers correspondant aux préférences de l'utilisateur. Ce traitement automatisé :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>est fondé sur le consentement de l'utilisateur,</li>
              <li>ne produit aucun effet juridique contraignant,</li>
              <li>peut être contesté par l'utilisateur conformément à l'article 10 de la UU PDP.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">13. Sanctions applicables</h2>
            <p className="text-muted-foreground">
              Conformément au Chapitre XIV de la UU PDP, toute violation de la protection des données personnelles peut entraîner des sanctions administratives et pénales, notamment :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>amendes administratives jusqu'à 2% du chiffre d'affaires annuel,</li>
              <li>sanctions pénales pouvant aller jusqu'à 6 ans d'emprisonnement et 6 milliards IDR d'amende,</li>
              <li>suspension ou interdiction de traitement des données.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              SOMA GATE s'engage à respecter pleinement la UU PDP et toutes les réglementations associées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">14. Modifications de la politique</h2>
            <p className="text-muted-foreground">
              SOMA GATE se réserve le droit de modifier la présente politique de confidentialité. Les utilisateurs seront notifiés de toute modification substantielle au moins 14 jours avant son entrée en vigueur. La version en vigueur est accessible à tout moment sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">15. Contact et réclamations</h2>
            <p className="text-muted-foreground">
              Pour toute question, demande d'exercice de droits, ou réclamation :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Délégué à la protection des données (DPO) :</strong> privacy@somagate.com</li>
              <li><strong>Support général :</strong> contact@somagate.com</li>
              <li><strong>Délai de réponse :</strong> 3x24 heures maximum</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              En cas de réponse insatisfaisante, l'utilisateur peut déposer une plainte auprès de l'autorité de protection des données personnelles indonésienne, une fois celle-ci instituée conformément à la UU PDP.
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