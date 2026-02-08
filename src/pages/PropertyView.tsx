import { AppLayout } from '@/components/layout/AppLayout';
import { PropertyDetail } from '@/components/properties/PropertyDetail';
import { useParams } from 'react-router-dom';

export default function PropertyView() {
  const { id } = useParams();
  return <AppLayout hideHeader><PropertyDetail propertyId={id!} /></AppLayout>;
}
