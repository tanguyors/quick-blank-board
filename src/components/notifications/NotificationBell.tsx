import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const count = unreadCount.data || 0;

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
