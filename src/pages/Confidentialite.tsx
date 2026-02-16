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
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : Février 2026</p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Collecte des données</h2>
            <p className="text-muted-foreground">
              Soma Gate collecte les données personnelles nécessaires au fonctionnement de la plateforme : 
              nom, prénom, adresse email, numéro de téléphone, et préférences immobilières. 
              Ces données sont collectées lors de l'inscription et de l'utilisation de nos services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Utilisation des données</h2>
            <p className="text-muted-foreground">
              Vos données sont utilisées pour : personnaliser votre expérience, faciliter les mises en relation, 
              sécuriser les transactions, envoyer des notifications pertinentes, et améliorer nos services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Protection des données</h2>
            <p className="text-muted-foreground">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger 
              vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Partage des données</h2>
            <p className="text-muted-foreground">
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées uniquement dans le cadre 
              d'une transaction immobilière avec les parties concernées (acheteur, vendeur, notaire) et avec votre consentement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Vos droits</h2>
            <p className="text-muted-foreground">
              Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. 
              Vous pouvez exercer ces droits en nous contactant à : privacy@somagate.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Cookies</h2>
            <p className="text-muted-foreground">
              Soma Gate utilise des cookies essentiels au fonctionnement de la plateforme. 
              Aucun cookie publicitaire n'est utilisé sans votre consentement explicite.
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
