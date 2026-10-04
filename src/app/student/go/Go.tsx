"use client";

// Where a station card's QR code lands. Sets the iPad up for today (see
// lib/station.ts), then goes straight to the lesson.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLesson } from "@/content/curriculum";
import { parseStationFragment } from "@/lib/station";
import { stationStore } from "@/lib/stationStore";
import { settingsStore } from "@/lib/settings";
import { myStore, whoStore } from "@/lib/club/store";

export function Go() {
  const router = useRouter();
  const [bad, setBad] = useState(false);

  useEffect(() => {
    const station = parseStationFragment(window.location.hash);
    if (!station) {
      // The fragment is outside React (the URL), read once on arrival.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBad(true);
      return;
    }
    // A fresh start: nothing from the last kid or the last session carries over.
    whoStore.set({ kidId: null });
    myStore.set({ passed: {} });
    stationStore.set({ station });
    const lesson = station.lesson && getLesson(station.lesson) ? station.lesson : null;
    settingsStore.update((s) => ({ ...s, young: station.easy, lockedLesson: station.lock && lesson ? lesson : null, pin: station.pin ?? (station.lock ? s.pin : null) }));
    router.replace(lesson ? `/student/lesson/${lesson}/` : "/student/");
  }, [router]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      {bad ? (
        <>
          <p className="text-6xl" aria-hidden>
            🤔
          </p>
          <h1 className="text-3xl font-bold">This card didn&apos;t scan right.</h1>
          <p className="text-xl text-ink-soft">Ask a grown-up to scan it again.</p>
          <Link href="/student/" className="rounded-2xl bg-primary px-8 py-4 text-2xl font-semibold text-primary-ink">
            Play anyway
          </Link>
        </>
      ) : (
        <p className="text-3xl font-semibold" aria-live="polite">
          Getting ready… ♟️
        </p>
      )}
    </main>
  );
}
