---
name: kloopik-game-dev
description: Build and add HTML5 canvas games to the kloopik portal at /Users/egalvans/Downloads/Head/Claude/portal
trigger: When user asks to add, build, or create a game for kloopik
---

# Kloopik Game Dev Skill

## Overview

The kloopik portal lives at `/Users/egalvans/Downloads/Head/Claude/portal`. Games are standalone HTML5 canvas files in `games/` and are catalogued in `src/_data/games.json`.

## Workflow

1. Read an existing game in `games/` to internalize conventions
2. Read `games/_game-template.html` as the starting point
3. Read `src/_data/games.json` to understand the catalog schema
4. Build the game file at `games/<slug>/game.html`
5. Add the catalog entry to `src/_data/games.json`

## Design Conventions

- Background: `#0a0a0f` (near-black, not pure `#000`)
- Accent color: `#5c5cff` (bright indigo)
- HUD rendered to canvas only — no DOM elements for score/lives/UI
- Canvas dimensions: 480×640 (portrait) or 480×360 (landscape), depending on genre
- Font in canvas: `'Courier New', monospace`

## GameSDK

Every game includes a `GameSDK` IIFE (copy verbatim from `_game-template.html`). It provides:

- `GameSDK.save(data)` — debounced postMessage to the parent shell for cloud saves
- `onSaveLoaded(data)` — implement this function in your game to restore state on load

After game over or level complete, use `setTimeout(startGame, 2000)` to restart with a brief pause — no ad interruptions.

## games.json Entry Schema

```json
{
  "slug": "game-name",
  "title": "Game Name",
  "category": "arcade|puzzle|strategy|simulation",
  "description": "One sentence. Punchy, present-tense.",
  "emoji": "🎮",
  "controls": "Arrow keys / Mouse / etc.",
  "new": true,
  "featured": false,
  "howToPlay": "<p>HTML string. 2-3 paragraphs of actual instructions.</p>",
  "about": "<p>HTML string. History and context of the game genre.</p>"
}
```

## Scope Rules

- Canvas HUD only — no DOM overlays for score, timer, lives
- No extra difficulty modes unless explicitly requested
- `visibilitychange` auto-save pattern always included
- Minimal scope: build what was asked, nothing more
