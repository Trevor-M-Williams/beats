export type TrackId =
  | "kick"
  | "snare"
  | "clap"
  | "tom"
  | "rim"
  | "perc"
  | "hatClosed"
  | "hatOpen";

export type Track = {
  id: TrackId;
  label: string;
};

export type Grid = boolean[][];

export type Preset = {
  id: string;
  name: string;
  tempo: number;
  grid: Grid;
};
