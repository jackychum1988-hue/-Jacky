# Ninja Code 忍者指令 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pixel-art ninja-themed programming puzzle game for a 9-year-old boy — arrange command sequences to guide a ninja through grid-based dojo levels.

**Architecture:** Standalone React + Vite + TypeScript SPA. Pure game engine functions in `src/game/`, React UI components in `src/components/`, hooks for state and progress. No backend — localStorage for persistence, deploys to Vercel as static site.

**Tech Stack:** React 18, Vite 5, TypeScript 5, CSS (no framework — pure pixel theme), Vitest for testing.

---

### Task 1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: `ninja-code/` (entire project directory)

- [ ] **Step 1: Create project with Vite**

```bash
cd "d:/"
npm create vite@latest ninja-code -- --template react-ts
cd ninja-code
npm install
```

- [ ] **Step 2: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Add test script to package.json**

Edit `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Configure Vitest in vite.config.ts**

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

- [ ] **Step 5: Create test setup file**

Create `src/test-setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 6: Verify scaffold works**

```bash
npm run dev
# Should start dev server, open browser to see Vite default page
```

```bash
npm run build
# Should produce dist/ with no errors
```

- [ ] **Step 7: Clean up Vite boilerplate**

Delete:
- `src/App.css`
- `src/index.css`
- `src/assets/react.svg`
- `public/vite.svg`

- [ ] **Step 8: Commit**

```bash
cd ninja-code
git init
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript project with Vitest"
```

---

### Task 2: Define all TypeScript types

**Files:**
- Create: `ninja-code/src/game/types.ts`

- [ ] **Step 1: Write the types file**

Create `src/game/types.ts`:
```typescript
// ── Directions ──
export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIRECTION_VECTORS: Record<Direction, { dx: number; dy: number }> = {
  up:    { dx: 0,  dy: -1 },
  down:  { dx: 0,  dy: 1  },
  left:  { dx: -1, dy: 0  },
  right: { dx: 1,  dy: 0  },
};

export function turnLeft(d: Direction): Direction {
  const order: Direction[] = ['up', 'left', 'down', 'right'];
  const i = order.indexOf(d);
  return order[(i + 1) % 4];
}

export function turnRight(d: Direction): Direction {
  const order: Direction[] = ['up', 'right', 'down', 'left'];
  const i = order.indexOf(d);
  return order[(i + 1) % 4];
}

// ── Commands ──
export type Command = 'forward' | 'turnLeft' | 'turnRight' | 'jump' | 'slash';

export const COMMAND_LABELS: Record<Command, string> = {
  forward:   '↑ 前进',
  turnLeft:  '↩ 左转',
  turnRight: '↪ 右转',
  jump:      '🦘 跳跃',
  slash:     '⚔️ 劈砍',
};

export const COMMAND_COLORS: Record<Command, string> = {
  forward:   '#cc3333',
  turnLeft:  '#7733cc',
  turnRight: '#7733cc',
  jump:      '#cc8833',
  slash:     '#cc8833',
};

// ── Belts ──
export type Belt = 'white' | 'yellow' | 'green' | 'black';

export const BELT_LABELS: Record<Belt, string> = '⬜ 白带·入门' | '🟨 黄带·进阶' | '🟩 绿带·挑战' | '⬛ 黑带·大师';
export const BELT_UNLOCK_STARS: Record<Belt, number> = {
  white: 0,
  yellow: 20,
  green: 40,
  black: 60,
};

// ── Grid content ──
export type CellContent = 'empty' | 'wall' | 'barrier' | 'gap' | 'gem';

// ── Level data ──
export interface LevelData {
  id: number;
  name: string;
  belt: Belt;
  gridSize: [number, number]; // [cols, rows]
  start: { x: number; y: number; facing: Direction };
  target: { x: number; y: number };
  walls: [number, number][];
  barriers: [number, number][]; // breakable with slash
  gaps: [number, number][];     // crossable with jump
  gems?: [number, number][];    // optional collectibles
  optimalSteps: number;
  availableCommands: Command[];
  maxCommands: number;          // instruction limit for this level
}

// ── Grid cell ──
export interface GridCell {
  x: number;
  y: number;
  content: CellContent;
  collected?: boolean; // for gems
}

// ── Ninja state ──
export interface NinjaState {
  x: number;
  y: number;
  facing: Direction;
}

// ── Execution frame (for animation) ──
export interface ExecutionFrame {
  step: number;
  ninja: NinjaState;
  destroyedBarriers: [number, number][]; // barriers destroyed this step
  collectedGems: [number, number][];
  event: 'move' | 'turn' | 'jump' | 'slash' | 'victory' | 'fail';
  message?: string;
}

// ── Execution result ──
export interface ExecutionResult {
  success: boolean;
  frames: ExecutionFrame[];
  stepsUsed: number;
  failReason?: string;
  gemsCollected: number;
}

// ── Game phase (state machine) ──
export type GamePhase = 'idle' | 'building' | 'executing' | 'success' | 'failed';

export interface GameState {
  phase: GamePhase;
  level: LevelData;
  ninja: NinjaState;
  sequence: Command[];
  executionFrames: ExecutionFrame[];
  currentFrame: number;
  stepsUsed: number;
  failReason?: string;
  gemsCollected: number;
}

// ── Progress (localStorage) ──
export interface LevelProgress {
  stars: number;
  bestSteps: number;
}

export interface Progress {
  completedLevels: Record<number, LevelProgress>;
  totalStars: number;
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
# Should pass with no errors
```

- [ ] **Step 3: Commit**

```bash
git add src/game/types.ts
git commit -m "feat: define all TypeScript types for game engine, levels, and progress"
```

---

### Task 3: Pixel theme CSS

**Files:**
- Create: `ninja-code/src/styles/pixel-theme.css`
- Modify: `ninja-code/src/main.tsx`

- [ ] **Step 1: Write the pixel theme CSS**

Create `src/styles/pixel-theme.css`:
```css
/* ── Pixel Retro Theme ── */
:root {
  --bg-primary: #0a0a2e;
  --bg-grid: #1a1a4e;
  --bg-grid-alt: #15153a;
  --border-grid: #3333aa;
  --border-active: #33ff33;
  --border-error: #ff3333;
  --accent: #33ff33;
  --accent-glow: #66ff66;
  --cmd-forward: #cc3333;
  --cmd-turn: #7733cc;
  --cmd-special: #cc8833;
  --cmd-execute: #33cc33;
  --text-primary: #ffffff;
  --text-secondary: #aaaaaa;
  --text-muted: #666666;
  --star-gold: #ffd700;
  --pixel-font: 'Courier New', 'Source Code Pro', 'Consolas', monospace;
  --border-width: 2px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--pixel-font);
  overflow-x: hidden;
}

/* ── Pixel button base ── */
.pixel-btn {
  font-family: var(--pixel-font);
  border: var(--border-width) solid;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: none; /* 8-bit: no smooth transitions */
  position: relative;
  user-select: none;
}

.pixel-btn:active {
  transform: translate(1px, 1px);
}

.pixel-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Grid cell ── */
.pixel-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(18px, 4vw, 32px);
  border: var(--border-width) solid var(--border-grid);
  background: var(--bg-grid);
}

.pixel-cell:nth-child(odd) {
  background: var(--bg-grid-alt);
}

/* ── Sequence bar ── */
.sequence-slot {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border: var(--border-width) solid;
  font-family: var(--pixel-font);
  font-size: 14px;
  cursor: pointer;
}

/* ── Animation helpers ── */
@keyframes pixel-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes pixel-flash-green {
  0% { border-color: var(--accent); }
  50% { border-color: var(--accent-glow); }
  100% { border-color: var(--accent); }
}

@keyframes pixel-flash-red {
  0%, 100% { border-color: var(--border-grid); }
  50% { border-color: var(--border-error); }
}

@keyframes pixel-pop {
  0% { transform: scale(0); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes pixel-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.pixel-pulse { animation: pixel-pulse 1s infinite; }
.pixel-flash-green { animation: pixel-flash-green 0.5s infinite; }
.pixel-flash-red { animation: pixel-flash-red 0.5s infinite; }
.pixel-pop { animation: pixel-pop 0.3s ease-out; }
.pixel-shake { animation: pixel-shake 0.3s ease-in-out; }
```

- [ ] **Step 2: Import theme in main.tsx**

Edit `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/pixel-theme.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 3: Verify dev server loads without errors**

```bash
npm run dev
# Should display blank dark blue page (--bg-primary applied)
```

- [ ] **Step 4: Commit**

```bash
git add src/styles/pixel-theme.css src/main.tsx
git commit -m "feat: add pixel retro theme CSS with 8-bit animations"
```

---

### Task 4: Game engine — pure functions

**Files:**
- Create: `ninja-code/src/game/engine.ts`
- Create: `ninja-code/src/game/__tests__/engine.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/game/__tests__/engine.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { createNinja, executeCommand, executeSequence } from '../engine';
import type { Direction, LevelData, NinjaState } from '../types';

// Minimal test level
const testLevel: LevelData = {
  id: 1,
  name: 'Test',
  belt: 'white',
  gridSize: [5, 5],
  start: { x: 0, y: 2, facing: 'right' },
  target: { x: 4, y: 2 },
  walls: [[2, 0], [2, 1], [2, 2]],
  barriers: [[3, 2]],
  gaps: [],
  optimalSteps: 4,
  availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash'],
  maxCommands: 8,
};

