"use client";

// Saved session plans (the planner's inputs, per date), so a plan made the
// night before drives the session pack, the station cards and Wrap-up.

import { createLocalStore, useLocalStore } from "@/lib/store";
import { getWarmup } from "@/content/warmups";
import { planSession, type Plan } from "./planner";
import type { Club } from "./model";

export interface SavedPlan {
  date: string;
  /** Kid ids expected (not attendance: that's taken in Wrap-up). */
  expected: string[];
  minutes: number;
  ipads: number;
  adults: string[];
  wholeGroup: boolean;
  overrides: Record<string, string>;
  warmup?: string;
  /** Lock station iPads to their group's lesson. */
  lock: boolean;
  pin?: string;
}

export const planStore = createLocalStore<{ plans: Record<string, SavedPlan> }>("chessclub:plans", { plans: {} });

export function usePlans(): Record<string, SavedPlan> {
  return useLocalStore(planStore).plans;
}

export function defaultPlan(club: Club, date: string): SavedPlan {
  return {
    date,
    expected: club.kids.filter((k) => !k.archived).map((k) => k.id),
    minutes: 45,
    ipads: 0,
    adults: ["Teacher"],
    wholeGroup: true,
    overrides: {},
    lock: true,
  };
}

export function savePlan(p: SavedPlan): void {
  planStore.update((s) => ({ plans: { ...s.plans, [p.date]: p } }));
}

export function computePlan(club: Club, p: SavedPlan): Plan {
  return planSession(club, p.expected, { minutes: p.minutes, ipads: p.ipads, adults: p.adults, wholeGroup: p.wholeGroup, overrides: p.overrides, warmup: getWarmup(p.warmup) });
}
