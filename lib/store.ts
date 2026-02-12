import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { zustandLocalStorage } from "@/hooks/use-local-storage";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Person {
  id: string;
  name: string;
  phone?: string;
}

export interface Receive {
  id: string;
  kapaanId: string;
  date: string;
  shape: string;
  pcs: number;
  weight: number;
  purity: string;
  color: string;
  lab: "IGI" | "GIA";
}

export interface Kapaan {
  id: string;
  kapaanNo: string;
  date: string;
  pcs: number;
  weight: number;
  personId: string;
}

// ── Store ──────────────────────────────────────────────────────────────────

interface DiamondState {
  kapaans: Kapaan[];
  persons: Person[];
  receives: Receive[];
  _hydrated: boolean;
}

interface DiamondActions {
  addKapaan: (kapaan: Omit<Kapaan, "id">) => void;
  updateKapaan: (id: string, data: Partial<Omit<Kapaan, "id">>) => void;
  removeKapaan: (id: string) => void;
  addPerson: (name: string, phone?: string) => Person;
  addReceive: (receive: Omit<Receive, "id">) => void;
  removeReceive: (id: string) => void;
}

type DiamondStore = DiamondState & DiamondActions;

let _id = 0;
const uid = () => `${Date.now()}-${++_id}`;

// ── Create Store ───────────────────────────────────────────────────────────

export const useDiamondStore = create<DiamondStore>()(
  persist(
    immer((set) => ({
      // State — starts empty
      kapaans: [],
      persons: [],
      receives: [],
      _hydrated: false,

      // Actions
      addKapaan: (data) =>
        set((state) => {
          state.kapaans.push({ ...data, id: uid() });
        }),

      updateKapaan: (id, data) =>
        set((state) => {
          const idx = state.kapaans.findIndex((k) => k.id === id);
          if (idx !== -1) {
            Object.assign(state.kapaans[idx], data);
          }
        }),

      removeKapaan: (id) =>
        set((state) => {
          state.kapaans = state.kapaans.filter((k) => k.id !== id);
          state.receives = state.receives.filter((r) => r.kapaanId !== id);
        }),

      addPerson: (name, phone) => {
        const person: Person = { id: uid(), name, phone };
        set((state) => {
          state.persons.push(person);
        });
        return person;
      },

      addReceive: (data) =>
        set((state) => {
          state.receives.push({ ...data, id: uid() });
        }),

      removeReceive: (id) =>
        set((state) => {
          state.receives = state.receives.filter((r) => r.id !== id);
        }),
    })),
    {
      name: "diamond-management-store",
      storage: zustandLocalStorage,
      partialize: (state) =>
        ({
          kapaans: state.kapaans,
          persons: state.persons,
          receives: state.receives,
        }) as unknown as DiamondStore,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
        }
      },
    }
  )
);

// ── Selectors (for optimized re-renders) ───────────────────────────────────

export const selectKapaans = (s: DiamondStore) => s.kapaans;
export const selectPersons = (s: DiamondStore) => s.persons;
export const selectReceives = (s: DiamondStore) => s.receives;
export const selectHydrated = (s: DiamondStore) => s._hydrated;

export const selectReceivesByKapaan = (kapaanId: string) => (s: DiamondStore) =>
  s.receives.filter((r) => r.kapaanId === kapaanId);

export const selectPersonById = (personId: string) => (s: DiamondStore) =>
  s.persons.find((p) => p.id === personId);
