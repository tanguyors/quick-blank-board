import { AppLayout } from '@/components/layout/AppLayout';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { useProperty } from '@/hooks/useProperties';
import { useParams, useNavigate } from 'react-router-dom';

export default function PropertyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: property, isLoading } = useProperty(id);

  if (isLoading) return <AppLayout><div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></AppLayout>;
  if (!property) return <AppLayout><div className="text-center p-8">Bien non trouvé</div></AppLayout>;

  return (
    <AppLayout>
      <h1 className="text-xl font-bold p-4 pb-0">Modifier le bien</h1>
      <PropertyForm
        key={property.id}
        property={property}
        existingMedia={property.property_media || []}
        onSuccess={() => navigate('/dashboard?tab=biens')}
      />
    </AppLayout>
  );
}
