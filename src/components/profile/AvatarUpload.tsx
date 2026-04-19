import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const COMPRESSION_OPTS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 800,
  useWebWorker: true,
  preserveExif: false,
  initialQuality: 0.85,
};

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
    const rawFile = e.target.files?.[0];
    if (!rawFile || !user) return;

    if (!rawFile.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image');
      return;
    }
    if (rawFile.size > MAX_FILE_SIZE) {
      toast.error('Image trop lourde (max 10 Mo)');
      return;
    }

    setUploading(true);
    try {
      let file: File = rawFile;
      if (rawFile.size > 500 * 1024) {
        try {
          const compressed = await imageCompression(rawFile, COMPRESSION_OPTS);
          file = new File([compressed], rawFile.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
        } catch (err) {
          console.warn('[AvatarUpload] Compression failed, using original:', err);
        }
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;

      const uploadPromise = supabase.storage.from('avatars').upload(path, file, { upsert: false });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout (60s) — réessayez')), 60_000)
      );
      const { error } = await Promise.race([uploadPromise, timeoutPromise]);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      onUpload(publicUrl);
      toast.success('Avatar mis à jour ✓');

      if (url) {
        const oldPath = url.split('/avatars/')[1]?.split('?')[0];
        if (oldPath && oldPath.startsWith(`${user.id}/`)) {
          supabase.storage.from('avatars').remove([oldPath]).catch(err => {
            console.warn('[AvatarUpload] Old avatar cleanup failed:', err);
          });
        }
      }
    } catch (error: any) {
      console.error('[AvatarUpload] Upload error:', error);
      toast.error(`Upload échoué: ${error.message}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
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
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-60"
        aria-label={uploading ? 'Upload en cours' : 'Changer la photo de profil'}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}
