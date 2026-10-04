"use client";

import { useEffect, useRef, useState } from "react";
import { ALL_LESSONS } from "@/content/curriculum";
import { Button, Card, PageHeader } from "@/components/ui/ui";
import { clubStore, downloadJson, myStore, useClub, whoStore } from "@/lib/club/store";
import { EMPTY_CLUB, mergeClub, parseClub, today, type Club } from "@/lib/club/model";
import { parseRosterFragment, rosterFragment } from "@/lib/club/share";
import { settingsStore, useSettings } from "@/lib/settings";

export function Devices() {
  const club = useClub();
  const settings = useSettings();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState<Club | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const [lesson, setLesson] = useState(ALL_LESSONS[0]?.id ?? "");
  const [pin, setPin] = useState("");
  const [copied, setCopied] = useState(false);

  // A roster link was opened on this device: offer to add those kids.
  useEffect(() => {
    const fromLink = parseRosterFragment(window.location.hash);
    if (fromLink) {
      // Reading the URL is a one-time sync with the outside world.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPending(fromLink);
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const merge = (incoming: Club, source: string) => {
    const { club: merged, added } = mergeClub(clubStore.getSnapshot(), incoming);
    clubStore.set(incoming.name && clubStore.getSnapshot().kids.length === 0 ? { ...merged, name: incoming.name } : merged);
    setMsg({ ok: true, text: `✓ Merged ${source}: ${added.kids} new kid(s), ${added.passes} new pass(es), ${added.games} new game(s).` });
  };

  const rosterLink = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}#${rosterFragment(club)}` : "";

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-5 pb-10">
      <PageHeader title="iPads & sharing" back="/teach/" backLabel="Coach" />
      <div className="flex flex-col gap-5 px-4">
        {msg && <p className={`rounded-xl px-4 py-3 font-semibold ${msg.ok ? "bg-primary-soft text-good" : "bg-oops/10 text-oops"}`}>{msg.text}</p>}

        {pending && (
          <Card className="ring-2 ring-info">
            <h2 className="text-lg font-bold">Add this roster to this device?</h2>
            <p className="mt-1">
              {pending.kids.length} kid(s) from “{pending.name}”: {pending.kids.map((k) => k.name).join(", ")}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => {
                  merge(pending, "the roster link");
                  setPending(null);
                }}
              >
                Add them
              </Button>
              <Button tone="soft" onClick={() => setPending(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <Card>
          <h2 className="text-xl font-bold">Your club&apos;s data lives on this device</h2>
          <p className="mt-1 text-ink-soft">
            There are no accounts and no server. To move data between devices (your laptop, your phone, a club iPad), save a file on one and open it on the other. Opening a file <b>merges</b>: nothing already here is lost.
          </p>
          <label className="mt-3 flex flex-col text-sm">
            Club name
            <input value={club.name} onChange={(e) => clubStore.update((c) => ({ ...c, name: e.target.value }))} className="mt-1 max-w-sm rounded-lg px-3 py-2 text-base ring-1 ring-line" />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => downloadJson(`chess-club-${today()}.json`, club)}>⬇ Save club file</Button>
            <Button tone="soft" onClick={() => file.current?.click()}>
              ⬆ Open a club file…
            </Button>
            <input
              ref={file}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                try {
                  merge(parseClub(await f.text()), f.name);
                } catch (err) {
                  setMsg({ ok: false, text: (err as Error).message });
                }
              }}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Set up a club iPad</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-6">
            <li>
              Open this site on the iPad in Safari, then tap <b>Share → Add to Home Screen</b>. It will work without Wi-Fi after that.
            </li>
            <li>
              Put your roster on it: open the <b>roster link</b> below on the iPad (AirDrop or text it to yourself), or save a club file here and open it on the iPad.
            </li>
            <li>
              Kids open <b>I&apos;m a student</b> and tap their name. Their passes save on the iPad.
            </li>
            <li>
              At the end of the day, on the iPad: <b>Coach → iPads &amp; sharing → Save club file</b>, and open that file on your own device to collect everyone&apos;s progress.
            </li>
          </ol>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              tone="soft"
              disabled={!club.kids.length}
              onClick={async () => {
                await navigator.clipboard.writeText(rosterLink);
                setCopied(true);
              }}
            >
              🔗 Copy roster link
            </Button>
            {copied && <span className="text-good">Copied!</span>}
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            The link holds first names and grades only, no progress. The names sit after the “#”, which browsers never send to the website, but the link itself can end up in message history, so share it only with devices you control.
          </p>
          <p className="mt-3 text-sm">
            <b>Shared iPads from a cart?</b> Skip the roster. Kids use <b>Just me</b>, and when they pass they get a pass code to show you. Enter it on the Roster page.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Lock this iPad to one lesson</h2>
          <p className="mt-1 text-ink-soft">Student mode will show only this lesson until you unlock it with your PIN. The PIN is saved only on this device.</p>
          {settings.lockedLesson ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span>
                Locked to <b>{ALL_LESSONS.find((l) => l.id === settings.lockedLesson)?.title}</b>.
              </span>
              <Button
                tone="soft"
                onClick={() => {
                  // A kid can reach this page with Safari's back button, so the PIN guards it here too.
                  if (settings.pin && prompt("Teacher PIN") !== settings.pin) return;
                  settingsStore.update((s) => ({ ...s, lockedLesson: null }));
                }}
              >
                Unlock
              </Button>
            </div>
          ) : (
            <form
              className="mt-3 flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                settingsStore.update((s) => ({ ...s, lockedLesson: lesson, pin: pin || null }));
                setPin("");
              }}
            >
              <select value={lesson} onChange={(e) => setLesson(e.target.value)} className="rounded-lg px-3 py-2 ring-1 ring-line" aria-label="Lesson">
                {ALL_LESSONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    Step {l.step}: {l.title}
                  </option>
                ))}
              </select>
              <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="PIN (optional)" className="w-36 rounded-lg px-3 py-2 ring-1 ring-line" aria-label="PIN" />
              <Button type="submit">Lock</Button>
            </form>
          )}
          <p className="mt-3 text-sm text-ink-soft">
            To keep kids inside the app entirely, use iOS <b>Guided Access</b>: Settings → Accessibility → Guided Access → on. Then open the app and triple-click the side (or Home) button to start it.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Read-aloud</h2>
          <label className="mt-2 flex items-center gap-3">
            <input type="checkbox" className="h-5 w-5" checked={settings.readAloud} onChange={(e) => settingsStore.update((s) => ({ ...s, readAloud: e.target.checked }))} />
            Read instructions out loud in easy-reading mode (uses the device&apos;s built-in voice)
          </label>
        </Card>

        <Card className="ring-oops/40">
          <h2 className="text-xl font-bold">Clear this device</h2>
          <p className="mt-1 text-ink-soft">Removes the roster, progress and settings from this browser only. Save a club file first if you want to keep it.</p>
          <Button
            tone="danger"
            className="mt-3"
            onClick={() => {
              if (!confirm("Delete all Chess Club data on this device? This can't be undone.")) return;
              clubStore.set({ ...EMPTY_CLUB });
              myStore.set({ passed: {} });
              whoStore.set({ kidId: null });
              settingsStore.reset();
              setMsg({ ok: true, text: "This device has been cleared." });
            }}
          >
            Delete everything on this device
          </Button>
        </Card>
      </div>
    </main>
  );
}
