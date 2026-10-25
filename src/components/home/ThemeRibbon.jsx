import { useTheme } from "@/lib/theme";
import { Check } from "lucide-react";

export default function ThemeRibbon() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 pt-16 sm:px-6 lg:px-10">
      <div className="glass rounded-2xl p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Six realms of light</p>
            <h2 className="mt-2 font-display text-2xl font-medium">Choose your palette</h2>
          </div>
          <p className="text-xs text-muted-foreground">Saved to this device â€” it survives every reload.</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="radiogroup" aria-label="Visual theme">
          {themes.map((option) => {
            const active = option.id === theme;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(option.id)}
                className={`group relative overflow-hidden rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-primary/70 bg-primary/10"
                    : "border-border/60 bg-foreground/[0.02] hover:border-primary/40"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="mb-2.5 flex h-9 overflow-hidden rounded-lg ring-1 ring-border/60"
                >
                  {option.dots.map((dot) => (
                    <span key={dot} className="flex-1" style={{ backgroundColor: dot }} />
                  ))}
                </span>
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                  {option.name}
                  {active && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{option.note}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

================================================================================
