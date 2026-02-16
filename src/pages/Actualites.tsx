import { ArrowLeft, Newspaper, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PageTopBar } from '@/components/layout/PageTopBar';

const PLACEHOLDER_ARTICLES = [
  {
    id: '1',
    title: 'Le marché immobilier à Bali en 2026 : tendances et perspectives',
    excerpt: 'Découvrez les dernières tendances du marché immobilier balinais, les zones en plein essor et les opportunités d\'investissement.',
    date: '16 Fév 2026',
    category: 'Marché',
  },
  {
    id: '2',
    title: 'Freehold vs Leasehold : tout comprendre en 5 minutes',
    excerpt: 'Guide complet pour comprendre les différences entre freehold et leasehold à Bali, et faire le bon choix pour votre investissement.',
    date: '14 Fév 2026',
    category: 'Guide',
  },
  {
    id: '3',
    title: 'Les 10 quartiers les plus recherchés de Bali',
    excerpt: 'De Canggu à Uluwatu, en passant par Ubud : découvrez les quartiers qui attirent le plus les investisseurs internationaux.',
    date: '12 Fév 2026',
    category: 'Lifestyle',
  },
  {
    id: '4',
    title: 'Nouvelle réglementation immobilière en Indonésie',
    excerpt: 'Les dernières modifications législatives impactant l\'achat de biens immobiliers par les étrangers en Indonésie.',
    date: '10 Fév 2026',
    category: 'Juridique',
  },
];

export default function Actualites() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageTopBar><h1 className="text-xl font-bold text-foreground">Actualités</h1></PageTopBar>

      <div className="max-w-3xl mx-auto px-4 py-4">
        <p className="text-muted-foreground text-sm mb-6">
          Restez informé des dernières actualités immobilières à Bali et en Indonésie.
        </p>

        <div className="space-y-4">
          {PLACEHOLDER_ARTICLES.map(article => (
            <article
              key={article.id}
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {article.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.date}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">{article.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-secondary/50 border border-border text-center">
          <Newspaper className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            De nouveaux articles sont publiés régulièrement. Revenez bientôt !
          </p>
        </div>
      </div>
    </div>
  );
}
