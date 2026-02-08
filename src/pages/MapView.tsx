import { AppLayout } from '@/components/layout/AppLayout';
import { PropertyMap } from '@/components/map/PropertyMap';

export default function MapView() {
  return (
    <AppLayout hideHeader>
      <div className="h-[calc(100vh-5rem)] lg:h-screen w-full">
        <PropertyMap />
      </div>
    </AppLayout>
  );
}
