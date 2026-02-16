import { Newspaper, Clock, TrendingUp, AlertTriangle, Building, MapPin } from 'lucide-react';
import { PageTopBar } from '@/components/layout/PageTopBar';

const ARTICLES = [
  {
    id: '1',
    title: 'Bali renforce les restrictions sur les permis de construire',
    date: '18 Déc 2025',
    category: 'Juridique',
    content: [
      "Les autorités provinciales de Bali ont récemment confirmé un durcissement significatif des règles liées aux permis de construire, notamment pour les nouvelles constructions situées sur des terres agricoles et des zones classées vertes.",
      "Cette décision s'inscrit dans une volonté claire de préserver les rizières, les espaces naturels et l'équilibre environnemental de l'île, tout en limitant l'urbanisation excessive observée ces dernières années. Les nouveaux projets de villas, d'hôtels et de restaurants sont désormais fortement restreints, voire interdits, dans certaines zones sensibles.",
      "Parallèlement, les contrôles administratifs ont été renforcés et les autorités se montrent plus strictes face aux constructions non conformes aux règles d'urbanisme et de zonage.",
      "Cette évolution marque un tournant important pour le marché immobilier balinais, avec une application plus rigoureuse des réglementations existantes et une réduction progressive des nouvelles opportunités de construction.",
    ],
  },
  {
    id: '2',
    title: 'Analyse SOMA GATE – Impact sur le marché immobilier',
    date: '18 Déc 2025',
    category: 'Analyse',
    content: [
      "La limitation des permis de construire entraîne une conséquence économique directe : la raréfaction de l'offre.",
      "Lorsque l'offre diminue et que la demande reste forte, la valeur des biens existants augmente mécaniquement. À Bali, cette dynamique est particulièrement marquée, car l'île continue d'attirer des investisseurs et des résidents du monde entier, tout en disposant d'un territoire limité.",
      "Les villas déjà construites, situées dans des zones conformes et disposant d'un cadre juridique clair, deviennent des actifs de plus en plus recherchés. Cette nouvelle réglementation transforme le marché immobilier balinais en un marché plus sélectif, mais également plus structuré et plus mature.",
      "Investir à Bali aujourd'hui ne relève plus d'une simple opportunité ponctuelle. C'est une décision stratégique à moyen et long terme. Sur des horizons de 2, 5, 15, 20 ans ou plus, la combinaison d'une offre limitée et d'une demande soutenue renforce la valeur patrimoniale des biens.",
    ],
  },
  {
    id: '3',
    title: 'Investissement Immobilier à Bali',
    date: '18 Déc 2025',
    category: 'Stratégie',
    content: [
      "Chez SOMA GATE, nous considérons que cette évolution impose de prendre l'investissement immobilier à Bali avec sérieux et vision. Les décisions prises aujourd'hui conditionnent la valeur des actifs de demain.",
    ],
  },
  {
    id: '4',
    title: 'Freehold vs Leasehold : tout comprendre en 5 minutes',
    date: '14 Fév 2026',
    category: 'Guide',
    content: [
      "Freehold — Vous possédez le bien et le terrain pour toujours. Pas de loyer foncier. Liberté totale. Propriété complète et permanente.",
      "Leasehold — Vous possédez uniquement les murs pour une durée limitée, généralement entre 20 et 40 ans. Le terrain appartient à un tiers. Paiement d'un ground rent et de charges. Propriété temporaire.",
      "Le choix entre Freehold et Leasehold dépend de votre projet, de votre budget et de votre horizon d'investissement. SOMA GATE vous accompagne dans cette réflexion stratégique.",
    ],
  },
];

const CATEGORY_ICONS: Record<string, typeof TrendingUp> = {
  'Juridique': AlertTriangle,
  'Analyse': TrendingUp,
  'Stratégie': Building,
  'Guide': MapPin,
};

export default function Actualites() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageTopBar><h1 className="text-xl font-bold text-foreground">Actualités</h1></PageTopBar>

      <div className="max-w-3xl mx-auto px-4 py-4">
        <p className="text-muted-foreground text-sm mb-6">
          Restez informé des dernières actualités immobilières à Bali et en Indonésie.
        </p>

        <div className="space-y-6">
          {ARTICLES.map(article => {
            const Icon = CATEGORY_ICONS[article.category] || Newspaper;
            return (
              <article
                key={article.id}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    {article.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.date}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-3">{article.title}</h2>
                <div className="space-y-2">
                  {article.content.map((paragraph, i) => (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-secondary/50 border border-border text-center">
          <Newspaper className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            De nouveaux articles sont publiés régulièrement. Revenez bientôt !
          </p>
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
