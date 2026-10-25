import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/profile";
import { relativeDate } from "@/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ReelComments({ reel, open, onOpenChange }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profile] = useProfile();

  useEffect(() => {
    if (!open || !reel) return;
    let alive = true;
    setLoading(true);
    base44.entities.ReelComment.filter({ reel_id: reel.id }, { sort: "-created_date", limit: 60 })
      .then((page) => {
        if (alive) setComments(page.items || []);
      })
      .catch((loadError) => {
        if (alive) setError(loadError.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, reel]);

  const submit = async (event) => {
    event.preventDefault();
    if (!text.trim() || !reel) return;
    setSaving(true);
    setError("");
    try {
      const created = await base44.entities.ReelComment.create({
        reel_id: reel.id,
        author_name: profile.name,
        author_ref: profile.id,
        text: text.trim().slice(0, 500),
      });
      setComments((prev) => [created, ...prev]);
      setText("");
    } catch (submitError) {
      setError(submitError.message || "Could not post the comment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/70 bg-card/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Conversation</DialogTitle>
        </DialogHeader>

        <div className="max-h-[46vh] space-y-3 overflow-y-auto thin-scrollbar pr-1">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            </p>
          ) : comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No comments yet â€” open the conversation.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-border/50 bg-background/40 px-3 py-2.5">
                <p className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <span>{comment.author_name || "Viewer"}</span>
                  <span>{relativeDate(comment.created_date)}</span>
                </p>
                <p className="mt-1 text-sm text-foreground">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={submit} className="mt-2 flex items-center gap-2">
          <label htmlFor="reel-comment" className="sr-only">
            Write a comment
          </label>
          <input
            id="reel-comment"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={500}
            placeholder={`Reply as ${profile.name}â€¦`}
            className="h-10 flex-1 rounded-full border border-border bg-background px-4 text-sm"
          />
          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-40"
            aria-label="Post comment"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
