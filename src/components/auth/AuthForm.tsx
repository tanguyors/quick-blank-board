import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, User, Home, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email,
            full_name: fullName,
          });
          await supabase.from('user_roles').insert({
            user_id: data.user.id,
            role,
          });
          // Initialize user score
          await supabase.from('wf_user_scores').insert({ user_id: data.user.id }).select();
          toast.success('Compte créé avec succès !');
          navigate('/profile-selection');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {!isLogin && (
        <div className="flex items-center px-4 py-4">
          <button onClick={() => setIsLogin(true)} className="flex items-center gap-2 text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          <span className="flex-1 text-center font-semibold text-lg">Inscription</span>
          <div className="w-16" />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <span className="text-primary text-4xl font-bold">𝔫</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isLogin ? 'Bienvenue sur SomaGate' : 'Rejoignez SomaGate'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          {/* Role selection for signup */}
          {!isLogin && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  role === 'user'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  role === 'user' ? 'bg-primary/20' : 'bg-secondary'
                }`}>
                  <User className={`h-6 w-6 ${role === 'user' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">Acheteur / Locataire</p>
                  <p className="text-sm text-muted-foreground">Je cherche un bien</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  role === 'user' ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {role === 'user' && <div className="w-3 h-3 rounded-full bg-primary" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  role === 'owner'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  role === 'owner' ? 'bg-primary/20' : 'bg-secondary'
                }`}>
                  <Home className={`h-6 w-6 ${role === 'owner' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">Vendeur / Bailleur</p>
                  <p className="text-sm text-muted-foreground">Je propose des biens</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  role === 'owner' ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {role === 'owner' && <div className="w-3 h-3 rounded-full bg-primary" />}
                </div>
              </button>
            </div>
          )}

          {/* Name field for signup */}
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Nom complet"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="pl-12 h-14 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          {/* Email */}
          {!isLogin && (
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Identifiants</p>
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder={isLogin ? 'Email' : 'Email'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="pl-12 h-14 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="pl-12 pr-12 h-14 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-14 rounded-xl text-base font-semibold bg-secondary hover:bg-secondary/80 text-foreground"
            disabled={loading}
          >
            {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'Créer mon compte'}
          </Button>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground pt-4">
            {isLogin ? "Pas encore inscrit ?" : "Déjà inscrit ?"}
            <button
              type="button"
              className="ml-1 text-foreground underline font-medium"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Créer un compte" : "Connectez-vous"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
