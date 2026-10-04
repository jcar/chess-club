"use client";

// Read-aloud for kids who can't read yet. Uses the browser's built-in speech
// synthesis: on iPad it works offline with the on-device voices, costs nothing
// and sends nothing anywhere.

let voice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang.startsWith("en"));
  return en.find((v) => v.localService && /US/.test(v.lang)) ?? en.find((v) => v.localService) ?? en[0] ?? null;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function utter(text: string): SpeechSynthesisUtterance {
  if (voice === undefined || voice === null) voice = pickVoice();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.rate = 0.92;
  u.pitch = 1.05;
  return u;
}

/** Say `text`, cutting off anything already being said. */
export function speak(text: string): void {
  speakLines([text]);
}

/** Say several lines in order (e.g. a question, then each answer). */
export function speakLines(lines: string[]): void {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  for (const line of lines) if (line.trim()) synth.speak(utter(line));
}

let primed = false;
/**
 * iOS only lets a page start talking from inside a tap. Speak an empty line on
 * the first tap anywhere, so later automatic read-aloud (a new question
 * appearing) is allowed.
 */
export function primeSpeechOnFirstTap(): void {
  if (primed || !canSpeak()) return;
  primed = true;
  const prime = () => {
    window.speechSynthesis.speak(utter(" "));
    window.removeEventListener("pointerdown", prime);
  };
  window.addEventListener("pointerdown", prime, { once: true });
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
