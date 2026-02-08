import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { User } from 'lucide-react';

export default function Profile() {
  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <User className="h-4 w-4 text-primary" />
          <span className="text-foreground font-semibold">Profil</span>
        </div>
      </PageTopBar>
      <ProfileForm />
    </AppLayout>
  );
}
