import { useCallback, useEffect, useState } from "react";
import { Loader2, Upload, Wand2, Clapperboard, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import { getProfile } from "@/lib/profile";
import { usePref, LANGUAGES } from "@/lib/prefs";
import { fetchProviderStatus } from "@/lib/animeApi";

const STYLES = ["cinematic", "manhwa", "painterly", "cel"];

function StatusBadge({ status }) {
  const map = {
    queued: { label: "Queued", icon: Clock, className: "border-border text-muted-foreground" },
    processing: { label: "Processing", icon: Loader2, className: "border-primary/50 text-primary" },
    completed: { label: "Completed", icon: CheckCircle2, className: "border-emerald-500/50 text-emerald-400" },
    failed: { label: "Failed", icon: AlertTriangle, className: "border-destructive/50 text-destructive" },
  };
  const meta = map[status] || map.queued;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${meta.className}`}>
      <meta.icon className={`h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export default function Creator() {
  const [tab, setTab] = useState("publish");
  const [language, setLanguage] = usePref("language");
  const [provider, setProvider] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Original story");
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [licence, setLicence] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("");
  const [myVideos, setMyVideos] = useState([]);

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [aspect, setAspect] = useState("16:9");
  const [rendering, setRendering] = useState(false);

  const loadJobs = useCallback(() => {
    base44.entities.VideoJob.filter({ owner_ref: getProfile().id }, { sort: "-created_date", limit: 12 })
      .then((page) => setJobs(page.items || []))
      .catch(() => setJobs([]));
  }, []);

  useEffect(() => {
    fetchProviderStatus().then(setProvider);
    loadJobs();
    base44.entities.Video.filter({ creator_name: getProfile().name }, { sort: "-created_date", limit: 12 })
      .then((page) => setMyVideos(page.items || []))
      .catch(() => setMyVideos([]));
  }, [loadJobs]);

  useEffect(() => {
    if (!jobs.some((job) => job.status === "processing" || job.status === "queued")) return;
    const timer = setInterval(loadJobs, 10000);
    return () => clearInterval(timer);
  }, [jobs, loadJobs]);

  const publish = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!videoFile) return setError("Choose a video file first.");
    if (!licence) return setError("Confirm you own or are licensed to publish this video.");
    setUploading(true);
    try {
      setUploadLabel("Uploading videoâ€¦");
      const video = await base44.integrations.Core.UploadPublicFile({ file: videoFile });
      let thumbnailUrl = "";
      if (thumbFile) {
        setUploadLabel("Uploading thumbnailâ€¦");
        const thumb = await base44.integrations.Core.UploadPublicFile({ file: thumbFile });
        thumbnailUrl = thumb.file_url;
      }
      setUploadLabel("Publishingâ€¦");
      const created = await base44.entities.Video.create({
        title: title.trim().slice(0, 140),
        description: description.trim().slice(0, 2000),
        video_url: video.file_url,
        thumbnail_url: thumbnailUrl,
        category: category.trim().slice(0, 40),
        creator_name: getProfile().name,
        licence: "Creator-declared licence",
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 6),
        status: "published",
        views: 0,
      });
      setMyVideos((prev) => [created, ...prev]);
      setMessage("Published. It is now listed in the theatre.");
      setTitle("");
      setDescription("");
      setTags("");
      setVideoFile(null);
      setThumbFile(null);
      setLicence(false);
    } catch (uploadError) {
      setError(uploadError.message || "The upload failed.");
    } finally {
      setUploading(false);
      setUploadLabel("");
    }
  };

  const render = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (prompt.trim().length < 12) return setError("Describe the shot in at least a sentence.");
    setRendering(true);
    try {
      const response = await base44.functions.invoke("videoJob", {
        prompt: prompt.trim(),
        language,
        style,
        aspect_ratio: aspect,
        owner_ref: getProfile().id,
      });
      const data = response?.data;
      if (data?.job) setJobs((prev) => [data.job, ...prev.filter((job) => job.id !== data.job.id)]);
      if (data?.ok) setMessage("Render complete â€” the clip is ready below.");
      else setError(data?.error || "The render could not be completed.");
      loadJobs();
    } catch (renderError) {
      setError(renderError.message || "The render service is unreachable.");
    } finally {
      setRendering(false);
    }
  };

  const publishJob = async (job) => {
    try {
      const created = await base44.entities.Video.create({
        title: job.prompt.slice(0, 120),
        description: `AI-rendered from a PRI-ANIME atelier prompt.\n\n${job.prompt}`,
        video_url: job.video_url,
        category: "AI original",
        creator_name: getProfile().name,
        licence: "AI-generated â€” PRI-ANIME atelier",
        status: "published",
        views: 0,
        tags: [job.style, job.language],
      });
      setMyVideos((prev) => [created, ...prev]);
      setMessage("AI clip published to the theatre.");
    } catch (publishError) {
      setError(publishError.message || "Could not publish the clip.");
    }
  };

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Creator studio"
        title="Publish licensed work"
        description="Upload videos you own, or send a scene through the AI render pipeline. Everything is created from environment configuration â€” no keys touch the browser."
      >
        <div className="flex gap-1 rounded-full border border-border/70 p-1">
          <button
            type="button"
            onClick={() => setTab("publish")}
            className={`rounded-full px-4 py-2 text-xs transition ${tab === "publish" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setTab("render")}
            className={`rounded-full px-4 py-2 text-xs transition ${tab === "render" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
          >
            AI render
          </button>
        </div>
      </PageHeader>

      <div className="mx-auto w-full max-w-[1600px] px-4 pt-8 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/40 px-5 py-4 text-sm">
          <span className={`inline-flex items-center gap-2 ${provider?.configured ? "text-emerald-400" : "text-muted-foreground"}`}>
            <span className={`h-2 w-2 rounded-full ${provider?.configured ? "bg-emerald-400" : "bg-muted-foreground"}`} />
            {provider?.configured ? `${provider.providerLabel} connected` : "No external video provider connected"}
          </span>
          {!provider?.configured && (
            <span className="text-xs text-muted-foreground">
              Playback uses the uploaded file URLs. Set VIDEO_PROVIDER, VIDEO_API_URL and VIDEO_API_KEY to enable a
              provider.
            </span>
          )}
        </div>

        {message && (
          <p className="mb-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">{message}</p>
        )}
        {error && (
          <p className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{error}</p>
        )}

        {tab === "publish" ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <form onSubmit={publish} className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-5">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <Clapperboard className="h-4 w-4 text-primary" aria-hidden="true" /> New screening
              </h2>

              <div>
                <label htmlFor="video-title" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Title
                </label>
                <input
                  id="video-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  maxLength={140}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Episode 1 â€” The gate at midnight"
                />
              </div>

              <div>
                <label htmlFor="video-description" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Description
                </label>
                <textarea
                  id="video-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="video-category" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Category
                  </label>
                  <input
                    id="video-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="video-tags" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Tags
                  </label>
                  <input
                    id="video-tags"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="fantasy, pilot"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="video-file" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Video file
                  </label>
                  <input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
                    className="mt-2 w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/15 file:px-3 file:py-2 file:text-xs file:text-primary"
                  />
                </div>
                <div>
                  <label htmlFor="video-thumb" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Thumbnail
                  </label>
                  <input
                    id="video-thumb"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setThumbFile(event.target.files?.[0] || null)}
                    className="mt-2 w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/15 file:px-3 file:py-2 file:text-xs file:text-primary"
                  />
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Video and images are stored publicly â€” anyone with the link can open them. Upload only work you own.
              </p>

              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={licence}
                  onChange={(event) => setLicence(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
                />
                I own this video or hold distribution rights, and it follows the content policy.
              </label>

              <button
                type="submit"
                disabled={uploading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                {uploading ? uploadLabel || "Publishingâ€¦" : "Publish screening"}
              </button>
            </form>

            <div>
              <h2 className="border-b border-border/60 pb-3 font-display text-xl">Your screenings</h2>
              <div className="mt-3 space-y-2">
                {myVideos.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
                    Nothing published yet under this profile.
                  </p>
                ) : (
                  myVideos.map((video) => (
                    <div key={video.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 p-3">
                      <span className="h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                        {video.thumbnail_url ? <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 block text-sm text-foreground">{video.title}</span>
                        <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{video.status}</span>
                      </span>
                      <a href={`/watch/${video.id}`} className="text-xs text-primary hover:underline">
                        Open
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <form onSubmit={render} className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-5">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <Wand2 className="h-4 w-4 text-primary" aria-hidden="true" /> Render a scene
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Jobs are queued server-side. Rendering is billed per second by the video model, so short clips are
                cheaper. If video generation is not enabled on this workspace, the job will report the exact reason.
              </p>

              <div>
                <label htmlFor="render-prompt" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Shot description
                </label>
                <textarea
                  id="render-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={5}
                  maxLength={1500}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="A silver-haired swordswoman stands in the rain, raising a glowing golden bladeâ€¦"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="render-style" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Style
                  </label>
                  <select
                    id="render-style"
                    value={style}
                    onChange={(event) => setStyle(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                  >
                    {STYLES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="render-aspect" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Aspect
                  </label>
                  <select
                    id="render-aspect"
                    value={aspect}
                    onChange={(event) => setAspect(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                  >
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="render-language" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Language
                  </label>
                  <select
                    id="render-language"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                  >
                    {LANGUAGES.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={rendering}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition disabled:opacity-50"
              >
                {rendering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" aria-hidden="true" />}
                {rendering ? "Renderingâ€¦" : "Start render job"}
              </button>
            </form>

            <div>
              <h2 className="border-b border-border/60 pb-3 font-display text-xl">Render jobs</h2>
              <div className="mt-3 space-y-3">
                {jobs.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
                    No render jobs yet.
                  </p>
                ) : (
                  jobs.map((job) => (
                    <div key={job.id} className="rounded-xl border border-border/50 bg-card/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={job.status} />
                        <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {job.style} Â· {job.aspect_ratio}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-foreground/85">{job.prompt}</p>
                      {job.error && <p className="mt-2 text-xs text-destructive">{job.error}</p>}
                      {job.status === "completed" && job.video_url && (
                        <div className="mt-3">
                          <video src={job.video_url} controls className="w-full rounded-lg" />
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => publishJob(job)}
                              className="text-[11px] text-primary hover:underline"
                            >
                              Publish to theatre
                            </button>
                            <a href={job.video_url} target="_blank" rel="noreferrer noopener" className="text-[11px] text-muted-foreground hover:text-primary">
                              Download
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
