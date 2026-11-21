// The Glasshouse scenes: three flat-vector greenhouse rooms, drawn fresh on
// canvas every frame. Each scene draws one shared background, then its seven
// differences twice: the left panel gets the original (`a`), the right panel
// the altered version (`b`). A difference is fair when its two drawings are
// both plausible in the room — a missing coconut, a recoloured bloom, a cat
// that wandered off — so the hunt is looking, not guessing.
//
// Panel-local coordinates: x 0..596, y 0..560. Every difference carries its
// centre and hit radius so the world can test clicks and draw markers.

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

/** A simple leaf: a pointed oval rotated to `angle`, with a centre vein. */
function leaf(ctx, x, y, len, wid, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -wid, len, 0);
  ctx.quadraticCurveTo(len * 0.5, wid, 0, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(len - 4, 0);
  ctx.stroke();
  ctx.restore();
}

/** A five-petal flower with a round centre. */
function flower(ctx, x, y, r, petal, centre) {
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.55, petal);
  }
  circle(ctx, x, y, r * 0.42, centre);
}

/** A terracotta pot, `s` wide, sitting on y (its base). */
function pot(ctx, x, y, s, color) {
  poly(ctx, [[x - s / 2, y - s * 0.62], [x + s / 2, y - s * 0.62], [x + s * 0.38, y], [x - s / 2 + s * 0.12, y]], color);
  rect(ctx, x - s / 2 - 3, y - s * 0.78, s + 6, s * 0.18, '#c96f3f');
}

/** A hanging planter: strings from the top, a bowl, trailing leaves. */
function hangingPlanter(ctx, x, y, bowl, leafColor) {
  ctx.strokeStyle = '#8a6b4a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 26, y - 46);
  ctx.lineTo(x, y);
  ctx.moveTo(x + 26, y - 46);
  ctx.lineTo(x, y);
  ctx.moveTo(x, y - 46);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.fillStyle = bowl;
  ctx.beginPath();
  ctx.moveTo(x - 30, y);
  ctx.quadraticCurveTo(x, y + 34, x + 30, y);
  ctx.closePath();
  ctx.fill();
  leaf(ctx, x - 12, y - 6, 26, 9, Math.PI * 1.15, leafColor);
  leaf(ctx, x + 10, y - 8, 26, 9, Math.PI * -0.15, leafColor);
  leaf(ctx, x, y - 12, 30, 9, Math.PI * 1.5, leafColor);
}

/** Glass roof mullions: diagonal bars across the top of the panel. */
function roofMullions(ctx, w, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  for (let x = -40; x < w + 40; x += 74) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 60, 92);
    ctx.stroke();
  }
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 92);
  ctx.lineTo(w, 92);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Scene 1 — The Palm House. Bright morning light through the glass roof.
