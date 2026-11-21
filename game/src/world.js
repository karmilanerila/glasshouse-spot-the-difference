// The Glasshouse world: the rules and the state, no drawing and no input.
// One scene at a time, seven differences each. A find scores points and
// grows the combo; a miss costs a strike and breaks the combo; three strikes
// or an empty timer ends the scene, and the player retries it. Hints (three a
// scene) point at an unfound difference for a few seconds and cost points.
import {
  DIFFS_PER_SCENE,
  FIND_POINTS,
  COMBO_STEP,
  HINTS_PER_SCENE,
  HINT_COST,
  MAX_STRIKES,
  TIME_BONUS_PER_SECOND,
} from './config.js';
import { SCENES } from './scenes.js';

export const HINT_SECONDS = 4;

export function createWorld() {
  const state = {
    sceneIndex: 0,
    found: new Set(),
    strikes: 0,
    hintsLeft: HINTS_PER_SCENE,
    hint: null, // { diff, until } — the difference a hint is pointing at
    elapsed: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    finds: 0,
    misses: 0,
    totalTime: 0,
    status: 'title', // title | play | paused | sceneDone | win | timeUp
    flash: null, // { x, y, panel, until } — a red ring where a click missed
    lastFind: null, // { x, y, panel, at } — the gold ring just earned
    sceneBonus: 0,
    message: '',
  };

  function scene() {
    return SCENES[state.sceneIndex];
  }

  function remaining() {
    return Math.max(0, scene().par - state.elapsed);
  }

  function foundCount() {
    return state.found.size;
  }

  function resetScene(index) {
    state.sceneIndex = index;
    state.found = new Set();
    state.strikes = 0;
    state.hintsLeft = HINTS_PER_SCENE;
    state.hint = null;
    state.elapsed = 0;
    state.combo = 0;
    state.flash = null;
    state.lastFind = null;
    state.sceneBonus = 0;
    state.status = 'play';
    state.message = '';
  }

  function startGame() {
    state.score = 0;
    state.finds = 0;
    state.misses = 0;
    state.totalTime = 0;
    state.bestCombo = 0;
    resetScene(0);
  }

  /** Test a click at panel-local (x, y) on either panel. Returns 'found' | 'miss' | 'done'. */
  function clickAt(x, y, now) {
    if (state.status !== 'play') return 'done';
    for (const diff of scene().diffs) {
      if (state.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) {
        state.found.add(diff.id);
        state.finds += 1;
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        state.score += FIND_POINTS + (state.combo - 1) * COMBO_STEP;
        state.lastFind = { x: diff.x, y: diff.y, at: now };
        state.hint = null;
        if (state.found.size === DIFFS_PER_SCENE) {
          state.sceneBonus = Math.round(remaining()) * TIME_BONUS_PER_SECOND;
          state.score += state.sceneBonus;
          state.totalTime += state.elapsed;
          state.status = 'sceneDone';
        }
        return 'found';
      }
    }
    state.strikes += 1;
    state.misses += 1;
    state.combo = 0;
    state.flash = { x, y, until: now + 0.6 };
    if (state.strikes >= MAX_STRIKES) {
      state.totalTime += state.elapsed;
      state.status = 'timeUp';
      state.message = 'Three strikes — the scene resets. Press R to try again.';
    }
    return 'miss';
  }

  /** Spend a hint: point at a random unfound difference for a few seconds. */
  function useHint(now) {
    if (state.status !== 'play' || state.hintsLeft <= 0) return null;
    const open = scene().diffs.filter((d) => !state.found.has(d.id));
    if (open.length === 0) return null;
    const diff = open[Math.floor(Math.random() * open.length)];
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - HINT_COST);
    state.hint = { diff, until: now + HINT_SECONDS };
    return diff;
  }

  function nextScene() {
    if (state.sceneIndex + 1 >= SCENES.length) {
      state.status = 'win';
      return false;
    }
    resetScene(state.sceneIndex + 1);
    return true;
  }

  function tick(dt) {
    if (state.status !== 'play') return;
    state.elapsed += dt;
    if (state.elapsed >= scene().par) {
      state.elapsed = scene().par;
      state.totalTime += state.elapsed;
      state.status = 'timeUp';
      state.message = 'Time’s up — the scene resets. Press R to try again.';
    }
  }

  return {
    state,
    scene,
    remaining,
    foundCount,
    resetScene,
    startGame,
    clickAt,
    useHint,
    nextScene,
    tick,
  };
}
