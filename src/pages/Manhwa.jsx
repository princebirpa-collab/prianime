import { useEffect, useState } from "react";
import { BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/common/PageHeader";
import { communityRequest } from "@/lib/communityApi";
import { getProfile } from "@/lib/profile";
import { relativeDate } from "@/lib/format";

export default function Manhwa() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const profileId = getProfile().id;
    Promise.all([
      communityRequest(`/stories?profileId=${encodeURIComponent(profileId)}`)
        .then((data) => (data.stories || []).map((story) => ({ ...story, storage: "cloudflare" })))
        .catch(() => []),
      base44.entities.Story.filter({ owner_ref: profileId }, { sort: "-created_date", limit: 100 })
        .then((page) => (page.items || []).map((story) => ({ ...story, storage: "base44" })))
        .catch(() => []),
    ]).then(([cloud, legacy]) => {
      if (!active) return;
      const ids = new Set(cloud.map((story) => String(story.id)));
      setStories([...cloud, ...legacy.filter((story) => !ids.has(String(story.id)))].sort((a, b) => String(b.created_date || "").localeCompare(String(a.created_date || ""))));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="pb-16">
      <PageHeader eyebrow="Original stories · PRI-ANIME" title="AI Manhwa Vault" description="Your saved original story treatments, character bibles and episode scripts in one place." />
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-rose-950/70 via-violet-950/55 to-background p-6 sm:p-9">
          <div className="absolute -right-12 -top-16 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[.2em] text-primary"><Sparkles className="h-3.5 w-3.5" /> Original universe</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">Create stories that belong to PRI-ANIME.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Build original characters, worlds, chapter outlines and dialogue in AI Studio, then save them here. Only stories saved to your profile appear in this vault.</p>
            <Link to="/studio" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110">Create a story <Sparkles className="h-4 w-4" /></Link>
          </div>
        </div>

        <div className="mt-9 flex items-center justify-between border-b border-border/60 pb-3">
          <div><p className="text-[10px] uppercase tracking-[.2em] text-primary">Your collection</p><h2 className="mt-1 font-display text-2xl">Saved manhwa projects</h2></div>
          <span className="text-xs text-muted-foreground">{stories.length} stories</span>
        </div>
        {loading ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <div key={n} className="h-44 animate-pulse rounded-2xl bg-card/60" />)}</div> :
          stories.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-border/70 p-8 text-center"><BookOpen className="mx-auto h-7 w-7 text-primary" /><h3 className="mt-3 font-display text-xl">Your vault is ready</h3><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">No saved stories yet. Start in AI Studio and save your first original story to see it here.</p></div> :
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stories.map((story) => <article key={story.id} className="rounded-2xl border border-border/60 bg-card/55 p-5 transition hover:border-primary/40"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-primary">{story.kind || "story"}</span><span className="text-[10px] text-muted-foreground">{relativeDate(story.created_date)}</span></div><h3 className="mt-3 line-clamp-2 font-display text-xl">{story.title || "Untitled story"}</h3><p className="mt-2 line-clamp-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{story.script || story.prompt || "No script preview available."}</p><div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground"><span>{story.language || "English"} · {story.style || "cinematic"}</span><span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3" /> Script</span></div></article>)}</div>
        }
        <p className="mt-6 text-xs text-muted-foreground">This vault currently stores story scripts and outlines, not finished illustrated comic pages. Image-panel generation can be added when an authorized image-generation service is configured.</p>
      </div>
    </div>
  );
}