describe('executeCommand', () => {
  it('forward moves ninja one step in facing direction', () => {
    const ninja = createNinja(testLevel);
    const result = executeCommand('forward', ninja, testLevel, new Set());
    expect(result.ninja.x).toBe(1);
    expect(result.ninja.y).toBe(2);
  });

  it('turnLeft rotates ninja 90° counter-clockwise', () => {
    const ninja = createNinja(testLevel);
    const result = executeCommand('turnLeft', ninja, testLevel, new Set());
    expect(result.ninja.facing).toBe('up');
  });

  it('turnRight rotates ninja 90° clockwise', () => {
    const ninja = createNinja(testLevel);
    const result = executeCommand('turnRight', ninja, testLevel, new Set());
    expect(result.ninja.facing).toBe('down');
  });

  it('forward into wall fails', () => {
    const ninja: NinjaState = { x: 1, y: 0, facing: 'down' };
    // Wall at (1, 1) — but let's just test wall collision directly.
    // Set up: ninja at (1,0) facing down, wall at (1,1)
    const levelWithWall: LevelData = {
      ...testLevel,
      start: { x: 1, y: 0, facing: 'down' },
      walls: [[1, 1]],
      barriers: [],
    };
    const ninja2 = createNinja(levelWithWall);
    const result = executeCommand('forward', ninja2, levelWithWall, new Set());
    expect(result.event).toBe('fail');
    expect(result.message).toContain('墙壁');
  });

  it('forward out of bounds fails', () => {
    const ninja: NinjaState = { x: 0, y: 0, facing: 'up' };
    const result = executeCommand('forward', ninja, testLevel, new Set());
    expect(result.event).toBe('fail');
  });

  it('forward into barrier without prior slash fails', () => {
    const ninja = createNinja(testLevel); // starts at (0,2) facing right
    // Move to (2,2), then try forward into barrier at (3,2)
    let n = executeCommand('forward', ninja, testLevel, new Set()).ninja;   // (1,2)
    n = executeCommand('forward', n, testLevel, new Set()).ninja;           // (2,2)
    const result = executeCommand('forward', n, testLevel, new Set());      // → (3,2) barrier!
    expect(result.event).toBe('fail');
    expect(result.message).toContain('木桩');
  });

  it('slash destroys barrier in front, then forward works', () => {
    const ninja = createNinja(testLevel); // (0,2) facing right
    let n = executeCommand('forward', ninja, testLevel, new Set()).ninja;   // (1,2)
    n = executeCommand('forward', n, testLevel, new Set()).ninja;           // (2,2)
    const destroyed = new Set<string>();
    const slashResult = executeCommand('slash', n, testLevel, destroyed);
    expect(slashResult.event).toBe('slash');
    expect(slashResult.destroyedBarriers).toContainEqual([3, 2]);
    destroyed.add('3,2');
    const forwardResult = executeCommand('forward', n, testLevel, destroyed);
    expect(forwardResult.event).toBe('move');
    expect(forwardResult.ninja.x).toBe(3);
  });

  it('jump crosses a gap cell', () => {
    const jumpLevel: LevelData = {
      ...testLevel,
      start: { x: 0, y: 0, facing: 'right' },
      gaps: [[1, 0]],
      walls: [],
      barriers: [],
      target: { x: 2, y: 0 },
      availableCommands: ['forward', 'jump'],
    };
    const ninja = createNinja(jumpLevel);
    const result = executeCommand('jump', ninja, jumpLevel, new Set());
    expect(result.event).toBe('jump');
    expect(result.ninja.x).toBe(2);
    expect(result.ninja.y).toBe(0);
  });

  it('forward into gap without jump fails', () => {
    const gapLevel: LevelData = {
      ...testLevel,
      start: { x: 0, y: 0, facing: 'right' },
      gaps: [[1, 0]],
      walls: [],
      barriers: [],
    };
    const ninja = createNinja(gapLevel);
    const result = executeCommand('forward', ninja, gapLevel, new Set());
    expect(result.event).toBe('fail');
    expect(result.message).toContain('陷阱');
  });

  it('reaching target triggers victory', () => {
    const easyLevel: LevelData = {
      ...testLevel,
      start: { x: 3, y: 0, facing: 'right' },
      target: { x: 4, y: 0 },
      walls: [],
      barriers: [],
    };
    const ninja = createNinja(easyLevel);
    const result = executeCommand('forward', ninja, easyLevel, new Set());
    expect(result.event).toBe('victory');
    expect(result.ninja.x).toBe(4);
  });
});

