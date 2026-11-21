// The Glasshouse: a spot-the-difference game in a botanical greenhouse.
// Field and palette: one clear job — every number the renderer and the
// world agree on lives here, so a scene never has to guess a size.
export const FIELD = { width: 1280, height: 800 };
export const PANEL = { width: 596, height: 560, top: 100, gap: 40 };
export const PANEL_LEFT_X = 24;
export const PANEL_RIGHT_X = PANEL_LEFT_X + PANEL.width + PANEL.gap;
export const HEADER_HEIGHT = 88;
export const FOOTER_TOP = 688;

export const DIFFS_PER_SCENE = 7;
export const HINTS_PER_SCENE = 3;
export const MAX_STRIKES = 3;
export const FIND_POINTS = 100;
export const COMBO_STEP = 25;
export const HINT_COST = 25;
export const TIME_BONUS_PER_SECOND = 5;

export const BEST_KEY = 'glasshouse-best-score';
export const MUTE_KEY = 'glasshouse-muted';

export const PALETTE = {
  backdrop: '#0d2b26',
  header: '#123c33',
  headerText: '#f3ead2',
  muted: '#9db8a4',
  gold: '#f5b301',
  goldSoft: '#ffd964',
  green: '#2e9e5b',
  red: '#e4572e',
  panelFrame: '#f7f3e6',
  footer: '#123c33',
  text: '#20301f',
  panelLabel: '#123c33',
};

export const FONT = "'Trebuchet MS', 'Segoe UI', Verdana, sans-serif";
