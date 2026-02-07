import { AppLayout } from '@/components/layout/AppLayout';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { useNavigate } from 'react-router-dom';

export default function PropertyNew() {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <h1 className="text-xl font-bold p-4 pb-0">Nouveau bien</h1>
      <PropertyForm onSuccess={(id) => navigate(`/properties/${id}/edit`)} />
    </AppLayout>
  );
}
