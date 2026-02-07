import { AppLayout } from '@/components/layout/AppLayout';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { MediaUpload } from '@/components/properties/MediaUpload';
import { useProperty } from '@/hooks/useProperties';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function PropertyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: property, isLoading, refetch } = useProperty(id);

  const handlePublishToggle = async (checked: boolean) => {
    const { error } = await supabase.from('properties').update({ is_published: checked }).eq('id', id!);
    if (error) toast.error(error.message);
    else { toast.success(checked ? 'Bien publié' : 'Bien dépublié'); refetch(); }
  };

  if (isLoading) return <AppLayout><div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></AppLayout>;
  if (!property) return <AppLayout><div className="text-center p-8">Bien non trouvé</div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Modifier le bien</h1>
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
          <Switch checked={property.is_published} onCheckedChange={handlePublishToggle} />
          <Label>Publié</Label>
        </div>
        <PropertyForm property={property} onSuccess={() => navigate('/dashboard')} />
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Photos et vidéos</h2>
          <MediaUpload propertyId={property.id} existingMedia={property.property_media || []} />
        </div>
      </div>
    </AppLayout>
  );
}
