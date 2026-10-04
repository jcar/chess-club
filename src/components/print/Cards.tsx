// Printable cards: station cards (QR an iPad scans), name tents, and the
// session check-off sheet.

import { Qr } from "@/components/ui/Qr";
import type { Station } from "@/lib/station";
import type { Kid } from "@/lib/club/model";
import type { Lesson } from "@/content/types";

const STEP_PIECE: Record<string, string> = {
  "s1-board": "🏁",
  "s1-rook": "♜",
  "s1-bishop": "♝",
  "s1-queen-king": "♛",
  "s1-knight": "♞",
  "s1-pawn": "♟",
  "s1-setup": "♚",
};

/** A big picture for a lesson, for kids who can't read the title. */
export function lessonPicture(l: Lesson): string {
  return STEP_PIECE[l.id] ?? "♞";
}

/** Half a page: cut along the dashed line. */
export function StationCard({ station, lesson, url, label }: { station: Station; lesson: Lesson; url: string; label: string }) {
  return (
    <div className="avoid-break flex h-[4.6in] flex-col justify-between rounded-2xl border-2 border-dashed border-black p-5" data-testid="station-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-wide uppercase">
            {station.club} · {station.date} · {label}
          </p>
          <p className="mt-1 text-4xl font-bold">
            <span className="mr-2" aria-hidden>
              {lessonPicture(lesson)}
            </span>
            {lesson.kidTitle ?? lesson.title}
          </p>
          <p className="mt-2 text-sm">
            📷 <b>iPad:</b> open the Camera app and point it at the code, then tap the link. {station.lock ? "The iPad stays on this lesson." : ""}
            {station.easy ? " Easy reading is on (read-aloud)." : ""}
          </p>
        </div>
        {url ? <Qr text={url} size={190} label={`Station code for ${lesson.title}`} /> : <div className="h-[190px] w-[190px]" />}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-lg">
        {station.kids.map((k) => (
          <li key={k.id}>
            <span aria-hidden>{k.animal}</span> {k.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Folds in half along the middle; the top half is upside down so both sides read right. */
export function NameTent({ kid, club }: { kid: Kid; club: string }) {
  const face = (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="text-7xl" aria-hidden>
        {kid.animal}
      </p>
      <p className="font-display text-6xl font-bold">{kid.name}</p>
      <p className="mt-1 text-sm">{club}</p>
    </div>
  );
  return (
    <div className="avoid-break grid h-[4.9in] grid-rows-2 border border-dashed border-black" data-testid="name-tent">
      <div className="rotate-180 border-b border-dotted border-black">{face}</div>
      {face}
    </div>
  );
}

export function CheckOffSheet({ title, kids, lessons, date }: { title: string; kids: Kid[]; lessons: Lesson[]; date: string }) {
  return (
    <div data-testid="checkoff">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm">
        {date} · Tick “Here” and each lesson passed. Then tap the same ticks into Wrap-up on the club keeper&apos;s phone.
      </p>
      <table className="mt-3 w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-black p-1 text-left">Kid</th>
            <th className="w-12 border border-black p-1">Here</th>
            {lessons.map((l) => (
              <th key={l.id} className="border border-black p-1 text-xs">
                S{l.step}: {l.title}
              </th>
            ))}
            <th className="w-1/4 border border-black p-1 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {kids.map((k) => (
            <tr key={k.id}>
              <td className="border border-black p-1 text-base font-semibold">
                {k.animal} {k.name}
              </td>
              <td className="border border-black p-1" />
              {lessons.map((l) => (
                <td key={l.id} className="h-8 border border-black p-1" />
              ))}
              <td className="border border-black p-1" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
