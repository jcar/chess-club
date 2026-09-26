"use client";

// A tiny factory for SSR-safe localStorage stores read via useSyncExternalStore
// (copied from OpeningLab). `getServerSnapshot` returns the frozen
// default so server and first client render match; never read localStorage
// during render elsewhere.

import { useSyncExternalStore } from "react";

export interface LocalStore<T> {
  subscribe: (l: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (next: T) => void;
  update: (fn: (prev: T) => T) => T;
  reset: () => void;
}

export function createLocalStore<T extends object>(key: string, defaults: T, migrate?: (raw: unknown) => T | null): LocalStore<T> {
  const frozen = Object.freeze({ ...defaults }) as T;
  let cache: T | null = null;
  const listeners = new Set<() => void>();

  const load = (): T => {
    if (typeof window === "undefined") return frozen;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return { ...defaults };
      const parsed = JSON.parse(raw);
      const migrated = migrate ? migrate(parsed) : null;
      return { ...defaults, ...(migrated ?? (parsed as Partial<T>)) };
    } catch {
      return { ...defaults };
    }
  };

  const persist = (next: T) => {
    cache = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* private mode / quota — keep in memory */
    }
    listeners.forEach((l) => l());
  };

  const store: LocalStore<T> = {
    subscribe: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getSnapshot: () => (cache ??= load()),
    getServerSnapshot: () => frozen,
    set: persist,
    update: (fn) => {
      const next = fn(store.getSnapshot());
      persist(next);
      return next;
    },
    reset: () => persist({ ...defaults }),
  };
  return store;
}

export function useLocalStore<T extends object>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
