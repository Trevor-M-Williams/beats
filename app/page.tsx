"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

import { DrumGrid } from "@/components/DrumGrid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDrumAudio } from "@/lib/beat/audio";
import {
  DEFAULT_TEMPO,
  KEY_BINDINGS,
  STEPS,
  TRACKS,
} from "@/lib/beat/constants";
import { createEmptyGrid } from "@/lib/beat/presets";
import type { Grid, Pattern, Project } from "@/types";

const STORAGE_KEY = "beats-project-v1";

const cloneGrid = (grid: Grid) => grid.map((row) => [...row]);

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `pattern-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createPattern = (name: string, grid?: Grid): Pattern => ({
  id: createId(),
  name,
  grid: grid ? cloneGrid(grid) : createEmptyGrid(),
  lengthSteps: STEPS,
});

const createDefaultProject = (): Project => {
  const pattern = createPattern("Pattern 1");
  return {
    patterns: [pattern],
    activePatternId: pattern.id,
    chain: [pattern.id],
    chainEnabled: false,
    tempo: DEFAULT_TEMPO,
  };
};

const sanitizeProject = (raw: unknown): Project | null => {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Partial<Project> & { grid?: Grid; tempo?: number };

  if (Array.isArray(candidate.patterns)) {
    const patterns = candidate.patterns
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const pattern = item as Partial<Pattern>;
        const grid = Array.isArray(pattern.grid)
          ? pattern.grid.map((row) => [...row])
          : createEmptyGrid();
        return {
          id: pattern.id ?? createId(),
          name: pattern.name ?? `Pattern ${index + 1}`,
          grid,
          lengthSteps: pattern.lengthSteps ?? STEPS,
        } as Pattern;
      })
      .filter((item): item is Pattern => Boolean(item));

    if (patterns.length === 0) return null;
    const patternIds = new Set(patterns.map((item) => item.id));
    const chain = Array.isArray(candidate.chain)
      ? candidate.chain.filter((id) => patternIds.has(id))
      : [patterns[0].id];
    const activePatternId = patternIds.has(candidate.activePatternId ?? "")
      ? (candidate.activePatternId as string)
      : patterns[0].id;

    return {
      patterns,
      activePatternId,
      chain,
      chainEnabled: Boolean(candidate.chainEnabled),
      tempo: typeof candidate.tempo === "number" ? candidate.tempo : DEFAULT_TEMPO,
    };
  }

  if (Array.isArray(candidate.grid)) {
    const pattern = createPattern("Pattern 1", candidate.grid);
    return {
      patterns: [pattern],
      activePatternId: pattern.id,
      chain: [pattern.id],
      chainEnabled: false,
      tempo: typeof candidate.tempo === "number" ? candidate.tempo : DEFAULT_TEMPO,
    };
  }

  return null;
};

export default function Home() {
  const defaultProject = useMemo(() => createDefaultProject(), []);
  const [patterns, setPatterns] = useState<Pattern[]>(defaultProject.patterns);
  const [activePatternId, setActivePatternId] = useState(
    defaultProject.activePatternId,
  );
  const [chain, setChain] = useState<string[]>(defaultProject.chain);
  const [chainEnabled, setChainEnabled] = useState(
    defaultProject.chainEnabled,
  );
  const [tempo, setTempo] = useState(defaultProject.tempo);
  const [hasLoaded, setHasLoaded] = useState(false);
  const dragPatternIdRef = useRef<string | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");
  const [menuPatternId, setMenuPatternId] = useState<string | null>(null);
  const [dialogPatternId, setDialogPatternId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  const { currentStep, isPlaying, start, stop, triggerTrack } = useDrumAudio({
    patterns,
    activePatternId,
    chain,
    chainEnabled,
    tempo,
    onPatternChange: (patternId) => {
      setActivePatternId((prev) => (prev === patternId ? prev : patternId));
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setHasLoaded(true);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      const project = sanitizeProject(parsed);
      if (project) {
        setPatterns(project.patterns);
        setActivePatternId(project.activePatternId);
        setChain(project.chain);
        setChainEnabled(project.chainEnabled);
        setTempo(project.tempo);
      }
    } catch {
      // Ignore malformed storage.
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    const project: Project = {
      patterns,
      activePatternId,
      chain,
      chainEnabled,
      tempo,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, [activePatternId, chain, chainEnabled, hasLoaded, patterns, tempo]);

  const activePattern =
    patterns.find((item) => item.id === activePatternId) ?? patterns[0];
  const activePatternIndex = patterns.findIndex(
    (item) => item.id === activePattern?.id,
  );

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    if (!activePattern) return;
    setPatterns((prev) =>
      prev.map((pattern) => {
        if (pattern.id !== activePattern.id) return pattern;
        const nextGrid = pattern.grid.map((row, r) =>
          row.map((value, c) =>
            r === trackIndex && c === stepIndex ? !value : value,
          ),
        );
        return { ...pattern, grid: nextGrid };
      }),
    );
  };

  const resetGrid = () => {
    if (!activePattern) return;
    setPatterns((prev) =>
      prev.map((pattern) =>
        pattern.id === activePattern.id
          ? { ...pattern, grid: createEmptyGrid() }
          : pattern,
      ),
    );
    setTempo(DEFAULT_TEMPO);
  };

  const createNewPattern = () => {
    const pattern = createPattern(`Pattern ${patterns.length + 1}`);
    setPatterns((prev) => [...prev, pattern]);
    setActivePatternId(pattern.id);
    setChain((prev) => [...prev, pattern.id]);
  };

  const duplicatePattern = (patternId?: string) => {
    const source =
      patterns.find((pattern) => pattern.id === patternId) ?? activePattern;
    if (!source) return;
    const sourceIndex = patterns.findIndex((item) => item.id === source.id);
    const duplicate = createPattern(`${source.name} Copy`, source.grid);
    setPatterns((prev) => {
      const next = [...prev];
      const insertIndex = Math.max(0, sourceIndex + 1);
      next.splice(insertIndex, 0, duplicate);
      return next;
    });
    setActivePatternId(duplicate.id);
    setChain((prev) => {
      const next = [...prev];
      const index = next.indexOf(source.id);
      if (index === -1) {
        next.push(duplicate.id);
      } else {
        next.splice(index + 1, 0, duplicate.id);
      }
      return next;
    });
  };

  const openRenameDialog = (patternId?: string) => {
    const target =
      patterns.find((pattern) => pattern.id === patternId) ?? activePattern;
    if (!target) return;
    setDialogPatternId(target.id);
    setRenameDraft(target.name);
    setIsRenameOpen(true);
  };

  const confirmRename = () => {
    const targetId = dialogPatternId ?? activePattern?.id;
    if (!targetId) return;
    const trimmed = renameDraft.trim();
    if (!trimmed) return;
    setPatterns((prev) =>
      prev.map((pattern) =>
        pattern.id === targetId ? { ...pattern, name: trimmed } : pattern,
      ),
    );
    setIsRenameOpen(false);
    setDialogPatternId(null);
  };

  const openDeleteDialog = (patternId?: string) => {
    const target =
      patterns.find((pattern) => pattern.id === patternId) ?? activePattern;
    if (!target || patterns.length <= 1) return;
    setDialogPatternId(target.id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    const targetId = dialogPatternId ?? activePattern?.id;
    if (!targetId || patterns.length <= 1) return;
    setPatterns((prev) =>
      prev.filter((pattern) => pattern.id !== targetId),
    );
    setChain((prev) => prev.filter((id) => id !== targetId));
    const nextPatterns = patterns.filter(
      (pattern) => pattern.id !== targetId,
    );
    const nextActive =
      nextPatterns[activePatternIndex] ?? nextPatterns[activePatternIndex - 1];
    if (nextActive) {
      setActivePatternId(nextActive.id);
    }
    setIsDeleteOpen(false);
    setDialogPatternId(null);
  };

  const selectPatternByOffset = (offset: number) => {
    if (!activePattern) return;
    const count = patterns.length;
    if (count === 0) return;
    const nextIndex = (activePatternIndex + offset + count) % count;
    const nextPattern = patterns[nextIndex];
    if (nextPattern) setActivePatternId(nextPattern.id);
  };

  const handleChainDrop = (targetId: string) => {
    const sourceId = dragPatternIdRef.current;
    dragPatternIdRef.current = null;
    if (!sourceId || sourceId === targetId) return;
    setChain((prev) => {
      const next = [...prev];
      const fromIndex = next.indexOf(sourceId);
      const toIndex = next.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, sourceId);
      return next;
    });
  };

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
      if ((event.metaKey || event.ctrlKey) && key === "d") {
        event.preventDefault();
        duplicatePattern();
        return;
      }

      if (key === "[") {
        event.preventDefault();
        selectPatternByOffset(-1);
        return;
      }

      if (key === "]") {
        event.preventDefault();
        selectPatternByOffset(1);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const binding = KEY_BINDINGS.find((item) => item.key === key);
      if (!binding) return;
      event.preventDefault();
      void triggerTrack(binding.trackId);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [duplicatePattern, selectPatternByOffset, triggerTrack]);

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
        <div className="rounded-3xl border border-zinc-800 bg-[#0f1117] p-4 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Chain
              </span>
              <button
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  chainEnabled
                    ? "border-white text-white"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                }`}
                onClick={() => setChainEnabled((prev) => !prev)}
                type="button"
              >
                {chainEnabled ? "Enabled" : "Disabled"}
              </button>
              <span className="text-xs text-zinc-400">
                Drag to reorder. Click to jump.
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {chain.map((patternId, index) => {
              const pattern = patterns.find((item) => item.id === patternId);
              if (!pattern) return null;
              const isActive = pattern.id === activePattern?.id;
              return (
                <div
                  key={pattern.id}
                  className="group relative"
                >
                  <button
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "border-white bg-white/10 text-white"
                        : "border-zinc-800 bg-[#0b0b0f] text-zinc-300 hover:border-zinc-600 hover:text-white"
                    }`}
                    draggable
                    onDragStart={() => {
                      dragPatternIdRef.current = pattern.id;
                    }}
                    onDragEnd={() => {
                      dragPatternIdRef.current = null;
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleChainDrop(pattern.id)}
                    onClick={() => {
                      setActivePatternId(pattern.id);
                      setMenuPatternId(null);
                    }}
                    type="button"
                  >
                    <span>{pattern.name}</span>
                    <button
                      className={`ml-1 flex h-6 w-6 items-center justify-center rounded-full border transition ${
                        menuPatternId === pattern.id
                          ? "border-white text-white opacity-100"
                          : "border-transparent text-zinc-500 opacity-0 group-hover:opacity-100 group-hover:border-zinc-600 group-hover:text-zinc-200"
                      }`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuPatternId((prev) =>
                          prev === pattern.id ? null : pattern.id,
                        );
                      }}
                      type="button"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </button>
                  {menuPatternId === pattern.id ? (
                    <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-2xl border border-zinc-800 bg-[#0f1117] p-2 text-xs shadow-[0_0_30px_rgba(0,0,0,0.35)]">
                      <button
                        className="w-full rounded-xl px-3 py-2 text-left text-zinc-200 transition hover:bg-white/5"
                        onClick={() => {
                          setMenuPatternId(null);
                          createNewPattern();
                        }}
                        type="button"
                      >
                        New Pattern
                      </button>
                      <button
                        className="w-full rounded-xl px-3 py-2 text-left text-zinc-200 transition hover:bg-white/5"
                        onClick={() => {
                          setMenuPatternId(null);
                          duplicatePattern(pattern.id);
                        }}
                        type="button"
                      >
                        Duplicate
                      </button>
                      <button
                        className="w-full rounded-xl px-3 py-2 text-left text-zinc-200 transition hover:bg-white/5"
                        onClick={() => {
                          setMenuPatternId(null);
                          openRenameDialog(pattern.id);
                        }}
                        type="button"
                      >
                        Rename
                      </button>
                      <button
                        className="w-full rounded-xl px-3 py-2 text-left text-red-300 transition hover:bg-red-500/10"
                        onClick={() => {
                          setMenuPatternId(null);
                          openDeleteDialog(pattern.id);
                        }}
                        type="button"
                        disabled={patterns.length <= 1}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
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
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="rounded-3xl border border-zinc-800 bg-[#0f1117] p-6 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
          <div className="mb-4 flex items-center justify-between gap-4 text-sm text-zinc-400">
            <span>
              Editing:{" "}
              <span className="font-semibold text-white">
                {activePattern?.name ?? "Pattern"}
              </span>
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Steps: {STEPS}
            </span>
          </div>
          <DrumGrid
            currentStep={currentStep}
            grid={activePattern?.grid ?? createEmptyGrid()}
            isPlaying={isPlaying}
            keyLabels={keyLabels}
            onToggleStep={toggleStep}
            stepLabels={stepLabels}
            tracks={TRACKS}
          />
        </div>
      </main>
      <Dialog
        open={isRenameOpen}
        onOpenChange={(open) => {
          setIsRenameOpen(open);
          if (!open) setDialogPatternId(null);
        }}
      >
        <DialogContent
          className="border-zinc-800 bg-[#0f1117] text-zinc-100 shadow-[0_0_60px_rgba(0,0,0,0.5)]"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            renameInputRef.current?.focus();
          }}
        >
          <DialogHeader className="text-left">
            <DialogTitle className="text-white">Rename Pattern</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Give this pattern a new name.
            </DialogDescription>
          </DialogHeader>
          <input
            ref={renameInputRef}
            className="w-full rounded-xl border border-zinc-700 bg-[#0b0b0f] px-3 py-2 text-sm text-white outline-none focus:border-white"
            value={renameDraft}
            onChange={(event) => setRenameDraft(event.target.value)}
          />
          <DialogFooter className="flex-row justify-end">
            <button
              className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              onClick={() => setIsRenameOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full border border-white bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
              onClick={confirmRename}
              type="button"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDialogPatternId(null);
        }}
      >
        <DialogContent className="border-zinc-800 bg-[#0f1117] text-zinc-100 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <DialogHeader className="text-left">
            <DialogTitle className="text-white">Delete Pattern</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This removes the pattern from your project and chain.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end">
            <button
              className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              onClick={() => setIsDeleteOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full border border-red-400 bg-red-400 px-4 py-2 text-xs font-semibold text-black transition hover:bg-red-300"
              onClick={confirmDelete}
              type="button"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
