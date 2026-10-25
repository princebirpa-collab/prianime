import { useCallback, useEffect, useState } from "react";
import { ShieldAlert, Loader2, CheckCircle2, XCircle, RefreshCw, Trash2, EyeOff, Eye, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { relativeDate } from "@/lib/format";

export default function Admin() {
  const [gate, setGate] = useState("checking");
  const [health, setHealth] = useState(null);
  const [reports, setReports] = useState([]);
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [healthResponse, reportPage, videoPage, userList] = await Promise.allSettled([
        base44.functions.invoke("health", {}),
        base44.entities.Report.filter({}, { sort: "-created_date", limit: 40 }),
        base44.entities.Video.filter({}, { sort: "-created_date", limit: 40 }),
        base44.entities.User.list(),
      ]);

      if (healthResponse.status === "fulfilled") setHealth(healthResponse.value?.data || null);
      if (reportPage.status === "fulfilled") setReports(reportPage.value.items || []);
      if (videoPage.status === "fulfilled") setVideos(videoPage.value.items || []);
      if (userList.status === "fulfilled") {
        const list = Array.isArray(userList.value) ? userList.value : userList.value?.items || [];
        setUsers(list);
      }
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    base44.auth
      .me()
      .then((user) => {
        if (user?.role === "admin") {
          setGate("admin");
          load();
        } else {
          setGate("denied");
        }
      })
      .catch(() => setGate("anonymous"));
  }, [load]);

  const resolveReport = async (report, status) => {
    try {
      const updated = await base44.entities.Report.update(report.id, { status });
      setReports((prev) => prev.map((row) => (row.id === report.id ? { ...row, ...updated } : row)));
    } catch (error) {
      setNote(error.message || "Could not update the report.");
    }
  };

  const hideVideo = async (video) => {
    const nextStatus = video.status === "hidden" ? "published" : "hidden";
    try {
      const updated = await base44.entities.Video.update(video.id, { status: nextStatus });
      setVideos((prev) => prev.map((row) => (row.id === video.id ? { ...row, ...updated } : row)));
    } catch (error) {
      setNote(error.message || "Could not update the video.");
    }
  };

  const removeVideo = async (video) => {
    if (!window.confirm(`Delete â€œ${video.title}â€ permanently?`)) return;
    try {
      await base44.entities.Video.delete(video.id);
      setVideos((prev) => prev.filter((row) => row.id !== video.id));
    } catch (error) {
      setNote(error.message || "Could not delete the video.");
    }
  };

  if (gate === "checking") {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (gate !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          icon={ShieldAlert}
          title="Administrator access only"
          body={
            gate === "denied"
              ? "This profile is signed into the workspace but is not an administrator. Ask a workspace admin for the admin role."
              : "Sign in to the workspace with an administrator account to open the moderation console. Server rules also block non-admins from reading the report queue."
          }
          actionLabel="Back to the theatre"
          actionTo="/"
        />
      </div>
    );
  }

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Admin console"
        title="Moderation & connections"
        description="Reports are readable only by workspace administrators â€” the rule is enforced by the database, not by hiding buttons."
      >
        <button
          type="button"
          onClick={load}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2.5 text-sm transition hover:border-primary/60 hover:text-primary disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
        </button>
      </PageHeader>

      <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 pt-8 sm:px-6 lg:px-10">
        {note && <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{note}</p>}

        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="font-display text-xl">Service connections</h2>
          {!health ? (
            <p className="mt-3 text-sm text-muted-foreground">Checking providersâ€¦</p>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(health.checks || {}).map(([key, check]) => (
                <div key={key} className="rounded-xl border border-border/50 bg-background/40 p-3">
                  <p className="flex items-center gap-1.5 text-sm">
                    {check.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                    )}
                    {check.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {check.ok ? "Connected" : check.error || "Not configured"}
                  </p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Secret values are never returned to the browser â€” only presence and status.
          </p>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="font-display text-xl">Report queue</h2>
          {reports.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nothing reported. The queue is clear.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {reports.map((report) => (
                <div key={report.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-background/40 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="text-primary">{report.reason}</span> Â· {report.target_type}: {report.target_label || report.target_id}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {report.status} Â· {relativeDate(report.created_date)}
                      {report.details ? ` Â· ${report.details}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => resolveReport(report, "removed")}
                      className="rounded-full border border-border/70 px-3 py-1.5 text-[11px] transition hover:border-primary/60 hover:text-primary"
                    >
                      Mark removed
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveReport(report, "dismissed")}
                      className="rounded-full border border-border/70 px-3 py-1.5 text-[11px] transition hover:text-muted-foreground"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="font-display text-xl">Video library</h2>
          {videos.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No videos published yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {videos.map((video) => (
                <div key={video.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 p-3">
                  <span className="h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {video.thumbnail_url ? <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm text-foreground">{video.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {video.status} Â· {video.creator_name || "unknown"} Â· {video.views || 0} views
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => hideVideo(video)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-[11px] transition hover:border-primary/60 hover:text-primary"
                  >
                    {video.status === "hidden" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {video.status === "hidden" ? "Publish" : "Hide"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVideo(video)}
                    aria-label={`Delete ${video.title}`}
                    className="text-muted-foreground transition hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <Users className="h-4 w-4 text-primary" aria-hidden="true" /> Workspace users
          </h2>
          {users.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Only administrators can list app users. Invite people from the dashboard's App Users page.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border/40">
              {users.map((user) => (
                <li key={user.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-foreground">{user.full_name || user.email}</span>
                  <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {user.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
