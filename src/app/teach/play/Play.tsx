"use client";

import { useState } from "react";
import { Button, Card, PageHeader } from "@/components/ui/ui";
import { createLocalStore, useLocalStore } from "@/lib/store";
import { clubStore, useClub } from "@/lib/club/store";
import { newId, today, type Club, type GameResult } from "@/lib/club/model";
import { ladderPairings, roundRobin, scores, swissRound, updateLadder, type Pairing } from "@/lib/club/pairing";

/** A round-robin or Swiss event in progress. Its games also go into the club's game list. */
interface Event {
  kind: "roundRobin" | "swiss" | null;
  players: string[];
  rounds: Pairing[][];
  gameIds: string[];
}
const eventStore = createLocalStore<Event>("chessclub:event", { kind: null, players: [], rounds: [], gameIds: [] });

type Result = GameResult["result"];

export function Play() {
  const club = useClub();
  const [tab, setTab] = useState<"ladder" | "event">("ladder");
  const name = (id: string) => club.kids.find((k) => k.id === id)?.name ?? "?";

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 pb-10">
      <PageHeader title="Club games" back="/teach/" backLabel="Coach">
        <Button tone="soft" onClick={() => window.print()} className="no-print">
          🖨 Print pairings
        </Button>
      </PageHeader>
      <div className="no-print flex gap-2 px-4">
        {(["ladder", "event"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-full px-4 py-2 font-semibold ring-1 ${tab === t ? "bg-ink text-white ring-ink" : "bg-card ring-line"}`}>
            {t === "ladder" ? "🪜 Ladder" : "🏆 Tournament"}
          </button>
        ))}
      </div>
      <div className="px-4">{tab === "ladder" ? <Ladder club={club} name={name} /> : <Tournament club={club} name={name} />}</div>
    </main>
  );
}

function record(white: string, black: string, result: Result): string {
  const game: GameResult = { id: newId(), date: today(), white, black, result };
  clubStore.update((c) => ({ ...c, games: [...c.games, game] }));
  return game.id;
}

function ResultButtons({ onResult, current }: { onResult: (r: Result) => void; current?: Result }) {
  const opts: [Result, string][] = [
    ["1-0", "White won"],
    ["1/2", "Draw"],
    ["0-1", "Black won"],
  ];
  return (
    <div className="no-print flex gap-1">
      {opts.map(([r, label]) => (
        <button key={r} type="button" onClick={() => onResult(r)} className={`rounded-lg px-2 py-1 text-sm ring-1 ${current === r ? "bg-primary text-primary-ink ring-primary" : "bg-card ring-line"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Ladder({ club, name }: { club: Club; name: (id: string) => string }) {
  const [shift, setShift] = useState(false);
  const [done, setDone] = useState<Record<string, Result>>({});
  const active = club.ladder.filter((id) => club.kids.some((k) => k.id === id && !k.archived));
  const present = club.attendance[today()] ?? [];
  const pairs = ladderPairings(active, present, shift);

  const move = (i: number, d: number) =>
    clubStore.update((c) => {
      const l = c.ladder.filter((id) => active.includes(id));
      const j = i + d;
      if (j < 0 || j >= l.length) return c;
      [l[i], l[j]] = [l[j], l[i]];
      return { ...c, ladder: l };
    });

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Card>
        <h2 className="text-xl font-bold">Today&apos;s ladder games</h2>
        <p className="text-sm text-ink-soft">Kids play the kid next to them on the ladder. Beat someone above you and you take their spot. Mark who&apos;s here on the Roster or Plan page.</p>
        <label className="no-print mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={shift} onChange={(e) => setShift(e.target.checked)} /> Shift pairs this week (so the top kid gets a new opponent)
        </label>
        {pairs.length === 0 && <p className="mt-3 text-ink-soft">Nobody is marked here today.</p>}
        <ul className="mt-3 flex flex-col gap-2">
          {pairs.map((p) => {
            const key = `${p.white}-${p.black}`;
            return (
              <li key={key} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sunk px-3 py-2">
                <span>
                  <b>{name(p.white)}</b> {p.black ? <>(W) vs <b>{name(p.black)}</b> (B)</> : "has a bye: play anyone free"}
                </span>
                {p.black && (
                  <ResultButtons
                    current={done[key]}
                    onResult={(r) => {
                      if (done[key]) return;
                      record(p.white, p.black!, r);
                      clubStore.update((c) => ({ ...c, ladder: updateLadder(c.ladder, { white: p.white, black: p.black!, result: r }) }));
                      setDone((d) => ({ ...d, [key]: r }));
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </Card>
      <Card>
        <h2 className="text-xl font-bold">Ladder</h2>
        <ol className="mt-2 flex flex-col gap-1">
          {active.map((id, i) => (
            <li key={id} className="flex items-center gap-2 rounded-lg px-2 py-1 odd:bg-sunk">
              <span className="w-6 text-right font-bold text-ink-soft">{i + 1}</span>
              <span className="flex-1 font-semibold">{name(id)}</span>
              <span className="no-print flex gap-1">
                <button type="button" aria-label={`Move ${name(id)} up`} onClick={() => move(i, -1)} className="rounded px-2 ring-1 ring-line">
                  ↑
                </button>
                <button type="button" aria-label={`Move ${name(id)} down`} onClick={() => move(i, 1)} className="rounded px-2 ring-1 ring-line">
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Tournament({ club, name }: { club: Club; name: (id: string) => string }) {
  const ev = useLocalStore(eventStore);
  const games = club.games.filter((g) => ev.gameIds.includes(g.id));
  const present = club.attendance[today()] ?? [];

  if (!ev.kind) {
    const players = club.kids.filter((k) => !k.archived && present.includes(k.id)).map((k) => k.id);
    return (
      <Card>
        <h2 className="text-xl font-bold">Start a tournament</h2>
        <p className="text-ink-soft">
          Uses the {players.length} kid(s) marked here today. <b>Round robin</b>: everyone plays everyone (best for 4–8 kids). <b>Swiss</b>: a few rounds where kids with the same score play each other (good for bigger groups).
        </p>
        <div className="mt-3 flex gap-2">
          <Button disabled={players.length < 2} onClick={() => eventStore.set({ kind: "roundRobin", players, rounds: roundRobin(players), gameIds: [] })}>
            Round robin
          </Button>
          <Button disabled={players.length < 2} onClick={() => eventStore.set({ kind: "swiss", players, rounds: [swissRound(players, [])], gameIds: [] })}>
            Swiss
          </Button>
        </div>
      </Card>
    );
  }

  const byes = ev.rounds.flat().filter((p) => !p.black).map((p) => p.white);
  const sc = scores(ev.players, games);
  const total = (id: string) => sc.get(id)! + byes.filter((b) => b === id).length;
  const standings = [...ev.players].sort((a, b) => total(b) - total(a));
  const resultOf = (p: Pairing) => games.find((g) => g.white === p.white && g.black === p.black)?.result;
  const lastRound = ev.rounds[ev.rounds.length - 1];
  const roundDone = lastRound.every((p) => !p.black || resultOf(p));

  return (
    <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-4">
        {ev.rounds.map((round, r) => (
          <Card key={r} className="avoid-break">
            <h2 className="text-lg font-bold">Round {r + 1}</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {round.map((p) => (
                <li key={`${p.white}-${p.black}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sunk px-3 py-2">
                  <span>
                    <b>{name(p.white)}</b> {p.black ? <>(W) vs <b>{name(p.black)}</b> (B)</> : "has a bye (1 point)"}
                  </span>
                  {p.black && (
                    <ResultButtons
                      current={resultOf(p)}
                      onResult={(res) => {
                        if (resultOf(p)) return;
                        const id = record(p.white, p.black!, res);
                        eventStore.update((e) => ({ ...e, gameIds: [...e.gameIds, id] }));
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
        <div className="no-print flex gap-2">
          {ev.kind === "swiss" && (
            <Button disabled={!roundDone} onClick={() => eventStore.update((e) => ({ ...e, rounds: [...e.rounds, swissRound(e.players, games, byes)] }))}>
              Pair next round
            </Button>
          )}
          <Button
            tone="soft"
            onClick={() => {
              if (confirm("End this tournament? Results stay in the club's game history.")) eventStore.reset();
            }}
          >
            End tournament
          </Button>
        </div>
      </div>
      <Card className="self-start">
        <h2 className="text-lg font-bold">Standings</h2>
        <ol className="mt-2">
          {standings.map((id, i) => (
            <li key={id} className="flex justify-between py-1">
              <span>
                {i + 1}. {name(id)}
              </span>
              <b>{fmt(total(id))}</b>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function fmt(points: number): string {
  const whole = Math.floor(points);
  return points % 1 ? `${whole || ""}½` : String(whole);
}
