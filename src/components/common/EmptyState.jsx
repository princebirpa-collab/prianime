import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function EmptyState({ icon: Icon = SearchX, title, body, actionLabel, actionTo, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-primary/40 bg-primary/10">
        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      </span>
      <p className="mt-4 font-display text-xl text-foreground">{title}</p>
      {body && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

================================================================================
