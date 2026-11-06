import { useState } from "react";
import { Check, RotateCcw, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useProfile } from "@/lib/profile";
import { useTheme } from "@/lib/theme";
import { usePref, LANGUAGES } from "@/lib/prefs";


const AVATAR_STYLES = [
  ["Crimson Ronin","#ef476f","#21101d","spiky"],["Azure Striker","#45b8e8","#101b32","swept"],["Shadow Prince","#a78bfa","#171329","long"],["Golden Captain","#eab65e","#2b1c12","spiky"],
  ["Emerald Rogue","#5bc69a","#10251e","messy"],["Frost Samurai","#9ed9ee","#142432","swept"],["Violet Phantom","#bd8cff","#21152f","long"],["Ash Wanderer","#aab0bd","#20212a","messy"],
  ["Scarlet Ace","#ff765e","#2a1517","swept"],["Midnight Mage","#7585ef","#12182d","long"],["Silver Hunter","#c5cbd6","#20212a","spiky"],["Neon Shinobi","#66d9ce","#102426","messy"]
];
const PRESET_AVATARS = AVATAR_STYLES.map(([name, hair, bg, style], index) => {
  const fringe = style === "spiky" ? "M20 48 25 12 38 29 48 5 57 28 76 13 79 51 67 37 57 45 43 34 31 45Z" : style === "long" ? "M21 53Q10 5 50 7Q91 7 79 55L73 80 63 57 35 57 27 82Z" : style === "swept" ? "M19 48Q12 8 49 8Q82 8 81 42L65 33Q48 43 29 34Z" : "M18 49Q17 12 48 9Q84 8 81 48L70 39 61 47 50 34 39 47 29 39Z";
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="g"><stop stop-color="' + hair + '" stop-opacity=".48"/><stop offset="1" stop-color="' + bg + '"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g)"/><path d="M9 100Q14 68 50 68Q86 68 91 100" fill="#263044"/><path d="M37 68V59H63V68L58 78H42Z" fill="#d6a58f"/><path d="M24 45Q24 24 50 22Q76 24 76 46L70 65Q63 77 50 77Q37 77 30 65Z" fill="#e8b99f"/><path d="' + fringe + '" fill="' + hair + '"/><path d="M35 52h10m10 0h10" stroke="#172033" stroke-width="3" stroke-linecap="round"/><ellipse cx="41" cy="54" rx="2.2" ry="3" fill="#f7f7ff"/><ellipse cx="59" cy="54" rx="2.2" ry="3" fill="#f7f7ff"/><path d="M45 68q5 3 10 0" fill="none" stroke="#985e68" stroke-width="2" stroke-linecap="round"/><path d="M31 83 50 92 69 83" fill="none" stroke="' + hair + '" stroke-opacity=".8" stroke-width="3"/></svg>';
  return { name, src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) };
});

const TOGGLES = [
  { key: "autoplayReels", label: "Autoplay reels", hint: "Play the next adjacent reel when it scrolls into view." },
  { key: "reelMuted", label: "Start reels muted", hint: "Unmute manually â€” browsers require it anyway." },
  { key: "subtitles", label: "Captions when available", hint: "Turn on subtitle tracks automatically." },
  { key: "reduceMotion", label: "Reduce motion", hint: "Fewer parallax and glow effects." },
  { key: "notifications", label: "Job notifications", hint: "Show render completions in the notification tray." },
  { key: "dataSaver", label: "Data saver", hint: "Load lighter previews where supported." },
];

function PrefToggle({ toggle }) {
  const [value, setValue] = usePref(toggle.key);
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/50 bg-background/40 p-3">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => setValue(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
      />
      <span>
        <span className="block text-sm text-foreground">{toggle.label}</span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">{toggle.hint}</span>
      </span>
    </label>
  );
}

