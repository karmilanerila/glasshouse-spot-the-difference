// The screenshot scenes behind ?shot=cover|scene2|scene3|win. Each one sets
// the real world to a fixed mid-game state — a few differences already found
// (gold rings on both pictures), several still unfound, the counter, the
// timer, hints and strikes all reading — so the frame is what a real game
// looks like halfway through a room, and the same seed always gives the
// same frame.
import { DIFFS_PER_SCENE } from './config.js';

function stageFound(world, sceneIndex, foundIds, elapsed, strikes, hintsLeft) {
  world.resetScene(sceneIndex);
  world.state.found = new Set(foundIds);
  world.state.elapsed = elapsed;
  world.state.strikes = strikes;
  world.state.hintsLeft = hintsLeft;
  world.state.score = foundIds.length * 100 + 75;
  world.state.combo = foundIds.length;
  world.state.bestCombo = foundIds.length;
  world.state.finds = foundIds.length;
  world.state.status = 'play';
}

/**
 * Set the world to the named shot and return the screen to draw over it and
 * the best score to show. Unknown names stage the cover.
 */
export function stageShot(name, world) {
  if (name === 'scene2') {
    stageFound(world, 1, ['orchid-bloom', 'pebbles'], 41, 0, 3);
    return { screen: 'play', best: 1240 };
  }
  if (name === 'scene3') {
    stageFound(world, 2, ['moon', 'lantern', 'frog', 'mushroom'], 95, 1, 2);
    return { screen: 'play', best: 2480 };
  }
  if (name === 'win') {
    world.startGame();
    world.state.sceneIndex = 2;
    world.state.found = new Set();
    world.state.score = 2845;
    world.state.finds = 21;
    world.state.misses = 2;
    world.state.bestCombo = 6;
    world.state.totalTime = 274;
    world.state.status = 'win';
    return { screen: 'win', best: 2845 };
  }
  // Cover: the Palm House, three found, four still to find.
  stageFound(world, 0, ['coconuts', 'butterfly', 'sun'], 73, 0, 3);
  return { screen: 'play', best: 1240 };
}

export { DIFFS_PER_SCENE };
