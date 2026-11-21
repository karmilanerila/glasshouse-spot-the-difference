// Drawing only: the world's state and the current screen in, pixels out.
// The 1280x800 playfield scales to fit the window. The header carries the
// scene, the timer, the remaining counter, strikes, hints and pause; the two
// panels sit side by side with gold rings on every difference found; the
// footer tracks the found dots, the score and the combo. Title, pause,
// scene-complete and win screens are panels over the same field.
import {
  FIELD,
  PANEL,
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  HEADER_HEIGHT,
  FOOTER_TOP,
  PALETTE,
  FONT,
  DIFFS_PER_SCENE,
  MAX_STRIKES,
} from './config.js';
import { SCENES, drawScene } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_SCENE_DONE = 'sceneDone';
export const SCREEN_WIN = 'win';
export const SCREEN_TIME_UP = 'timeUp';

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align, weight) {
    const key = `${weight || ''}${size}`;
    if (!fonts.has(key)) fonts.set(key, `${weight ? `${weight} ` : ''}${size}px ${FONT}`);
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  function drawHeader(world, now) {
    const state = world.state;
    const scene = world.scene();
    context.fillStyle = PALETTE.header;
    context.fillRect(0, 0, FIELD.width, HEADER_HEIGHT);
    context.fillStyle = PALETTE.gold;
    context.fillRect(0, HEADER_HEIGHT - 4, FIELD.width, 4);
    text('The Glasshouse', 24, 38, 30, PALETTE.headerText, 'left', 'bold');
    text(`${scene.name}  ·  Scene ${state.sceneIndex + 1} of ${SCENES.length}`, 24, 68, 17, PALETTE.muted, 'left');
    const remaining = DIFFS_PER_SCENE - state.found.size;
    // Remaining counter — the pill the eye lands on.
    context.fillStyle = remaining === 0 ? PALETTE.green : PALETTE.gold;
    context.beginPath();
    context.roundRect(560, 18, 150, 44, 22);
    context.fill();
    text(remaining === 0 ? 'All found!' : `${remaining} to find`, 635, 48, 22, '#20301f', 'center', 'bold');
    // Timer.
    const left = world.remaining();
    text(`Time ${formatTime(left)}`, 740, 48, 24, left <= 30 ? '#ff8a70' : PALETTE.headerText, 'left', 'bold');
    // Strikes.
    text('Strikes', 872, 34, 14, PALETTE.muted, 'left');
    for (let i = 0; i < MAX_STRIKES; i += 1) {
      context.fillStyle = i < state.strikes ? PALETTE.red : 'rgba(255,255,255,0.22)';
      context.beginPath();
      context.arc(888 + i * 26, 52, 9, 0, Math.PI * 2);
      context.fill();
    }
    // Hint and pause pills.
    context.fillStyle = 'rgba(255,255,255,0.14)';
    context.beginPath();
    context.roundRect(970, 18, 108, 44, 22);
    context.fill();
    text(`Hint (${state.hintsLeft})`, 1024, 48, 18, PALETTE.headerText, 'center', 'bold');
    context.fillStyle = 'rgba(255,255,255,0.14)';
    context.beginPath();
    context.roundRect(1090, 18, 92, 44, 22);
    context.fill();
    text('Pause', 1136, 48, 18, PALETTE.headerText, 'center', 'bold');
    void now;
  }

  /** Gold ring + green centre on a found difference, in panel coordinates. */
  function drawMarker(x, y, r, panelX) {
    context.strokeStyle = PALETTE.gold;
    context.lineWidth = 5;
    context.beginPath();
    context.arc(panelX + x, PANEL.top + y, r + 6, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = 'rgba(255,255,255,0.85)';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(panelX + x, PANEL.top + y, r + 11, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = PALETTE.green;
    context.beginPath();
    context.arc(panelX + x, PANEL.top + y, 7, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#ffffff';
    context.lineWidth = 2.5;
    context.beginPath();
    context.moveTo(panelX + x - 3.5, PANEL.top + y);
    context.lineTo(panelX + x - 1, PANEL.top + y + 3);
    context.lineTo(panelX + x + 4, PANEL.top + y - 3.5);
    context.stroke();
  }

  function drawPanels(world, now) {
    const state = world.state;
    const scene = world.scene();
    for (const [panel, px] of [[0, PANEL_LEFT_X], [1, PANEL_RIGHT_X]]) {
      context.fillStyle = PALETTE.panelFrame;
      context.fillRect(px - 5, PANEL.top - 5, PANEL.width + 10, PANEL.height + 10);
      drawScene(context, scene, panel, px, PANEL.top);
      // Panel tags.
      context.fillStyle = PALETTE.panelLabel;
      context.beginPath();
      context.roundRect(px + 10, PANEL.top + 10, 34, 30, 8);
      context.fill();
      text(panel === 0 ? 'A' : 'B', px + 27, PANEL.top + 33, 20, '#ffffff', 'center', 'bold');
      // Markers for differences found so far.
      for (const diff of scene.diffs) {
        if (state.found.has(diff.id)) drawMarker(diff.x, diff.y, diff.r, px);
      }
    }
    // Hint pulse on both panels.
    if (state.hint && now < state.hint.until) {
      const pulse = 1 + 0.18 * Math.sin(now * 6);
      for (const px of [PANEL_LEFT_X, PANEL_RIGHT_X]) {
        context.strokeStyle = PALETTE.goldSoft;
        context.setLineDash([10, 8]);
        context.lineWidth = 4;
        context.beginPath();
        context.arc(px + state.hint.diff.x, PANEL.top + state.hint.diff.y, (state.hint.diff.r + 10) * pulse, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);
      }
    }
    // Miss flash.
    if (state.flash && now < state.flash.until) {
      const alpha = (state.flash.until - now) / 0.6;
      context.strokeStyle = `rgba(228, 87, 46, ${alpha})`;
      context.lineWidth = 4;
      context.beginPath();
      context.arc(state.flash.x + PANEL_LEFT_X, state.flash.y + PANEL.top, 22, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(state.flash.x + PANEL_LEFT_X - 10, state.flash.y + PANEL.top - 10);
      context.lineTo(state.flash.x + PANEL_LEFT_X + 10, state.flash.y + PANEL.top + 10);
      context.moveTo(state.flash.x + PANEL_LEFT_X + 10, state.flash.y + PANEL.top - 10);
      context.lineTo(state.flash.x + PANEL_LEFT_X - 10, state.flash.y + PANEL.top + 10);
      context.stroke();
    }
  }

  function drawFooter(world, cursor) {
    const state = world.state;
    const scene = world.scene();
    context.fillStyle = PALETTE.footer;
    context.fillRect(0, FOOTER_TOP, FIELD.width, FIELD.height - FOOTER_TOP);
    context.fillStyle = PALETTE.gold;
    context.fillRect(0, FOOTER_TOP, FIELD.width, 4);
    text('Found', 24, FOOTER_TOP + 42, 17, PALETTE.muted, 'left', 'bold');
    for (let i = 0; i < DIFFS_PER_SCENE; i += 1) {
      const cx = 96 + i * 34;
      context.fillStyle = i < state.found.size ? PALETTE.gold : 'rgba(255,255,255,0.22)';
      context.beginPath();
      context.arc(cx, FOOTER_TOP + 38, 11, 0, Math.PI * 2);
      context.fill();
      if (i < state.found.size) {
        context.strokeStyle = '#20301f';
        context.lineWidth = 2.5;
        context.beginPath();
        context.moveTo(cx - 5, FOOTER_TOP + 38);
        context.lineTo(cx - 1.5, FOOTER_TOP + 42);
        context.lineTo(cx + 5.5, FOOTER_TOP + 33);
        context.stroke();
      }
    }
    // Scene pips.
    for (let i = 0; i < SCENES.length; i += 1) {
      context.fillStyle = i < state.sceneIndex ? PALETTE.green : i === state.sceneIndex ? PALETTE.gold : 'rgba(255,255,255,0.22)';
      context.beginPath();
      context.arc(360 + i * 30, FOOTER_TOP + 38, 9, 0, Math.PI * 2);
      context.fill();
    }
    text(`Score ${state.score}`, 1010, FOOTER_TOP + 44, 20, PALETTE.headerText, 'right', 'bold');
    if (state.combo >= 2) text(`Combo x${state.combo}`, 880, FOOTER_TOP + 44, 18, '#ffb703', 'right', 'bold');
    text('Click a difference — or move with ← → ↑ ↓ and press Enter · H hint · P pause', 24, FOOTER_TOP + 82, 15, PALETTE.muted, 'left');
    // Keyboard cursor.
    if (cursor && cursor.visible) {
      context.strokeStyle = PALETTE.gold;
      context.lineWidth = 3;
      context.beginPath();
      context.arc(cursor.x, cursor.y, 14, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(cursor.x - 20, cursor.y);
      context.lineTo(cursor.x - 8, cursor.y);
      context.moveTo(cursor.x + 8, cursor.y);
      context.lineTo(cursor.x + 20, cursor.y);
      context.moveTo(cursor.x, cursor.y - 20);
      context.lineTo(cursor.x, cursor.y - 8);
      context.moveTo(cursor.x, cursor.y + 8);
      context.lineTo(cursor.x, cursor.y + 20);
      context.stroke();
    }
  }

  function drawOverlayPanel(title, lines, prompt, accent) {
    context.fillStyle = 'rgba(10, 30, 24, 0.55)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    const width = 640;
    const height = 150 + lines.length * 36 + 70;
    const x = (FIELD.width - width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = '#f7f3e6';
    context.beginPath();
    context.roundRect(x, y, width, height, 18);
    context.fill();
    context.fillStyle = accent;
    context.fillRect(x, y, width, 8);
    text(title, FIELD.width / 2, y + 72, 40, '#123c33', 'center', 'bold');
    for (let i = 0; i < lines.length; i += 1) {
      text(lines[i], FIELD.width / 2, y + 122 + i * 36, 21, '#4a5d4a', 'center');
    }
    text(prompt, FIELD.width / 2, y + height - 34, 20, '#2e86ab', 'center', 'bold');
  }

  function drawTitle(world, best) {
    const scene = SCENES[0];
    drawScene(context, scene, 0, PANEL_LEFT_X, PANEL.top);
    drawScene(context, scene, 1, PANEL_RIGHT_X, PANEL.top);
    context.fillStyle = 'rgba(10, 30, 24, 0.45)';
    context.fillRect(0, PANEL.top, FIELD.width, PANEL.height);
    const width = 680;
    const height = 380;
    const x = (FIELD.width - width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = '#f7f3e6';
    context.beginPath();
    context.roundRect(x, y, width, height, 18);
    context.fill();
    text('The Glasshouse', FIELD.width / 2, y + 78, 52, '#123c33', 'center', 'bold');
    text('A spot-the-difference hunt in a botanical greenhouse', FIELD.width / 2, y + 122, 21, '#4a5d4a', 'center');
    text('Three rooms · Seven differences in each · Two minutes a room', FIELD.width / 2, y + 164, 19, '#4a5d4a', 'center');
    text('Click a difference in either picture — or move the', FIELD.width / 2, y + 210, 19, '#4a5d4a', 'center');
    text('crosshair with ← → ↑ ↓ and press Enter. H hints, P pauses.', FIELD.width / 2, y + 238, 19, '#4a5d4a', 'center');
    if (best > 0) text(`Best score: ${best}`, FIELD.width / 2, y + 282, 19, '#2e9e5b', 'center', 'bold');
    text('Press Space or click to start', FIELD.width / 2, y + height - 36, 22, '#2e86ab', 'center', 'bold');
  }

  /** Paint one frame for the screen the game is on. `now` is seconds. */
  function draw(world, screen, best, cursor, now) {
    const state = world.state;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    if (screen === SCREEN_TITLE) {
      drawTitle(world, best);
      return;
    }
    drawHeader(world, now);
    drawPanels(world, now);
    drawFooter(world, screen === SCREEN_PLAY ? cursor : null);
    if (screen === SCREEN_PAUSED) {
      drawOverlayPanel('Paused', ['The greenhouse will wait for you.', `Scene ${state.sceneIndex + 1}: ${world.scene().name} — ${DIFFS_PER_SCENE - state.found.size} still to find.`], 'Press P or click to resume', PALETTE.gold);
    } else if (screen === SCREEN_SCENE_DONE) {
      const stars = state.strikes === 0 ? '★★★' : state.strikes === 1 ? '★★☆' : '★☆☆';
      drawOverlayPanel(
        `${world.scene().name} — complete!`,
        [`${stars}   All ${DIFFS_PER_SCENE} differences found`, `Time bonus +${state.sceneBonus}  ·  Score ${state.score}`, state.sceneIndex + 1 < SCENES.length ? `Next: ${SCENES[state.sceneIndex + 1].name}` : 'That was the last room — one more step!'],
        'Press N or click for the next scene',
        PALETTE.green,
      );
    } else if (screen === SCREEN_WIN) {
      const accuracy = state.finds + state.misses === 0 ? 100 : Math.round((100 * state.finds) / (state.finds + state.misses));
      drawOverlayPanel(
        'You found all 21 differences!',
        [`Final score ${state.score}   ·   Best combo x${state.bestCombo}`, `Total time ${formatTime(state.totalTime)}   ·   Accuracy ${accuracy}%`, 'The Palm House · The Orchid Corner · The Fern Grotto at Dusk'],
        'Press Space to play again',
        PALETTE.gold,
      );
    } else if (screen === SCREEN_TIME_UP) {
      drawOverlayPanel('Out of time — or out of strikes', [state.message, `${state.found.size} of ${DIFFS_PER_SCENE} found in ${world.scene().name}`], 'Press R to try this scene again', PALETTE.red);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw };
}
