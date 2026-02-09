# Beats App

Lightweight, browser-based beat maker built with Next.js + Web Audio API.

## Lookup Table

| Path                      | What It Is                                           |
| ------------------------- | ---------------------------------------------------- |
| `app/`                    | Next.js App Router pages, layout, and global styles. |
| `app/page.tsx`            | Main UI: transport, presets, and drum grid.          |
| `app/layout.tsx`          | Root layout and metadata.                            |
| `app/globals.css`         | Global styles and Tailwind base.                     |
| `components/`             | Reusable UI components.                              |
| `components/DrumGrid.tsx` | Grid UI for steps and track labels.                  |
| `lib/beat/`               | Beat engine logic and presets.                       |
| `lib/beat/audio.ts`       | Web Audio hook and drum synthesis.                   |
| `lib/beat/constants.ts`   | Track list, defaults, and key bindings.              |
| `lib/beat/presets.ts`     | Preset patterns and empty grid factory.              |
| `types/`                  | Shared TypeScript types.                             |
| `types/index.ts`          | Track, grid, and preset types.                       |
| `public/`                 | Static assets.                                       |
| `SPEC.md`                 | Product spec and feature roadmap.                    |
| `LOG.md`                  | Running log of features and key decisions.           |
| `package.json`            | Scripts and dependencies.                            |
| `next.config.ts`          | Next.js configuration.                               |
| `components.json`         | shadcn/ui config (if used).                          |
| `pnpm-lock.yaml`          | Lockfile for dependencies.                           |
| `tsconfig.json`           | TypeScript config.                                   |
