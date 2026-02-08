import type { Track } from "@/types";

export const TRACKS: Track[] = [
  { id: "kick", label: "Kick" },
  { id: "snare", label: "Snare" },
  { id: "clap", label: "Clap" },
  { id: "tom", label: "Tom" },
  { id: "rim", label: "Rim" },
  { id: "perc", label: "Perc" },
  { id: "hatClosed", label: "Hat C" },
  { id: "hatOpen", label: "Hat O" },
];

export const STEPS = 16;
export const DEFAULT_TEMPO = 120;

export const KEY_BINDINGS: { trackId: Track["id"]; key: string }[] = [
  { trackId: "kick", key: "a" },
  { trackId: "snare", key: "s" },
  { trackId: "clap", key: "d" },
  { trackId: "tom", key: "f" },
  { trackId: "rim", key: "g" },
  { trackId: "perc", key: "h" },
  { trackId: "hatClosed", key: "j" },
  { trackId: "hatOpen", key: "k" },
];
