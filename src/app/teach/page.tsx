import type { Metadata } from "next";
import Link from "next/link";
import { STEPS } from "@/content/curriculum";
import { StepDot } from "@/components/ui/ui";

export const metadata: Metadata = { title: "Coach" };

const TOOLS = [
  { href: "/teach/plan/", icon: "🗓", title: "Plan today", text: "Pick who's here. Get groups by level and a timed agenda." },
  { href: "/teach/roster/", icon: "📋", title: "Roster & progress", text: "Kids, attendance, passes, pass codes, certificates." },
  { href: "/teach/play/", icon: "🏆", title: "Club games", text: "Ladder, round robin and Swiss pairings." },
  { href: "/teach/devices/", icon: "📱", title: "iPads & sharing", text: "Set up club iPads, lock a lesson, move data between devices." },
];

export default function TeachHome() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6">
      <header className="flex items-center gap-3">
        <Link href="/" className="rounded-xl px-3 py-2 text-ink-soft ring-1 ring-line">
          ← Home
        </Link>
        <h1 className="text-3xl font-bold">Coach</h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line transition hover:shadow-md">
            <p className="text-3xl" aria-hidden>
              {t.icon}
            </p>
            <h2 className="mt-1 text-lg font-bold">{t.title}</h2>
            <p className="text-sm text-ink-soft">{t.text}</p>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">Lessons</h2>
          <p className="text-ink-soft">
            Kids move up by skill, not age. Everyone new to chess starts at Step 1, whether they&apos;re in kindergarten or 8th grade, and kids who already play can be placed higher from the Roster. Each lesson has a script you can read aloud, a game for the tables, and practice that works on iPads or paper.
          </p>
        </div>
        {STEPS.map((s) => (
          <div key={s.n} className={`rounded-2xl bg-card p-4 ring-1 ring-line ${s.comingSoon ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-3">
              <StepDot n={s.n} />
              <div className="flex-1">
                <h3 className="text-xl font-bold">
                  Step {s.n}: {s.title}
                </h3>
                <p className="text-sm text-ink-soft">
                  {s.summary}
                </p>
              </div>
              {s.comingSoon && <span className="rounded-full bg-sunk px-3 py-1 text-sm">Coming soon</span>}
            </div>
            {s.lessons.length > 0 && (
              <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {s.lessons.map((l, i) => (
                  <li key={l.id}>
                    <Link href={`/teach/lesson/${l.id}/`} className="flex items-center gap-2 rounded-xl bg-sunk px-3 py-2 hover:bg-primary-soft">
                      <span className="w-5 text-right font-bold text-ink-soft">{i + 1}</span>
                      <span className="font-semibold">{l.title}</span>
                      <span className="ml-auto text-xs text-ink-soft">{l.minutes + l.activity.minutes}′</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
