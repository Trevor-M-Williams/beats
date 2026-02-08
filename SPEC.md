# Beat Maker App Spec

## Summary

A lightweight, browser-based beat making app inspired by Ableton’s Session View. Focus on fast pattern creation, clip launching, and basic mixing. No backend, auth, or database. Beats are saved locally using `localStorage`.

## Goals

- Fast, fun beat creation with minimal setup.
- Works offline.
- Simple, clean UI that fits laptop and tablet screens.
- Local-only persistence for now.

## Non-Goals (for this phase)

- Collaboration or cloud sync.
- User accounts, auth, or database.
- Full audio workstation features (automation lanes, advanced routing, VSTs).

## Target Users

- Hobbyists and beginners who want to sketch beats quickly.
- Producers who want a lightweight scratchpad.

## Core Concepts

- **Project**: A saved beat with tempo, tracks, clips, and mixer settings.
- **Track**: A lane for clips (drum, sample, synth). Tracks have mixer settings.
- **Clip**: A looping pattern on a track, composed of steps or notes.
- **Scene**: A horizontal row of clips that can be launched together.
- **Transport**: Play/stop, tempo, swing, metronome.

## Feature Set (MVP)

### 1. Session Grid

- 8 tracks x 8 scenes grid (configurable later).
- Each cell can hold a clip.
- Click a clip to edit.
- Click a scene launch to trigger all clips in the row.
- Clip state: empty, stopped, playing.

### 2. Clip Editor

- Two modes:
  - **Drum Step Sequencer** (16-step grid)
  - **Piano Roll** (single-octave for now)
- Quantized steps (1/16).
- Velocity per step (simple 3 levels).
- Clip length: 1–4 bars.
- Undo/redo (in-memory only).

### 3. Sound Engine

- Web Audio API.
- Built-in drum kit (kick, snare, hat, clap).
- 1–2 simple synth voices (sine + square).
- Basic sampler for short one-shots (preloaded assets only).
- Polyphony limit to prevent overload.

### 4. Mixer

- Per-track volume and mute/solo.
- Master volume.
- Simple high-pass / low-pass per track (single knob each).

### 5. Transport & Timing

- Tempo: 60–180 BPM.
- Swing: 0–60%.
- Metronome toggle.
- Play/stop/record (record writes steps while playing).

### 6. Persistence

- Save/load projects in localStorage.
- Project list view with rename/delete.
- Export/import JSON file for manual backup.

## UX/UI Requirements

- Dark UI with high contrast.
- Keyboard shortcuts for play/stop, copy/paste clip, duplicate scene.
- Responsive layout with collapsible side panels.
- Minimal animations (clip launch highlight).

## Data Model (Client-Side)

### Project

- `id`, `name`, `bpm`, `swing`, `createdAt`, `updatedAt`
- `tracks`: array of Track
- `scenes`: array of Scene

### Track

- `id`, `name`, `type` ("drum" | "synth" | "sample")
- `volume`, `mute`, `solo`
- `filters`: `{ lowPass, highPass }`
- `clips`: map of sceneId -> ClipId

### Clip

- `id`, `name`, `lengthBars`, `steps`
- `steps`: array of step objects
- `mode`: "drum" | "piano"

### Step

- `time` (step index)
- `note` (MIDI note number)
- `velocity` (0–2)
- `length` (steps)

## Pages / Routes

- `/` Session view (main)
- `/project` Project list / create / import
- `/settings` (minimal: audio device, latency, theme)

## Technical Notes

- Use `AudioContext` with a single scheduler loop.
- Consider `requestAnimationFrame` for UI timing.
- `localStorage` schema versioning for future migrations.
- Defer heavy assets; preload small kit.

## Milestones

1. Session grid + clip editor (drum only)
2. Transport + sound engine
3. Mixer
4. Persistence
5. Piano roll + synth
6. Polishing & shortcuts

## Open Questions

- Should the grid be 6x8 or 8x8 by default?
- Should the clip editor allow drag to paint steps?
- Do we want per-track effects beyond filters?
