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

export type Pattern = {
  id: string;
  name: string;
  grid: Grid;
  lengthSteps: number;
};

export type Project = {
  patterns: Pattern[];
  activePatternId: string;
  chain: string[];
  chainEnabled: boolean;
  tempo: number;
};
