// Input: mouse clicks on either picture and keyboard play. The cursor is a
// crosshair the arrow keys move; Enter or Space clicks where it stands, Tab
// jumps it to the other picture, H asks for a hint, P pauses, M mutes,
// N moves on when a scene is done, R retries a failed scene.
import { PANEL, PANEL_LEFT_X, PANEL_RIGHT_X, FIELD } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_NEXT = 8;
export const ACTION_RETRY = 16;
export const ACTION_MUTE = 32;
export const ACTION_TAB = 64;

const CURSOR_SPEED = 560; // px per second, held keys repeat through the loop

export function createInput(canvas, onClick) {
  let actions = 0;
  const cursor = { x: PANEL_LEFT_X + PANEL.width / 2, y: PANEL.top + PANEL.height / 2, panel: 0, visible: false };
  const keys = new Set();

  function panelHit(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = FIELD.width / rect.width;
    const scaleY = FIELD.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    if (y >= PANEL.top && y <= PANEL.top + PANEL.height) {
      if (x >= PANEL_LEFT_X && x <= PANEL_LEFT_X + PANEL.width) {
        return { panel: 0, x: x - PANEL_LEFT_X, y: y - PANEL.top };
      }
      if (x >= PANEL_RIGHT_X && x <= PANEL_RIGHT_X + PANEL.width) {
        return { panel: 1, x: x - PANEL_RIGHT_X, y: y - PANEL.top };
      }
    }
    return null;
  }

  canvas.addEventListener('pointerdown', (event) => {
    const hit = panelHit(event.clientX, event.clientY);
    if (hit) {
      cursor.x = hit.panel === 0 ? PANEL_LEFT_X + hit.x : PANEL_RIGHT_X + hit.x;
      cursor.y = PANEL.top + hit.y;
      cursor.panel = hit.panel;
      cursor.visible = true;
      onClick(hit.x, hit.y);
    } else {
      actions |= ACTION_CONFIRM;
    }
  });

  canvas.addEventListener('pointermove', (event) => {
    const hit = panelHit(event.clientX, event.clientY);
    if (hit) {
      cursor.x = hit.panel === 0 ? PANEL_LEFT_X + hit.x : PANEL_RIGHT_X + hit.x;
      cursor.y = PANEL.top + hit.y;
      cursor.panel = hit.panel;
      cursor.visible = true;
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat && !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        actions |= ACTION_CONFIRM;
        break;
      case 'p':
      case 'P':
      case 'Escape':
        actions |= ACTION_PAUSE;
        break;
      case 'h':
      case 'H':
        actions |= ACTION_HINT;
        break;
      case 'n':
      case 'N':
        actions |= ACTION_NEXT;
        break;
      case 'r':
      case 'R':
        actions |= ACTION_RETRY;
        break;
      case 'm':
      case 'M':
        actions |= ACTION_MUTE;
        break;
      case 'Tab':
        event.preventDefault();
        actions |= ACTION_TAB;
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        keys.add(event.key);
        cursor.visible = true;
        break;
      default:
        break;
    }
  });

  window.addEventListener('keyup', (event) => {
    keys.delete(event.key);
  });

  window.addEventListener('blur', () => keys.clear());

  function moveCursor(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('ArrowRight')) dx += 1;
    if (keys.has('ArrowUp')) dy -= 1;
    if (keys.has('ArrowDown')) dy += 1;
    if (dx === 0 && dy === 0) return;
    const len = Math.hypot(dx, dy);
    cursor.x = Math.min(FIELD.width - 8, Math.max(8, cursor.x + (dx / len) * CURSOR_SPEED * dt));
    cursor.y = Math.min(FIELD.height - 8, Math.max(8, cursor.y + (dy / len) * CURSOR_SPEED * dt));
    cursor.panel = cursor.x < PANEL_LEFT_X + PANEL.width + PANEL.gap / 2 ? 0 : 1;
  }

  /** The cursor's position in the panel it stands on, for a keyboard click. */
  function cursorHit() {
    const baseX = cursor.panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X;
    return { x: cursor.x - baseX, y: cursor.y - PANEL.top };
  }

  function takeActions() {
    const taken = actions;
    actions = 0;
    return taken;
  }

  return { cursor, moveCursor, cursorHit, takeActions };
}
