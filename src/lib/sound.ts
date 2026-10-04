"use client";

// Tiny sound effects, synthesised with Web Audio (no audio files, works
// offline). Kept soft and short: a two-note "yes", a low "hmm", a little
// fanfare for passing. Switched off on the iPads & sharing page.

import { settingsStore } from "./settings";

export type Cue = "right" | "wrong" | "pass" | "win" | "star";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

const NOTES: Record<Cue, [freq: number, start: number, length: number][]> = {
  right: [
    [660, 0, 0.12],
    [880, 0.1, 0.18],
  ],
  wrong: [
    [300, 0, 0.18],
    [240, 0.14, 0.22],
  ],
  star: [[1046, 0, 0.15]],
  pass: [
    [523, 0, 0.14],
    [659, 0.12, 0.14],
    [784, 0.24, 0.14],
    [1046, 0.36, 0.35],
  ],
  win: [
    [784, 0, 0.12],
    [988, 0.1, 0.12],
    [1175, 0.2, 0.3],
  ],
};

export function playCue(cue: Cue): void {
  if (!settingsStore.getSnapshot().sounds) return;
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + 0.01;
  for (const [freq, start, length] of NOTES[cue]) {
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = cue === "wrong" ? "triangle" : "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0 + start);
    gain.gain.exponentialRampToValueAtTime(0.18, t0 + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + length);
    osc.connect(gain).connect(a.destination);
    osc.start(t0 + start);
    osc.stop(t0 + start + length + 0.05);
  }
}
