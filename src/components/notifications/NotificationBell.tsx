import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import iconNotifications from '@/assets/icons/notifications.png';

export function NotificationBell() {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteRead, deleteOne } = useNotifications();
  const navigate = useNavigate();
  const count = unreadCount.data || 0;
  const [open, setOpen] = useState(false);

  const recentNotifs = (notifications.data || []).slice(0, 5);
  const hasReadNotifs = recentNotifs.some(n => n.read_at);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t('nav.notifications')}
        >
          <img src={iconNotifications} alt="" className="h-5 w-5 object-contain" />
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
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">{t('nav.notifications')}</h3>
          {count > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="text-[10px] text-primary hover:underline"
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>

        {!recentNotifs.length ? (
          <div className="p-6 text-center">
            <img src={iconNotifications} alt="" className="h-8 w-8 object-contain mx-auto mb-2 opacity-30" />
            <p className="text-muted-foreground text-sm">{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {recentNotifs.map(notif => (
              <div
                key={notif.id}
                className={`relative group w-full text-left px-4 py-3 border-b border-border last:border-b-0 transition-colors hover:bg-accent/50 ${
                  !notif.read_at ? 'bg-primary/5' : ''
                }`}
              >
                <button
                  className="w-full text-left"
                  onClick={() => {
                    if (!notif.read_at) markAsRead.mutate(notif.id);
                    if (notif.action_url) {
                      setOpen(false);
                      navigate(notif.action_url);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-xs leading-snug">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {format(new Date(notif.created_at), 'dd MMM HH:mm')}
                      </p>
                    </div>
                    {!notif.read_at && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
                {/* Delete button — visible on hover (desktop) or always for read notifs */}
                {notif.read_at && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOne.mutate(notif.id);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 px-3 py-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-primary hover:text-primary text-xs font-medium"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
          >
            {t('notifications.viewAll')}
          </Button>
          {hasReadNotifs && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive text-xs"
              onClick={() => deleteRead.mutate()}
              disabled={deleteRead.isPending}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              {t('notifications.deleteRead', 'Clear read')}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
