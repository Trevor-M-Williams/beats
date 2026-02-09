import type { Grid } from "@/types";

import { STEPS, TRACKS } from "./constants";

export function createEmptyGrid(): Grid {
  return TRACKS.map(() => Array(STEPS).fill(false));
}

// Preset data removed per spec update.
