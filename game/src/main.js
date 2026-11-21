// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between title, play, paused, scene-complete, win and time-up screens.
//
// ?shot=cover|scene2|scene3|win (with &seed=N) stages that scene instead of
// running the loop, paints it twice and sets window.__shotReady for a
// screenshot.
import { BEST_KEY, MUTE_KEY } from './config.js';
import { createWorld } from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_PAUSE,
  ACTION_HINT,
  ACTION_NEXT,
  ACTION_RETRY,
  ACTION_MUTE,
  ACTION_TAB,
  createInput,
} from './input.js';
import { createAudio } from './audio.js';
import {
  createRenderer,
  SCREEN_TITLE,
  SCREEN_PLAY,
  SCREEN_PAUSED,
  SCREEN_SCENE_DONE,
  SCREEN_WIN,
  SCREEN_TIME_UP,
} from './render.js';
import { stageShot } from './shots.js';

const STEP = 1 / 60;
/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world, scene.screen, scene.best, null, world.state.elapsed);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let muted = audio.muted;

  const input = createInput(canvas, (x, y) => {
    if (screen !== SCREEN_PLAY) {
      if (screen === SCREEN_TITLE || screen === SCREEN_WIN) startGame();
      else if (screen === SCREEN_SCENE_DONE) advance();
      else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
      return;
    }
    audio.unlock();
    const result = world.clickAt(x, y, performance.now() / 1000);
    if (result === 'found') {
      audio.find();
      announce(`Found! ${7 - world.state.found.size} to find.`);
      if (world.state.status === 'sceneDone') {
        screen = SCREEN_SCENE_DONE;
        audio.sceneDone();
      }
    } else if (result === 'miss') {
      audio.miss();
      announce(world.state.status === 'timeUp' ? world.state.message : 'Not a difference. Strike!');
      if (world.state.status === 'timeUp') screen = SCREEN_TIME_UP;
    }
  });

  // Screen readers (and anyone watching the page's text) hear the changes.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    audio.unlock();
    world.startGame();
    screen = SCREEN_PLAY;
    announce('Playing. Find 7 differences in the Palm House.');
  }

  function advance() {
    if (world.state.status === 'win') {
      startGame();
      return;
    }
    if (!world.nextScene()) {
      screen = SCREEN_WIN;
      audio.win();
      if (world.state.score > best) {
        best = world.state.score;
        saveBest(best);
      }
      announce(`You found all 21 differences! Final score ${world.state.score}.`);
      return;
    }
    screen = SCREEN_PLAY;
    announce(`Playing. Find 7 differences in ${world.scene().name}.`);
  }

  function handleActions(dt) {
    input.moveCursor(dt);
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (actions & ACTION_TAB) {
      input.cursor.panel = input.cursor.panel === 0 ? 1 : 0;
      input.cursor.x = (input.cursor.panel === 0 ? 24 : 660) + 298;
      input.cursor.visible = true;
    }
    if (actions & ACTION_CONFIRM) {
      audio.unlock();
      if (screen === SCREEN_TITLE || screen === SCREEN_WIN) startGame();
      else if (screen === SCREEN_SCENE_DONE) advance();
      else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
      else if (screen === SCREEN_TIME_UP) world.resetScene(world.state.sceneIndex);
      else if (screen === SCREEN_PLAY) {
        const hit = input.cursorHit();
        const result = world.clickAt(hit.x, hit.y, performance.now() / 1000);
        if (result === 'found') {
          audio.find();
          if (world.state.status === 'sceneDone') {
            screen = SCREEN_SCENE_DONE;
            audio.sceneDone();
          }
        } else if (result === 'miss') {
          audio.miss();
          if (world.state.status === 'timeUp') screen = SCREEN_TIME_UP;
        }
      }
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      const diff = world.useHint(performance.now() / 1000);
      if (diff) {
        audio.hint();
        announce(`Hint: look near ${diff.label}.`);
      }
    }
    if (actions & ACTION_NEXT && screen === SCREEN_SCENE_DONE) advance();
    if (actions & ACTION_RETRY && screen === SCREEN_TIME_UP) {
      world.resetScene(world.state.sceneIndex);
      screen = SCREEN_PLAY;
      announce('Trying the scene again.');
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions(dt);
    if (screen === SCREEN_PLAY) {
      accumulator += dt;
      while (accumulator >= STEP) {
        world.tick(STEP);
        accumulator -= STEP;
        if (world.state.status === 'timeUp') {
          screen = SCREEN_TIME_UP;
          break;
        }
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world, screen, best, input.cursor, world.state.elapsed);
  }

  // Leaving the tab pauses a running game rather than letting time run out unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  void MUTE_KEY;
  announce('The Glasshouse. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
