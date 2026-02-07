import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import {
  Flame, Shield, FileText, MessageSquare, Eye, Star,
  ArrowRight, CheckCircle, Building2, Users, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Flame,
    title: 'Swipe & Match',
    desc: 'Découvrez des biens en un geste. Swipez à droite pour matcher avec vos coups de cœur.',
  },
  {
    icon: Shield,
    title: 'Transactions sécurisées',
    desc: 'Workflow guidé étape par étape : visite, intention, offre, documents — tout est tracé.',
  },
  {
    icon: MessageSquare,
    title: 'Messagerie protégée',
    desc: 'Communication sécurisée avec détection anti-fraude. Vos échanges restent sur la plateforme.',
  },
  {
    icon: FileText,
    title: 'Documents automatiques',
    desc: 'LOI, contrats, term sheets générés automatiquement. Validation croisée acheteur/vendeur.',
  },
  {
    icon: Eye,
    title: 'Visites organisées',
    desc: 'Proposez des créneaux, confirmez les visites et recevez des rappels automatiques.',
  },
  {
    icon: Star,
    title: 'Score & Certification',
    desc: 'Un score de fiabilité basé sur votre historique. Devenez un "Client Certifié" reconnu.',
  },
];

const STEPS = [
  { num: '01', title: 'Inscrivez-vous', desc: 'Créez votre compte en quelques secondes, choisissez votre rôle.' },
  { num: '02', title: 'Explorez ou publiez', desc: 'Acheteurs : swipez. Propriétaires : publiez vos biens.' },
  { num: '03', title: 'Matchez & visitez', desc: 'Organisez des visites directement depuis la plateforme.' },
  { num: '04', title: 'Concluez en confiance', desc: 'Documents générés, validation croisée, transaction finalisée.' },
];

const STATS = [
  { icon: Building2, value: '500+', label: 'Biens listés' },
  { icon: Users, value: '2 000+', label: 'Utilisateurs actifs' },
  { icon: TrendingUp, value: '95%', label: 'Satisfaction' },
];

export default function Home() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  // If logged in, redirect
  if (!loading && user) {
    const isOwner = roles.includes('owner');
    return <Navigate to={isOwner ? '/dashboard' : '/explore'} replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold text-2xl tracking-tight">𝔫</span>
            <span className="font-semibold text-lg">SomaGate</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              Connexion
            </Button>
            <Button size="sm" onClick={() => navigate('/auth')}>
              Commencer
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Flame className="h-4 w-4" />
            La nouvelle façon d'acheter en Côte d'Ivoire
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            L'immobilier
            <span className="text-primary"> réinventé</span>
            <br />
            pour l'Afrique
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            SomaGate connecte acheteurs et propriétaires avec un workflow sécurisé, transparent et entièrement digital. De la découverte à la signature.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Button size="lg" className="h-14 px-8 text-base font-semibold rounded-xl" onClick={() => navigate('/auth')}>
              Créer mon compte gratuit
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-base rounded-xl" onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Découvrir les fonctionnalités
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 px-6">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Tout ce qu'il faut pour
              <span className="text-primary"> réussir</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Une plateforme complète qui vous accompagne de la découverte à la conclusion de votre transaction immobilière.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(feat => (
              <div
                key={feat.title}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">{feat.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Comment ça <span className="text-primary">marche</span> ?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {STEPS.map(step => (
              <div key={step.num} className="flex gap-4">
                <div className="text-3xl font-extrabold text-primary/20">{step.num}</div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            La confiance au cœur de chaque transaction
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            SomaGate utilise un système de scoring intelligent pour évaluer la fiabilité de chaque utilisateur. 
            Les messages sont analysés en temps réel pour détecter les tentatives de fraude. 
            Chaque étape de votre transaction est enregistrée et traçable.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-10">
            {['Anti-fraude IA', 'Score de fiabilité', 'Traçabilité complète'].map(item => (
              <div key={item} className="flex flex-col items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à <span className="text-primary">commencer</span> ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Rejoignez SomaGate gratuitement et découvrez une nouvelle expérience immobilière.
          </p>
          <Button size="lg" className="h-14 px-10 text-base font-semibold rounded-xl" onClick={() => navigate('/auth')}>
            Créer mon compte
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold text-xl">𝔫</span>
            <span className="font-semibold">SomaGate</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SomaGate — Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