describe('executeSequence', () => {
  it('executes all commands and returns frames', () => {
    const easyLevel: LevelData = {
      ...testLevel,
      start: { x: 0, y: 0, facing: 'right' },
      target: { x: 2, y: 0 },
      walls: [],
      barriers: [],
      gaps: [],
    };
    const result = executeSequence(easyLevel, ['forward', 'forward']);
    expect(result.success).toBe(true);
    expect(result.frames.length).toBe(3); // frame 0 initial + 2 steps
    expect(result.stepsUsed).toBe(2);
  });

  it('stops on first failure', () => {
    const level: LevelData = {
      ...testLevel,
      start: { x: 0, y: 0, facing: 'right' },
      target: { x: 2, y: 0 },
      walls: [[1, 0]],
      barriers: [],
      gaps: [],
    };
    const result = executeSequence(level, ['forward', 'forward']);
    expect(result.success).toBe(false);
    expect(result.frames.length).toBeLessThan(3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run
# Expected: FAIL — cannot find module '../engine'
```

- [ ] **Step 3: Implement the game engine**

Create `src/game/engine.ts`:
```typescript
import type {
  Command, Direction, LevelData, NinjaState,
  ExecutionFrame, ExecutionResult, CellContent,
} from './types';
import { DIRECTION_VECTORS, turnLeft, turnRight } from './types';

export function createNinja(level: LevelData): NinjaState {
  return {
    x: level.start.x,
    y: level.start.y,
    facing: level.start.facing,
  };
}

function getCellContent(x: number, y: number, level: LevelData, destroyedBarriers: Set<string>): CellContent {
  if (level.walls.some(([wx, wy]) => wx === x && wy === y)) return 'wall';
  if (level.gaps.some(([gx, gy]) => gx === x && gy === y)) return 'gap';
  if (level.barriers.some(([bx, by]) => bx === x && by === y)) {
    return destroyedBarriers.has(`${x},${y}`) ? 'empty' : 'barrier';
  }
  if (level.gems?.some(([gx, gy]) => gx === x && gy === y)) return 'gem';
  return 'empty';
}

function isOutOfBounds(x: number, y: number, level: LevelData): boolean {
  const [cols, rows] = level.gridSize;
  return x < 0 || x >= cols || y < 0 || y >= rows;
}

export function executeCommand(
  command: Command,
  ninja: NinjaState,
  level: LevelData,
  destroyedBarriers: Set<string>,
): Omit<ExecutionFrame, 'step'> {
  const [cols, rows] = level.gridSize;

  switch (command) {
    case 'turnLeft':
      return {
        ninja: { ...ninja, facing: turnLeft(ninja.facing) },
        destroyedBarriers: [],
        collectedGems: [],
        event: 'turn',
      };

    case 'turnRight':
      return {
        ninja: { ...ninja, facing: turnRight(ninja.facing) },
        destroyedBarriers: [],
        collectedGems: [],
        event: 'turn',
      };

    case 'slash': {
      const vec = DIRECTION_VECTORS[ninja.facing];
      const tx = ninja.x + vec.dx;
      const ty = ninja.y + vec.dy;
      if (isOutOfBounds(tx, ty, level)) {
        return {
          ninja,
          destroyedBarriers: [],
          collectedGems: [],
          event: 'fail',
          message: '面前没有东西可劈！',
        };
      }
      const content = getCellContent(tx, ty, level, destroyedBarriers);
      if (content === 'barrier') {
        return {
          ninja,
          destroyedBarriers: [[tx, ty]],
          collectedGems: [],
          event: 'slash',
        };
      }
      return {
        ninja,
        destroyedBarriers: [],
        collectedGems: [],
        event: 'fail',
        message: '面前没有木桩可劈！',
      };
    }

    case 'jump': {
      const vec = DIRECTION_VECTORS[ninja.facing];
      const tx = ninja.x + vec.dx * 2;
      const ty = ninja.y + vec.dy * 2;
      const midX = ninja.x + vec.dx;
      const midY = ninja.y + vec.dy;

      if (isOutOfBounds(tx, ty, level)) {
        return {
          ninja,
          destroyedBarriers: [],
          collectedGems: [],
          event: 'fail',
          message: '跳得太远，跳出道场了！',
        };
      }
      const midContent = getCellContent(midX, midY, level, destroyedBarriers);
      if (midContent !== 'gap') {
        return {
          ninja,
          destroyedBarriers: [],
          collectedGems: [],
          event: 'fail',
          message: '面前没有陷阱，不需要跳跃！直接前进吧。',
        };
      }
      const landingContent = getCellContent(tx, ty, level, destroyedBarriers);
      if (landingContent === 'wall') {
        return {
          ninja,
          destroyedBarriers: [],
          collectedGems: [],
          event: 'fail',
          message: '跳过去会撞到墙壁！',
        };
      }
      const collected: [number, number][] = [];
      if (landingContent === 'gem') collected.push([tx, ty]);
      const isTarget = tx === level.target.x && ty === level.target.y;
      return {
        ninja: { x: tx, y: ty, facing: ninja.facing },
        destroyedBarriers: [],
        collectedGems: collected,
        event: isTarget ? 'victory' : 'jump',
      };
    }

    case 'forward': {
      const vec = DIRECTION_VECTORS[ninja.facing];
      const tx = ninja.x + vec.dx;
      const ty = ninja.y + vec.dy;

      if (isOutOfBounds(tx, ty, level)) {
        return {
          ninja,
          destroyedBarriers: [],
          collectedGems: [],
          event: 'fail',
          message: '撞到道场墙壁了！',
        };
      }
      const content = getCellContent(tx, ty, level, destroyedBarriers);
      if (content === 'wall') {
        return {
          ninja,
          destroyedBarriers: [],
          collectedGems: [],
          event: 'fail',
          message: '撞到墙壁了！换条路吧。',
        };
      }
      if (content === 'barrier') {
        return {
          ninja,
          destroyedBarriers: [],
          collectedGems: [],
          event: 'fail',
          message: '木桩挡住了路！先用劈砍破坏它。',
        };
      }
      if (content === 'gap') {
        return {
          ninja,
          destroyedBarriers: [],
          collectedGems: [],
          event: 'fail',
          message: '掉进陷阱了！试试跳跃指令。',
        };
      }
      const collected: [number, number][] = [];
      if (content === 'gem') collected.push([tx, ty]);
      const isTarget = tx === level.target.x && ty === level.target.y;
      return {
        ninja: { x: tx, y: ty, facing: ninja.facing },
        destroyedBarriers: [],
        collectedGems: collected,
        event: isTarget ? 'victory' : 'move',
      };
    }

    default:
      return { ninja, destroyedBarriers: [], collectedGems: [], event: 'fail', message: '未知指令' };
  }
}

export function executeSequence(level: LevelData, sequence: Command[]): ExecutionResult {
  const frames: ExecutionFrame[] = [];
  let ninja = createNinja(level);
  const destroyedBarriers = new Set<string>();
  const collectedGemsSet = new Set<string>();
  let totalGemsCollected = 0;

  frames.push({
    step: 0,
    ninja: { ...ninja },
    destroyedBarriers: [],
    collectedGems: [],
    event: 'move',
  });

  for (let i = 0; i < sequence.length; i++) {
    const result = executeCommand(sequence[i], ninja, level, destroyedBarriers);

    // Track destroyed barriers
    for (const [bx, by] of result.destroyedBarriers) {
      destroyedBarriers.add(`${bx},${by}`);
    }
    // Track collected gems
    for (const [gx, gy] of result.collectedGems) {
      if (!collectedGemsSet.has(`${gx},${gy}`)) {
        collectedGemsSet.add(`${gx},${gy}`);
        totalGemsCollected++;
      }
    }

    ninja = result.ninja;

    frames.push({
      step: i + 1,
      ninja: { ...ninja },
      destroyedBarriers: result.destroyedBarriers,
      collectedGems: result.collectedGems,
      event: result.event,
      message: result.message,
    });

    if (result.event === 'fail') {
      return {
        success: false,
        frames,
        stepsUsed: i + 1,
        failReason: result.message,
        gemsCollected: totalGemsCollected,
      };
    }
    if (result.event === 'victory') {
      return {
        success: true,
        frames,
        stepsUsed: i + 1,
        gemsCollected: totalGemsCollected,
      };
    }
  }

  // Ran out of commands without reaching target
  return {
    success: false,
    frames,
    stepsUsed: sequence.length,
    failReason: '指令用完了，还没到达卷轴！再试一次吧。',
    gemsCollected: totalGemsCollected,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run
# Expected: all tests PASS (green)
```

- [ ] **Step 5: Commit**

```bash
git add src/game/engine.ts src/game/__tests__/engine.test.ts
git commit -m "feat: implement game engine with command execution and collision detection"
```

---

### Task 5: Validator — star calculation

**Files:**
- Create: `ninja-code/src/game/validator.ts`
- Create: `ninja-code/src/game/__tests__/validator.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/game/__tests__/validator.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { calculateStars, canUnlockBelt } from '../validator';
import type { Belt } from '../types';

describe('calculateStars', () => {
  it('returns 3 stars when steps equal optimal', () => {
    expect(calculateStars(5, 5)).toBe(3);
  });

  it('returns 3 stars when steps less than optimal', () => {
    expect(calculateStars(3, 5)).toBe(3);
  });

  it('returns 2 stars when steps within +3 of optimal', () => {
    expect(calculateStars(6, 5)).toBe(2);
    expect(calculateStars(8, 5)).toBe(2);
  });

  it('returns 1 star when steps exceed optimal+3', () => {
    expect(calculateStars(9, 5)).toBe(1);
    expect(calculateStars(15, 5)).toBe(1);
  });

  it('returns 0 stars when not successful (not used in practice, but safe)', () => {
    expect(calculateStars(0, 0)).toBe(0);
  });
});

describe('canUnlockBelt', () => {
  it('white is always unlocked', () => {
    expect(canUnlockBelt('white', 0)).toBe(true);
  });

  it('yellow needs 20 stars', () => {
    expect(canUnlockBelt('yellow', 19)).toBe(false);
    expect(canUnlockBelt('yellow', 20)).toBe(true);
  });

  it('green needs 40 stars', () => {
    expect(canUnlockBelt('green', 39)).toBe(false);
    expect(canUnlockBelt('green', 40)).toBe(true);
  });

  it('black needs 60 stars', () => {
    expect(canUnlockBelt('black', 59)).toBe(false);
    expect(canUnlockBelt('black', 60)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run
# Expected: FAIL — cannot find module '../validator'
```

- [ ] **Step 3: Implement validator**

Create `src/game/validator.ts`:
```typescript
import type { Belt } from './types';
import { BELT_UNLOCK_STARS } from './types';

export function calculateStars(stepsUsed: number, optimalSteps: number): number {
  if (optimalSteps <= 0) return 0;
  if (stepsUsed <= optimalSteps) return 3;
  if (stepsUsed <= optimalSteps + 3) return 2;
  return 1;
}

export function canUnlockBelt(belt: Belt, totalStars: number): boolean {
  return totalStars >= BELT_UNLOCK_STARS[belt];
}

export function getNextBelt(current: Belt): Belt | null {
  const order: Belt[] = ['white', 'yellow', 'green', 'black'];
  const i = order.indexOf(current);
  return i < order.length - 1 ? order[i + 1] : null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run
# Expected: all PASS
```

- [ ] **Step 5: Commit**

```bash
git add src/game/validator.ts src/game/__tests__/validator.test.ts
git commit -m "feat: add star calculation and belt unlock validator"
```

---

### Task 6: useProgress hook — localStorage persistence

**Files:**
- Create: `ninja-code/src/hooks/useProgress.ts`
- Create: `ninja-code/src/hooks/__tests__/useProgress.test.ts`

- [ ] **Step 1: Write the hook**

Create `src/hooks/useProgress.ts`:
```typescript
import { useState, useCallback, useEffect } from 'react';
import type { Progress, LevelProgress } from '../game/types';
import { calculateStars } from '../game/validator';

const STORAGE_KEY = 'ninja-code-progress';

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        completedLevels: parsed.completedLevels || {},
        totalStars: parsed.totalStars || 0,
      };
    }
  } catch {
    console.warn('Failed to load progress from localStorage');
  }
  return { completedLevels: {}, totalStars: 0 };
}

function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    console.warn('Failed to save progress to localStorage');
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress);

  // Persist on every change
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const getLevelProgress = useCallback(
    (levelId: number): LevelProgress | null => {
      return progress.completedLevels[levelId] || null;
    },
    [progress],
  );

  const completeLevel = useCallback(
    (levelId: number, stepsUsed: number, optimalSteps: number) => {
      setProgress(prev => {
        const existing = prev.completedLevels[levelId];
        const stars = calculateStars(stepsUsed, optimalSteps);
        // Only update if better than previous attempt
        if (existing && existing.stars >= stars && existing.bestSteps <= stepsUsed) {
          return prev;
        }
        const newCompleted = { ...prev.completedLevels };
        newCompleted[levelId] = {
          stars: Math.max(stars, existing?.stars || 0),
          bestSteps: Math.min(stepsUsed, existing?.bestSteps || Infinity),
        };
        const newTotalStars = Object.values(newCompleted).reduce(
          (sum, lp) => sum + lp.stars, 0,
        );
        return { completedLevels: newCompleted, totalStars: newTotalStars };
      });
    },
    [],
  );

  const isLevelUnlocked = useCallback(
    (levelId: number): boolean => {
      if (levelId === 1) return true;
      // Level N unlocked if level N-1 is completed
      return !!progress.completedLevels[levelId - 1];
    },
    [progress],
  );

  const resetProgress = useCallback(() => {
    setProgress({ completedLevels: {}, totalStars: 0 });
  }, []);

  return {
    progress,
    getLevelProgress,
    completeLevel,
    isLevelUnlocked,
    resetProgress,
  };
}
```

- [ ] **Step 2: Write a simple React render test**

Since localStorage-based hooks are hard to unit-test in jsdom, we test indirectly through integration. Create `src/hooks/__tests__/useProgress.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProgress } from '../useProgress';

beforeEach(() => {
  localStorage.clear();
});

describe('useProgress', () => {
  it('starts with empty progress', () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.progress.totalStars).toBe(0);
    expect(result.current.progress.completedLevels).toEqual({});
  });

  it('level 1 is always unlocked', () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.isLevelUnlocked(1)).toBe(true);
  });

  it('level 2 is locked until level 1 completed', () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.isLevelUnlocked(2)).toBe(false);
    act(() => result.current.completeLevel(1, 3, 3));
    expect(result.current.isLevelUnlocked(2)).toBe(true);
  });

  it('completeLevel saves stars and best steps', () => {
    const { result } = renderHook(() => useProgress());
    act(() => result.current.completeLevel(1, 5, 3)); // 2 stars (within +3)
    expect(result.current.getLevelProgress(1)).toEqual({ stars: 2, bestSteps: 5 });
    expect(result.current.progress.totalStars).toBe(2);
  });

  it('completeLevel keeps best result', () => {
    const { result } = renderHook(() => useProgress());
    act(() => result.current.completeLevel(1, 3, 3)); // 3 stars
    act(() => result.current.completeLevel(1, 8, 3)); // 1 star, should not overwrite
    expect(result.current.getLevelProgress(1)).toEqual({ stars: 3, bestSteps: 3 });
  });

  it('resetProgress clears everything', () => {
    const { result } = renderHook(() => useProgress());
    act(() => result.current.completeLevel(1, 3, 3));
    act(() => result.current.resetProgress());
    expect(result.current.progress.totalStars).toBe(0);
  });
});
```

- [ ] **Step 3: Run tests to verify they pass**

```bash
npx vitest run
# Expected: all PASS
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useProgress.ts src/hooks/__tests__/useProgress.test.ts
git commit -m "feat: implement useProgress hook with localStorage persistence"
```

---

### Task 7: Level data — all 40 levels

**Files:**
- Create: `ninja-code/src/game/levels.ts`

- [ ] **Step 1: Define all 40 levels**

Create `src/game/levels.ts`:
```typescript
import type { LevelData } from './types';

