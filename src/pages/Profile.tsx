import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default function Profile() {
  return (
    <AppLayout hideHeader>
      <div className="flex items-center px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-2xl">𝔫</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {/* Settings and logout are in the header component if needed */}
        </div>
      </div>
      <ProfileForm />
    </AppLayout>
  );
}
