export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="border-b border-border/50 bg-gradient-to-b from-card/50 to-transparent">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-primary">
                <span className="h-px w-8 bg-primary/70" aria-hidden="true" />
                {eyebrow}
              </p>
            )}
            <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
              {title}
            </h1>
            {description && <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
          </div>
          {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
        </div>
      </div>
    </header>
  );
}
