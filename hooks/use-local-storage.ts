"use client";

import { useCallback, useSyncExternalStore } from "react";

// ── Low-level helpers ──────────────────────────────────────────────────────

function getStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredValue<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch a custom event so other tabs / components stay in sync
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch {
    // quota exceeded, etc.
  }
}

// ── Subscribe to changes (cross-tab + same-tab) ───────────────────────────

function subscribeToStorage(callback: () => void) {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * A custom hook that syncs state with localStorage.
 *
 * - SSR-safe (returns `initialValue` on the server)
 * - Cross-tab sync via the `storage` event
 * - Uses `useSyncExternalStore` for tear-free reads
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Snapshot for useSyncExternalStore — keeps a cached ref so React
  // doesn't re-render unless the serialised value actually changed.
  const getSnapshot = useCallback(
    () => localStorage.getItem(key),
    [key]
  );
  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribeToStorage, getSnapshot, getServerSnapshot);

  const value: T = raw !== null ? (() => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  })() : initialValue;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(getStoredValue(key, initialValue))
          : next;
      setStoredValue(key, resolved);
    },
    [key, initialValue]
  );

  const removeValue = useCallback(() => {
    localStorage.removeItem(key);
    window.dispatchEvent(new StorageEvent("storage", { key }));
  }, [key]);

  return [value, setValue, removeValue] as const;
}

// ── Zustand storage adapter ────────────────────────────────────────────────

/**
 * A storage adapter compatible with Zustand's `persist` middleware.
 * This reuses the same localStorage mechanism as the hook above.
 *
 * Zustand's persist expects `getItem` to return the parsed object
 * (or null), not a raw string.
 */
export const zustandLocalStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: unknown): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};
