import { useState } from "react";
import { Check, RotateCcw, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useProfile } from "@/lib/profile";
import { useTheme } from "@/lib/theme";
import { usePref, LANGUAGES } from "@/lib/prefs";

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
  const [language, setLanguage] = usePref("language");

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
            <span className="grid h-16 w-16 place-items-center rounded-full border border-primary/40 bg-primary/15 font-display text-2xl text-primary">
              {(name || "G").slice(0, 1).toUpperCase()}
            </span>
            <p className="text-xs text-muted-foreground">
              This profile names your comments and saved scripts. No password, no email â€” it lives in this browser.
            </p>
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
