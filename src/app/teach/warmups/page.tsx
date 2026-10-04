import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/ui";
import { WARMUPS } from "@/content/warmups";

export const metadata: Metadata = { title: "Warm-ups" };

/** Five-minute whole-group warm-ups, big enough to read from across the room. */
export default function Warmups() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 pb-12">
      <PageHeader title="Warm-ups" back="/teach/" backLabel="Coach" />
      <p className="px-4 text-ink-soft">Five minutes to get the wiggles out and review an idea. Pick one in the planner, or just start one here.</p>
      <nav aria-label="Warm-ups" className="flex flex-wrap gap-2 px-4">
        {WARMUPS.map((w) => (
          <a key={w.id} href={`#${w.id}`} className="rounded-full bg-sunk px-3 py-1 text-sm">
            {w.title}
          </a>
        ))}
      </nav>
      <div className="flex flex-col gap-4 px-4">
        {WARMUPS.map((w) => (
          <section key={w.id} id={w.id} className="scroll-mt-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-line" data-testid="warmup">
            <h2 className="font-display text-3xl font-bold">{w.title}</h2>
            <p className="text-ink-soft">
              {w.minutes} min · {w.focus} · You need: {w.materials.join(", ")}
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-7 text-xl">
              {w.steps.map((st) => (
                <li key={st}>{st}</li>
              ))}
            </ol>
            {w.older && (
              <p className="mt-3 rounded-lg bg-sunk px-3 py-2">
                <b>Older or stronger kids:</b> {w.older}
              </p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
