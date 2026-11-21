# glasshouse-spot-the-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/karmilanerila/glasshouse-spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/karmilanerila/glasshouse-spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**The Glasshouse** — a spot-the-difference game set in a botanical greenhouse. Two near-identical pictures side by side, gold-ring markers on the differences you find, several still unfound, and a counter of how many remain.

Three rooms, seven differences in each, two minutes a room:

1. **The Palm House** — morning light through the glass roof: coconuts, a butterfly, a watering can, and a little red bird.
2. **The Orchid Corner** — a warm potting room: orchid blooms, books, a teacup, and a cat asleep on the chair.
3. **The Fern Grotto at Dusk** — lanterns, a still pond, fireflies, and a frog on a lily pad.

Play with mouse or keyboard: click a difference in either picture, or move the crosshair with the arrow keys and press Enter. **H** asks for a hint (three a room), **P** pauses, **M** mutes the sounds, **R** retries a failed room. Finds build a combo; wrong clicks cost strikes; finishing a room with time left earns a bonus.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `game/index.html` directly in a desktop browser — the game is plain static files with no network requests. `main.ts` (Node 22) hands the game, its screenshots and its dossier to `/output` for the make.fun bounty.

---

<sub>Entered on [make.fun](https://make.fun/?ref=karmilanerila&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
