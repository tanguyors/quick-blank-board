import { ArrowLeft } from 'lucide-react';
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

        <h1 className="text-3xl font-bold text-foreground mb-2">Conditions Générales de Vente</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : Février 2026</p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Objet</h2>
            <p className="text-muted-foreground">
              Les présentes Conditions Générales de Vente (CGV) régissent l'utilisation de la plateforme Soma Gate, 
              accessible via l'application mobile et le site web. Soma Gate est une plateforme d'intelligence immobilière 
              facilitant la mise en relation entre acheteurs et vendeurs de biens immobiliers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Acceptation des conditions</h2>
            <p className="text-muted-foreground">
              L'utilisation de la plateforme Soma Gate implique l'acceptation pleine et entière des présentes CGV. 
              En créant un compte, l'utilisateur reconnaît avoir pris connaissance des présentes conditions et les accepte sans réserve.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Services proposés</h2>
            <p className="text-muted-foreground">
              Soma Gate propose les services suivants : découverte de biens immobiliers, mise en relation acheteurs-vendeurs, 
              gestion sécurisée des transactions, génération automatique de documents légaux, et accompagnement personnalisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Responsabilité</h2>
            <p className="text-muted-foreground">
              Soma Gate agit en qualité d'intermédiaire technologique et ne peut être tenu responsable des transactions 
              effectuées entre les utilisateurs. Chaque utilisateur est responsable de la véracité des informations 
              qu'il communique sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              L'ensemble des éléments constituant la plateforme Soma Gate (logos, textes, images, logiciels) sont protégés 
              par le droit de la propriété intellectuelle. Toute reproduction non autorisée est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question relative aux présentes CGV, veuillez nous contacter à l'adresse : contact@somagate.com
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
