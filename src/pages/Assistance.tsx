import { useState } from 'react';
import { useAllowScroll } from '@/hooks/useAllowScroll';
import { Link } from 'react-router-dom';
import { Send, MessageCircle, Mail, HelpCircle } from 'lucide-react';
import { PublicNavBar } from '@/components/layout/PublicNavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const FAQ = [
  {
    question: "Comment fonctionne le swipe ?",
    answer: "Swipez à droite pour liker un bien, à gauche pour passer. Si le vendeur accepte votre intérêt, un match est créé et vous pouvez commencer une transaction.",
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer: "Oui, toutes les données sont chiffrées et protégées par des politiques de sécurité au niveau de la base de données. Les numéros de téléphone ne peuvent pas être échangés dans les messages.",
  },
  {
    question: "Comment devenir Client Certifié ?",
    answer: "Le badge Client Certifié est attribué automatiquement après la finalisation réussie de votre première transaction sur la plateforme.",
  },
  {
    question: "Que faire en cas de no-show à une visite ?",
    answer: "Les no-shows sont enregistrés et impactent le score de fiabilité. Si l'autre partie ne se présente pas, signalez-le dans l'application pour que son score soit ajusté.",
  },
];

export default function Assistance() {
  useAllowScroll();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message envoyé ! Nous vous répondrons dans les 24h.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavBar title="Assistance" />

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Besoin d'aide ?</h1>
          <p className="text-muted-foreground text-base">
            Notre équipe est disponible pour répondre à toutes vos questions.
          </p>
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Questions fréquentes
          </h2>
          {FAQ.map((faq, i) => (
            <button
              key={i}
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              className="w-full bg-card border border-border rounded-xl p-4 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground text-sm">{faq.question}</h3>
                <span className="text-muted-foreground text-lg">{expandedFaq === i ? '−' : '+'}</span>
              </div>
              {expandedFaq === i && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{faq.answer}</p>
              )}
            </button>
          ))}
        </div>

        {/* Contact form */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Contactez-nous
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              placeholder="Votre nom *"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="h-12 bg-secondary/30 border-border rounded-xl"
            />
            <Input
              type="email"
              placeholder="Votre email *"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="h-12 bg-secondary/30 border-border rounded-xl"
            />
            <Input
              placeholder="Sujet"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="h-12 bg-secondary/30 border-border rounded-xl"
            />
            <Textarea
              placeholder="Décrivez votre problème ou question *"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={4}
              className="bg-secondary/30 border-border rounded-xl"
            />
            <Button type="submit" className="w-full h-12 rounded-xl" disabled={sending}>
              {sending ? 'Envoi...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer le message
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
