import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getProfile } from "@/lib/profile";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ReelUploadDialog({ open, onOpenChange, onUploaded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [licence, setLicence] = useState(false);
  const [status, setStatus] = useState("idle");
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setVideoFile(null);
    setThumbFile(null);
    setLicence(false);
    setStatus("idle");
    setProgressLabel("");
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!videoFile) {
      setError("Choose a video file to publish.");
      return;
    }
    if (!licence) {
      setError("Confirm that you own this clip or have a licence to publish it.");
      return;
    }
    setStatus("saving");
    setError("");
    try {
      setProgressLabel("Uploading videoâ€¦");
      const video = await base44.integrations.Core.UploadPublicFile({ file: videoFile });
      let thumbnailUrl = "";
      if (thumbFile) {
        setProgressLabel("Uploading thumbnailâ€¦");
        const thumb = await base44.integrations.Core.UploadPublicFile({ file: thumbFile });
        thumbnailUrl = thumb.file_url;
      }
      setProgressLabel("Publishingâ€¦");
      const profile = getProfile();
      await base44.entities.Reel.create({
        title: title.trim().slice(0, 120),
        description: description.trim().slice(0, 500),
        video_url: video.file_url,
        thumbnail_url: thumbnailUrl,
        creator_name: profile.name,
        creator_ref: profile.id,
        tags: tags.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean).slice(0, 6),
        likes: 0,
        views: 0,
        status: "published",
        licence: "Creator-declared licence",
      });
      setStatus("done");
      onUploaded?.();
      reset();
    } catch (uploadError) {
      setError(uploadError.message || "The upload failed.");
      setStatus("idle");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { onOpenChange(next); if (!next) reset(); }}>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-border/70 bg-card/95 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Publish a reel</DialogTitle>
          <DialogDescription>
            Video is stored publicly â€” anyone with the link can open it. Only upload clips you own or are licensed
            to publish.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="reel-title" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Title
            </label>
            <input
              id="reel-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={120}
              placeholder="The gate at midnight"
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="reel-description" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Caption
            </label>
            <textarea
              id="reel-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              maxLength={500}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="reel-tags" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Tags (comma separated)
            </label>
            <input
              id="reel-tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="fantasy, sword, cinematic"
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="reel-video" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Video file
              </label>
              <input
                id="reel-video"
                type="file"
                accept="video/*"
                onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
                className="mt-2 w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/15 file:px-3 file:py-2 file:text-xs file:text-primary"
              />
            </div>
            <div>
              <label htmlFor="reel-thumb" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Thumbnail (optional)
              </label>
              <input
                id="reel-thumb"
                type="file"
                accept="image/*"
                onChange={(event) => setThumbFile(event.target.files?.[0] || null)}
                className="mt-2 w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/15 file:px-3 file:py-2 file:text-xs file:text-primary"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={licence}
              onChange={(event) => setLicence(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
            />
            I own this clip or hold a licence to publish it, and it follows the content policy.
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {status === "saving" && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {progressLabel}
            </p>
          )}

          <Button type="submit" disabled={status === "saving"} className="w-full">
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            {status === "saving" ? "Publishingâ€¦" : "Publish reel"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

================================================================================