// ---------------------------------------------------------------------------
function palmHouseBase(ctx) {
  const w = 596;
  const sky = ctx.createLinearGradient(0, 0, 0, 560);
  sky.addColorStop(0, '#bfe6f2');
  sky.addColorStop(0.55, '#dff3e2');
  sky.addColorStop(1, '#eef7df');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, 560);
  // Sun glow, top right.
  const glow = ctx.createRadialGradient(512, 66, 8, 512, 66, 120);
  glow.addColorStop(0, 'rgba(255, 236, 160, 0.95)');
  glow.addColorStop(1, 'rgba(255, 236, 160, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(380, 0, 216, 200);
  roofMullions(ctx, w, 'rgba(255,255,255,0.75)');
  // Back wall and floor.
  rect(ctx, 0, 380, w, 180, '#cfe3c2');
  rect(ctx, 0, 380, w, 8, '#a9c79a');
  rect(ctx, 0, 470, w, 90, '#e8c9a0');
  ctx.strokeStyle = 'rgba(160,110,60,0.35)';
  ctx.lineWidth = 2;
  for (let x = 0; x < w; x += 74) {
    ctx.beginPath();
    ctx.moveTo(x, 470);
    ctx.lineTo(x - 30, 560);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 515);
  ctx.lineTo(w, 515);
  ctx.stroke();
  // Central path.
  poly(ctx, [[238, 470], [358, 470], [392, 560], [204, 560]], '#f2e3c2');
  // The palm: curved trunk and six fronds.
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(150, 470);
  ctx.quadraticCurveTo(128, 330, 150, 180);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 2;
  for (let y = 220; y < 470; y += 34) {
    ctx.beginPath();
    ctx.moveTo(138, y);
    ctx.lineTo(160, y + 8);
    ctx.stroke();
  }
  const fronds = [
    [150, 180, -2.6, 120], [150, 180, -2.1, 128], [150, 180, -1.5, 118],
    [150, 180, -0.6, 122], [150, 180, 0.1, 112], [150, 180, 0.7, 104],
  ];
  for (const [x, y, a, len] of fronds) leaf(ctx, x, y, len, 17, a, '#2e8b57');
  // Monstera, right side.
  ctx.strokeStyle = '#3f7d4e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(478, 470);
  ctx.lineTo(478, 330);
  ctx.stroke();
  leaf(ctx, 478, 330, 92, 30, -2.4, '#1f7a44');
  leaf(ctx, 478, 330, 96, 30, -1.9, '#27a35c');
  leaf(ctx, 478, 330, 88, 28, -1.2, '#1f7a44');
  leaf(ctx, 478, 330, 90, 28, -0.5, '#2fae62');
  leaf(ctx, 478, 330, 70, 24, -2.9, '#27a35c');
  // Hanging planters across the top.
  hangingPlanter(ctx, 250, 74, '#b5651d', '#3f9e58');
  hangingPlanter(ctx, 330, 66, '#7a5c9e', '#3f9e58');
  hangingPlanter(ctx, 410, 74, '#b5651d', '#3f9e58');
  // Shelf with terracotta pots, bottom right.
  rect(ctx, 430, 420, 150, 10, '#8a5a33');
  pot(ctx, 462, 420, 44, '#d2691e');
  pot(ctx, 556, 420, 44, '#d2691e');
  // Small fern on the floor, left.
  leaf(ctx, 60, 470, 70, 16, -2.2, '#2fae62');
  leaf(ctx, 60, 470, 76, 16, -1.6, '#27a35c');
  leaf(ctx, 60, 470, 64, 15, -1.0, '#2fae62');
}

