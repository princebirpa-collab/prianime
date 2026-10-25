import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationsBell() {
  const { items, unread } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 border-border/70 bg-popover/95 p-0 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Notifications</p>
          <span className="text-[11px] text-muted-foreground">{unread} new</span>
        </div>
        <div className="max-h-80 overflow-y-auto thin-scrollbar">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nothing yet â€” your render jobs and new reels will appear here.
            </p>
          ) : (
            items.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className="block border-b border-border/40 px-4 py-3 transition last:border-0 hover:bg-foreground/5"
              >
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.body}</p>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