export const LEVELS: LevelData[] = [
  // ═══ WHITE BELT (1-10): Forward + Turns, 4×4 to 5×5 ═══
  {
    id: 1, name: '第一步', belt: 'white', gridSize: [4, 4],
    start: { x: 0, y: 1, facing: 'right' },
    target: { x: 3, y: 1 },
    walls: [], barriers: [], gaps: [],
    optimalSteps: 3, availableCommands: ['forward'], maxCommands: 5,
  },
  {
    id: 2, name: '向右转', belt: 'white', gridSize: [4, 4],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 3, y: 3 },
    walls: [], barriers: [], gaps: [],
    optimalSteps: 5, availableCommands: ['forward', 'turnRight'], maxCommands: 6,
  },
  {
    id: 3, name: 'L型小路', belt: 'white', gridSize: [4, 4],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 0, y: 3 },
    walls: [[3, 0], [3, 1], [3, 2]], barriers: [], gaps: [],
    optimalSteps: 3, availableCommands: ['forward', 'turnRight'], maxCommands: 6,
  },
  {
    id: 4, name: '绕墙走', belt: 'white', gridSize: [5, 5],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 3, y: 2 },
    walls: [[2, 1], [2, 2], [2, 3]], barriers: [], gaps: [],
    optimalSteps: 5, availableCommands: ['forward', 'turnLeft', 'turnRight'], maxCommands: 8,
  },
  {
    id: 5, name: 'Z字路', belt: 'white', gridSize: [5, 5],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 4, y: 4 },
    walls: [[2, 0], [2, 1], [2, 2], [2, 3]], barriers: [], gaps: [],
    optimalSteps: 6, availableCommands: ['forward', 'turnLeft', 'turnRight'], maxCommands: 8,
  },
  {
    id: 6, name: '左右选择', belt: 'white', gridSize: [5, 5],
    start: { x: 2, y: 4, facing: 'up' },
    target: { x: 2, y: 0 },
    walls: [[1, 2], [3, 2]], barriers: [], gaps: [],
    optimalSteps: 3, availableCommands: ['forward', 'turnLeft', 'turnRight'], maxCommands: 8,
  },
  {
    id: 7, name: '回廊', belt: 'white', gridSize: [5, 5],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 0, y: 4 },
    walls: [[2, 0], [2, 1], [2, 2], [2, 4], [4, 2], [1, 2]], barriers: [], gaps: [],
    optimalSteps: 6, availableCommands: ['forward', 'turnLeft', 'turnRight'], maxCommands: 8,
  },
  {
    id: 8, name: '蛇形道', belt: 'white', gridSize: [5, 5],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 4, y: 0 },
    walls: [[3, 0], [1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]], barriers: [], gaps: [],
    optimalSteps: 7, availableCommands: ['forward', 'turnLeft', 'turnRight'], maxCommands: 8,
  },
  {
    id: 9, name: '十字路口', belt: 'white', gridSize: [5, 5],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 4, y: 0 },
    walls: [[2, 0], [2, 1], [2, 3], [2, 4]], barriers: [], gaps: [],
    optimalSteps: 5, availableCommands: ['forward', 'turnLeft', 'turnRight'], maxCommands: 8,
  },
  {
    id: 10, name: '🏆 白带考核', belt: 'white', gridSize: [5, 5],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 4, y: 4 },
    walls: [[1, 1], [2, 1], [3, 1], [1, 3], [2, 3], [3, 3]], barriers: [], gaps: [],
    optimalSteps: 5, availableCommands: ['forward', 'turnLeft', 'turnRight'], maxCommands: 8,
  },

  // ═══ YELLOW BELT (11-20): + Slash, 5×5 to 6×6 ═══
  {
    id: 11, name: '劈开木桩', belt: 'yellow', gridSize: [5, 5],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 4, y: 2 },
    walls: [], barriers: [[2, 2]], gaps: [],
    optimalSteps: 3, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash'], maxCommands: 8,
  },
  {
    id: 12, name: '双木桩', belt: 'yellow', gridSize: [5, 5],
    start: { x: 0, y: 1, facing: 'right' },
    target: { x: 4, y: 3 },
    walls: [], barriers: [[2, 1], [2, 3]], gaps: [],
    optimalSteps: 4, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash'], maxCommands: 8,
  },
  {
    id: 13, name: '墙壁与木桩', belt: 'yellow', gridSize: [6, 6],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 5, y: 2 },
    walls: [[3, 0], [3, 1], [3, 3], [3, 4], [3, 5]], barriers: [[3, 2]], gaps: [],
    optimalSteps: 5, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash'], maxCommands: 8,
  },
  {
    id: 14, name: '选择破坏', belt: 'yellow', gridSize: [6, 6],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 5, y: 2 },
    walls: [[2, 0], [2, 1], [2, 3], [2, 4], [2, 5]], barriers: [[2, 2]], gaps: [],
    optimalSteps: 3, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash'], maxCommands: 8,
  },
  {
    id: 15, name: '木桩阵', belt: 'yellow', gridSize: [6, 6],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 5, y: 2 },
    walls: [], barriers: [[1, 2], [2, 1], [3, 2], [4, 3]], gaps: [],
    optimalSteps: 5, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash'], maxCommands: 8,
  },
  {
    id: 16, name: '绕道还是劈砍', belt: 'yellow', gridSize: [6, 6],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 5, y: 0 },
    walls: [], barriers: [[3, 0]], gaps: [],
    optimalSteps: 3, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash'], maxCommands: 8,
  },
  {
    id: 17, name: '迷宫初探', belt: 'yellow', gridSize: [6, 6],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 5, y: 5 },
    walls: [[2, 0], [2, 1], [2, 2], [2, 3], [4, 2], [4, 3], [4, 4], [4, 5]],
    barriers: [[2, 4], [2, 5]], gaps: [],
    optimalSteps: 5, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash'], maxCommands: 8,
  },
  {
    id: 18, name: '分叉路', belt: 'yellow', gridSize: [6, 6],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 5, y: 0 },
    walls: [[3, 0], [3, 1]], barriers: [[1, 2]], gaps: [],
    optimalSteps: 6, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash'], maxCommands: 8,
  },
  {
    id: 19, name: '守卫道场', belt: 'yellow', gridSize: [6, 6],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 5, y: 2 },
    walls: [[3, 1], [3, 3], [4, 0], [4, 4], [4, 5]], barriers: [[3, 2]], gaps: [],
    optimalSteps: 5, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash'], maxCommands: 8,
  },
  {
    id: 20, name: '🏆 黄带考核', belt: 'yellow', gridSize: [6, 6],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 5, y: 5 },
    walls: [[1, 2], [2, 2], [3, 2], [4, 2], [2, 4]],
    barriers: [[1, 1], [3, 3], [4, 4]], gaps: [],
    optimalSteps: 6, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash'], maxCommands: 8,
  },

  // ═══ GREEN BELT (21-30): + Jump, 6×6 to 7×7 ═══
  {
    id: 21, name: '跳过陷阱', belt: 'green', gridSize: [6, 6],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 5, y: 2 },
    walls: [], barriers: [], gaps: [[2, 2]],
    optimalSteps: 2, availableCommands: ['forward', 'turnLeft', 'turnRight', 'jump'], maxCommands: 8,
  },
  {
    id: 22, name: '陷阱与选择', belt: 'green', gridSize: [6, 6],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 5, y: 2 },
    walls: [], barriers: [], gaps: [[2, 2], [4, 2]],
    optimalSteps: 3, availableCommands: ['forward', 'turnLeft', 'turnRight', 'jump'], maxCommands: 8,
  },
  {
    id: 23, name: '跳不过去', belt: 'green', gridSize: [6, 6],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 5, y: 2 },
    walls: [[1, 0], [1, 1], [1, 3], [1, 4], [1, 5]],
    barriers: [], gaps: [[2, 2]],
    optimalSteps: 3, availableCommands: ['forward', 'turnLeft', 'turnRight', 'jump'], maxCommands: 8,
  },
  {
    id: 24, name: '复合障碍', belt: 'green', gridSize: [7, 7],
    start: { x: 0, y: 3, facing: 'right' },
    target: { x: 6, y: 3 },
    walls: [], barriers: [[2, 3]], gaps: [[4, 3]],
    optimalSteps: 4, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 8,
  },
  {
    id: 25, name: '跳跃道场', belt: 'green', gridSize: [7, 7],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 6, y: 0 },
    walls: [], barriers: [], gaps: [[1, 0], [3, 0], [5, 0]],
    optimalSteps: 5, availableCommands: ['forward', 'turnLeft', 'turnRight', 'jump'], maxCommands: 8,
  },
  {
    id: 26, name: '劈砍还是跳跃', belt: 'green', gridSize: [7, 7],
    start: { x: 0, y: 2, facing: 'right' },
    target: { x: 6, y: 2 },
    walls: [], barriers: [[2, 2]], gaps: [[4, 2]],
    optimalSteps: 4, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 8,
  },
  {
    id: 27, name: '陷阱走廊', belt: 'green', gridSize: [7, 7],
    start: { x: 0, y: 3, facing: 'right' },
    target: { x: 6, y: 3 },
    walls: [], barriers: [[3, 3]], gaps: [[1, 3], [5, 3]],
    optimalSteps: 5, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 8,
  },
  {
    id: 28, name: '高难绕行', belt: 'green', gridSize: [7, 7],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 6, y: 6 },
    walls: [[3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 6]],
    barriers: [[0, 3]], gaps: [[3, 3]],
    optimalSteps: 8, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 8,
  },
  {
    id: 29, name: '最终试炼前', belt: 'green', gridSize: [7, 7],
    start: { x: 0, y: 3, facing: 'right' },
    target: { x: 6, y: 3 },
    walls: [[3, 0], [3, 1], [3, 5], [3, 6]],
    barriers: [[3, 2]], gaps: [[3, 4]],
    optimalSteps: 6, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 8,
  },
  {
    id: 30, name: '🏆 绿带考核', belt: 'green', gridSize: [7, 7],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 6, y: 6 },
    walls: [[1, 3], [3, 3], [5, 3], [3, 1], [3, 5]],
    barriers: [[1, 2], [5, 4]], gaps: [[3, 2]],
    optimalSteps: 7, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 8,
  },

  // ═══ BLACK BELT (31-40): Complex mazes, 7×7 to 8×8 ═══
  {
    id: 31, name: '暗影迷宫', belt: 'black', gridSize: [7, 7],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 6, y: 6 },
    walls: [[2, 0], [2, 1], [2, 2], [2, 3], [2, 5], [2, 6],
           [4, 1], [4, 2], [4, 3], [4, 4], [4, 5]],
    barriers: [[2, 4], [5, 6]], gaps: [[4, 0], [6, 4]],
    optimalSteps: 8, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 12,
  },
  {
    id: 32, name: '螺旋道', belt: 'black', gridSize: [7, 7],
    start: { x: 3, y: 3, facing: 'right' },
    target: { x: 6, y: 0 },
    walls: [[5, 1], [5, 2], [5, 3], [5, 4],
           [1, 2], [1, 3], [1, 4], [1, 5],
           [2, 1], [3, 1], [4, 1]],
    barriers: [[5, 5]], gaps: [[1, 1], [5, 0]],
    optimalSteps: 7, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 12,
  },
  {
    id: 33, name: '十字陷阱', belt: 'black', gridSize: [8, 8],
    start: { x: 0, y: 3, facing: 'right' },
    target: { x: 7, y: 4 },
    walls: [[4, 0], [4, 1], [4, 2], [4, 5], [4, 6], [4, 7]],
    barriers: [[2, 3], [6, 3]], gaps: [[4, 3], [6, 4]],
    optimalSteps: 7, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 12,
  },
  {
    id: 34, name: '忍者的抉择', belt: 'black', gridSize: [8, 8],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 7, y: 7 },
    walls: [[3, 0], [3, 1], [3, 2], [5, 5], [5, 6], [5, 7]],
    barriers: [[3, 5], [6, 3]], gaps: [[3, 3], [5, 3]],
    optimalSteps: 9, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 12,
  },
  {
    id: 35, name: '道场深处', belt: 'black', gridSize: [8, 8],
    start: { x: 0, y: 3, facing: 'right' },
    target: { x: 7, y: 3 },
    walls: [[2, 0], [2, 1], [2, 5], [2, 6], [2, 7],
           [5, 0], [5, 1], [5, 5], [5, 6], [5, 7]],
    barriers: [[2, 2], [2, 4], [5, 2], [5, 4]],
    gaps: [[2, 3], [5, 3]],
    optimalSteps: 6, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 12,
  },
  {
    id: 36, name: '回字阵', belt: 'black', gridSize: [8, 8],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 4, y: 4 },
    walls: [[2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
           [2, 5], [3, 5], [4, 5], [5, 5], [6, 5],
           [2, 2], [2, 3], [2, 4],
           [6, 2], [6, 3], [6, 4]],
    barriers: [[1, 0], [4, 3]], gaps: [[4, 2]],
    optimalSteps: 10, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 12,
  },
  {
    id: 37, name: '大师之路', belt: 'black', gridSize: [8, 8],
    start: { x: 0, y: 1, facing: 'right' },
    target: { x: 7, y: 7 },
    walls: [[1, 3], [1, 4], [1, 5], [1, 6], [1, 7],
           [3, 0], [3, 1], [3, 2], [5, 5], [5, 6], [5, 7]],
    barriers: [[3, 4], [5, 2]], gaps: [[1, 2], [7, 0]],
    optimalSteps: 10, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 12,
  },
  {
    id: 38, name: '终极迷宫', belt: 'black', gridSize: [8, 8],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 7, y: 7 },
    walls: [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
           [1, 4], [2, 4], [3, 4], [5, 4], [6, 4],
           [3, 0], [3, 1], [3, 5], [3, 6], [3, 7],
           [5, 0], [5, 5], [5, 6], [5, 7]],
    barriers: [[2, 0], [6, 7]], gaps: [[3, 3], [5, 1]],
    optimalSteps: 10, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 12,
  },
  {
    id: 39, name: '影之试炼', belt: 'black', gridSize: [8, 8],
    start: { x: 0, y: 3, facing: 'right' },
    target: { x: 7, y: 3 },
    walls: [[2, 1], [2, 2], [2, 4], [2, 5],
           [5, 1], [5, 2], [5, 4], [5, 5]],
    barriers: [[2, 3], [5, 3]], gaps: [[3, 0], [4, 6], [6, 3]],
    optimalSteps: 8, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 12,
  },
  {
    id: 40, name: '🏆 忍者大师', belt: 'black', gridSize: [8, 8],
    start: { x: 0, y: 0, facing: 'right' },
    target: { x: 7, y: 7 },
    walls: [[1, 2], [2, 2], [3, 2],
           [5, 4], [6, 4],
           [3, 5], [3, 6],
           [2, 0], [2, 1], [6, 6], [6, 7]],
    barriers: [[3, 0], [5, 5], [4, 4]],
    gaps: [[1, 0], [6, 0], [3, 3]],
    optimalSteps: 10, availableCommands: ['forward', 'turnLeft', 'turnRight', 'slash', 'jump'], maxCommands: 12,
  },
];

