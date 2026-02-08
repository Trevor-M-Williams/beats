"use client";

import { useEffect, useMemo, useState } from "react";

import { DrumGrid } from "@/components/DrumGrid";
import { useDrumAudio } from "@/lib/beat/audio";
import {
  DEFAULT_TEMPO,
  KEY_BINDINGS,
  STEPS,
  TRACKS,
} from "@/lib/beat/constants";
import { createEmptyGrid, PRESETS } from "@/lib/beat/presets";
import type { Grid } from "@/types";

export default function Home() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid);
  const [tempo, setTempo] = useState(DEFAULT_TEMPO);

  const { currentStep, isPlaying, start, stop, triggerTrack } = useDrumAudio({
    grid,
    tempo,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const binding = KEY_BINDINGS.find((item) => item.key === key);
      if (!binding) return;
      event.preventDefault();
      void triggerTrack(binding.trackId);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerTrack]);

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    setGrid((prev) =>
      prev.map((row, r) =>
        row.map((value, c) =>
          r === trackIndex && c === stepIndex ? !value : value,
        ),
      ),
    );
  };

  const resetGrid = () => {
    setGrid(createEmptyGrid());
    setTempo(DEFAULT_TEMPO);
  };

  const loadPreset = (presetId: string) => {
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setGrid(preset.grid);
    setTempo(preset.tempo);
  };

  const stepLabels = useMemo(
    () => Array.from({ length: STEPS }, (_, index) => (index + 1).toString()),
    [],
  );
  const keyLabels = useMemo(
    () =>
      Object.fromEntries(
        KEY_BINDINGS.map((binding) => [
          binding.trackId,
          binding.key.toUpperCase(),
        ]),
      ),
    [],
  );

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-zinc-100">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-6 pt-10">
        <div>
          <h1 className="text-3xl font-semibold text-white">Beat Lab</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            className="rounded-full border border-zinc-700 px-6 py-2 text-sm font-semibold text-white transition hover:border-zinc-500"
            onClick={isPlaying ? stop : start}
          >
            {isPlaying ? "Stop" : "Play"}
          </button>
          <button
            className="rounded-full border border-zinc-700 px-6 py-2 text-sm font-semibold text-white transition hover:border-zinc-500"
            onClick={resetGrid}
          >
            Reset
          </button>
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <span>Tempo</span>
            <input
              className="w-40 accent-white"
              type="range"
              min={60}
              max={180}
              value={tempo}
              onChange={(event) => setTempo(Number(event.target.value))}
            />
            <span className="w-10 text-right tabular-nums">{tempo}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
            <span className="uppercase tracking-[0.2em] text-zinc-500">
              Presets
            </span>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-white transition hover:border-zinc-500"
                onClick={() => loadPreset(preset.id)}
                type="button"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="rounded-3xl border border-zinc-800 bg-[#0f1117] p-6 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
          <DrumGrid
            currentStep={currentStep}
            grid={grid}
            isPlaying={isPlaying}
            keyLabels={keyLabels}
            onToggleStep={toggleStep}
            stepLabels={stepLabels}
            tracks={TRACKS}
          />
        </div>
      </main>
    </div>
  );
}
