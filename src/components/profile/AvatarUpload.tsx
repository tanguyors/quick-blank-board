import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploadProps {
  url?: string | null;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ url, onUpload }: AvatarUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user!.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      onUpload(publicUrl);
      toast.success('Avatar mis à jour');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <Avatar className="h-28 w-28 border-4 border-primary/30">
        <AvatarImage src={url || ''} />
        <AvatarFallback className="text-3xl bg-primary/20 text-primary font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-foreground hover:bg-muted transition-colors"
      >
        <Camera className="h-4 w-4" />
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}
