import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/ui";
import { WARMUPS } from "@/content/warmups";

export const metadata: Metadata = { title: "Start here" };

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-line">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-2 flex flex-col gap-2 leading-relaxed [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc">{children}</div>
    </section>
  );
}

const TOC = [
  ["first", "Your first session"],
  ["roles", "Who does what"],
  ["week", "Every week"],
  ["print", "What to buy and print"],
  ["ipads", "iPad day"],
  ["early", "Early readers and new players"],
  ["mixed", "A room of mixed ages"],
  ["privacy", "Privacy"],
  ["faq", "FAQ"],
] as const;

export default function Guide() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 pb-12">
      <PageHeader title="Start here" back="/teach/" backLabel="Coach" />
      <div className="flex flex-col gap-4 px-4">
        <p className="text-lg">
          You don&apos;t need to play chess to run this club. Every lesson has a script to read, a table game, and practice that works on paper or on iPads. This page is the whole playbook.
        </p>
        <nav aria-label="Contents" className="flex flex-wrap gap-2">
          {TOC.map(([id, t]) => (
            <a key={id} href={`#${id}`} className="rounded-full bg-sunk px-3 py-1 text-sm">
              {t}
            </a>
          ))}
        </nav>

        <Section id="first" title="Your first session">
          <ol>
            <li>
              <b>Add the kids</b> on the <Link href="/teach/roster/" className="text-info underline">Roster</Link>: first names, and grade if you like (it only switches on easy reading for the youngest). Each kid gets an animal so non-readers can find their name.
            </li>
            <li>
              <b>Plan it</b> the night before on <Link href="/teach/plan/" className="text-info underline">Plan a session</Link>: pick the date, who&apos;s coming, the adults, how many iPads, and a warm-up. New kids all start at Step 1, so session one is usually one big group.
            </li>
            <li>
              <b>Print the session pack</b> from the planner: agenda, station cards for iPads, worksheets with names filled in, answer keys, game cards and a check-off sheet. Name tents help everyone learn names.
            </li>
            <li>
              <b>Run it</b> (45 minutes): warm-up (5) → teach “The Chessboard” with Present mode or a demo board (15) → the table game in pairs (10) → practice and pass check on iPads or worksheets (8) → free play → wrap-up (5).
            </li>
            <li>
              <b>Wrap up</b> on one phone: <Link href="/teach/wrapup/" className="text-info underline">Wrap-up</Link> → tick who came and who passed. Scan iPad pass codes; helpers show you their code.
            </li>
          </ol>
          <p>Don&apos;t worry about finishing a lesson. Repeating one next week is normal, especially for the youngest kids.</p>
        </Section>

        <Section id="roles" title="Who does what">
          <ul>
            <li>
              <b>Lead (teacher or coach):</b> runs the clock and the warm-up, teaches the whole group from Present mode, and keeps the club on their phone (Wrap-up).
            </li>
            <li>
              <b>Helpers:</b> each takes a group from the plan. Open the lesson script on your phone (the QR on the pack cover), read the “say” lines, and use a demo board. Walk the tables during games and watch for the lesson&apos;s “common mistakes”.
            </li>
            <li>
              <b>Helpers keeping score:</b> scan the roster QR on the pack cover once, tick your group in Wrap-up, then “Show my code” so the lead can scan it.
            </li>
            <li>
              <b>Table captains:</b> older kids who already know the moves can coach a younger pair: check the board setup, remind them of the rules, praise good moves. Kids love the job, and teaching locks in their own learning.
            </li>
          </ul>
        </Section>

        <Section id="week" title="Every week">
          <ol>
            <li>Plan (5 minutes): open last week&apos;s kids, change who&apos;s coming, check the suggested lessons. Override a group&apos;s lesson if you want to repeat one.</li>
            <li>Print the pack. Put game cards on the tables before kids arrive.</li>
            <li>Teach, play, practice. Kids who pass early: the lesson&apos;s game, extra puzzles (for readers), or a real game.</li>
            <li>Wrap-up on one phone. Print lesson stamps for today&apos;s passes, and add stickers to the wall chart (<Link href="/print/club/" className="text-info underline">Club printables</Link>).</li>
            <li>When a kid finishes a step, print a certificate from the Roster and celebrate it at the start of next session.</li>
          </ol>
        </Section>

        <Section id="print" title="What to buy and print">
          <ul>
            <li>One board and set per two kids (vinyl roll-up boards are cheap and tough), plus a few spares.</li>
            <li>A demo board (wall or magnetic), or a projector/TV for Present mode.</li>
            <li>Masking tape for a floor grid (warm-ups like Knight Hopscotch), a cloth bag for Mystery Piece, stickers for the wall chart.</li>
            <li>Each week: the session pack. Print worksheets double-sided if you like; each kid gets practice + pass check.</li>
            <li>Once: name tents, the wall sticker chart, a few score sheets for older kids.</li>
          </ul>
        </Section>

        <Section id="ipads" title="iPad day">
          <ol>
            <li>
              <b>Before the first session:</b> ask the campus tech person whether school iPads and Wi-Fi can open <code>jcar.github.io</code>. If not, run on paper: everything works without iPads.
            </li>
            <li>Use Safari. The site works offline after it has loaded once on that iPad with Wi-Fi.</li>
            <li>
              <b>Station cards:</b> open the Camera app on the iPad, point it at the group&apos;s card, tap the link. The iPad opens that lesson with easy reading on, and shows only that group&apos;s names. Nothing from last week matters, so it&apos;s fine if kids get a different iPad.
            </li>
            <li>Each kid taps their animal, does the lesson, and gets a pass code on screen. Tap “Next kid” for the next one.</li>
            <li>
              To keep kids inside the app: Settings → Accessibility → Guided Access, then triple-click the side button in the lesson. Set a PIN in the planner to lock station iPads.
            </li>
            <li>Turn the volume up: easy reading reads every question and answer aloud.</li>
          </ol>
        </Section>

        <Section id="early" title="Early readers and new players">
          <ul>
            <li>Easy reading (on by default for the youngest) uses simpler words, reads questions, answers and hints out loud, and marks answers with colours so a kid can hear “Blue: Diagonal” and tap blue.</li>
            <li>Expect each step to take one and a half to two times as many sessions. Repeat lessons freely; the planner&apos;s “Teach instead” makes that one click.</li>
            <li>Lessons marked 📖 lean on reading (square names, notation). Do them out loud with a demo board, then tick the pass by hand in Wrap-up.</li>
            <li>Keep talk short: one idea, then hands on the pieces. Use the “with younger kids” tip on each lesson page.</li>
            <li>
              Warm-ups get the wiggles out: {WARMUPS.slice(0, 4).map((w) => w.title).join(", ")} and <Link href="/teach/warmups/" className="text-info underline">more</Link>.
            </li>
          </ul>
        </Section>

        <Section id="mixed" title="A room of mixed ages">
          <ul>
            <li>Turn on “Early readers learn together” in the planner: the youngest stay one group on one lesson; readers are grouped by step.</li>
            <li>Pair kids of similar strength for games. The ladder (Club games) does this automatically.</li>
            <li>Make strong older kids table captains. Give kids who finish early a job: set up boards, play the lesson&apos;s game, or try extra puzzles.</li>
            <li>A quiet signal helps: “Hands on your king!” and everyone freezes.</li>
            <li>Praise effort and good thinking, not just wins. “You looked for checks first. That&apos;s what strong players do.”</li>
          </ul>
        </Section>

        <Section id="privacy" title="Privacy">
          <ul>
            <li>Use first names or nicknames only.</li>
            <li>The roster lives in this browser. Nothing goes to a server: there isn&apos;t one. Station cards, pass codes and helper codes move data from device to device inside the QR code itself.</li>
            <li>Station cards and the roster QR show kids&apos; first names: collect them after club, or recycle them.</li>
            <li>To move the club to another device, save a club file on the iPads & sharing page.</li>
          </ul>
        </Section>

        <Section id="faq" title="FAQ">
          <p>
            <b>A kid passed on paper.</b> Tick it in Wrap-up (or on the kid&apos;s roster page).
          </p>
          <p>
            <b>A pass landed on the wrong kid.</b> Untick it in Wrap-up for that date, then tick the right kid.
          </p>
          <p>
            <b>A kid already plays.</b> On their roster page, set “Already knows up to…”, and they start at that step.
          </p>
          <p>
            <b>The iPad isn&apos;t talking.</b> Check the volume and the mute switch, tap anywhere once, then tap 🔊.
          </p>
          <p>
            <b>The camera won&apos;t scan in Wrap-up.</b> Allow camera access for the site, or point the phone&apos;s Camera app at the code instead (in Safari).
          </p>
          <p>
            <b>We have no iPads.</b> That&apos;s fine. The session pack has everything on paper, and the check-off sheet becomes your record.
          </p>
        </Section>
      </div>
    </main>
  );
}
