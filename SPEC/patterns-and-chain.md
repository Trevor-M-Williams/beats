# Patterns and Song Chain Spec

## Terminology
- **Pattern**: A 16-step loop (1 bar at 1/16 resolution) containing all track steps.
- **Chain**: An ordered list of patterns that plays back as a song.

## Goals
- Let users create multiple patterns.
- Let users arrange patterns into a chain.
- Keep the current grid workflow fast and simple.

## UI/UX
### Pattern Picker
- Shows current pattern name and index (e.g. “Pattern 1”).
- Actions: `+ New`, `Duplicate`, `Rename`, `Delete`.

### Chain Row
- Horizontal list of pattern tiles (P1, P2, …).
- Drag to reorder.
- Click to jump playback to a pattern.
- Toggle to enable/disable chain playback (optional in MVP).

### Grid
- Always edits the currently selected pattern.
- Visual indicator for the active pattern.

## Playback Rules
- If chain is disabled or empty: loop the active pattern.
- If chain is enabled: play patterns in chain order.
- On step wrap (step 16 → 1), advance to the next pattern in the chain.
- Loop the chain by default.

## Data Model
### Pattern
- `id`: string
- `name`: string
- `grid`: boolean[][] (tracks x 16)
- `lengthSteps`: number (default 16)

### Project
- `patterns`: Pattern[]
- `activePatternId`: string
- `chain`: string[] (pattern IDs)
- `chainEnabled`: boolean

## Keyboard Shortcuts
- `[` / `]`: previous/next pattern
- `Cmd/Ctrl + D`: duplicate current pattern

## Persistence
- Save patterns + chain in localStorage.
- Migration: if a saved project has only one grid, create a single pattern.

## Implementation Notes
- Extend the audio scheduler with a `patternIndex` pointer.
- On step wrap, update the active pattern if chain playback is enabled.
- Ensure UI reads grid from `activePatternId`.
