import type { Grid, Preset } from "@/types";

import { STEPS, TRACKS } from "./constants";

export function createEmptyGrid(): Grid {
  return TRACKS.map(() => Array(STEPS).fill(false));
}

export const PRESETS: Preset[] = [
  {
    id: "boom-bap",
    name: "Boom Bap",
    tempo: 92,
    grid: TRACKS.map((_, trackIndex) =>
      Array.from({ length: STEPS }, (_, step) => {
        if (trackIndex === 0) return step % 4 === 0;
        if (trackIndex === 1) return step === 4 || step === 12;
        if (trackIndex === 2) return step === 4 || step === 12;
        if (trackIndex === 3) return step === 6 || step === 14;
        if (trackIndex === 6) return step % 2 === 0;
        if (trackIndex === 7) return step === 14;
        return false;
      }),
    ),
  },
  {
    id: "house",
    name: "House",
    tempo: 124,
    grid: TRACKS.map((_, trackIndex) =>
      Array.from({ length: STEPS }, (_, step) => {
        if (trackIndex === 0) return step % 4 === 0;
        if (trackIndex === 1) return step === 4 || step === 12;
        if (trackIndex === 2) return step === 4 || step === 12;
        if (trackIndex === 5) return step === 2 || step === 10;
        if (trackIndex === 6) return step % 2 === 1;
        if (trackIndex === 7) return step === 8;
        return false;
      }),
    ),
  },
  {
    id: "trap",
    name: "Trap",
    tempo: 140,
    grid: TRACKS.map((_, trackIndex) =>
      Array.from({ length: STEPS }, (_, step) => {
        if (trackIndex === 0) return step === 0 || step === 10 || step === 12;
        if (trackIndex === 1) return step === 8 || step === 12;
        if (trackIndex === 4) return step === 6;
        if (trackIndex === 6)
          return step % 2 === 0 || step === 7 || step === 11;
        if (trackIndex === 7) return step === 14;
        return false;
      }),
    ),
  },
];
