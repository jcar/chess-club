"use client";

import { createLocalStore, useLocalStore } from "./store";
import type { Station } from "./station";
import { today } from "./club/model";

/** Today's station card, if this iPad was set up from one. */
export const stationStore = createLocalStore<{ station: Station | null }>("chessclub:station", { station: null });

/** The station for today, or null (a card from another day is ignored). */
export function useStation(): Station | null {
  const { station } = useLocalStore(stationStore);
  return station && station.date === today() ? station : null;
}