export default function Settings() {
  const [profile, updateProfile] = useProfile();
  const { theme, setTheme, themes } = useTheme();
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || "");
  const [saved, setSaved] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const chooseAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setAvatarError("Choose a JPG, PNG or WebP image under 5 MB."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { const image = new Image(); image.onload = () => { const canvas = document.createElement("canvas"); const scale = Math.min(1, 320 / Math.max(image.width, image.height)); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height); updateProfile({ avatar: canvas.toDataURL("image/webp", 0.82) }); setAvatarError(""); }; image.onerror = () => setAvatarError("This image could not be opened."); image.src = reader.result; };
    reader.onerror = () => setAvatarError("This image could not be read."); reader.readAsDataURL(file);
  };
  const [language, setLanguage] = usePref("language");
  const [catalogMode, setCatalogMode] = useState(() => localStorage.getItem("pri-anime:catalog-source-mode") || "automatic");
  const updateCatalogMode = (value) => { setCatalogMode(value); localStorage.setItem("pri-anime:catalog-source-mode", value); };

  const save = (event) => {
    event.preventDefault();
    updateProfile({ name: name.trim().slice(0, 40) || "Guest Viewer", bio: bio.trim().slice(0, 160) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Settings"
        title="Make it yours"
        description="Theme, language and playback preferences are stored on this device and survive every reload."
      />

      <div className="mx-auto grid w-full max-w-[1100px] gap-6 px-4 pt-8 sm:px-6 lg:grid-cols-2 lg:px-10">
        <form onSubmit={save} className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="font-display text-xl">Viewer profile</h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative"><img src={profile.avatar || "/avatar-default.svg"} alt="Profile avatar" className="h-20 w-20 rounded-full border-2 border-primary/70 object-cover" /><label htmlFor="profile-avatar-upload" className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-primary px-2 py-1 text-white">＋</label><input id="profile-avatar-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseAvatar} className="sr-only" /></div>
            <p className="text-xs text-muted-foreground">
              This profile names your comments and saved scripts. No password, no email â€” it lives in this browser.
            </p>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">Choose your male anime character</p>
            <div className="grid grid-cols-6 gap-2">{PRESET_AVATARS.map((avatar) => <button key={avatar.name} type="button" onClick={() => updateProfile({ avatar: avatar.src })} aria-label={"Choose " + avatar.name + " avatar"} aria-pressed={profile.avatar === avatar.src} className={"rounded-full p-0.5 transition " + (profile.avatar === avatar.src ? "bg-primary ring-2 ring-primary/50" : "bg-border hover:bg-primary/50")}><img src={avatar.src} alt={avatar.name + " anime avatar"} className="aspect-square w-full rounded-full object-cover" /></button>)}</div>
            <p className="mt-2 text-[11px] text-muted-foreground">12 original male anime-style avatars. Choose one or upload your own image. Changes save automatically.</p>
            {avatarError && <p role="alert" className="mt-2 text-xs text-destructive">{avatarError}</p>}
          </div>

          <div className="mt-5">
            <label htmlFor="profile-name" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Display name
            </label>
            <input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={40}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="profile-bio" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Bio
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={2}
              maxLength={160}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {saved ? <Check className="h-4 w-4" /> : null}
            {saved ? "Saved" : "Save profile"}
          </button>
        </form>

        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="font-display text-xl">Visual theme</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {themes.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                aria-pressed={theme === option.id}
                className={`rounded-xl border p-3 text-left transition ${
                  theme === option.id ? "border-primary/70 bg-primary/10" : "border-border/60 hover:border-primary/40"
                }`}
              >
                <span aria-hidden="true" className="mb-2 flex h-7 overflow-hidden rounded-md ring-1 ring-border/60">
                  {option.dots.map((dot) => (
                    <span key={dot} className="flex-1" style={{ backgroundColor: dot }} />
                  ))}
                </span>
                <span className="flex items-center gap-1 text-[12px] font-medium">
                  {option.name}
                  {theme === option.id && <Check className="h-3 w-3 text-primary" />}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label htmlFor="pref-language" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Story language
            </label>
            <select
              id="pref-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {LANGUAGES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.10] via-card/70 to-background p-5 shadow-[0_20px_70px_-38px_hsl(var(--primary)/.5)] lg:col-span-2">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[.26em] text-primary">Catalogue intelligence</p>
            <h2 className="mt-1 font-display text-2xl">Live anime data & failover</h2>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">AniList is the primary catalogue. If it is offline or has no matching result, PRI-ANIME searches MyAnimeList through Jikan and then Kitsu. Backup results are clearly identified and never sent to AniList or VidStuck as if they were AniList IDs.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => updateCatalogMode("automatic")} aria-pressed={catalogMode === "automatic"} className={`rounded-xl border p-4 text-left transition ${catalogMode === "automatic" ? "border-primary bg-primary/10 shadow-[0_0_24px_-12px_hsl(var(--primary)/.8)]" : "border-border/60 bg-background/40 hover:border-primary/50"}`}>
                <span className="flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Automatic failover</span>
                <span className="mt-1 block text-[11px] text-muted-foreground">AniList → MAL/Jikan → Kitsu. Recommended.</span>
              </button>
              <button type="button" onClick={() => updateCatalogMode("anilist-only")} aria-pressed={catalogMode === "anilist-only"} className={`rounded-xl border p-4 text-left transition ${catalogMode === "anilist-only" ? "border-primary bg-primary/10" : "border-border/60 bg-background/40 hover:border-primary/50"}`}>
                <span className="text-sm font-semibold">AniList only</span>
                <span className="mt-1 block text-[11px] text-muted-foreground">Disable independent catalogue fallback.</span>
              </button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-background/50 p-3"><p className="text-xs font-semibold">AniList</p><p className="mt-1 text-[11px] text-muted-foreground">Main catalogue, premiere dates and episode airing schedule.</p></div>
              <div className="rounded-xl border border-border/60 bg-background/50 p-3"><p className="text-xs font-semibold">MAL / Jikan + Kitsu</p><p className="mt-1 text-[11px] text-muted-foreground">Independent search and backup title details.</p></div>
              <div className="rounded-xl border border-border/60 bg-background/50 p-3"><p className="text-xs font-semibold">Wikipedia / IMDb</p><p className="mt-1 text-[11px] text-muted-foreground">Wikipedia live reference summary; IMDb title search (no public full-data API assumed).</p></div>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-border/60 bg-card/40 p-5 lg:col-span-2">
          <h2 className="font-display text-xl">Playback & privacy</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TOGGLES.map((toggle) => (
              <PrefToggle key={toggle.key} toggle={toggle} />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 p-3">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Clearing local data removes your profile, saved lists and preferences from this browser.
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Clear all local PRI-ANIME data on this device?")) {
                  Object.keys(localStorage)
                    .filter((key) => key.startsWith("pri-anime:"))
                    .forEach((key) => localStorage.removeItem(key));
                  window.location.reload();
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-destructive/50 px-4 py-2 text-xs text-destructive transition hover:bg-destructive/10"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear local data
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