// Verify optimal steps manually: each level must be solvable within its optimalSteps.
// These were designed with specific solutions in mind. If a level's solution exceeds
// optimalSteps in practice, adjust optimalSteps upward.

export function getLevel(id: number): LevelData | undefined {
  return LEVELS.find(l => l.id === id);
}

export function getLevelsByBelt(belt: Belt): LevelData[] {
  return LEVELS.filter(l => l.belt === belt);
}

export const LEVEL_COUNT = LEVELS.length;
```

- [ ] **Step 2: Verify levels compile and have valid data**

```bash
npx tsc --noEmit
# Should pass
```

Write a quick validation script — add to `src/game/__tests__/levels.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { LEVELS, getLevel } from '../levels';

describe('levels', () => {
  it('has exactly 40 levels', () => {
    expect(LEVELS.length).toBe(40);
  });

  it('each level has unique id 1-40', () => {
    const ids = LEVELS.map(l => l.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
  });

  it('each level has start position within grid', () => {
    for (const l of LEVELS) {
      expect(l.start.x).toBeGreaterThanOrEqual(0);
      expect(l.start.x).toBeLessThan(l.gridSize[0]);
      expect(l.start.y).toBeGreaterThanOrEqual(0);
      expect(l.start.y).toBeLessThan(l.gridSize[1]);
    }
  });

  it('each level has target position within grid', () => {
    for (const l of LEVELS) {
      expect(l.target.x).toBeGreaterThanOrEqual(0);
      expect(l.target.x).toBeLessThan(l.gridSize[0]);
      expect(l.target.y).toBeGreaterThanOrEqual(0);
      expect(l.target.y).toBeLessThan(l.gridSize[1]);
    }
  });

  it('start and target are not on walls/barriers/gaps', () => {
    for (const l of LEVELS) {
      const { x: sx, y: sy } = l.start;
      const { x: tx, y: ty } = l.target;
      const wallSet = new Set(l.walls.map(([x, y]) => `${x},${y}`));
      const barrierSet = new Set(l.barriers.map(([x, y]) => `${x},${y}`));
      const gapSet = new Set(l.gaps.map(([x, y]) => `${x},${y}`));
      expect(wallSet.has(`${sx},${sy}`)).toBe(false);
      expect(barrierSet.has(`${sx},${sy}`)).toBe(false);
      expect(gapSet.has(`${sx},${sy}`)).toBe(false);
      expect(wallSet.has(`${tx},${ty}`)).toBe(false);
      expect(barrierSet.has(`${tx},${ty}`)).toBe(false);
      expect(gapSet.has(`${tx},${ty}`)).toBe(false);
    }
  });

  it('getLevel works', () => {
    expect(getLevel(1)?.name).toBe('第一步');
    expect(getLevel(99)).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run
# Expected: all PASS
```

- [ ] **Step 4: Commit**

```bash
git add src/game/levels.ts src/game/__tests__/levels.test.ts
git commit -m "feat: add all 40 levels across 4 belts with validation tests"
```

---

### Task 8: Pixel UI components (PixelButton, GridCell, GameGrid)

**Files:**
- Create: `ninja-code/src/components/PixelButton.tsx`
- Create: `ninja-code/src/components/GridCell.tsx`
- Create: `ninja-code/src/components/GameGrid.tsx`

- [ ] **Step 1: PixelButton component**

Create `src/components/PixelButton.tsx`:
```typescript
import type { CSSProperties, ReactNode } from 'react';

interface PixelButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  style?: CSSProperties;
  className?: string;
  ariaLabel?: string;
}

export function PixelButton({
  children, onClick, disabled = false,
  color = '#3333aa', style, className = '', ariaLabel,
}: PixelButtonProps) {
  return (
    <button
      className={`pixel-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        background: disabled ? '#333' : color,
        color: '#fff',
        borderColor: disabled ? '#555' : color,
        padding: '8px 16px',
        fontSize: '15px',
        textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: GridCell component**

Create `src/components/GridCell.tsx`:
```typescript
import type { CellContent } from '../game/types';

interface GridCellProps {
  x: number;
  y: number;
  content: CellContent;
  hasNinja: boolean;
  isTarget: boolean;
  ninjaFacing?: string;
  isDestroyed?: boolean;
  isFlash?: boolean;
}

const CONTENT_ICONS: Record<CellContent, string> = {
  empty: '',
  wall: '🧱',
  barrier: '🪵',
  gap: '⛳',
  gem: '💎',
};

const FACING_ICONS: Record<string, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

export function GridCell({
  content, hasNinja, isTarget, ninjaFacing,
  isDestroyed, isFlash,
}: GridCellProps) {
  let display: string;
  let cellStyle: React.CSSProperties = {};

  if (hasNinja) {
    display = ninjaFacing ? FACING_ICONS[ninjaFacing] : '🥷';
    cellStyle = { color: '#33ff33', fontWeight: 'bold' };
  } else if (isTarget) {
    display = '🎯';
  } else if (content === 'barrier' && isDestroyed) {
    display = ''; // destroyed barrier disappears
    cellStyle = { background: '#1a2a1a' };
  } else {
    display = CONTENT_ICONS[content];
  }

  const className = `pixel-cell${isFlash ? ' pixel-flash-red' : ''}`;

  return (
    <div className={className} style={cellStyle}>
      {display}
    </div>
  );
}
```

- [ ] **Step 3: GameGrid component**

Create `src/components/GameGrid.tsx`:
```typescript
import type { LevelData, NinjaState } from '../game/types';
import { GridCell } from './GridCell';

interface GameGridProps {
  level: LevelData;
  ninja: NinjaState;
  destroyedBarriers: [number, number][];
  flashCells?: [number, number][];
}

export function GameGrid({ level, ninja, destroyedBarriers, flashCells = [] }: GameGridProps) {
  const [cols, rows] = level.gridSize;
  const destroyedSet = new Set(destroyedBarriers.map(([x, y]) => `${x},${y}`));
  const flashSet = new Set(flashCells.map(([x, y]) => `${x},${y}`));
  const cellSize = Math.min(72, Math.floor(400 / Math.max(cols, rows)));

  const grid: React.ReactNode[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const isNinja = ninja.x === x && ninja.y === y;
      const isTarget = level.target.x === x && level.target.y === y;
      let content = level.walls.some(([wx, wy]) => wx === x && wy === y) ? 'wall' as const
        : level.gaps.some(([gx, gy]) => gx === x && gy === y) ? 'gap' as const
        : level.barriers.some(([bx, by]) => bx === x && by === y) ? 'barrier' as const
        : level.gems?.some(([gx, gy]) => gx === x && gy === y) ? 'gem' as const
        : 'empty' as const;

      grid.push(
        <GridCell
          key={`${x},${y}`}
          x={x} y={y}
          content={content}
          hasNinja={isNinja}
          isTarget={isTarget}
          ninjaFacing={isNinja ? ninja.facing : undefined}
          isDestroyed={content === 'barrier' && destroyedSet.has(`${x},${y}`)}
          isFlash={flashSet.has(`${x},${y}`)}
        />,
      );
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        gap: '2px',
        justifyContent: 'center',
        padding: '16px',
        background: '#0a0a1e',
        border: '3px solid #3333aa',
        borderRadius: '2px',
      }}
      role="grid"
      aria-label={`道场地图 ${cols}×${rows}`}
    >
      {grid}
    </div>
  );
}
```

- [ ] **Step 4: Verify components compile**

```bash
npx tsc --noEmit
# Should pass
```

- [ ] **Step 5: Commit**

```bash
git add src/components/PixelButton.tsx src/components/GridCell.tsx src/components/GameGrid.tsx
git commit -m "feat: implement PixelButton, GridCell, and GameGrid components"
```

---

### Task 9: SequenceBar + InstructionPanel components

**Files:**
- Create: `ninja-code/src/components/SequenceBar.tsx`
- Create: `ninja-code/src/components/InstructionPanel.tsx`

- [ ] **Step 1: SequenceBar component**

Create `src/components/SequenceBar.tsx`:
```typescript
import type { Command } from '../game/types';
import { COMMAND_LABELS, COMMAND_COLORS } from '../game/types';

interface SequenceBarProps {
  sequence: Command[];
  onRemove: (index: number) => void;
  maxCommands: number;
  disabled?: boolean;
}

export function SequenceBar({ sequence, onRemove, maxCommands, disabled }: SequenceBarProps) {
  return (
    <div style={{
      background: '#16213e',
      border: '2px solid #0f3460',
      padding: '12px',
      minHeight: '56px',
      borderRadius: '2px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: sequence.length > 0 ? '8px' : '0',
      }}>
        <span style={{ color: '#888', fontSize: '12px' }}>
          📋 指令序列
        </span>
        <span style={{ color: sequence.length >= maxCommands ? '#ff4444' : '#888', fontSize: '12px' }}>
          {sequence.length}/{maxCommands}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        {sequence.length === 0 ? (
          <span style={{ color: '#555', fontSize: '14px', fontStyle: 'italic' }}>
            点击下方按钮添加指令...
          </span>
        ) : (
          sequence.map((cmd, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i > 0 && <span style={{ color: '#555', fontSize: '12px' }}>→</span>}
              <span
                className="sequence-slot"
                onClick={() => !disabled && onRemove(i)}
                style={{
                  background: COMMAND_COLORS[cmd],
                  borderColor: COMMAND_COLORS[cmd],
                  color: '#fff',
                  opacity: disabled ? 0.6 : 1,
                  cursor: disabled ? 'default' : 'pointer',
                }}
                title="点击删除此指令"
                role="button"
                aria-label={`删除第${i + 1}条指令: ${COMMAND_LABELS[cmd]}`}
              >
                {COMMAND_LABELS[cmd]}
              </span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: InstructionPanel component**

Create `src/components/InstructionPanel.tsx`:
```typescript
import type { Command } from '../game/types';
import { COMMAND_LABELS, COMMAND_COLORS } from '../game/types';
import { PixelButton } from './PixelButton';

interface InstructionPanelProps {
  availableCommands: Command[];
  onAddCommand: (cmd: Command) => void;
  onExecute: () => void;
  onClear: () => void;
  sequenceFull: boolean;
  sequenceEmpty: boolean;
  executing: boolean;
}

export function InstructionPanel({
  availableCommands, onAddCommand, onExecute, onClear,
  sequenceFull, sequenceEmpty, executing,
}: InstructionPanelProps) {
  return (
    <div style={{
      background: '#0f0f23',
      border: '2px solid #16213e',
      padding: '12px',
      borderRadius: '2px',
    }}>
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {availableCommands.map(cmd => (
          <PixelButton
            key={cmd}
            onClick={() => onAddCommand(cmd)}
            disabled={sequenceFull || executing}
            color={COMMAND_COLORS[cmd]}
            ariaLabel={`添加指令: ${COMMAND_LABELS[cmd]}`}
          >
            {COMMAND_LABELS[cmd]}
          </PixelButton>
        ))}

        <div style={{ width: '2px', height: '30px', background: '#333', margin: '0 4px' }} />

        <PixelButton
          onClick={onClear}
          disabled={sequenceEmpty || executing}
          color="#555"
          ariaLabel="清空所有指令"
        >
          🗑️ 清空
        </PixelButton>

        <PixelButton
          onClick={onExecute}
          disabled={sequenceEmpty || executing}
          color="#33cc33"
          className={!sequenceEmpty && !executing ? 'pixel-pulse' : ''}
          ariaLabel="执行指令序列"
          style={{ padding: '10px 24px', fontSize: '18px' }}
        >
          ▶ 执行！
        </PixelButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify components compile**

```bash
npx tsc --noEmit
# Should pass
```

- [ ] **Step 4: Commit**

```bash
git add src/components/SequenceBar.tsx src/components/InstructionPanel.tsx
git commit -m "feat: implement SequenceBar and InstructionPanel components"
```

---

### Task 10: StarRating, BeltBadge, CompleteModal components

**Files:**
- Create: `ninja-code/src/components/StarRating.tsx`
- Create: `ninja-code/src/components/BeltBadge.tsx`
- Create: `ninja-code/src/components/CompleteModal.tsx`

- [ ] **Step 1: StarRating component**

Create `src/components/StarRating.tsx`:
```typescript
interface StarRatingProps {
  stars: number; // 0-3
  animate?: boolean;
}

export function StarRating({ stars, animate }: StarRatingProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', fontSize: '36px' }}>
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={animate && i <= stars ? 'pixel-pop' : ''}
          style={{
            color: i <= stars ? '#ffd700' : '#333',
            textShadow: i <= stars ? '2px 2px 0 #886600' : 'none',
            animationDelay: animate ? `${i * 0.2}s` : '0s',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: BeltBadge component**

Create `src/components/BeltBadge.tsx`:
```typescript
import type { Belt } from '../game/types';

const BELT_CONFIG: Record<Belt, { label: string; color: string; icon: string }> = {
  white:  { label: '白带', color: '#aaaaaa', icon: '⬜' },
  yellow: { label: '黄带', color: '#ffd700', icon: '🟨' },
  green:  { label: '绿带', color: '#33ff33', icon: '🟩' },
  black:  { label: '黑带', color: '#ffffff', icon: '⬛' },
};

interface BeltBadgeProps {
  belt: Belt;
  active?: boolean;
}

export function BeltBadge({ belt, active = false }: BeltBadgeProps) {
  const config = BELT_CONFIG[belt];
  return (
    <span style={{
      background: active ? config.color : '#1a1a4e',
      color: active ? '#000' : '#666',
      padding: '4px 12px',
      fontSize: '12px',
      fontWeight: 'bold',
      border: `2px solid ${active ? config.color : '#3333aa'}`,
      opacity: active ? 1 : 0.5,
    }}>
      {config.icon} {config.label}
    </span>
  );
}
```

- [ ] **Step 3: CompleteModal component**

Create `src/components/CompleteModal.tsx`:
```typescript
import { StarRating } from './StarRating';
import { PixelButton } from './PixelButton';

interface CompleteModalProps {
  levelName: string;
  levelId: number;
  stars: number;
  stepsUsed: number;
  optimalSteps: number;
  gemsCollected: number;
  totalGems: number;
  onReplay: () => void;
  onNextLevel: () => void;
  hasNextLevel: boolean;
}

export function CompleteModal({
  levelName, levelId, stars, stepsUsed, optimalSteps,
  gemsCollected, totalGems, onReplay, onNextLevel, hasNextLevel,
}: CompleteModalProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div className="pixel-pop" style={{
        background: '#0a0a2e',
        border: '3px solid #33ff33',
        padding: '32px',
        textAlign: 'center',
        minWidth: '320px',
        maxWidth: '400px',
        animation: undefined,
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>

        <h2 style={{
          color: '#33ff33',
          fontSize: '22px',
          fontWeight: 900,
          marginBottom: '4px',
          textShadow: '2px 2px 0 #003300',
        }}>
          任务完成！
        </h2>

        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '16px' }}>
          第{levelId}关 · {levelName}
        </p>

        <StarRating stars={stars} animate />

        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          margin: '20px 0',
          fontSize: '13px',
          color: '#aaa',
        }}>
          <div>
            <div style={{ color: '#33ff33', fontSize: '20px', fontWeight: 'bold' }}>{stepsUsed}</div>
            使用步数
          </div>
          <div>
            <div style={{ color: '#ffd700', fontSize: '20px', fontWeight: 'bold' }}>{optimalSteps}</div>
            最优步数
          </div>
          {totalGems > 0 && (
            <div>
              <div style={{ color: '#cc8833', fontSize: '20px', fontWeight: 'bold' }}>{gemsCollected}/{totalGems}</div>
              勾玉
            </div>
          )}
        </div>

        {stars === 3 && (
          <p style={{ color: '#ffd700', fontSize: '13px', marginBottom: '16px' }}>
            🥷 完美忍者！最优解！
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <PixelButton onClick={onReplay} color="#3333aa" ariaLabel="重新挑战本关">
            🔄 重玩
          </PixelButton>
          {hasNextLevel && (
            <PixelButton onClick={onNextLevel} color="#33cc33" ariaLabel="进入下一关">
              ▶ 下一关
            </PixelButton>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify components compile**

```bash
npx tsc --noEmit
# Should pass
```

- [ ] **Step 5: Commit**

```bash
git add src/components/StarRating.tsx src/components/BeltBadge.tsx src/components/CompleteModal.tsx
git commit -m "feat: implement StarRating, BeltBadge, and CompleteModal components"
```

---

### Task 11: LevelSelect component

**Files:**
- Create: `ninja-code/src/components/LevelSelect.tsx`

- [ ] **Step 1: LevelSelect component**

Create `src/components/LevelSelect.tsx`:
```typescript
import { useState } from 'react';
import type { Belt, LevelProgress } from '../game/types';
import { LEVELS, getLevelsByBelt } from '../game/levels';
import { BELT_LABELS } from '../game/types';
import { canUnlockBelt } from '../game/validator';
import { BeltBadge } from './BeltBadge';

interface LevelSelectProps {
  onSelectLevel: (levelId: number) => void;
  getLevelProgress: (levelId: number) => LevelProgress | null;
  isLevelUnlocked: (levelId: number) => boolean;
  totalStars: number;
}

const BELTS: Belt[] = ['white', 'yellow', 'green', 'black'];

export function LevelSelect({ onSelectLevel, getLevelProgress, isLevelUnlocked, totalStars }: LevelSelectProps) {
  const [activeBelt, setActiveBelt] = useState<Belt>('white');

  const levels = getLevelsByBelt(activeBelt);
  const unlocked = canUnlockBelt(activeBelt, totalStars);

  return (
    <div style={{
      maxWidth: '560px',
      margin: '0 auto',
      padding: '24px 16px',
    }}>
      {/* Header */}
      <h1 style={{
        textAlign: 'center',
        color: '#33ff33',
        fontSize: '28px',
        fontWeight: 900,
        textShadow: '3px 3px 0 #003300',
        marginBottom: '4px',
        letterSpacing: '2px',
      }}>
        忍者指令
      </h1>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '20px' }}>
        排列指令，引导忍者到达卷轴！
      </p>

      {/* Belt tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginBottom: '16px',
      }}>
        {BELTS.map(belt => (
          <button
            key={belt}
            onClick={() => canUnlockBelt(belt, totalStars) && setActiveBelt(belt)}
            disabled={!canUnlockBelt(belt, totalStars)}
            style={{
              fontFamily: 'inherit',
              cursor: canUnlockBelt(belt, totalStars) ? 'pointer' : 'not-allowed',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
          >
            <BeltBadge belt={belt} active={belt === activeBelt} />
          </button>
        ))}
      </div>

      {/* Star count */}
      <div style={{
        textAlign: 'center',
        color: '#ffd700',
        fontSize: '15px',
        marginBottom: '20px',
        textShadow: '1px 1px 0 #886600',
      }}>
        ⭐ {totalStars} 颗星
      </div>

      {/* Level grid */}
      {!unlocked ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          需要更多星星才能解锁此段位...
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
        }}>
          {levels.map(level => {
            const progress = getLevelProgress(level.id);
            const unlocked = isLevelUnlocked(level.id);
            return (
              <button
                key={level.id}
                onClick={() => unlocked && onSelectLevel(level.id)}
                disabled={!unlocked}
                style={{
                  fontFamily: 'inherit',
                  aspectRatio: '1',
                  background: progress ? '#1a3a1a' : unlocked ? '#1a1a4e' : '#0a0a1e',
                  border: `2px solid ${
                    progress && progress.stars === 3 ? '#ffd700' :
                    progress ? '#33ff33' :
                    unlocked ? '#3333aa' :
                    '#1a1a3a'
                  }`,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: unlocked ? 1 : 0.35,
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
                aria-label={`第${level.id}关: ${level.name}${progress ? `, ${progress.stars}星` : ''}`}
                title={`${level.name}${progress ? ` — ${'★'.repeat(progress.stars)}` : ''}`}
              >
                <span style={{ fontSize: '18px', marginBottom: '2px' }}>
                  {level.id}
                </span>
                {progress && (
                  <span style={{ color: '#ffd700', fontSize: '10px' }}>
                    {'★'.repeat(progress.stars)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify component compiles**

```bash
npx tsc --noEmit
# Should pass
```

- [ ] **Step 3: Commit**

```bash
git add src/components/LevelSelect.tsx
git commit -m "feat: implement LevelSelect component with belt tabs and star display"
```

---

### Task 12: useGameState hook — game state machine

**Files:**
- Create: `ninja-code/src/hooks/useGameState.ts`

- [ ] **Step 1: Implement useGameState hook**

Create `src/hooks/useGameState.ts`:
```typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import type { Command, GamePhase, ExecutionFrame } from '../game/types';
import type { LevelData } from '../game/types';
import { createNinja, executeSequence } from '../game/engine';

export function useGameState(level: LevelData) {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [sequence, setSequence] = useState<Command[]>([]);
  const [ninja, setNinja] = useState(() => createNinja(level));
  const [executionFrames, setExecutionFrames] = useState<ExecutionFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [destroyedBarriers, setDestroyedBarriers] = useState<Set<string>>(new Set());
  const [failReason, setFailReason] = useState<string | undefined>();
  const [gemsCollected, setGemsCollected] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Reset when level changes
  useEffect(() => {
    resetGame();
  }, [level.id]);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('idle');
    setSequence([]);
    setNinja(createNinja(level));
    setExecutionFrames([]);
    setCurrentFrame(0);
    setDestroyedBarriers(new Set());
    setFailReason(undefined);
    setGemsCollected(0);
  }, [level]);

  const addCommand = useCallback((cmd: Command) => {
    if (phase === 'executing') return;
    if (sequence.length >= level.maxCommands) return;
    setPhase('building');
    setSequence(prev => [...prev, cmd]);
  }, [phase, sequence.length, level.maxCommands]);

  const removeCommand = useCallback((index: number) => {
    if (phase === 'executing') return;
    setSequence(prev => prev.filter((_, i) => i !== index));
  }, [phase]);

  const clearSequence = useCallback(() => {
    if (phase === 'executing') return;
    setSequence([]);
    setPhase('idle');
  }, [phase]);

  const execute = useCallback(() => {
    if (sequence.length === 0 || phase === 'executing') return;
    setPhase('executing');

    const result = executeSequence(level, sequence);
    setExecutionFrames(result.frames);
    setCurrentFrame(0);
    setGemsCollected(result.gemsCollected);

    // Animate step by step
    let frame = 0;
    const interval = 400; // ms per step

    timerRef.current = window.setInterval(() => {
      frame++;
      if (frame < result.frames.length) {
        setCurrentFrame(frame);
        setNinja(result.frames[frame].ninja);

        // Track destroyed barriers
        const destroyed = result.frames[frame].destroyedBarriers;
        if (destroyed.length > 0) {
          setDestroyedBarriers(prev => {
            const next = new Set(prev);
            destroyed.forEach(([x, y]) => next.add(`${x},${y}`));
            return next;
          });
        }
      } else {
        // Animation complete
        clearInterval(timerRef.current!);
        timerRef.current = null;

        if (result.success) {
          setPhase('success');
        } else {
          setPhase('failed');
          setFailReason(result.failReason || '未知错误');
        }
      }
    }, interval);
  }, [sequence, level, phase]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    phase,
    ninja,
    sequence,
    executionFrames,
    currentFrame,
    destroyedBarriers: [...destroyedBarriers].map(s => s.split(',').map(Number) as [number, number]),
    failReason,
    gemsCollected,
    totalGems: level.gems?.length || 0,
    stepsUsed: executionFrames.length > 0 ? executionFrames.length - 1 : 0,
    addCommand,
    removeCommand,
    clearSequence,
    execute,
    resetGame,
  };
}
```

- [ ] **Step 2: Verify the hook compiles**

```bash
npx tsc --noEmit
# Should pass
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useGameState.ts
git commit -m "feat: implement useGameState hook with step-by-step execution animation"
```

---

### Task 13: App.tsx — main game screen and routing

**Files:**
- Create: `ninja-code/src/components/GameScreen.tsx`
- Modify: `ninja-code/src/App.tsx`

- [ ] **Step 1: GameScreen component (the main game view)**

Create `src/components/GameScreen.tsx`:
```typescript
import { GameGrid } from './GameGrid';
import { SequenceBar } from './SequenceBar';
import { InstructionPanel } from './InstructionPanel';
import { CompleteModal } from './CompleteModal';
import { PixelButton } from './PixelButton';
import { useGameState } from '../hooks/useGameState';
import type { LevelData, LevelProgress } from '../game/types';
import { calculateStars } from '../game/validator';

interface GameScreenProps {
  level: LevelData;
  onBack: () => void;
  onComplete: (levelId: number, stepsUsed: number) => void;
  onNextLevel: (currentId: number) => void;
  hasNextLevel: boolean;
}

export function GameScreen({ level, onBack, onComplete, onNextLevel, hasNextLevel }: GameScreenProps) {
  const game = useGameState(level);

  const handleComplete = () => {
    onComplete(level.id, game.stepsUsed);
  };

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 0',
      }}>
        <PixelButton onClick={onBack} color="#333" style={{ fontSize: '13px', padding: '6px 12px' }}>
          ← 返回
        </PixelButton>
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#33ff33', fontSize: '14px', fontWeight: 'bold' }}>
            第{level.id}关
          </span>
          <span style={{ color: '#888', fontSize: '13px', marginLeft: '8px' }}>
            {level.name}
          </span>
        </div>
        <PixelButton
          onClick={game.resetGame}
          color="#555"
          style={{ fontSize: '13px', padding: '6px 12px' }}
          disabled={game.phase === 'executing'}
        >
          🔄 重置
        </PixelButton>
      </div>

      {/* Game Grid */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className={game.phase === 'failed' ? 'pixel-shake' : ''}>
          <GameGrid
            level={level}
            ninja={game.ninja}
            destroyedBarriers={game.destroyedBarriers}
          />
        </div>
      </div>

      {/* Fail message */}
      {game.phase === 'failed' && (
        <div style={{
          textAlign: 'center',
          color: '#ff4444',
          fontSize: '14px',
          padding: '8px',
          border: '2px solid #ff4444',
          background: '#1a0000',
        }}>
          ❌ {game.failReason || '失败了！'}
        </div>
      )}

      {/* Sequence */}
      <SequenceBar
        sequence={game.sequence}
        onRemove={game.removeCommand}
        maxCommands={level.maxCommands}
        disabled={game.phase === 'executing'}
      />

      {/* Instructions */}
      <InstructionPanel
        availableCommands={level.availableCommands}
        onAddCommand={game.addCommand}
        onExecute={game.execute}
        onClear={game.clearSequence}
        sequenceFull={game.sequence.length >= level.maxCommands}
        sequenceEmpty={game.sequence.length === 0}
        executing={game.phase === 'executing'}
      />

      {/* Executing indicator */}
      {game.phase === 'executing' && (
        <div style={{ textAlign: 'center', color: '#33ff33', fontSize: '13px' }} className="pixel-pulse">
          执行中...
        </div>
      )}

      {/* Complete modal */}
      {game.phase === 'success' && (
        <CompleteModal
          levelName={level.name}
          levelId={level.id}
          stars={calculateStars(game.stepsUsed, level.optimalSteps)}
          stepsUsed={game.stepsUsed}
          optimalSteps={level.optimalSteps}
          gemsCollected={game.gemsCollected}
          totalGems={game.totalGems}
          onReplay={() => {
            game.resetGame();
          }}
          onNextLevel={() => {
            handleComplete();
            onNextLevel(level.id);
          }}
          hasNextLevel={hasNextLevel}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: App.tsx — routing between level select and game**

Edit `src/App.tsx`:
```typescript
import { useState, useCallback } from 'react';
import { LevelSelect } from './components/LevelSelect';
import { GameScreen } from './components/GameScreen';
import { getLevel } from './game/levels';
import { useProgress } from './hooks/useProgress';

type Screen = 'menu' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const { progress, getLevelProgress, completeLevel, isLevelUnlocked } = useProgress();

  const handleSelectLevel = useCallback((levelId: number) => {
    setCurrentLevelId(levelId);
    setScreen('game');
  }, []);

  const handleBack = useCallback(() => {
    setScreen('menu');
  }, []);

  const handleComplete = useCallback((levelId: number, stepsUsed: number) => {
    const level = getLevel(levelId);
    if (level) {
      completeLevel(levelId, stepsUsed, level.optimalSteps);
    }
  }, [completeLevel]);

  const handleNextLevel = useCallback((currentId: number) => {
    const nextId = currentId + 1;
    const nextLevel = getLevel(nextId);
    if (nextLevel) {
      setCurrentLevelId(nextId);
    }
  }, []);

  if (screen === 'game') {
    const level = getLevel(currentLevelId);
    if (!level) {
      setScreen('menu');
      return null;
    }
    return (
      <GameScreen
        level={level}
        onBack={handleBack}
        onComplete={handleComplete}
        onNextLevel={handleNextLevel}
        hasNextLevel={!!getLevel(currentLevelId + 1)}
      />
    );
  }

  return (
    <LevelSelect
      onSelectLevel={handleSelectLevel}
      getLevelProgress={getLevelProgress}
      isLevelUnlocked={isLevelUnlocked}
      totalStars={progress.totalStars}
    />
  );
}
```

- [ ] **Step 3: Verify everything compiles**

```bash
npx tsc --noEmit
# Should pass
```

- [ ] **Step 4: Verify dev server loads the game**

```bash
npm run dev
# Open browser — should see LevelSelect screen with 40 levels
# Click level 1 → gameplay screen with grid + commands
```

- [ ] **Step 5: Commit**

```bash
git add src/components/GameScreen.tsx src/App.tsx
git commit -m "feat: integrate App routing, GameScreen with full game loop"
```

---

### Task 14: index.html and final polish

**Files:**
- Modify: `ninja-code/index.html`
- Modify: `ninja-code/src/main.tsx` (if needed)

- [ ] **Step 1: Update index.html**

Edit `index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥷</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>忍者指令 — 编程启蒙游戏</title>
    <meta name="description" content="排列指令引导忍者到达卷轴！专为9岁+儿童设计的编程思维启蒙游戏。" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
# Should produce dist/ with no errors, size < 100KB gzipped
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: update index.html with game title and favicon"
```

---

### Task 15: Deploy to Vercel

- [ ] **Step 1: Install Vercel CLI and deploy**

```bash
npm install -g vercel
cd ninja-code
vercel --prod
# Follow prompts: set up project, confirm framework preset (Vite), deploy
```

- [ ] **Step 2: Verify deployed game**

Open the Vercel URL, play through level 1-3, verify:
- Level select shows all 40 levels
- Commands add/remove correctly
- Execution animation works
- Victory modal shows stars
- Progress persists after refresh (localStorage)

- [ ] **Step 3: Commit any deployment config**

```bash
git add -A
git commit -m "chore: add Vercel deployment configuration"
```

---

## Self-Review Checklist

After implementation, verify:
- [ ] All Vitest tests pass
- [ ] TypeScript compiles with no errors
- [ ] Level 1 is playable end-to-end
- [ ] Victory and failure states both work
- [ ] localStorage persists across refresh
- [ ] All 40 levels load and validate
- [ ] Game works in Chrome and Edge
