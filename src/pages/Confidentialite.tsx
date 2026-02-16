import { ArrowLeft } from 'lucide-react';
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

        <h1 className="text-3xl font-bold text-foreground mb-2">Politique de Confidentialité</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 18 décembre 2025</p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Responsable du traitement</h2>
            <p className="text-muted-foreground">
              La plateforme SOMA GATE, exploitée depuis l'Indonésie, est responsable du traitement des données personnelles collectées dans le cadre de l'utilisation de ses services. Le traitement est réalisé conformément à la Loi indonésienne n°27 de 2022 sur la protection des données personnelles (PDP Law).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Données collectées</h2>
            <p className="text-muted-foreground">SOMA GATE collecte les données personnelles suivantes :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Numéro WhatsApp</li>
              <li>Données de localisation (avec autorisation)</li>
              <li>Nom complet et informations de profil</li>
              <li>Préférences immobilières (types de biens, budget, secteurs)</li>
              <li>Données d'utilisation de la plateforme (historique de navigation, interactions)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Finalité du traitement</h2>
            <p className="text-muted-foreground">Les données collectées sont utilisées aux fins suivantes :</p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>Mise en relation entre acheteurs et vendeurs (matching immobilier)</li>
              <li>Personnalisation de l'expérience utilisateur</li>
              <li>Envoi de notifications pertinentes (matchs, visites, messages)</li>
              <li>Sécurisation des transactions et conservation des preuves</li>
              <li>Amélioration continue des services de la plateforme</li>
              <li>Communication avec les utilisateurs (assistance, informations)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Durée de conservation</h2>
            <p className="text-muted-foreground">
              Les données personnelles sont conservées pendant toute la durée d'utilisation du compte et pour une durée maximale de 3 ans après la dernière activité de l'utilisateur. Les données liées aux transactions sont conservées conformément aux obligations légales applicables en matière de preuve et de traçabilité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Partage des données</h2>
            <p className="text-muted-foreground">
              Les données personnelles ne sont jamais vendues à des tiers. Elles peuvent être partagées uniquement dans le cadre d'une mise en relation immobilière avec les parties concernées (acheteur, vendeur, notaire) et avec le consentement de l'utilisateur. Les prestataires techniques (hébergement, email) ont accès aux données strictement nécessaires à l'exécution de leurs services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Droits des utilisateurs</h2>
            <p className="text-muted-foreground">
              Conformément à la PDP Law indonésienne, chaque utilisateur dispose des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li><strong>Droit d'accès :</strong> obtenir une copie de ses données personnelles</li>
              <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
              <li><strong>Droit de suppression :</strong> demander l'effacement de ses données</li>
              <li><strong>Droit à la portabilité :</strong> récupérer ses données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> s'opposer au traitement de ses données</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Pour exercer ces droits, contactez-nous à : privacy@somagate.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Sécurité des données</h2>
            <p className="text-muted-foreground">
              SOMA GATE met en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger les données personnelles contre tout accès non autorisé, modification, divulgation ou destruction. Les données sont chiffrées en transit et au repos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Cookies et technologies de suivi</h2>
            <p className="text-muted-foreground">
              SOMA GATE utilise des cookies essentiels au fonctionnement de la plateforme (session, authentification). Aucun cookie publicitaire ou de traçage n'est utilisé sans le consentement explicite de l'utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Modifications</h2>
            <p className="text-muted-foreground">
              SOMA GATE se réserve le droit de modifier la présente politique de confidentialité à tout moment. La version en vigueur est celle accessible sur la plateforme. Les utilisateurs seront informés de toute modification substantielle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question relative à la protection de vos données personnelles, veuillez nous contacter à l'adresse : privacy@somagate.com
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground tracking-wider">
            SOMA GATE — LA PLATEFORME D'INTELLIGENCE IMMOBILIÈRE
          </p>
        </div>
      </div>
    </div>
  );
}
