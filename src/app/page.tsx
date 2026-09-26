import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="text-center">
        <p className="text-5xl" aria-hidden>
          ♞
        </p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Chess Club Kit</h1>
        <p className="mt-3 text-lg text-ink-soft">Ready-to-run chess lessons for any club, even if you&apos;ve never played.</p>
      </div>
      <div className="grid w-full gap-5 sm:grid-cols-2">
        <Link href="/teach/" className="group rounded-3xl bg-card p-8 shadow-md ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-lg">
          <p className="text-4xl" aria-hidden>
            🧑‍🏫
          </p>
          <h2 className="mt-3 text-2xl font-bold">I&apos;m the coach</h2>
          <p className="mt-1 text-ink-soft">Lesson plans with scripts, printable worksheets, your roster, and club games.</p>
        </Link>
        <Link href="/student/" className="group rounded-3xl bg-primary p-8 text-primary-ink shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
          <p className="text-4xl" aria-hidden>
            🧒
          </p>
          <h2 className="mt-3 text-2xl font-bold">I&apos;m a student</h2>
          <p className="mt-1 opacity-90">Practice on the iPad: puzzles, stars and games.</p>
        </Link>
      </div>
      <p className="max-w-xl text-center text-sm text-ink-soft">
        Free and open source. No accounts, no ads. Everything you enter stays on this device.
      </p>
    </main>
  );
}
