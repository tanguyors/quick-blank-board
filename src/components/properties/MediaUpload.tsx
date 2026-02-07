import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, X, Star } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface MediaUploadProps {
  propertyId: string;
  existingMedia?: any[];
}

export function MediaUpload({ propertyId, existingMedia = [] }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState(existingMedia);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const path = `${propertyId}/${Date.now()}-${i}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('property-media').upload(path, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('property-media').getPublicUrl(path);
        const { data, error } = await supabase
          .from('property_media')
          .insert({
            property_id: propertyId, url: publicUrl,
            type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
            position: media.length + i,
            is_primary: media.length === 0 && i === 0,
          })
          .select().single();
        if (error) throw error;
        setMedia(prev => [...prev, data]);
      }
      toast.success('Médias uploadés');
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaItem: any) => {
    try {
      await supabase.from('property_media').delete().eq('id', mediaItem.id);
      setMedia(prev => prev.filter(m => m.id !== mediaItem.id));
      toast.success('Média supprimé');
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const setPrimary = async (mediaItem: any) => {
    try {
      await supabase.from('property_media').update({ is_primary: false }).eq('property_id', propertyId);
      await supabase.from('property_media').update({ is_primary: true }).eq('id', mediaItem.id);
      setMedia(prev => prev.map(m => ({ ...m, is_primary: m.id === mediaItem.id })));
      toast.success('Image principale définie');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleUpload} />
      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full">
        <Upload className="h-4 w-4 mr-2" />{uploading ? 'Upload en cours...' : 'Ajouter des photos/vidéos'}
      </Button>
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {media.map((m: any) => (
            <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={m.url} alt="" className="w-full h-full object-cover" />
              {m.is_primary && <div className="absolute top-1 left-1"><Star className="h-4 w-4 text-accent fill-accent" /></div>}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary-foreground" onClick={() => setPrimary(m)}><Star className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary-foreground" onClick={() => handleDelete(m)}><X className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
