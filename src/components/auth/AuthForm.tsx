import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [loading, setLoading] = useState(false);
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
          toast.success('Compte créé avec succès !');
          navigate('/');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      {!isLogin && (
        <>
          <div>
            <Label htmlFor="fullName">Nom complet</Label>
            <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={role === 'user' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setRole('user')}
            >
              🏠 Acheteur
            </Button>
            <Button
              type="button"
              variant={role === 'owner' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setRole('owner')}
            >
              🔑 Propriétaire
            </Button>
          </div>
        </>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
        <button type="button" className="ml-1 text-primary underline" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "S'inscrire" : "Se connecter"}
        </button>
      </p>
    </form>
  );
}
