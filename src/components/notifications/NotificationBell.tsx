import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useState } from 'react';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const count = unreadCount.data || 0;
  const [open, setOpen] = useState(false);

  const recentNotifs = (notifications.data || []).slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
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
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 bg-popover border border-border shadow-lg z-50"
        sideOffset={8}
      >
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
        </div>

        {!recentNotifs.length ? (
          <div className="p-6 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
            <p className="text-muted-foreground text-sm">Aucune notification</p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {recentNotifs.map(notif => (
              <button
                key={notif.id}
                onClick={() => {
                  if (!notif.read_at) markAsRead.mutate(notif.id);
                  if (notif.action_url) {
                    setOpen(false);
                    navigate(notif.action_url);
                  }
                }}
                className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 transition-colors hover:bg-accent/50 ${
                  !notif.read_at ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-xs leading-snug">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {format(new Date(notif.created_at), "dd MMM 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                  {!notif.read_at && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="px-4 py-2.5 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-primary hover:text-primary text-xs font-medium"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
          >
            Voir toutes les notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
