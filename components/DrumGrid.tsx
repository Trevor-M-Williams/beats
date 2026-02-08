"use client";

import type { Grid, Track } from "@/types";

type DrumGridProps = {
  currentStep: number;
  grid: Grid;
  isPlaying: boolean;
  tracks: Track[];
  onToggleStep: (trackIndex: number, stepIndex: number) => void;
  stepLabels: string[];
};

export function DrumGrid({
  currentStep,
  grid,
  isPlaying,
  tracks,
  onToggleStep,
  stepLabels,
}: DrumGridProps) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-[100px_repeat(16,minmax(0,1fr))] gap-2 text-xs uppercase tracking-[0.15em] text-zinc-500">
        <div />
        {stepLabels.map((label, index) => (
          <div key={label} className={index % 4 === 0 ? "text-zinc-300" : ""}>
            {label}
          </div>
        ))}
      </div>

      {tracks.map((track, trackIndex) => (
        <div
          key={track.id}
          className="grid grid-cols-[100px_repeat(16,minmax(0,1fr))] gap-2"
        >
          <div className="flex items-center text-sm font-semibold text-zinc-200">
            {track.label}
          </div>
          {grid[trackIndex].map((active, stepIndex) => {
            const isActiveStep = stepIndex === currentStep && isPlaying;
            return (
              <button
                key={`${track.id}-${stepIndex}`}
                type="button"
                onClick={() => onToggleStep(trackIndex, stepIndex)}
                className={[
                  "h-10 rounded-lg border text-sm transition",
                  active
                    ? "border-white bg-white text-black"
                    : "border-zinc-800 bg-[#13151d] text-zinc-500 hover:border-zinc-500",
                  isActiveStep ? "ring-2 ring-emerald-400/80" : "",
                ].join(" ")}
              >
                {active ? "●" : ""}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
