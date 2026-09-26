import Link from "next/link";

export function StepDot({ n, size = "md" }: { n: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "h-16 w-16 text-3xl" : size === "sm" ? "h-7 w-7 text-sm" : "h-10 w-10 text-lg";
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full font-display font-bold text-white shadow-sm ${cls}`} style={{ background: `var(--step-${n})` }}>
      {n}
    </span>
  );
}

export function PageHeader({ title, back, backLabel = "Back", children }: { title: string; back?: string; backLabel?: string; children?: React.ReactNode }) {
  return (
    <header className="no-print mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-4 pt-4 pb-2">
      {back && (
        <Link href={back} className="rounded-xl px-3 py-2 text-ink-soft ring-1 ring-line hover:bg-card">
          ← {backLabel}
        </Link>
      )}
      <h1 className="flex-1 text-2xl font-bold sm:text-3xl">{title}</h1>
      {children}
    </header>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line ${className}`}>{children}</div>;
}

export function Button({ children, onClick, tone = "primary", type = "button", disabled, className = "" }: { children: React.ReactNode; onClick?: () => void; tone?: "primary" | "soft" | "danger"; type?: "button" | "submit"; disabled?: boolean; className?: string }) {
  const t = tone === "primary" ? "bg-primary text-primary-ink" : tone === "danger" ? "bg-oops text-white" : "bg-card text-ink ring-1 ring-line";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`rounded-xl px-4 py-2 font-semibold shadow-sm transition active:scale-95 disabled:opacity-40 ${t} ${className}`}>
      {children}
    </button>
  );
}

export function LinkButton({ href, children, tone = "primary", className = "" }: { href: string; children: React.ReactNode; tone?: "primary" | "soft"; className?: string }) {
  const t = tone === "primary" ? "bg-primary text-primary-ink" : "bg-card text-ink ring-1 ring-line";
  return (
    <Link href={href} className={`inline-block rounded-xl px-4 py-2 font-semibold shadow-sm ${t} ${className}`}>
      {children}
    </Link>
  );
}
