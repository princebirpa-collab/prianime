import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getProfile } from "@/lib/profile";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const REASONS = ["Copyright / unlicensed", "Sexual content", "Violence", "Hate speech", "Spam", "Misinformed metadata"];

export default function ReportDialog({ targetType, targetId, targetLabel, trigger }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setStatus("saving");
    setError("");
    try {
      await base44.entities.Report.create({
        target_type: targetType,
        target_id: String(targetId),
        target_label: (targetLabel || "").slice(0, 140),
        reason,
        details: details.slice(0, 600),
        reporter_ref: getProfile().id,
        status: "open",
      });
      setStatus("done");
      setDetails("");
    } catch (submitError) {
      setStatus("idle");
      setError(submitError.message || "Could not send the report.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setStatus("idle"); }}>
      <DialogTrigger asChild>
        {trigger || (
          <button type="button" className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-primary">
            <Flag className="h-3.5 w-3.5" aria-hidden="true" /> Report
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="border-border/70 bg-card/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Report content</DialogTitle>
          <DialogDescription>
            Reports go to the admin moderation queue. Tell us what is wrong with â€œ{targetLabel}â€.
          </DialogDescription>
        </DialogHeader>

        {status === "done" ? (
          <div className="py-6 text-center">
            <p className="text-sm text-foreground">Report received. Thank you.</p>
            <p className="mt-1 text-xs text-muted-foreground">An admin will review it in the moderation queue.</p>
            <Button variant="outline" className="mt-5" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="report-reason" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Reason
              </label>
              <select
                id="report-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {REASONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="report-details" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Details (optional)
              </label>
              <textarea
                id="report-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={3}
                maxLength={600}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Anything the moderator should know."
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={status === "saving"} className="w-full">
              {status === "saving" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send report
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

================================================================================
