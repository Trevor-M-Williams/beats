# Project Log

This is a running log of features added and decisions made along the way, including important details that might not be obvious from the code alone.

## 2026-02-08
- Created a lightweight beat maker MVP with an 8-track, 16-step drum grid and a transport bar.
- Implemented Web Audio API drum synthesis (kick, snare, clap, tom, rim, perc, closed hat, open hat).
- Added open/closed hat choke behavior (closed hat cuts open hat).
- Added presets with different tempos and patterns (Boom Bap, House, Trap).
- Set the default state to an empty grid at 120 BPM; reset returns to this state.
- Added keyboard triggers for all drum voices and displayed key labels in the grid UI.
- Refactored into separate modules:
  - UI: `components/DrumGrid.tsx`
  - Audio engine: `lib/beat/audio.ts`
  - Presets/constants: `lib/beat/presets.ts`, `lib/beat/constants.ts`
  - Types: `types/index.ts`
