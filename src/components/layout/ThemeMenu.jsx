import { Palette, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/lib/theme";

export default function ThemeMenu() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Change visual theme"
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
        >
          <Palette className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 border-border/70 bg-popover/95 p-2 backdrop-blur-xl">
        <p className="px-2 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Visual theme
        </p>
        <div className="grid gap-1" role="radiogroup" aria-label="Visual theme">
          {themes.map((option) => {
            const active = option.id === theme;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(option.id)}
                className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                  active ? "bg-primary/15" : "hover:bg-foreground/5"
                }`}
              >
                <span className="flex overflow-hidden rounded-full ring-1 ring-border">
                  {option.dots.map((dot) => (
                    <span key={dot} className="h-4 w-2.5" style={{ backgroundColor: dot }} />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{option.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{option.note}</span>
                </span>
                {active && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

================================================================================