const palmHouseDiffs = [
  {
    id: 'coconuts', x: 150, y: 196, r: 26, label: 'coconuts under the palm crown',
    a(ctx) { circle(ctx, 138, 196, 9, '#6b4423'); circle(ctx, 158, 200, 9, '#6b4423'); circle(ctx, 148, 210, 9, '#7d5230'); },
    b(ctx) { circle(ctx, 138, 196, 9, '#6b4423'); circle(ctx, 158, 200, 9, '#6b4423'); },
  },
  {
    id: 'planter-bloom', x: 330, y: 66, r: 24, label: 'the middle hanging planter’s bloom',
    a(ctx) { flower(ctx, 330, 62, 13, '#ff7eb6', '#ffd23f'); },
    b(ctx) { flower(ctx, 330, 62, 13, '#ff8c42', '#ffd23f'); },
  },
  {
    id: 'butterfly', x: 470, y: 250, r: 26, label: 'the butterfly on the monstera',
    a(ctx) {
      ctx.fillStyle = '#ff9f1c';
      ctx.beginPath(); ctx.ellipse(462, 244, 12, 16, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(480, 244, 12, 16, 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#20301f';
      ctx.fillRect(468, 238, 4, 18);
    },
    b(ctx) {},
  },
  {
    id: 'watering-can', x: 210, y: 470, r: 30, label: 'the watering can on the path',
    a(ctx) {
      roundRect(ctx, 186, 442, 52, 30, 8, '#2e86ab');
      ctx.strokeStyle = '#2e86ab';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(238, 452); ctx.lineTo(262, 436); ctx.stroke();
      circle(ctx, 264, 434, 5, '#2e86ab');
      ctx.beginPath(); ctx.moveTo(186, 448); ctx.quadraticCurveTo(172, 452, 176, 466); ctx.stroke();
    },
    b(ctx) {},
  },
  {
    id: 'sun', x: 512, y: 66, r: 26, label: 'the sun in the top window',
    a(ctx) {
      circle(ctx, 512, 66, 22, '#ffd23f');
      ctx.strokeStyle = '#ffd23f';
      ctx.lineWidth = 4;
      for (let i = 0; i < 8; i += 1) {
        const an = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(512 + Math.cos(an) * 28, 66 + Math.sin(an) * 28);
        ctx.lineTo(512 + Math.cos(an) * 36, 66 + Math.sin(an) * 36);
        ctx.stroke();
      }
    },
    b(ctx) {
      circle(ctx, 500, 66, 16, '#ffffff');
      circle(ctx, 516, 60, 13, '#ffffff');
      circle(ctx, 526, 70, 12, '#ffffff');
      ellipse(ctx, 512, 72, 24, 10, '#ffffff');
    },
  },
  {
    id: 'shelf-pots', x: 510, y: 400, r: 28, label: 'the pots on the shelf',
    a(ctx) { pot(ctx, 510, 420, 44, '#d2691e'); },
    b(ctx) {},
  },
  {
    id: 'palm-bird', x: 95, y: 445, r: 24, label: 'the little bird by the fern',
    a(ctx) {
      ellipse(ctx, 95, 448, 14, 10, '#e4572e');
      circle(ctx, 107, 440, 7, '#e4572e');
      poly(ctx, [[113, 440], [121, 442], [113, 444]], '#f5b301');
      ctx.fillStyle = '#20301f';
      circle(ctx, 109, 438, 1.6, '#20301f');
    },
    b(ctx) {},
  },
];

export const SCENE_PALM_HOUSE = {
  id: 'palm-house',
  name: 'The Palm House',
  tag: 'Morning light through the glass roof',
  par: 120,
  base: palmHouseBase,
  diffs: palmHouseDiffs,
};

// ---------------------------------------------------------------------------
// Scene 2 — The Orchid Corner. A warm potting room: shelves, books, a cat.
// ---------------------------------------------------------------------------
function orchidCornerBase(ctx) {
  const w = 596;
  rect(ctx, 0, 0, w, 560, '#f6e7c9');
  // Window with a garden view, right.
  rect(ctx, 420, 40, 150, 190, '#8fb8d8');
  rect(ctx, 432, 52, 126, 166, '#bfe6f2');
  circle(ctx, 520, 90, 18, '#ffd23f');
  poly(ctx, [[432, 218], [500, 150], [558, 218]], '#5da24a');
  poly(ctx, [[470, 218], [520, 170], [558, 218]], '#4c8a3f');
  ctx.strokeStyle = '#7a5a3a';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(495, 40); ctx.lineTo(495, 230); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(420, 135); ctx.lineTo(570, 135); ctx.stroke();
  rect(ctx, 414, 34, 162, 8, '#7a5a3a');
  rect(ctx, 414, 230, 162, 8, '#7a5a3a');
  // Wainscot and floor.
  rect(ctx, 0, 400, w, 10, '#d9b98a');
  rect(ctx, 0, 410, w, 150, '#e9d3a7');
  rect(ctx, 0, 410, w, 6, '#c9a86f');
  // Shelves, left.
  rect(ctx, 40, 210, 260, 12, '#8a5a33');
  rect(ctx, 40, 330, 260, 12, '#8a5a33');
  // Orchid pots on the top shelf.
  pot(ctx, 90, 210, 46, '#c96f3f');
  pot(ctx, 190, 210, 46, '#c96f3f');
  pot(ctx, 268, 210, 46, '#7a5c9e');
  // Orchid stems and blooms (the middle bloom is a difference).
  ctx.strokeStyle = '#3f7d4e';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(90, 186); ctx.quadraticCurveTo(84, 150, 92, 128); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(190, 186); ctx.quadraticCurveTo(196, 150, 188, 128); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(268, 186); ctx.quadraticCurveTo(262, 156, 270, 138); ctx.stroke();
  flower(ctx, 92, 122, 12, '#ffffff', '#ffd23f');
  flower(ctx, 270, 132, 12, '#ff7eb6', '#ffd23f');
  // Books standing on the top shelf (count is a difference).
  const bookColors = ['#e4572e', '#2e86ab', '#f5b301', '#2e9e5b'];
  for (let i = 0; i < 4; i += 1) rect(ctx, 316 + i * 17, 168, 14, 42, bookColors[i]);
  // Pebble jar on the lower shelf (colour is a difference).
  roundRect(ctx, 216, 286, 44, 44, 8, 'rgba(255,255,255,0.55)');
  rect(ctx, 216, 286, 44, 10, '#8a5a33');
  // Hanging fern, top left.
  hangingPlanter(ctx, 60, 60, '#7a5c9e', '#2fae62');
  // Wall clock.
  circle(ctx, 490, 300, 30, '#fffdf5');
  ctx.strokeStyle = '#7a5a3a';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(490, 300, 30, 0, Math.PI * 2); ctx.stroke();
  // Table with a teacup (presence is a difference).
  rect(ctx, 300, 430, 180, 12, '#8a5a33');
  rect(ctx, 312, 442, 10, 60, '#7a5a3a');
  rect(ctx, 458, 442, 10, 60, '#7a5a3a');
  // Armchair with a sleeping cat (presence is a difference).
  roundRect(ctx, 400, 440, 130, 62, 14, '#c96f3f');
  roundRect(ctx, 400, 420, 26, 60, 10, '#c96f3f');
}

const orchidCornerDiffs = [
  {
    id: 'orchid-bloom', x: 188, y: 122, r: 26, label: 'the middle orchid’s bloom',
    a(ctx) { flower(ctx, 188, 122, 13, '#9b5de5', '#ffd23f'); },
    b(ctx) { flower(ctx, 188, 122, 13, '#ffffff', '#ffd23f'); },
  },
  {
    id: 'books', x: 350, y: 188, r: 26, label: 'the books on the top shelf',
    a(ctx) { rect(ctx, 384, 168, 14, 42, '#e4572e'); },
    b(ctx) {},
  },
  {
    id: 'teacup', x: 360, y: 414, r: 26, label: 'the teacup on the table',
    a(ctx) {
      roundRect(ctx, 342, 402, 36, 24, 6, '#fffdf5');
      ctx.strokeStyle = '#2e86ab';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(380, 414, 8, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ellipse(ctx, 360, 402, 16, 4, '#8a5a33');
    },
    b(ctx) {},
  },
  {
    id: 'cat', x: 465, y: 452, r: 30, label: 'the cat asleep on the chair',
    a(ctx) {
      ellipse(ctx, 465, 458, 34, 16, '#f08c1e');
      circle(ctx, 492, 446, 12, '#f08c1e');
      poly(ctx, [[486, 436], [490, 424], [496, 436]], '#f08c1e');
      poly(ctx, [[498, 436], [504, 426], [506, 438]], '#f08c1e');
      ctx.strokeStyle = '#c96f3f';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(470, 446, 12, 0.3, 1.4); ctx.stroke();
      ctx.beginPath(); ctx.arc(452, 448, 10, 0.5, 1.8); ctx.stroke();
    },
    b(ctx) {},
  },
  {
    id: 'clock', x: 490, y: 300, r: 26, label: 'the wall clock’s hands',
    a(ctx) {
      ctx.strokeStyle = '#20301f';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(490, 300); ctx.lineTo(490, 282); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(490, 300); ctx.lineTo(506, 300); ctx.stroke();
    },
    b(ctx) {
      ctx.strokeStyle = '#20301f';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(490, 300); ctx.lineTo(498, 316); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(490, 300); ctx.lineTo(478, 312); ctx.stroke();
    },
  },
  {
    id: 'fern', x: 60, y: 96, r: 26, label: 'the hanging fern’s length',
    a(ctx) { leaf(ctx, 48, 70, 46, 12, Math.PI * 1.2, '#2fae62'); leaf(ctx, 72, 70, 46, 12, Math.PI * -0.2, '#27a35c'); },
    b(ctx) { leaf(ctx, 48, 70, 22, 9, Math.PI * 1.2, '#2fae62'); leaf(ctx, 72, 70, 22, 9, Math.PI * -0.2, '#27a35c'); },
  },
  {
    id: 'pebbles', x: 238, y: 312, r: 24, label: 'the pebbles in the jar',
    a(ctx) {
      circle(ctx, 228, 316, 7, '#2e86ab'); circle(ctx, 242, 322, 7, '#2e86ab');
      circle(ctx, 250, 310, 6, '#2e86ab'); circle(ctx, 232, 326, 6, '#4aa3c7');
    },
    b(ctx) {
      circle(ctx, 228, 316, 7, '#e4572e'); circle(ctx, 242, 322, 7, '#e4572e');
      circle(ctx, 250, 310, 6, '#e4572e'); circle(ctx, 232, 326, 6, '#f08c1e');
    },
  },
];

export const SCENE_ORCHID_CORNER = {
  id: 'orchid-corner',
  name: 'The Orchid Corner',
  tag: 'A warm potting room, shelves full of green',
  par: 120,
  base: orchidCornerBase,
  diffs: orchidCornerDiffs,
};

// ---------------------------------------------------------------------------
// Scene 3 — The Fern Grotto at Dusk. Lanterns, a pond, fireflies.
// ---------------------------------------------------------------------------
function fernGrottoBase(ctx) {
  const w = 596;
  const dusk = ctx.createLinearGradient(0, 0, 0, 560);
  dusk.addColorStop(0, '#123f4a');
  dusk.addColorStop(0.6, '#1e6b5e');
  dusk.addColorStop(1, '#2a7a5c');
  ctx.fillStyle = dusk;
  ctx.fillRect(0, 0, w, 560);
  // Stars.
  ctx.fillStyle = '#ffe9a8';
  const stars = [[80, 60], [150, 40], [220, 80], [340, 46], [420, 70], [60, 140], [250, 130], [380, 120], [540, 150], [180, 170]];
  for (const [x, y] of stars) circle(ctx, x, y, 2.2, '#ffe9a8');
  // The moon (phase is a difference).
  // Hanging lanterns (the middle one's flame is a difference).
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(150, 0); ctx.lineTo(150, 96); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(300, 0); ctx.lineTo(300, 110); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(450, 0); ctx.lineTo(450, 96); ctx.stroke();
  for (const x of [150, 450]) {
    const glow = ctx.createRadialGradient(x, 132, 4, x, 132, 70);
    glow.addColorStop(0, 'rgba(255, 190, 80, 0.55)');
    glow.addColorStop(1, 'rgba(255, 190, 80, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 70, 62, 140, 140);
    roundRect(ctx, x - 20, 108, 40, 48, 8, '#c96f3f');
    rect(ctx, x - 14, 120, 28, 26, '#ffe9a8');
  }
  // Ferns left and right.
  for (const bx of [40, 556]) {
    const dir = bx < 300 ? 1 : -1;
    leaf(ctx, bx, 470, 110, 22, dir > 0 ? -1.9 : -1.2, '#2fae62');
    leaf(ctx, bx, 470, 120, 22, dir > 0 ? -1.4 : -1.7, '#27a35c');
    leaf(ctx, bx, 470, 96, 20, dir > 0 ? -2.3 : -0.8, '#1f7a44');
  }
  // The pond.
  ellipse(ctx, 298, 490, 260, 62, '#1b4d5c');
  ellipse(ctx, 298, 486, 240, 52, '#2a6b7a');
  // Lily pads (one holds a frog; one holds a flower).
  ellipse(ctx, 200, 486, 52, 16, '#2e9e5b');
  ellipse(ctx, 350, 500, 58, 17, '#2e9e5b');
  ellipse(ctx, 470, 478, 46, 14, '#2e9e5b');
  // Pond stones (count is a difference).
  ellipse(ctx, 500, 520, 18, 9, '#8d99ae');
  ellipse(ctx, 528, 512, 14, 8, '#8d99ae');
  ellipse(ctx, 470, 526, 15, 8, '#6c7a89');
  // A mushroom at the pond's edge (presence is a difference).
  // Fireflies (count is a difference).
  circle(ctx, 120, 220, 3.5, '#ffe066');
  circle(ctx, 420, 260, 3.5, '#ffe066');
  circle(ctx, 520, 300, 3.5, '#ffe066');
}

const fernGrottoDiffs = [
  {
    id: 'moon', x: 500, y: 80, r: 28, label: 'the moon’s phase',
    a(ctx) {
      circle(ctx, 500, 80, 26, '#ffe9a8');
      circle(ctx, 510, 74, 22, '#123f4a');
    },
    b(ctx) { circle(ctx, 500, 80, 26, '#ffe9a8'); },
  },
  {
    id: 'lantern', x: 300, y: 132, r: 26, label: 'the middle lantern’s flame',
    a(ctx) {
      const glow = ctx.createRadialGradient(300, 142, 4, 300, 142, 70);
      glow.addColorStop(0, 'rgba(255, 190, 80, 0.55)');
      glow.addColorStop(1, 'rgba(255, 190, 80, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(230, 72, 140, 140);
      roundRect(ctx, 280, 118, 40, 48, 8, '#c96f3f');
      rect(ctx, 286, 130, 28, 26, '#ffe9a8');
    },
    b(ctx) {
      roundRect(ctx, 280, 118, 40, 48, 8, '#5c4a3a');
      rect(ctx, 286, 130, 28, 26, '#3a3f4a');
    },
  },
  {
    id: 'fireflies', x: 440, y: 210, r: 28, label: 'the fireflies by the ferns',
    a(ctx) { circle(ctx, 440, 200, 3.5, '#ffe066'); circle(ctx, 462, 224, 3.5, '#ffe066'); },
    b(ctx) {},
  },
  {
    id: 'frog', x: 200, y: 472, r: 28, label: 'the frog on the lily pad',
    a(ctx) {
      ellipse(ctx, 200, 478, 18, 12, '#4caf50');
      circle(ctx, 190, 468, 7, '#4caf50');
      circle(ctx, 210, 468, 7, '#4caf50');
      circle(ctx, 190, 466, 2.4, '#20301f');
      circle(ctx, 210, 466, 2.4, '#20301f');
    },
    b(ctx) {},
  },
  {
    id: 'lily-bloom', x: 350, y: 492, r: 26, label: 'the lily’s bloom',
    a(ctx) { flower(ctx, 350, 490, 13, '#ff7eb6', '#ffd23f'); },
    b(ctx) { flower(ctx, 350, 490, 13, '#ffffff', '#ffd23f'); },
  },
  {
    id: 'stones', x: 500, y: 516, r: 26, label: 'the stones at the pond’s edge',
    a(ctx) { ellipse(ctx, 492, 506, 16, 8, '#8d99ae'); },
    b(ctx) {},
  },
  {
    id: 'mushroom', x: 110, y: 440, r: 26, label: 'the mushroom by the pond',
    a(ctx) {
      rect(ctx, 104, 440, 12, 20, '#f2e3c2');
      ctx.fillStyle = '#e4572e';
      ctx.beginPath();
      ctx.arc(110, 440, 18, Math.PI, 0);
      ctx.fill();
      circle(ctx, 102, 434, 3, '#fffdf5');
      circle(ctx, 114, 430, 3, '#fffdf5');
    },
    b(ctx) {},
  },
];

export const SCENE_FERN_GROTTO = {
  id: 'fern-grotto',
  name: 'The Fern Grotto at Dusk',
  tag: 'Lanterns, a still pond, and fireflies',
  par: 120,
  base: fernGrottoBase,
  diffs: fernGrottoDiffs,
};

/** The three scenes, in the order the game plays them. */
export const SCENES = [SCENE_PALM_HOUSE, SCENE_ORCHID_CORNER, SCENE_FERN_GROTTO];

/**
 * Draw one scene into one panel. `variant` 0 is the left picture, 1 the
 * right picture; each difference draws its own original or altered self.
 */
export function drawScene(ctx, scene, variant, ox, oy) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.beginPath();
  ctx.rect(0, 0, 596, 560);
  ctx.clip();
  scene.base(ctx);
  for (const diff of scene.diffs) {
    if (variant === 0) diff.a(ctx);
    else diff.b(ctx);
  }
  ctx.restore();
}
