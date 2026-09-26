"use client";

import { useMemo } from "react";

const COLORS = ["#e05a47", "#f08a24", "#e3b505", "#58a55c", "#2a9d8f", "#3b7dd8", "#9b4dca"];

/** A one-shot burst of falling confetti. Purely decorative. */
export function Confetti({ count = 60 }: { count?: number }) {
  // Deterministic "random" layout per index so render stays pure.
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37) % 100,
        delay: ((i * 13) % 20) / 20,
        dur: 1.8 + ((i * 7) % 10) / 10,
        color: COLORS[i % COLORS.length],
        size: 8 + ((i * 5) % 8),
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute top-0 block rounded-sm"
          style={{ left: `${b.left}%`, width: b.size, height: b.size * 0.6, background: b.color, animation: `confetti ${b.dur}s ${b.delay}s ease-in both` }}
        />
      ))}
    </div>
  );
}
