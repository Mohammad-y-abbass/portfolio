/**
 * Escape Room Game - Refactored ES6 Module
 * A puzzle game where the player must escape a locked study by solving various puzzles.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** Base canvas dimensions (internal resolution) */
const BASE_WIDTH = 960;
const BASE_HEIGHT = 640;
const CANVAS_WIDTH = BASE_WIDTH;
const CANVAS_HEIGHT = BASE_HEIGHT;

/** Color palette (green phosphor retro theme) */
const PALETTE = {
  bg0: "#010603",
  bg1: "#03120a",
  wall: "#04130a",
  wallLight: "#0a2011",
  floorA: "#031a0d",
  floorB: "#020f07",
  dim: "#154a24",
  mid: "#2f8f52",
  bright: "#39ff6a",
  brighter: "#a8ffc0",
  ink: "#010b04",
  panel: "#020e06",
  panelBorder: "#39ff6a",
  flame: "#8dff4a",
};

/** Game symbols for puzzles */
const SYMBOLS = ["\u2600", "\u263E", "\u2605", "\u2699"]; // sun, moon, star, gear

/** Pattern types for bookshelf puzzle */
const PATTERNS = ["solid", "hatch", "dots", "stripe", "cross"];

/** Pattern display labels */
const PATTERN_LABEL = {
  solid: "SOLID",
  hatch: "HATCH",
  dots: "DOTS",
  stripe: "LINES",
  cross: "CROSS",
};

/** Movement keys */
const MOVE_KEYS = [
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "w",
  "a",
  "s",
  "d",
  " ",
];

// ============================================================================
// WORLD LAYOUT
// ============================================================================

const ROOM = { x: 26, y: 16, w: CANVAS_WIDTH - 52, h: CANVAS_HEIGHT - 96 };
const WALL_TOP_H = 118;
const FLOOR = {
  x: ROOM.x + 18,
  y: ROOM.y + WALL_TOP_H,
  w: ROOM.w - 36,
  h: ROOM.h - WALL_TOP_H - 18,
};

// ============================================================================
// GAME STATE
// ============================================================================

/**
 * Game state object containing all dynamic game data
 */
const state = {
  keys: {},
  player: {
    x: FLOOR.x + FLOOR.w * 0.5,
    y: FLOOR.y + FLOOR.h * 0.5,
    w: 20,
    h: 14,
    speed: 165,
    facing: "down",
    moving: false,
    animT: 0,
  },
  flags: {
    rugMoved: false,
    drawerOpen: false,
    clockSolved: false,
    bookshelfSolved: false,
    paintingChecked: false,
    boxOpened: false,
    safeOpen: false,
    won: false,
  },
  foundDigits: [null, null, null, null],
  inventory: [],
  activePuzzle: null,
  dialValues: [0, 1, 2],
  clockHour: 0,
  safeDials: [0, 0, 0, 0],
  selectedBook: -1,
  toast: { text: "", t: 0 },
  startTime: 0,
  elapsed: 0,
  bestTime: null,
  uiHitRegions: [],
};

// ============================================================================
// PUZZLE DATA
// ============================================================================

const digits = {
  d1: 0,
  d2: 0,
  d3: 0,
  d4: 0,
};

let correctSeq = [];
let clockClueHour = 0;
let shelfPatterns = [];
let targetOrder = [];
let currentOrder = [];

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Returns a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random element from an array
 * @param {Array} arr - Array to choose from
 * @returns {*} Random element
 */
function choice(arr) {
  return arr[rand(0, arr.length - 1)];
}

/**
 * Returns a shuffled copy of an array
 * @param {Array} arr - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Converts a number to a Roman numeral
 * @param {number} n - Number to convert
 * @returns {string} Roman numeral string
 */
function romanNumeral(n) {
  const map = [
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  if (n === 0) return "0";
  let out = "",
    num = n;
  for (const [v, s] of map) {
    while (num >= v) {
      out += s;
      num -= v;
    }
  }
  return out;
}

/**
 * Clamps a value between a minimum and maximum
 * @param {number} v - Value to clamp
 * @param {number} lo - Minimum value
 * @param {number} hi - Maximum value
 * @returns {number} Clamped value
 */
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Checks if two rectangles overlap
 * @param {Object} a - First rectangle {x, y, w, h}
 * @param {Object} b - Second rectangle {x, y, w, h}
 * @returns {boolean} True if rectangles overlap
 */
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * Checks if a point is inside a rectangle
 * @param {number} px - Point x coordinate
 * @param {number} py - Point y coordinate
 * @param {Object} r - Rectangle {x, y, w, h}
 * @returns {boolean} True if point is inside rectangle
 */
function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

/**
 * Simple noise function for deterministic random values
 * @param {number} n - Input value
 * @returns {number} Noise value between 0 and 1
 */
function noise1(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// ============================================================================
// DRAWING HELPERS
// ============================================================================

let ctx = null;
let CW = CANVAS_WIDTH;
let CH = CANVAS_HEIGHT;

/**
 * Draws a rounded rectangle path
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {number} r - Border radius
 */
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Sets a glow effect on the context
 * @param {string} color - Glow color
 * @param {number} blur - Blur amount
 */
function glow(color, blur) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

/**
 * Removes glow effect from the context
 */
function noGlow() {
  ctx.shadowBlur = 0;
}

/**
 * Creates a vertical gradient
 * @param {number} x0 - Start x
 * @param {number} y0 - Start y
 * @param {number} x1 - End x
 * @param {number} y1 - End y
 * @param {Array} stops - Array of [position, color] stops
 * @returns {CanvasGradient} Linear gradient
 */
function vgrad(x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const s of stops) g.addColorStop(s[0], s[1]);
  return g;
}

/**
 * Creates a radial gradient
 * @param {number} cx - Center x
 * @param {number} cy - Center y
 * @param {number} r0 - Inner radius
 * @param {number} r1 - Outer radius
 * @param {Array} stops - Array of [position, color] stops
 * @returns {CanvasGradient} Radial gradient
 */
function rgrad(cx, cy, r0, r1, stops) {
  const g = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
  for (const s of stops) g.addColorStop(s[0], s[1]);
  return g;
}

/**
 * Draws a drop shadow ellipse
 * @param {number} cx - Center x
 * @param {number} by - Bottom y
 * @param {number} rx - X radius
 * @param {number} ry - Y radius
 * @param {number} alpha - Opacity
 */
function dropShadow(cx, by, rx, ry, alpha) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0," + (alpha || 0.4) + ")";
  ctx.beginPath();
  ctx.ellipse(cx, by, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a 3D-style solid block with highlights and shadows
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {number} r - Border radius
 */
function solidBlock(x, y, w, h, r) {
  ctx.fillStyle = vgrad(x, y, x + w, y + h, [
    [0, "#12351c"],
    [0.55, "#0b2513"],
    [1, "#07190c"],
  ]);
  roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.save();
  roundRect(x, y, w, h, r);
  ctx.clip();
  ctx.strokeStyle = "rgba(168,255,192,0.28)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + h - 2);
  ctx.lineTo(x + 2, y + 2);
  ctx.lineTo(x + w - 2, y + 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + h - 2);
  ctx.lineTo(x + w - 2, y + h - 2);
  ctx.lineTo(x + w - 2, y + 2);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = 1.2;
  roundRect(x, y, w, h, r);
  ctx.stroke();
}

/**
 * Draws a wooden leg with tapered shape
 * @param {number} x - Center x
 * @param {number} y - Top y
 * @param {number} h - Height
 * @param {number} wTop - Top width
 * @param {number} wBot - Bottom width
 */
function woodLeg(x, y, h, wTop, wBot) {
  ctx.fillStyle = vgrad(x - wTop, y, x + wTop, y, [
    [0, "#0a2312"],
    [0.5, "#154a24"],
    [1, "#08200f"],
  ]);
  ctx.beginPath();
  ctx.moveTo(x - wTop, y);
  ctx.lineTo(x + wTop, y);
  ctx.lineTo(x + wBot, y + h);
  ctx.lineTo(x - wBot, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(1,11,4,0.5)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Wraps text to fit within a maximum width
 * @param {string} text - Text to wrap
 * @param {number} cx - Center x
 * @param {number} y - Starting y
 * @param {number} maxW - Maximum width
 * @param {number} lh - Line height
 */
function wrapText(text, cx, y, maxW, lh) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxW && line !== "") {
      lines.push(line);
      line = w + " ";
    } else line = test;
  }
  lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l.trim(), cx, y + i * lh));
}

// ============================================================================
// GAME ENTITIES
// ============================================================================

const RUG = {
  id: "rug",
  x: FLOOR.x + 40,
  y: FLOOR.y + FLOOR.h - 150,
  w: 170,
  h: 110,
};

const DESK = {
  id: "desk",
  x: FLOOR.x + FLOOR.w * 0.5 - 70,
  y: FLOOR.y + FLOOR.h - 150,
  w: 170,
  h: 80,
};

const SHELF = {
  id: "shelf",
  x: ROOM.x + ROOM.w - 190,
  y: ROOM.y + 22,
  w: 170,
  h: WALL_TOP_H - 30,
};

const CLOCK = {
  id: "clock",
  x: ROOM.x + 100,
  y: ROOM.y + 8,
  w: 70,
  h: WALL_TOP_H - 6,
};

const PAINTING = {
  id: "painting",
  x: ROOM.x + 220,
  y: ROOM.y + 34,
  w: 110,
  h: 66,
};

const SAFE = {
  id: "safe",
  x: FLOOR.x + FLOOR.w - 120,
  y: FLOOR.y + FLOOR.h - 120,
  w: 88,
  h: 70,
};

const DOOR = {
  id: "door",
  x: ROOM.x + ROOM.w - 16,
  y: ROOM.y + ROOM.h * 0.5 - 50,
  w: 16,
  h: 100,
};

const WINDOW_ = {
  x: ROOM.x + ROOM.w * 0.5 - 40,
  y: ROOM.y + 34,
  w: 80,
  h: 66,
};

const CHAIR = { id: "chair", x: 340, y: 400, w: 44, h: 56 };
const FIREPLACE = { id: "fireplace", x: 262, y: 472, w: 140, h: 70 };
const GLOBE = { id: "globe", x: 660, y: 168, w: 46, h: 92 };
const COATRACK = { id: "coatrack", x: 862, y: 198, w: 28, h: 112 };
const PLANT = { id: "plant", x: 700, y: 400, w: 40, h: 60 };

const SOLIDS = [
  DESK,
  SHELF,
  CLOCK,
  SAFE,
  CHAIR,
  FIREPLACE,
  GLOBE,
  COATRACK,
];

const FLAVOR = {
  fireplace:
    "The hearth glows a dim, steady green. Something about the light feels artificial.",
  globe:
    "A tarnished globe, spinning slightly at your touch. None of the continents look quite right.",
  chair:
    "A worn leather chair, pulled back as if someone just left it.",
  plant:
    "A wiry fern in a cracked pot. Still alive, somehow, down here.",
  coatrack: "A coat and hat hang untouched, gathering dust.",
};

const INTERACTABLES = [
  { ref: RUG, label: "Rug", range: 70 },
  { ref: DESK, label: "Desk Drawer", range: 75 },
  { ref: SHELF, label: "Bookshelf", range: 75 },
  { ref: CLOCK, label: "Grandfather Clock", range: 70 },
  { ref: PAINTING, label: "Painting", range: 80 },
  { ref: SAFE, label: "Safe", range: 70 },
  { ref: DOOR, label: "Door", range: 60 },
  { ref: FIREPLACE, label: "Fireplace", range: 70 },
  { ref: GLOBE, label: "Globe", range: 60 },
  { ref: CHAIR, label: "Chair", range: 55 },
  { ref: PLANT, label: "Plant", range: 55 },
  { ref: COATRACK, label: "Coat Rack", range: 55 },
];

// ============================================================================
// ENTITY HELPERS
// ============================================================================

/**
 * Gets the center point of a rectangle
 * @param {Object} r - Rectangle {x, y, w, h}
 * @returns {Object} Center point {x, y}
 */
function centerOf(r) {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

/**
 * Finds the nearest interactable to the player
 * @returns {Object|null} Nearest interactable or null
 */
function nearestInteractable() {
  const p = state.player;
  const pc = { x: p.x + p.w / 2, y: p.y + p.h / 2 };
  let best = null,
    bestD = Infinity;
  for (const it of INTERACTABLES) {
    const c = centerOf(it.ref);
    const d = Math.hypot(pc.x - c.x, pc.y - c.y);
    if (d < it.range && d < bestD) {
      bestD = d;
      best = it;
    }
  }
  return best;
}

// ============================================================================
// INPUT HANDLING
// ============================================================================

/**
 * Handles keyboard keydown events
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyDown(e) {
  const k = e.key.toLowerCase();
  if (MOVE_KEYS.includes(k)) e.preventDefault();
  state.keys[k] = true;
  
  if (state.flags.won) return;
  if (e.key === "Escape") {
    state.activePuzzle = null;
  }
  if (k === "e" && !state.activePuzzle) {
    const it = nearestInteractable();
    if (it) handleInteract(it.ref.id);
    else toast("There's nothing to interact with here.");
  }
  if (k === "h") {
    showHint();
  }
  if (k === "n") {
    state.activePuzzle = state.activePuzzle === "notes" ? null : "notes";
  }
}

/**
 * Handles keyboard keyup events
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyUp(e) {
  state.keys[e.key.toLowerCase()] = false;
}

/**
 * Handles canvas click events
 * @param {MouseEvent} e - Mouse event
 */
function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (CW / rect.width);
  const my = (e.clientY - rect.top) * (CH / rect.height);

  if (state.flags.won) {
    for (const h of state.uiHitRegions) {
      if (pointInRect(mx, my, h)) h.onClick();
    }
    return;
  }
  if (state.activePuzzle) {
    for (const h of state.uiHitRegions) {
      if (pointInRect(mx, my, h)) h.onClick();
    }
    return;
  }
  for (const h of state.uiHitRegions) {
    if (h.always && pointInRect(mx, my, h)) {
      h.onClick();
      return;
    }
  }
  for (const it of INTERACTABLES) {
    if (pointInRect(mx, my, it.ref)) {
      const p = state.player;
      const pc = { x: p.x + p.w / 2, y: p.y + p.h / 2 };
      const c = centerOf(it.ref);
      const d = Math.hypot(pc.x - c.x, pc.y - c.y);
      if (d < it.range) handleInteract(it.ref.id);
      else toast("Move closer first.");
      return;
    }
  }
}

// ============================================================================
// INTERACTION LOGIC
// ============================================================================

/**
 * Handles interaction with game objects
 * @param {string} id - Object ID
 */
function handleInteract(id) {
  if (FLAVOR[id]) {
    toast(FLAVOR[id]);
    return;
  }
  switch (id) {
    case "rug":
      if (!state.flags.rugMoved) {
        state.flags.rugMoved = true;
        toast(
          "You pull back the rug and find a note scratched into the floorboard.",
        );
      } else {
        state.activePuzzle = "rug";
      }
      break;
    case "desk":
      state.activePuzzle = "desk";
      break;
    case "shelf":
      state.activePuzzle = "shelf";
      break;
    case "clock":
      state.activePuzzle = "clock";
      break;
    case "painting":
      state.activePuzzle = "painting";
      if (!state.flags.paintingChecked) {
        state.flags.paintingChecked = true;
        state.foundDigits[3] = digits.d4;
      }
      break;
    case "safe":
      state.activePuzzle = "safe";
      break;
    case "door":
      if (state.inventory.includes("Door Key")) {
        state.flags.won = true;
        state.elapsed = (performance.now() - state.startTime) / 1000;
        saveBest(state.elapsed);
      } else {
        toast("The door is locked tight. You need a key.");
      }
      break;
  }
}

/**
 * Shows a contextual hint based on game progress
 */
function showHint() {
  const f = state.flags;
  let msg;
  if (!f.rugMoved)
    msg = "Something feels off about that rug in the corner.";
  else if (!f.drawerOpen)
    msg =
      "The floorboard note showed a sequence of three symbols — match them on the drawer's dials.";
  else if (!f.paintingChecked)
    msg = "That painting hangs crooked. Straighten it.";
  else if (!f.clockSolved)
    msg = "A note from the drawer mentioned an hour. Try setting the clock.";
  else if (!f.bookshelfSolved)
    msg =
      "Sort the books to match the pattern order shown in the painting.";
  else if (!f.boxOpened)
    msg = state.inventory.includes("Brass Key")
      ? "Use the Brass Key on the small box in the bookshelf."
      : "You'll need a key for the locked box on the shelf.";
  else if (!f.safeOpen)
    msg =
      "Enter the four digits you've collected into the safe, in order.";
  else if (!f.won) msg = "The safe held a key. Try the door.";
  else msg = "You've already escaped. Well done.";
  toast("HINT: " + msg);
}

/**
 * Displays a toast message
 * @param {string} msg - Message to display
 */
function toast(msg) {
  state.toast.text = msg;
  state.toast.t = 3.2;
}

// ============================================================================
// MOVEMENT & COLLISION
// ============================================================================

/**
 * Attempts to move the player with collision detection
 * @param {number} dx - X direction (-1 to 1)
 * @param {number} dy - Y direction (-1 to 1)
 * @param {number} dt - Delta time in seconds
 */
function tryMove(dx, dy, dt) {
  const p = state.player;
  const speed = p.speed * dt;
  const nx = { x: p.x + dx * speed, y: p.y, w: p.w, h: p.h };
  const ny = { x: p.x, y: p.y + dy * speed, w: p.w, h: p.h };
  let blockedX = false,
    blockedY = false;
  for (const s of SOLIDS) {
    const pad = 6;
    const sb = {
      x: s.x - pad,
      y: s.y - pad,
      w: s.w + pad * 2,
      h: s.h + pad * 2,
    };
    if (rectsOverlap(nx, sb)) blockedX = true;
    if (rectsOverlap(ny, sb)) blockedY = true;
  }
  if (!blockedX)
    p.x = clamp(nx.x, FLOOR.x + 4, FLOOR.x + FLOOR.w - p.w - 4);
  if (!blockedY)
    p.y = clamp(ny.y, FLOOR.y + 4, FLOOR.y + FLOOR.h - p.h - 4);
}

// ============================================================================
// GAME UPDATE
// ============================================================================

/**
 * Updates game state
 * @param {number} dt - Delta time in seconds
 */
function update(dt) {
  if (state.toast.t > 0) state.toast.t -= dt;
  if (state.flags.won) {
    return;
  }
  const p = state.player;
  if (!state.activePuzzle) {
    let dx = 0,
      dy = 0;
    if (state.keys["w"] || state.keys["arrowup"]) dy = -1;
    if (state.keys["s"] || state.keys["arrowdown"]) dy = 1;
    if (state.keys["a"] || state.keys["arrowleft"]) dx = -1;
    if (state.keys["d"] || state.keys["arrowright"]) dx = 1;
    
    p.moving = dx !== 0 || dy !== 0;
    if (p.moving) {
      const len = Math.hypot(dx, dy) || 1;
      tryMove(dx / len, dy / len, dt);
      if (Math.abs(dx) > Math.abs(dy))
        p.facing = dx > 0 ? "right" : "left";
      else if (dy !== 0) p.facing = dy > 0 ? "down" : "up";
      p.animT += dt * 8;
    }
    state.elapsed = (performance.now() - state.startTime) / 1000;
  }
}

// ============================================================================
// DRAWING FUNCTIONS - ROOM
// ============================================================================

/**
 * Draws the floor with wood plank pattern
 */
function drawFloor() {
  ctx.fillStyle = vgrad(0, FLOOR.y, 0, FLOOR.y + FLOOR.h, [
    [0, "#04220f"],
    [1, "#01130a"],
  ]);
  ctx.fillRect(FLOOR.x, FLOOR.y, FLOOR.w, FLOOR.h);
  const plankW = 42;
  let pi = 0;
  for (let x = FLOOR.x; x < FLOOR.x + FLOOR.w; x += plankW) {
    const pw = Math.min(plankW, FLOOR.x + FLOOR.w - x);
    ctx.fillStyle =
      pi % 2 === 0 ? "rgba(57,255,106,0.045)" : "rgba(0,0,0,0.14)";
    ctx.fillRect(x, FLOOR.y, pw, FLOOR.h);
    ctx.strokeStyle = "rgba(57,255,106,0.07)";
    ctx.lineWidth = 1;
    for (let gy = FLOOR.y + 8; gy < FLOOR.y + FLOOR.h - 6; gy += 17) {
      const n = noise1(pi * 97 + gy * 3.1);
      if (n < 0.55) {
        const gx = x + 4 + n * 10;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx + pw * 0.5 + n * 8, gy + 2 + n * 3);
        ctx.stroke();
      }
    }
    pi++;
  }
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  for (let x = FLOOR.x; x < FLOOR.x + FLOOR.w; x += plankW) {
    ctx.beginPath();
    ctx.moveTo(x, FLOOR.y);
    ctx.lineTo(x, FLOOR.y + FLOOR.h);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  for (let y = FLOOR.y + 26; y < FLOOR.y + FLOOR.h; y += 52) {
    ctx.beginPath();
    for (let x = FLOOR.x; x < FLOOR.x + FLOOR.w; x += plankW * 2) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + plankW, y);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(57,255,106,0.18)";
    for (let x = FLOOR.x + 6; x < FLOOR.x + FLOOR.w; x += plankW * 2) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = vgrad(0, FLOOR.y, 0, FLOOR.y + 26, [
    [0, "rgba(0,0,0,0.3)"],
    [1, "rgba(0,0,0,0)"],
  ]);
  ctx.fillRect(FLOOR.x, FLOOR.y, FLOOR.w, 26);
}

/**
 * Draws the walls with wainscot and window
 */
function drawWalls() {
  const g = vgrad(0, ROOM.y, 0, ROOM.y + WALL_TOP_H, [
    [0, "#0d2a17"],
    [0.7, "#062012"],
    [1, "#03140a"],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(ROOM.x, ROOM.y, ROOM.w, WALL_TOP_H);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(ROOM.x, ROOM.y + WALL_TOP_H - 52, ROOM.w, 4);
  for (let x = ROOM.x + 16; x < ROOM.x + ROOM.w - 16; x += 70) {
    solidBlock(x, ROOM.y + WALL_TOP_H - 46, 54, 34, 3);
  }
  ctx.fillStyle = "rgba(168,255,192,0.10)";
  ctx.fillRect(ROOM.x, ROOM.y, ROOM.w, 3);

  ctx.fillStyle = vgrad(0, FLOOR.y - 18, 0, FLOOR.y, [
    [0, "#0f2c18"],
    [1, "#04140a"],
  ]);
  ctx.fillRect(FLOOR.x - 18, FLOOR.y - 18, FLOOR.w + 36, 18);
  ctx.fillStyle = vgrad(FLOOR.x - 18, 0, FLOOR.x, 0, [
    [0, "#04140a"],
    [1, "#0f2c18"],
  ]);
  ctx.fillRect(FLOOR.x - 18, FLOOR.y - 18, 18, FLOOR.h + 36);
  ctx.fillStyle = vgrad(
    FLOOR.x + FLOOR.w,
    0,
    FLOOR.x + FLOOR.w + 18,
    0,
    [
      [0, "#0f2c18"],
      [1, "#04140a"],
    ],
  );
  ctx.fillRect(FLOOR.x + FLOOR.w, FLOOR.y - 18, 18, FLOOR.h + 36);
  ctx.fillStyle = vgrad(
    0,
    FLOOR.y + FLOOR.h,
    0,
    FLOOR.y + FLOOR.h + 18,
    [
      [0, "#04140a"],
      [1, "#0f2c18"],
    ],
  );
  ctx.fillRect(FLOOR.x - 18, FLOOR.y + FLOOR.h, FLOOR.w + 36, 18);
  ctx.strokeStyle = "rgba(57,255,106,0.22)";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    FLOOR.x - 18,
    FLOOR.y - 18,
    FLOOR.w + 36,
    FLOOR.h + 36,
  );
  ctx.strokeStyle = "rgba(168,255,192,0.15)";
  ctx.strokeRect(
    FLOOR.x - 15,
    FLOOR.y - 15,
    FLOOR.w + 30,
    FLOOR.h + 30,
  );

  const wx = WINDOW_.x,
    wy = WINDOW_.y,
    ww = WINDOW_.w,
    wh = WINDOW_.h;
  ctx.fillStyle = "#040f08";
  ctx.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
  solidBlock(wx - 6, wy - 6, ww + 12, wh + 12, 4);
  ctx.fillStyle = "#01100a";
  ctx.fillRect(wx, wy, ww, wh);
  const sky = rgrad(wx + ww * 0.4, wy + wh * 0.3, 4, ww * 0.9, [
    [0, "rgba(141,255,74,0.30)"],
    [0.6, "rgba(57,255,106,0.10)"],
    [1, "rgba(57,255,106,0.02)"],
  ]);
  ctx.fillStyle = sky;
  ctx.fillRect(wx + 4, wy + 4, ww - 8, wh - 8);
  ctx.fillStyle = "rgba(1,10,4,0.55)";
  ctx.beginPath();
  ctx.moveTo(wx + 4, wy + wh - 14);
  for (let i = 0; i <= 6; i++) {
    const px = wx + 4 + (ww - 8) * (i / 6);
    const py = wy + wh - 14 - (8 + noise1(i * 7.7) * 14);
    ctx.lineTo(px, py);
  }
  ctx.lineTo(wx + ww - 4, wy + wh - 4);
  ctx.lineTo(wx + 4, wy + wh - 4);
  ctx.closePath();
  ctx.fill();
  glow(PALETTE.bright, 5);
  ctx.strokeStyle = PALETTE.bright;
  ctx.lineWidth = 2;
  ctx.strokeRect(wx, wy, ww, wh);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(wx + ww / 2, wy);
  ctx.lineTo(wx + ww / 2, wy + wh);
  ctx.moveTo(wx, wy + wh / 2);
  ctx.lineTo(wx + ww, wy + wh / 2);
  ctx.stroke();
  noGlow();
  solidBlock(wx - 10, wy + wh + 2, ww + 20, 8, 2);
  drawSconce(wx - 34, wy + 16);
  drawSconce(wx + ww + 20, wy + 16);
}

/**
 * Draws a wall sconce with flickering flame
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function drawSconce(x, y) {
  const flick = 0.7 + Math.sin(performance.now() / 260 + x) * 0.15;
  ctx.fillStyle = vgrad(x - 7, y, x + 7, y + 34, [
    [0, "#123a1e"],
    [1, "#07190c"],
  ]);
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 7, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 18);
  ctx.lineTo(x, y + 28);
  ctx.stroke();
  ctx.fillStyle = vgrad(x - 6, y + 26, x + 6, y + 34, [
    [0, "#2f8f52"],
    [1, "#123a1e"],
  ]);
  ctx.beginPath();
  ctx.moveTo(x - 6, y + 26);
  ctx.lineTo(x + 6, y + 26);
  ctx.lineTo(x + 3, y + 34);
  ctx.lineTo(x - 3, y + 34);
  ctx.closePath();
  ctx.fill();
  glow(PALETTE.flame, 14 * flick);
  ctx.fillStyle = "rgba(141,255,74,0.35)";
  ctx.beginPath();
  ctx.moveTo(x, y - 10 * flick);
  ctx.quadraticCurveTo(x + 9, y + 6, x, y + 18);
  ctx.quadraticCurveTo(x - 9, y + 6, x, y - 10 * flick);
  ctx.fill();
  glow(PALETTE.flame, 8 * flick);
  ctx.fillStyle = PALETTE.flame;
  ctx.beginPath();
  ctx.moveTo(x, y - 6 * flick);
  ctx.quadraticCurveTo(x + 5, y + 6, x, y + 15);
  ctx.quadraticCurveTo(x - 5, y + 6, x, y - 6 * flick);
  ctx.fill();
  ctx.fillStyle = "#eaffe8";
  ctx.beginPath();
  ctx.ellipse(x, y + 9, 1.6, 4 * flick, 0, 0, Math.PI * 2);
  ctx.fill();
  noGlow();
}

// ============================================================================
// DRAWING FUNCTIONS - OBJECTS
// ============================================================================

/**
 * Draws the rug with hidden symbol clue
 */
function drawRug() {
  ctx.save();
  const cx = RUG.x + RUG.w / 2,
    cy = RUG.y + RUG.h / 2;
  const offset = state.flags.rugMoved ? 26 : 0;
  ctx.translate(offset * 0.4, offset * 0.2);
  dropShadow(cx, RUG.y + RUG.h - 6, RUG.w * 0.46, 14, 0.25);
  ctx.fillStyle = vgrad(RUG.x, RUG.y, RUG.x, RUG.y + RUG.h, [
    [0, "rgba(21,74,36,0.55)"],
    [1, "rgba(8,32,17,0.6)"],
  ]);
  roundRect(RUG.x, RUG.y, RUG.w, RUG.h, 10);
  ctx.fill();
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = 1.5;
  roundRect(RUG.x, RUG.y, RUG.w, RUG.h, 10);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle =
      i % 2 === 0 ? "rgba(57,255,106,0.22)" : "rgba(168,255,192,0.12)";
    ctx.lineWidth = i === 0 ? 2 : 1.2;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      RUG.w * 0.4 - i * 15,
      RUG.h * 0.4 - i * 11,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(57,255,106,0.3)";
  ctx.lineWidth = 1;
  for (let fx = RUG.x + 6; fx < RUG.x + RUG.w - 4; fx += 7) {
    ctx.beginPath();
    ctx.moveTo(fx, RUG.y);
    ctx.lineTo(fx, RUG.y - 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fx, RUG.y + RUG.h);
    ctx.lineTo(fx, RUG.y + RUG.h + 4);
    ctx.stroke();
  }
  ctx.restore();
  if (state.flags.rugMoved) {
    glow(PALETTE.bright, 6);
    ctx.fillStyle = PALETTE.bright;
    ctx.font = '13px "Courier New", monospace';
    ctx.textAlign = "center";
    ctx.fillText(
      correctSeq.join("  "),
      cx - offset * 0.6 + offset * 0.4,
      RUG.y + RUG.h - 14,
    );
    noGlow();
  }
}

/**
 * Draws the desk with drawer and items
 */
function drawDesk() {
  dropShadow(
    DESK.x + DESK.w / 2,
    DESK.y + DESK.h + 16,
    DESK.w * 0.52,
    10,
    0.3,
  );
  woodLeg(DESK.x + 14, DESK.y + DESK.h - 4, 22, 6, 4);
  woodLeg(DESK.x + DESK.w - 14, DESK.y + DESK.h - 4, 22, 6, 4);
  solidBlock(DESK.x, DESK.y, DESK.w, DESK.h, 6);
  ctx.fillStyle = vgrad(DESK.x, DESK.y, DESK.x + DESK.w, DESK.y + 10, [
    [0, "rgba(168,255,192,0.30)"],
    [1, "rgba(168,255,192,0.02)"],
  ]);
  ctx.fillRect(DESK.x + 4, DESK.y + 3, DESK.w - 8, 7);
  ctx.strokeStyle = "rgba(57,255,106,0.16)";
  ctx.lineWidth = 1;
  for (let gx = DESK.x + 16; gx < DESK.x + DESK.w - 10; gx += 22) {
    ctx.beginPath();
    ctx.moveTo(gx, DESK.y + 3);
    ctx.lineTo(gx + 8, DESK.y + DESK.h - 4);
    ctx.stroke();
  }

  const drX = DESK.x + 18,
    drY = DESK.y + DESK.h - 30,
    drW = DESK.w - 36,
    drH = 20;
  ctx.fillStyle = state.flags.drawerOpen
    ? "rgba(0,0,0,0.5)"
    : "rgba(0,0,0,0.28)";
  ctx.fillRect(drX, drY, drW, drH);
  ctx.strokeStyle = state.flags.drawerOpen ? PALETTE.bright : PALETTE.mid;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(drX, drY, drW, drH);
  ctx.fillStyle = rgrad(drX + drW / 2, drY + drH / 2, 0.5, 4, [
    [0, "#eaffe8"],
    [1, "#2f8f52"],
  ]);
  ctx.beginPath();
  ctx.arc(drX + drW / 2, drY + drH / 2, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = rgrad(DESK.x + 26, DESK.y + 16, 1, 7, [
    [0, "#7dffa0"],
    [1, "#0e3018"],
  ]);
  ctx.beginPath();
  ctx.arc(DESK.x + 26, DESK.y + 16, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(DESK.x + 30, DESK.y + 12);
  ctx.lineTo(DESK.x + 48, DESK.y - 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(DESK.x + 48, DESK.y - 6);
  ctx.lineTo(DESK.x + 44, DESK.y - 2);
  ctx.lineTo(DESK.x + 50, DESK.y - 1);
  ctx.closePath();
  ctx.fillStyle = "rgba(57,255,106,0.5)";
  ctx.fill();

  ctx.save();
  ctx.translate(DESK.x + 78, DESK.y + 16);
  ctx.rotate(-0.08);
  ctx.fillStyle = "rgba(168,255,192,0.10)";
  ctx.strokeStyle = "rgba(57,255,106,0.4)";
  ctx.lineWidth = 1;
  ctx.fillRect(-13, -9, 26, 18);
  ctx.strokeRect(-13, -9, 26, 18);
  ctx.restore();
  ctx.save();
  ctx.translate(DESK.x + 74, DESK.y + 13);
  ctx.rotate(0.05);
  ctx.fillStyle = "rgba(168,255,192,0.14)";
  ctx.strokeStyle = "rgba(57,255,106,0.45)";
  ctx.fillRect(-13, -9, 26, 18);
  ctx.strokeRect(-13, -9, 26, 18);
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    ctx.moveTo(-8, -3 + i * 4);
    ctx.lineTo(6, -3 + i * 4);
  }
  ctx.strokeStyle = "rgba(57,255,106,0.3)";
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = rgrad(DESK.x + DESK.w - 23, DESK.y + 8, 1, 12, [
    [0, "#7dffa0"],
    [1, "#154a24"],
  ]);
  ctx.beginPath();
  ctx.ellipse(
    DESK.x + DESK.w - 23,
    DESK.y + 18,
    10,
    3,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = vgrad(
    DESK.x + DESK.w - 27,
    DESK.y,
    DESK.x + DESK.w - 20,
    DESK.y,
    [
      [0, "#eaffe8"],
      [1, "#2f8f52"],
    ],
  );
  ctx.fillRect(DESK.x + DESK.w - 26, DESK.y + 1, 6, 17);
  const flick = 0.7 + Math.sin(performance.now() / 220) * 0.2;
  glow(PALETTE.flame, 10 * flick);
  ctx.fillStyle = "rgba(141,255,74,0.4)";
  ctx.beginPath();
  ctx.ellipse(
    DESK.x + DESK.w - 23,
    DESK.y - 3,
    5,
    9 * flick,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = PALETTE.flame;
  ctx.beginPath();
  ctx.ellipse(
    DESK.x + DESK.w - 23,
    DESK.y - 4,
    3,
    6 * flick,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  noGlow();
}

/**
 * Draws the bookshelf with patterned books
 */
function drawShelf() {
  solidBlock(SHELF.x, SHELF.y, SHELF.w, SHELF.h, 4);
  const rows = 2;
  for (let r = 1; r < rows; r++) {
    const ry = SHELF.y + r * (SHELF.h / rows);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(SHELF.x + 3, ry - 2, SHELF.w - 6, 3);
    ctx.strokeStyle = "rgba(168,255,192,0.18)";
    ctx.beginPath();
    ctx.moveTo(SHELF.x + 4, ry + 1);
    ctx.lineTo(SHELF.x + SHELF.w - 4, ry + 1);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(SHELF.x, SHELF.y, 6, SHELF.h);
  ctx.fillRect(SHELF.x + SHELF.w - 6, SHELF.y, 6, SHELF.h);

  const bw = (SHELF.w - 24) / 5;
  for (let i = 0; i < 5; i++) {
    const bx = SHELF.x + 12 + i * bw;
    const by = SHELF.y + 10;
    const bh = SHELF.h / rows - 16;
    drawPatternedBook(bx, by, bw - 4, bh, currentOrder[i]);
    if (state.activePuzzle === "shelf" && state.selectedBook === i) {
      glow(PALETTE.bright, 8);
      ctx.strokeStyle = PALETTE.brighter;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx - 2, by - 2, bw, bh + 4);
      noGlow();
      ctx.lineWidth = 1;
    }
  }
  const decorH = SHELF.h / rows - 16;
  const decorY = SHELF.y + SHELF.h / rows + 6;
  for (let i = 0; i < 6; i++) {
    const bx = SHELF.x + 8 + i * ((SHELF.w - 16) / 6);
    const bwv = (SHELF.w - 16) / 6 - 2;
    const lean = (noise1(i * 31) - 0.5) * 0.12;
    const hVar = decorH - noise1(i * 13) * 8;
    ctx.save();
    ctx.translate(bx + bwv / 2, decorY + decorH);
    ctx.rotate(lean);
    ctx.fillStyle = vgrad(0, -hVar, 0, 0, [
      [0, "rgba(57,255,106,0.20)"],
      [1, "rgba(8,30,15,0.5)"],
    ]);
    ctx.fillRect(-bwv / 2, -hVar, bwv, hVar);
    ctx.strokeStyle = "rgba(47,143,82,0.55)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-bwv / 2, -hVar, bwv, hVar);
    ctx.restore();
  }
  const boxX = SHELF.x + SHELF.w - 32,
    boxY = SHELF.y - 16;
  solidBlock(boxX, boxY, 26, 16, 2);
  ctx.strokeStyle = state.flags.boxOpened ? PALETTE.bright : PALETTE.mid;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(boxX + 2, boxY + 2, 22, 5);
  if (!state.flags.boxOpened) {
    ctx.fillStyle = rgrad(boxX + 13, boxY - 2, 0.5, 4, [
      [0, "#eaffe8"],
      [1, "#2f8f52"],
    ]);
    ctx.fillRect(boxX + 11, boxY - 5, 4, 7);
  }
}

/**
 * Draws a book with a pattern
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {string} pattern - Pattern type
 */
function drawPatternedBook(x, y, w, h, pattern) {
  dropShadow(x + w / 2, y + h + 2, w * 0.5, 2, 0.25);
  ctx.fillStyle = vgrad(x, y, x, y + h, [
    [0, "rgba(168,255,192,0.20)"],
    [0.4, "rgba(57,255,106,0.10)"],
    [1, "rgba(0,0,0,0.28)"],
  ]);
  ctx.fillRect(x, y, w, h);
  glow(PALETTE.dim, 3);
  ctx.strokeStyle = PALETTE.bright;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(x, y, w, h);
  noGlow();
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = PALETTE.mid;
  ctx.fillStyle = "rgba(57,255,106,0.4)";
  ctx.lineWidth = 1;
  if (pattern === "solid") {
    ctx.fillStyle = "rgba(57,255,106,0.30)";
    ctx.fillRect(x, y, w, h);
  } else if (pattern === "hatch") {
    for (let i = -h; i < w; i += 6) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i + h, y + h);
      ctx.stroke();
    }
  } else if (pattern === "dots") {
    for (let yy = y + 4; yy < y + h; yy += 6) {
      for (let xx = x + 4; xx < x + w; xx += 6) {
        ctx.beginPath();
        ctx.arc(xx, yy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === "stripe") {
    for (let yy = y + 3; yy < y + h; yy += 5) {
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.lineTo(x + w, yy);
      ctx.stroke();
    }
  } else if (pattern === "cross") {
    for (let i = -h; i < w; i += 7) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i + h, y + h);
      ctx.stroke();
    }
    for (let i = 0; i < w + h; i += 7) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + h);
      ctx.lineTo(x + i - h, y);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = "rgba(1,11,4,0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.18);
  ctx.lineTo(x + w, y + h * 0.18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.82);
  ctx.lineTo(x + w, y + h * 0.82);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = "rgba(168,255,192,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 1);
  ctx.lineTo(x + 1, y + h - 1);
  ctx.stroke();
}

/**
 * Draws the grandfather clock
 */
function drawClock() {
  dropShadow(
    CLOCK.x + CLOCK.w / 2,
    CLOCK.y + CLOCK.h + 4,
    CLOCK.w * 0.4,
    6,
    0.3,
  );
  ctx.fillStyle = vgrad(
    CLOCK.x,
    CLOCK.y,
    CLOCK.x + CLOCK.w,
    CLOCK.y + CLOCK.h,
    [
      [0, "#123a1e"],
      [0.5, "#0b2513"],
      [1, "#07190c"],
    ],
  );
  ctx.beginPath();
  ctx.moveTo(CLOCK.x + 4, CLOCK.y + CLOCK.h);
  ctx.lineTo(CLOCK.x + 4, CLOCK.y + 18);
  ctx.quadraticCurveTo(
    CLOCK.x + CLOCK.w / 2,
    CLOCK.y - 10,
    CLOCK.x + CLOCK.w - 4,
    CLOCK.y + 18,
  );
  ctx.lineTo(CLOCK.x + CLOCK.w - 4, CLOCK.y + CLOCK.h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.strokeStyle = "rgba(168,255,192,0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CLOCK.x + 7, CLOCK.y + CLOCK.h - 2);
  ctx.lineTo(CLOCK.x + 7, CLOCK.y + 20);
  ctx.stroke();

  const fcx = CLOCK.x + CLOCK.w / 2,
    fcy = CLOCK.y + 38,
    r = 24;
  ctx.fillStyle = rgrad(fcx - 6, fcy - 8, 2, r + 4, [
    [0, "#eaffe8"],
    [0.4, "#7dffa0"],
    [1, "#154a24"],
  ]);
  ctx.beginPath();
  ctx.arc(fcx, fcy, r, 0, Math.PI * 2);
  ctx.fill();
  glow(PALETTE.bright, 5);
  ctx.strokeStyle = PALETTE.bright;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(fcx, fcy, r, 0, Math.PI * 2);
  ctx.stroke();
  noGlow();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(
      fcx + Math.cos(a) * (r - 4),
      fcy + Math.sin(a) * (r - 4),
    );
    ctx.lineTo(fcx + Math.cos(a) * r, fcy + Math.sin(a) * r);
    ctx.stroke();
  }
  const ang = ((state.clockHour % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = "#08210f";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(fcx, fcy);
  ctx.lineTo(
    fcx + Math.cos(ang) * r * 0.55,
    fcy + Math.sin(ang) * r * 0.55,
  );
  ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(fcx, fcy);
  ctx.lineTo(
    fcx + Math.cos(ang * 2.9) * r * 0.75,
    fcy + Math.sin(ang * 2.9) * r * 0.75,
  );
  ctx.stroke();
  ctx.fillStyle = "#08210f";
  ctx.beginPath();
  ctx.arc(fcx, fcy, 2, 0, Math.PI * 2);
  ctx.fill();
  if (state.flags.clockSolved) {
    glow(PALETTE.bright, 6);
    ctx.fillStyle = PALETTE.bright;
    ctx.beginPath();
    ctx.arc(fcx, fcy, 3, 0, Math.PI * 2);
    ctx.fill();
    noGlow();
  }
  const winX = CLOCK.x + 10,
    winY = CLOCK.y + 70,
    winW = CLOCK.w - 20,
    winH = CLOCK.h - 80;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(winX, winY, winW, winH);
  ctx.strokeStyle = "rgba(57,255,106,0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(winX, winY, winW, winH);
  const swing = Math.sin(performance.now() / 900) * 0.28;
  ctx.save();
  ctx.translate(winX + winW / 2, winY + 6);
  ctx.rotate(swing);
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, winH - 16);
  ctx.stroke();
  ctx.fillStyle = rgrad(0, winH - 16, 1, 8, [
    [0, "#eaffe8"],
    [1, "#2f8f52"],
  ]);
  ctx.beginPath();
  ctx.arc(0, winH - 14, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.dim;
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws the painting with pattern clue
 */
function drawPainting() {
  ctx.save();
  const rot = state.flags.paintingChecked ? 0 : -0.045;
  ctx.translate(
    PAINTING.x + PAINTING.w / 2,
    PAINTING.y + PAINTING.h / 2,
  );
  ctx.rotate(rot);
  ctx.translate(
    -(PAINTING.x + PAINTING.w / 2),
    -(PAINTING.y + PAINTING.h / 2),
  );
  dropShadow(
    PAINTING.x + PAINTING.w / 2,
    PAINTING.y + PAINTING.h + 10,
    PAINTING.w * 0.5,
    6,
    0.22,
  );
  ctx.strokeStyle = "rgba(57,255,106,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAINTING.x - 2, PAINTING.y - 16);
  ctx.lineTo(PAINTING.x + PAINTING.w / 2, PAINTING.y - 8);
  ctx.lineTo(PAINTING.x + PAINTING.w + 2, PAINTING.y - 16);
  ctx.stroke();
  ctx.fillStyle = vgrad(
    PAINTING.x - 6,
    PAINTING.y - 6,
    PAINTING.x + PAINTING.w + 6,
    PAINTING.y + PAINTING.h + 6,
    [
      [0, "#7dffa0"],
      [0.5, "#2f8f52"],
      [1, "#0e3018"],
    ],
  );
  ctx.fillRect(
    PAINTING.x - 6,
    PAINTING.y - 6,
    PAINTING.w + 12,
    PAINTING.h + 12,
  );
  ctx.fillStyle = "#04140a";
  ctx.fillRect(PAINTING.x, PAINTING.y, PAINTING.w, PAINTING.h);
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 2;
  ctx.strokeRect(
    PAINTING.x - 6,
    PAINTING.y - 6,
    PAINTING.w + 12,
    PAINTING.h + 12,
  );
  ctx.strokeStyle = "rgba(168,255,192,0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    PAINTING.x - 3,
    PAINTING.y - 3,
    PAINTING.w + 6,
    PAINTING.h + 6,
  );
  const bw = PAINTING.w / targetOrder.length;
  for (let i = 0; i < targetOrder.length; i++) {
    drawPatternedBook(
      PAINTING.x + i * bw,
      PAINTING.y,
      bw - 1,
      PAINTING.h,
      targetOrder[i],
    );
  }
  ctx.restore();
}

/**
 * Draws the safe
 */
function drawSafe() {
  dropShadow(
    SAFE.x + SAFE.w / 2,
    SAFE.y + SAFE.h + 6,
    SAFE.w * 0.5,
    8,
    0.32,
  );
  ctx.fillStyle = vgrad(
    SAFE.x,
    SAFE.y,
    SAFE.x + SAFE.w,
    SAFE.y + SAFE.h,
    [
      [0, "#1a4527"],
      [0.5, "#0e2f18"],
      [1, "#07190c"],
    ],
  );
  roundRect(SAFE.x, SAFE.y, SAFE.w, SAFE.h, 6);
  ctx.fill();
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 2;
  roundRect(SAFE.x, SAFE.y, SAFE.w, SAFE.h, 6);
  ctx.stroke();
  ctx.strokeStyle = "rgba(168,255,192,0.25)";
  ctx.lineWidth = 1;
  roundRect(SAFE.x + 3, SAFE.y + 3, SAFE.w - 6, SAFE.h - 6, 4);
  ctx.stroke();
  ctx.fillStyle = "rgba(168,255,192,0.5)";
  for (const [rx, ry] of [
    [SAFE.x + 8, SAFE.y + 8],
    [SAFE.x + SAFE.w - 8, SAFE.y + 8],
    [SAFE.x + 8, SAFE.y + SAFE.h - 8],
    [SAFE.x + SAFE.w - 8, SAFE.y + SAFE.h - 8],
  ]) {
    ctx.beginPath();
    ctx.arc(rx, ry, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = rgrad(
    SAFE.x + SAFE.w / 2 - 4,
    SAFE.y + SAFE.h / 2 - 10,
    2,
    18,
    [
      [0, "#eaffe8"],
      [0.5, "#7dffa0"],
      [1, "#154a24"],
    ],
  );
  ctx.beginPath();
  ctx.arc(
    SAFE.x + SAFE.w / 2,
    SAFE.y + SAFE.h / 2 - 6,
    16,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  glow(PALETTE.bright, 4);
  ctx.strokeStyle = PALETTE.bright;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(
    SAFE.x + SAFE.w / 2,
    SAFE.y + SAFE.h / 2 - 6,
    16,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  noGlow();
  ctx.strokeStyle = "#08210f";
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(
      SAFE.x + SAFE.w / 2 + Math.cos(a) * 10,
      SAFE.y + SAFE.h / 2 - 6 + Math.sin(a) * 10,
    );
    ctx.lineTo(
      SAFE.x + SAFE.w / 2 + Math.cos(a) * 15,
      SAFE.y + SAFE.h / 2 - 6 + Math.sin(a) * 15,
    );
    ctx.stroke();
  }
  ctx.fillStyle = "#08210f";
  ctx.beginPath();
  ctx.arc(
    SAFE.x + SAFE.w / 2,
    SAFE.y + SAFE.h / 2 - 6,
    3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(SAFE.x + 12, SAFE.y + SAFE.h - 16);
  ctx.lineTo(SAFE.x + SAFE.w - 12, SAFE.y + SAFE.h - 16);
  ctx.stroke();
  if (state.flags.safeOpen) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(SAFE.x + 10, SAFE.y + SAFE.h - 22, SAFE.w - 20, 14);
    ctx.strokeStyle = "rgba(57,255,106,0.5)";
    ctx.strokeRect(SAFE.x + 10, SAFE.y + SAFE.h - 22, SAFE.w - 20, 14);
    glow(PALETTE.flame, 6);
    ctx.fillStyle = PALETTE.flame;
    ctx.beginPath();
    ctx.arc(
      SAFE.x + SAFE.w / 2,
      SAFE.y + SAFE.h - 15,
      2.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    noGlow();
  }
}

/**
 * Draws the door
 */
function drawDoor() {
  dropShadow(
    DOOR.x + DOOR.w / 2,
    DOOR.y + DOOR.h + 6,
    DOOR.w * 1.6,
    5,
    0.25,
  );
  ctx.fillStyle = vgrad(
    DOOR.x - 2,
    DOOR.y,
    DOOR.x + DOOR.w + 2,
    DOOR.y + DOOR.h,
    [
      [0, "#123a1e"],
      [0.5, "#0b2513"],
      [1, "#07190c"],
    ],
  );
  ctx.fillRect(DOOR.x - 2, DOOR.y, DOOR.w + 4, DOOR.h);
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(DOOR.x + 2, DOOR.y + 8, DOOR.w - 4, DOOR.h * 0.4);
  ctx.strokeRect(
    DOOR.x + 2,
    DOOR.y + DOOR.h * 0.52,
    DOOR.w - 4,
    DOOR.h * 0.4,
  );
  ctx.strokeStyle = state.flags.won ? "rgba(57,255,106,0.25)" : PALETTE.mid;
  ctx.lineWidth = 2;
  ctx.strokeRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h);
  ctx.fillStyle = rgrad(DOOR.x - 3, DOOR.y + DOOR.h / 2 - 2, 0.5, 3.2, [
    [0, "#eaffe8"],
    [1, "#2f8f52"],
  ]);
  ctx.beginPath();
  ctx.arc(DOOR.x - 3, DOOR.y + DOOR.h / 2, 2.6, 0, Math.PI * 2);
  ctx.fill();
  if (state.inventory.includes("Door Key") && !state.flags.won) {
    glow(PALETTE.bright, 6);
    ctx.fillStyle = PALETTE.bright;
    ctx.beginPath();
    ctx.arc(
      DOOR.x + DOOR.w / 2,
      DOOR.y + DOOR.h / 2,
      2.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    noGlow();
  }
}

/**
 * Draws the fireplace with flickering flames
 */
function drawFireplace() {
  dropShadow(
    FIREPLACE.x + FIREPLACE.w / 2,
    FIREPLACE.y + FIREPLACE.h + 4,
    FIREPLACE.w * 0.55,
    8,
    0.28,
  );
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(FIREPLACE.x, FIREPLACE.y + FIREPLACE.h);
  ctx.lineTo(FIREPLACE.x, FIREPLACE.y + 14);
  ctx.quadraticCurveTo(
    FIREPLACE.x + FIREPLACE.w / 2,
    FIREPLACE.y - 16,
    FIREPLACE.x + FIREPLACE.w,
    FIREPLACE.y + 14,
  );
  ctx.lineTo(FIREPLACE.x + FIREPLACE.w, FIREPLACE.y + FIREPLACE.h);
  ctx.lineTo(FIREPLACE.x, FIREPLACE.y + FIREPLACE.h);
  ctx.closePath();
  ctx.fillStyle = vgrad(
    FIREPLACE.x,
    FIREPLACE.y,
    FIREPLACE.x + FIREPLACE.w,
    FIREPLACE.y + FIREPLACE.h,
    [
      [0, "#123a1e"],
      [1, "#07190c"],
    ],
  );
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  for (
    let by = FIREPLACE.y - 14, row = 0;
    by < FIREPLACE.y + FIREPLACE.h;
    by += 12, row++
  ) {
    const offset = row % 2 === 0 ? 0 : 12;
    for (
      let bx = FIREPLACE.x - 12 + offset;
      bx < FIREPLACE.x + FIREPLACE.w + 12;
      bx += 24
    ) {
      ctx.strokeRect(bx, by, 24, 12);
    }
  }
  ctx.restore();
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(FIREPLACE.x, FIREPLACE.y + FIREPLACE.h);
  ctx.lineTo(FIREPLACE.x, FIREPLACE.y + 14);
  ctx.quadraticCurveTo(
    FIREPLACE.x + FIREPLACE.w / 2,
    FIREPLACE.y - 16,
    FIREPLACE.x + FIREPLACE.w,
    FIREPLACE.y + 14,
  );
  ctx.lineTo(FIREPLACE.x + FIREPLACE.w, FIREPLACE.y + FIREPLACE.h);
  ctx.stroke();
  solidBlock(FIREPLACE.x - 8, FIREPLACE.y - 22, FIREPLACE.w + 16, 9, 2);
  const hx = FIREPLACE.x + 18,
    hy = FIREPLACE.y + 26,
    hw = FIREPLACE.w - 36,
    hh = FIREPLACE.h - 26;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(hx, hy, hw, hh);
  ctx.strokeStyle = "rgba(57,255,106,0.3)";
  ctx.strokeRect(hx, hy, hw, hh);
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(hx + 8, hy + hh);
  ctx.lineTo(hx + 8, hy + hh - 16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hx + hw - 8, hy + hh);
  ctx.lineTo(hx + hw - 8, hy + hh - 16);
  ctx.stroke();
  ctx.fillStyle = "rgba(141,255,74,0.25)";
  ctx.fillRect(hx + 6, hy + hh - 6, hw - 12, 4);
  const t = performance.now() / 500;
  const flick = 0.85 + Math.sin(t) * 0.1 + Math.sin(t * 2.3) * 0.05;
  glow(PALETTE.flame, 20 * flick);
  ctx.fillStyle = "rgba(141,255,74,0.30)";
  ctx.beginPath();
  ctx.ellipse(
    hx + hw / 2,
    hy + hh - hh * 0.4,
    hw * 0.42,
    hh * 0.5 * flick,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const fx = hx + hw / 2 + (i - 1) * 14;
    const fh = (hh - 10) * flick * (i === 1 ? 1 : 0.75);
    ctx.fillStyle = i === 1 ? "#eaffe8" : PALETTE.flame;
    ctx.beginPath();
    ctx.moveTo(fx, hy + hh - 4);
    ctx.quadraticCurveTo(fx + 10, hy + hh - fh * 0.6, fx, hy + hh - fh);
    ctx.quadraticCurveTo(fx - 10, hy + hh - fh * 0.6, fx, hy + hh - 4);
    ctx.fill();
  }
  noGlow();
}

/**
 * Draws the globe with rotating continents
 */
function drawGlobe() {
  const cx = GLOBE.x + GLOBE.w / 2;
  dropShadow(cx, GLOBE.y + GLOBE.h + 3, 16, 5, 0.3);
  woodLeg(cx - 14, GLOBE.y + GLOBE.h - 4, 4, 3, 5);
  woodLeg(cx + 14, GLOBE.y + GLOBE.h - 4, 4, 3, 5);
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 16, GLOBE.y + GLOBE.h);
  ctx.lineTo(cx + 16, GLOBE.y + GLOBE.h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, GLOBE.y + GLOBE.h);
  ctx.lineTo(cx, GLOBE.y + GLOBE.h - 24);
  ctx.stroke();

  const r = 22,
    sy = GLOBE.y + GLOBE.h - 24 - r;
  ctx.fillStyle = rgrad(cx - r * 0.4, sy - r * 0.4, 1, r * 1.6, [
    [0, "#c8ffd8"],
    [0.35, "#7dffa0"],
    [0.7, "#2f8f52"],
    [1, "#0a2312"],
  ]);
  ctx.beginPath();
  ctx.arc(cx, sy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, sy, r, 0, Math.PI * 2);
  ctx.clip();
  const spin = performance.now() / 4000;
  ctx.fillStyle = "rgba(8,33,18,0.6)";
  const blobs = [
    [-0.5, -0.3, 9],
    [0.3, -0.1, 7],
    [-0.1, 0.35, 6],
    [0.6, 0.3, 5],
  ];
  for (const [bx, by, br] of blobs) {
    const a = Math.cos(spin);
    ctx.beginPath();
    ctx.ellipse(
      cx + bx * r * a,
      sy + by * r,
      br * Math.abs(a) + 1,
      br * 0.7,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(8,33,18,0.4)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const a = spin + (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      sy,
      r * Math.abs(Math.cos(a)) + 0.5,
      r,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx - r, sy);
  ctx.lineTo(cx + r, sy);
  ctx.stroke();
  ctx.restore();
  glow(PALETTE.bright, 3);
  ctx.strokeStyle = "rgba(57,255,106,0.6)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(cx, sy, r, 0, Math.PI * 2);
  ctx.stroke();
  noGlow();
  ctx.fillStyle = "rgba(234,255,232,0.7)";
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.4, sy - r * 0.45, 3, 5, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(168,255,192,0.4)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(cx, sy, r + 3, r * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Draws the chair
 */
function drawChair() {
  dropShadow(
    CHAIR.x + CHAIR.w / 2,
    CHAIR.y + CHAIR.h + 12,
    CHAIR.w * 0.55,
    7,
    0.28,
  );
  woodLeg(CHAIR.x + 8, CHAIR.y + CHAIR.h - 6, 16, 3, 2.2);
  woodLeg(CHAIR.x + CHAIR.w - 8, CHAIR.y + CHAIR.h - 6, 16, 3, 2.2);
  ctx.fillStyle = vgrad(
    CHAIR.x,
    CHAIR.y + 18,
    CHAIR.x,
    CHAIR.y + CHAIR.h - 6,
    [
      [0, "#1a4527"],
      [1, "#0a2312"],
    ],
  );
  roundRect(CHAIR.x + 6, CHAIR.y + 18, CHAIR.w - 12, CHAIR.h - 24, 4);
  ctx.fill();
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 1.6;
  roundRect(CHAIR.x + 6, CHAIR.y + 18, CHAIR.w - 12, CHAIR.h - 24, 4);
  ctx.stroke();
  ctx.fillStyle = vgrad(CHAIR.x, CHAIR.y, CHAIR.x + CHAIR.w, CHAIR.y, [
    [0, "#0e3018"],
    [0.5, "#1a4527"],
    [1, "#0e3018"],
  ]);
  roundRect(CHAIR.x + 6, CHAIR.y, CHAIR.w - 12, 20, 5);
  ctx.fill();
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 1.6;
  roundRect(CHAIR.x + 6, CHAIR.y, CHAIR.w - 12, 20, 5);
  ctx.stroke();
  ctx.fillStyle = "rgba(8,33,18,0.6)";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(
      CHAIR.x + 13 + (i * (CHAIR.w - 26)) / 2,
      CHAIR.y + 10,
      1.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CHAIR.x + 3, CHAIR.y + 20);
  ctx.lineTo(CHAIR.x + 3, CHAIR.y + 34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(CHAIR.x + CHAIR.w - 3, CHAIR.y + 20);
  ctx.lineTo(CHAIR.x + CHAIR.w - 3, CHAIR.y + 34);
  ctx.stroke();
}

/**
 * Draws the plant
 */
function drawPlant() {
  dropShadow(
    PLANT.x + PLANT.w / 2,
    PLANT.y + PLANT.h + 3,
    PLANT.w * 0.5,
    5,
    0.28,
  );
  ctx.fillStyle = vgrad(
    PLANT.x,
    PLANT.y + PLANT.h - 24,
    PLANT.x,
    PLANT.y + PLANT.h,
    [
      [0, "#1a4527"],
      [1, "#07190c"],
    ],
  );
  ctx.beginPath();
  ctx.moveTo(PLANT.x + 8, PLANT.y + PLANT.h);
  ctx.lineTo(PLANT.x + 4, PLANT.y + PLANT.h - 24);
  ctx.lineTo(PLANT.x + PLANT.w - 4, PLANT.y + PLANT.h - 24);
  ctx.lineTo(PLANT.x + PLANT.w - 8, PLANT.y + PLANT.h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.mid;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "rgba(168,255,192,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PLANT.x + 5, PLANT.y + PLANT.h - 23);
  ctx.lineTo(PLANT.x + PLANT.w - 5, PLANT.y + PLANT.h - 23);
  ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.ellipse(
    PLANT.x + PLANT.w / 2,
    PLANT.y + PLANT.h - 24,
    PLANT.w / 2 - 5,
    3,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  const cx = PLANT.x + PLANT.w / 2,
    by = PLANT.y + PLANT.h - 24;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.34;
    const len = 24 + Math.abs(i - 3) * -2 + noise1(i * 5) * 4;
    const front = i >= 2 && i <= 4;
    ctx.strokeStyle = front
      ? "rgba(125,255,160,0.75)"
      : "rgba(47,143,82,0.55)";
    ctx.lineWidth = front ? 2 : 1.4;
    const tipx = cx + Math.cos(a) * 10,
      tipy = by - 30 - Math.abs(i - 3) * 2;
    ctx.beginPath();
    ctx.moveTo(cx, by);
    ctx.quadraticCurveTo(
      cx + Math.cos(a) * 14,
      by - len * 0.7,
      tipx,
      tipy,
    );
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let s = 0.3; s < 0.9; s += 0.25) {
      const sxm = cx + (tipx - cx) * s,
        sym = by + (tipy - by) * s;
      ctx.beginPath();
      ctx.moveTo(sxm, sym);
      ctx.lineTo(sxm + 5, sym - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sxm, sym);
      ctx.lineTo(sxm - 5, sym - 2);
      ctx.stroke();
    }
  }
}

/**
 * Draws the coat rack
 */
function drawCoatRack() {
  dropShadow(
    COATRACK.x + COATRACK.w / 2,
    COATRACK.y + COATRACK.h + 3,
    12,
    4,
    0.25,
  );
  const cx = COATRACK.x + COATRACK.w / 2;
  ctx.fillStyle = vgrad(cx - 3, 0, cx + 3, 0, [
    [0, "#0a2312"],
    [0.5, "#2f8f52"],
    [1, "#08200f"],
  ]);
  ctx.fillRect(cx - 3, COATRACK.y + 6, 6, COATRACK.h - 6);
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 3, COATRACK.y + 6, 6, COATRACK.h - 6);
  ctx.fillStyle = rgrad(cx - 1.5, COATRACK.y + 2, 0.5, 5, [
    [0, "#eaffe8"],
    [1, "#2f8f52"],
  ]);
  ctx.beginPath();
  ctx.arc(cx, COATRACK.y + 4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.dim;
  ctx.stroke();
  for (let i = 0; i < 2; i++) {
    ctx.strokeStyle = PALETTE.mid;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx, COATRACK.y + 18 + i * 10);
    ctx.lineTo(cx + (i === 0 ? -11 : 11), COATRACK.y + 24 + i * 10);
    ctx.stroke();
  }
  ctx.fillStyle = vgrad(
    cx - 15,
    COATRACK.y + 28,
    cx + 15,
    COATRACK.y + 28,
    [
      [0, "#0a2312"],
      [0.5, "#1a4527"],
      [1, "#08200f"],
    ],
  );
  ctx.beginPath();
  ctx.moveTo(cx - 3, COATRACK.y + 28);
  ctx.lineTo(cx - 15, COATRACK.y + 34);
  ctx.lineTo(cx - 12, COATRACK.y + 50);
  ctx.lineTo(cx - 13, COATRACK.y + 72);
  ctx.lineTo(cx + 13, COATRACK.y + 72);
  ctx.lineTo(cx + 12, COATRACK.y + 50);
  ctx.lineTo(cx + 15, COATRACK.y + 34);
  ctx.lineTo(cx + 3, COATRACK.y + 28);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(57,255,106,0.4)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, COATRACK.y + 30);
  ctx.lineTo(cx, COATRACK.y + 70);
  ctx.stroke();
  ctx.fillStyle = vgrad(
    cx - 13,
    COATRACK.y + 14,
    cx + 13,
    COATRACK.y + 22,
    [
      [0, "#154a24"],
      [1, "#0a2312"],
    ],
  );
  ctx.beginPath();
  ctx.ellipse(cx - 11, COATRACK.y + 18, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(57,255,106,0.4)";
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx - 11, COATRACK.y + 14, 7, 6, 0, Math.PI, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// DRAWING FUNCTIONS - PLAYER
// ============================================================================

/**
 * Draws the player character
 */
function drawPlayer() {
  const p = state.player;
  const bob = p.moving ? Math.sin(p.animT) * 2 : 0;
  const stride = p.moving ? Math.sin(p.animT) : 0;
  const cx = p.x + p.w / 2,
    cy = p.y + p.h / 2 + bob;
  let ex = 0,
    ey = 0;
  if (p.facing === "down") {
    ex = 0;
    ey = 1;
  }
  if (p.facing === "up") {
    ex = 0;
    ey = -1;
  }
  if (p.facing === "left") {
    ex = -1;
    ey = 0;
  }
  if (p.facing === "right") {
    ex = 1;
    ey = 0;
  }

  dropShadow(cx, cy + 17, 12, 4, 0.35);

  ctx.strokeStyle = "#08210f";
  ctx.lineCap = "round";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy + 9);
  ctx.lineTo(cx - 5 + stride * 4, cy + 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 5, cy + 9);
  ctx.lineTo(cx + 5 - stride * 4, cy + 18);
  ctx.stroke();

  ctx.fillStyle = vgrad(cx - 12, cy - 2, cx + 12, cy + 13, [
    [0, "rgba(168,255,192,0.5)"],
    [0.5, "rgba(57,255,106,0.55)"],
    [1, "rgba(10,35,18,0.9)"],
  ]);
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 4);
  ctx.lineTo(cx + 7, cy - 4);
  ctx.lineTo(cx + 11 + ex * 2, cy + 13);
  ctx.lineTo(cx - 11 + ex * 2, cy + 13);
  ctx.closePath();
  ctx.fill();
  glow(PALETTE.bright, 6);
  ctx.strokeStyle = PALETTE.bright;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  noGlow();
  ctx.strokeStyle = "rgba(8,33,18,0.7)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx - 8 + ex, cy + 4);
  ctx.lineTo(cx + 8 + ex, cy + 4);
  ctx.stroke();

  ctx.strokeStyle = "rgba(57,255,106,0.65)";
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy - 2);
  ctx.lineTo(cx - 11 - stride * 3, cy + 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 9, cy - 2);
  ctx.lineTo(cx + 11 + stride * 3, cy + 8);
  ctx.stroke();

  ctx.fillStyle = rgrad(cx - 3, cy - 16, 1, 9, [
    [0, "#eaffe8"],
    [0.4, "#7dffa0"],
    [1, "#154a24"],
  ]);
  ctx.beginPath();
  ctx.arc(cx, cy - 13, 7, 0, Math.PI * 2);
  ctx.fill();
  glow(PALETTE.bright, 5);
  ctx.strokeStyle = PALETTE.bright;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy - 13, 7, 0, Math.PI * 2);
  ctx.stroke();
  noGlow();

  if (p.facing === "up") {
    ctx.fillStyle = "rgba(10,35,18,0.65)";
    ctx.beginPath();
    ctx.arc(cx, cy - 14, 6, Math.PI * 0.15, Math.PI * 0.85);
    ctx.fill();
  } else if (p.facing === "down") {
    ctx.fillStyle = "#08210f";
    ctx.beginPath();
    ctx.arc(cx - 2.4, cy - 14, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 2.4, cy - 14, 0.9, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#08210f";
    ctx.beginPath();
    ctx.arc(cx + ex * 3.5, cy - 14, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(8,33,18,0.55)";
  ctx.beginPath();
  ctx.arc(cx, cy - 17, 6.4, Math.PI, Math.PI * 2);
  ctx.fill();

  if (p.facing === "left" || p.facing === "right") {
    ctx.fillStyle = "rgba(10,35,18,0.6)";
    roundRect(cx - ex * 13 - 3, cy + 1, 6, 7, 1.4);
    ctx.fill();
    ctx.strokeStyle = "rgba(57,255,106,0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.lineCap = "butt";
}

// ============================================================================
// DRAWING FUNCTIONS - UI
// ============================================================================

/**
 * Draws the interaction prompt above nearby objects
 */
function drawPrompt() {
  if (state.activePuzzle || state.flags.won) return;
  const it = nearestInteractable();
  if (!it) return;
  const c = centerOf(it.ref);
  const px = c.x,
    py = it.ref.y - 14;
  ctx.font = '11px "Courier New", monospace';
  ctx.textAlign = "center";
  const label = "[E] " + it.label;
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = "rgba(1,10,4,0.85)";
  roundRect(px - tw / 2 - 8, py - 14, tw + 16, 20, 3);
  ctx.fill();
  ctx.strokeStyle = PALETTE.bright;
  ctx.lineWidth = 1;
  roundRect(px - tw / 2 - 8, py - 14, tw + 16, 20, 3);
  ctx.stroke();
  glow(PALETTE.bright, 4);
  ctx.fillStyle = PALETTE.brighter;
  ctx.fillText(label, px, py);
  noGlow();
}

/**
 * Draws the HUD with digits, timer, and hint button
 */
function drawHUD() {
  const chipY = 8;
  for (let i = 0; i < 4; i++) {
    const x = 8 + i * 30;
    ctx.fillStyle = "rgba(1,10,4,0.8)";
    roundRect(x, chipY, 24, 24, 4);
    ctx.fill();
    ctx.strokeStyle = PALETTE.bright;
    ctx.strokeRect(x, chipY, 24, 24);
    ctx.fillStyle = PALETTE.brighter;
    ctx.font = '13px "Courier New", monospace';
    ctx.textAlign = "center";
    ctx.fillText(
      state.foundDigits[i] === null
        ? "?"
        : String(state.foundDigits[i]),
      x + 12,
      chipY + 17,
    );
  }
  const mins = Math.floor(state.elapsed / 60);
  const secs = Math.floor(state.elapsed % 60);
  const timeStr =
    (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
  ctx.font = '13px "Courier New", monospace';
  ctx.textAlign = "right";
  ctx.fillStyle = PALETTE.bright;
  ctx.fillText("T " + timeStr, CW - 10, 26);
  if (state.bestTime !== null) {
    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = PALETTE.mid;
    ctx.fillText(
      "best " + Math.floor(state.bestTime) + "s",
      CW - 10,
      40,
    );
  }
  const hb = {
    x: CW - 76,
    y: CH - 34,
    w: 66,
    h: 24,
    always: true,
    onClick: showHint,
  };
  state.uiHitRegions.push(hb);
  ctx.fillStyle = "rgba(1,10,4,0.85)";
  roundRect(hb.x, hb.y, hb.w, hb.h, 5);
  ctx.fill();
  ctx.strokeStyle = PALETTE.bright;
  ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = '12px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.fillText("[H]INT", hb.x + hb.w / 2, hb.y + 16);
  
  // Add notes button
  const nb = {
    x: CW - 156,
    y: CH - 34,
    w: 66,
    h: 24,
    always: true,
    onClick: () => {
      state.activePuzzle = state.activePuzzle === "notes" ? null : "notes";
    },
  };
  state.uiHitRegions.push(nb);
  ctx.fillStyle = "rgba(1,10,4,0.85)";
  roundRect(nb.x, nb.y, nb.w, nb.h, 5);
  ctx.fill();
  ctx.strokeStyle = PALETTE.bright;
  ctx.strokeRect(nb.x, nb.y, nb.w, nb.h);
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = '12px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.fillText("[N]OTES", nb.x + nb.w / 2, nb.y + 16);
}

/**
 * Draws the toast message
 */
function drawToast() {
  if (state.toast.t <= 0) return;
  ctx.globalAlpha = clamp(state.toast.t, 0, 1);
  ctx.font = '12px "Courier New", monospace';
  ctx.textAlign = "center";
  const tw = ctx.measureText(state.toast.text).width;
  const x = CW / 2,
    y = CH - 52;
  ctx.fillStyle = "rgba(1,8,3,0.9)";
  roundRect(x - tw / 2 - 14, y - 16, tw + 28, 28, 5);
  ctx.fill();
  ctx.strokeStyle = PALETTE.bright;
  ctx.strokeRect(x - tw / 2 - 14, y - 16, tw + 28, 28);
  ctx.fillStyle = PALETTE.brighter;
  ctx.fillText(state.toast.text, x, y + 2);
  ctx.globalAlpha = 1;
}

// ============================================================================
// PUZZLE PANELS
// ============================================================================

/**
 * Draws a semi-transparent overlay
 */
function overlay() {
  ctx.fillStyle = "rgba(0,4,1,0.72)";
  ctx.fillRect(0, 0, CW, CH);
}

/**
 * Draws a modal panel with title and close button
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {string} title - Panel title
 * @returns {Object} Panel position {x, y}
 */
function panel(w, h, title) {
  const x = CW / 2 - w / 2,
    y = CH / 2 - h / 2;
  ctx.fillStyle = PALETTE.panel;
  roundRect(x, y, w, h, 8);
  ctx.fill();
  glow(PALETTE.bright, 4);
  ctx.strokeStyle = PALETTE.panelBorder;
  ctx.lineWidth = 2;
  roundRect(x, y, w, h, 8);
  ctx.stroke();
  noGlow();
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.fillText("> " + title, x + w / 2, y + 30);
  const cb = {
    x: x + w - 30,
    y: y + 8,
    w: 22,
    h: 22,
    onClick: () => {
      state.activePuzzle = null;
    },
  };
  state.uiHitRegions.push(cb);
  ctx.strokeStyle = PALETTE.bright;
  ctx.strokeRect(cb.x, cb.y, cb.w, cb.h);
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = '14px "Courier New", monospace';
  ctx.fillText("X", cb.x + 11, cb.y + 16);
  return { x, y };
}

/**
 * Draws a clickable button
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {string} label - Button label
 * @param {Function} onClick - Click handler
 * @param {boolean} enabled - Whether button is enabled
 */
function drawButton(x, y, w, h, label, onClick, enabled) {
  enabled = enabled === undefined ? true : enabled;
  ctx.fillStyle = enabled
    ? "rgba(57,255,106,0.12)"
    : "rgba(60,60,60,0.1)";
  roundRect(x, y, w, h, 5);
  ctx.fill();
  ctx.strokeStyle = enabled ? PALETTE.bright : "#2a2a2a";
  roundRect(x, y, w, h, 5);
  ctx.stroke();
  ctx.fillStyle = enabled ? PALETTE.brighter : "#555";
  ctx.font = '13px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.fillText(label, x + w / 2, y + h / 2 + 4);
  if (enabled) state.uiHitRegions.push({ x, y, w, h, onClick });
}

/**
 * Draws the rug puzzle panel
 */
function drawRugPanel() {
  overlay();
  const { x, y } = panel(340, 200, "TORN NOTE");
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = '13px "Courier New", monospace';
  ctx.textAlign = "center";
  wrapText(
    "Scratched beneath the rug, three symbols are etched into the wood — a code for something in this room.",
    x + 170,
    y + 62,
    290,
    18,
  );
  glow(PALETTE.bright, 5);
  ctx.font = '28px "Courier New", monospace';
  ctx.fillText(correctSeq.join("   "), x + 170, y + 150);
  noGlow();
}

/**
 * Draws the desk drawer puzzle panel
 */
function drawDeskPanel() {
  overlay();
  const { x, y } = panel(380, 260, "DESK DRAWER");
  ctx.textAlign = "center";
  if (!state.flags.rugMoved) {
    ctx.fillStyle = PALETTE.brighter;
    ctx.font = '13px "Courier New", monospace';
    wrapText(
      "The drawer is fitted with a three-symbol lock. There must be a clue somewhere in the room.",
      x + 190,
      y + 90,
      300,
      18,
    );
    return;
  }
  if (state.flags.drawerOpen) {
    ctx.fillStyle = PALETTE.brighter;
    ctx.font = '13px "Courier New", monospace';
    wrapText(
      "The drawer sits open. Inside was a Brass Key and a note about a clock and an eclipse hour.",
      x + 190,
      y + 70,
      320,
      18,
    );
    return;
  }
  const dw = 90;
  for (let i = 0; i < 3; i++) {
    const dx = x + 40 + i * dw + dw / 2;
    const dy = y + 120;
    drawButton(dx - 16, dy - 58, 32, 26, "\u25B2", () => {
      state.dialValues[i] = (state.dialValues[i] + 1) % SYMBOLS.length;
    });
    glow(PALETTE.bright, 4);
    ctx.fillStyle = PALETTE.brighter;
    ctx.font = '26px "Courier New", monospace';
    ctx.textAlign = "center";
    ctx.fillText(SYMBOLS[state.dialValues[i]], dx, dy + 10);
    noGlow();
    drawButton(dx - 16, dy + 26, 32, 26, "\u25BC", () => {
      state.dialValues[i] =
        (state.dialValues[i] - 1 + SYMBOLS.length) % SYMBOLS.length;
    });
  }
  drawButton(x + 190 - 55, y + 260 - 56, 110, 30, "UNLOCK", () => {
    const cur = state.dialValues.map((i) => SYMBOLS[i]);
    if (cur.join() === correctSeq.join()) {
      state.flags.drawerOpen = true;
      state.inventory.push("Brass Key");
      toast("The drawer clicks open — you found a Brass Key.");
    } else {
      toast("The lock resists. Wrong combination.");
    }
  });
}

/**
 * Draws the clock puzzle panel
 */
function drawClockPanel() {
  overlay();
  const { x, y } = panel(360, 240, "GRANDFATHER CLOCK");
  ctx.textAlign = "center";
  if (!state.flags.drawerOpen) {
    ctx.fillStyle = PALETTE.brighter;
    ctx.font = '13px "Courier New", monospace';
    wrapText(
      "The hands are rusted stuck. Something in the desk might loosen them.",
      x + 180,
      y + 90,
      290,
      18,
    );
    return;
  }
  if (state.flags.clockSolved) {
    ctx.fillStyle = PALETTE.brighter;
    ctx.font = '13px "Courier New", monospace';
    wrapText(
      "The hour clicks into place and a small panel springs open, revealing a numeral inside.",
      x + 180,
      y + 70,
      300,
      18,
    );
    glow(PALETTE.bright, 5);
    ctx.font = '24px "Courier New", monospace';
    ctx.fillText(String(digits.d1), x + 180, y + 120);
    noGlow();
    ctx.font = '12px "Courier New", monospace';
    ctx.fillStyle = PALETTE.mid;
    ctx.fillText("(Digit I for the safe)", x + 180, y + 150);
    return;
  }
  glow(PALETTE.bright, 4);
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = '32px "Courier New", monospace';
  ctx.fillText(String(state.clockHour), x + 180, y + 120);
  noGlow();
  drawButton(x + 80, y + 96, 34, 30, "\u25C0", () => {
    state.clockHour = state.clockHour === 1 ? 12 : state.clockHour - 1;
  });
  drawButton(x + 246, y + 96, 34, 30, "\u25B6", () => {
    state.clockHour = state.clockHour === 12 ? 1 : state.clockHour + 1;
  });
  drawButton(x + 180 - 55, y + 240 - 56, 110, 30, "SET HOUR", () => {
    if (state.clockHour === clockClueHour) {
      state.flags.clockSolved = true;
      state.foundDigits[0] = digits.d1;
      toast("The clock chimes — a hidden panel opens.");
    } else {
      toast("Nothing happens.");
    }
  });
}

/**
 * Draws the painting puzzle panel
 */
function drawPaintingPanel() {
  overlay();
  const { x, y } = panel(380, 260, "A CROOKED PAINTING");
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = '13px "Courier New", monospace';
  ctx.textAlign = "center";
  wrapText(
    "You straighten the frame. A small brass plaque is set into the bottom edge.",
    x + 190,
    y + 58,
    310,
    18,
  );
  glow(PALETTE.bright, 4);
  ctx.font = '22px "Courier New", monospace';
  ctx.fillText(
    "NUMERAL " + romanNumeral(digits.d4) + " = " + digits.d4,
    x + 190,
    y + 96,
  );
  noGlow();
  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = PALETTE.mid;
  ctx.fillText("(Digit IV for the safe)", x + 190, y + 125);
  const bw = 260 / targetOrder.length;
  for (let i = 0; i < targetOrder.length; i++) {
    drawPatternedBook(
      x + 60 + i * bw,
      y + 118,
      bw - 3,
      34,
      targetOrder[i],
    );
  }
  ctx.fillStyle = PALETTE.mid;
  ctx.font = '9px "Courier New", monospace';
  for (let i = 0; i < targetOrder.length; i++) {
    ctx.fillText(
      PATTERN_LABEL[targetOrder[i]],
      x + 60 + i * bw + bw / 2 - 2,
      y + 166,
    );
  }
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText(
    "This band of patterns matches something else in the room.",
    x + 190,
    y + 192,
  );
}

/**
 * Draws the bookshelf puzzle panel
 */
function drawShelfPanel() {
  overlay();
  const { x, y } = panel(420, 300, "BOOKSHELF");
  ctx.textAlign = "center";
  if (state.flags.bookshelfSolved) {
    ctx.fillStyle = PALETTE.brighter;
    ctx.font = '13px "Courier New", monospace';
    wrapText(
      "The books click into place and a small drawer pops out from beneath the shelf.",
      x + 210,
      y + 70,
      330,
      18,
    );
    glow(PALETTE.bright, 5);
    ctx.font = '24px "Courier New", monospace';
    ctx.fillText(String(digits.d2), x + 210, y + 120);
    noGlow();
    ctx.font = '12px "Courier New", monospace';
    ctx.fillStyle = PALETTE.mid;
    ctx.fillText("(Digit II for the safe)", x + 210, y + 150);
    if (
      !state.flags.boxOpened &&
      state.inventory.includes("Brass Key")
    ) {
      drawButton(
        x + 210 - 90,
        y + 300 - 56,
        180,
        30,
        "OPEN LOCKED BOX",
        () => {
          state.flags.boxOpened = true;
          state.foundDigits[2] = digits.d3;
          toast(
            "Inside the box: a slip reading digit III = " + digits.d3,
          );
        },
      );
    }
    return;
  }
  ctx.fillStyle = PALETTE.mid;
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText(
    "Click two books to swap them.",
    x + 210,
    y + 52,
  );
  const bw = 62,
    bh = 92,
    startX = x + 210 - (bw * 5) / 2,
    by = y + 72;
  for (let i = 0; i < 5; i++) {
    const bx = startX + i * bw;
    drawPatternedBook(bx + 4, by, bw - 10, bh, currentOrder[i]);
    if (state.selectedBook === i) {
      glow(PALETTE.bright, 8);
      ctx.strokeStyle = PALETTE.brighter;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 2, by - 2, bw - 6, bh + 4);
      noGlow();
      ctx.lineWidth = 1;
    }
    state.uiHitRegions.push({
      x: bx + 4,
      y: by,
      w: bw - 10,
      h: bh,
      onClick: () => {
        if (state.selectedBook === -1) {
          state.selectedBook = i;
        } else if (state.selectedBook === i) {
          state.selectedBook = -1;
        } else {
          const tmp = currentOrder[i];
          currentOrder[i] = currentOrder[state.selectedBook];
          currentOrder[state.selectedBook] = tmp;
          state.selectedBook = -1;
          if (currentOrder.join() === targetOrder.join()) {
            state.flags.bookshelfSolved = true;
            state.foundDigits[1] = digits.d2;
            toast("The books lock into place with a click!");
          }
        }
      },
    });
  }
  if (!state.flags.boxOpened && state.inventory.includes("Brass Key")) {
    drawButton(
      x + 420 - 160,
      y + 300 - 52,
      140,
      26,
      "OPEN LOCKED BOX",
      () => {
        state.flags.boxOpened = true;
        state.foundDigits[2] = digits.d3;
        toast(
          "Inside the box: a slip reading digit III = " + digits.d3,
        );
      },
    );
  }
}

/**
 * Draws the safe puzzle panel
 */
function drawSafePanel() {
  overlay();
  const { x, y } = panel(380, 300, "THE SAFE");
  ctx.textAlign = "center";
  if (state.flags.safeOpen) {
    ctx.fillStyle = PALETTE.brighter;
    ctx.font = '13px "Courier New", monospace';
    wrapText(
      "The dial clicks through and the safe swings open. Inside is a Door Key.",
      x + 190,
      y + 90,
      300,
      18,
    );
    return;
  }
  ctx.fillStyle = PALETTE.mid;
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText(
    "Enter the four digits you have discovered, in order I -> IV",
    x + 190,
    y + 52,
  );
  const dw = 78;
  for (let i = 0; i < 4; i++) {
    const dx = x + 30 + i * dw + dw / 2,
      dy = y + 120;
    drawButton(dx - 16, dy - 52, 32, 24, "\u25B2", () => {
      state.safeDials[i] = (state.safeDials[i] + 1) % 10;
    });
    glow(PALETTE.bright, 4);
    ctx.fillStyle = PALETTE.brighter;
    ctx.font = '24px "Courier New", monospace';
    ctx.textAlign = "center";
    ctx.fillText(String(state.safeDials[i]), dx, dy + 8);
    noGlow();
    drawButton(dx - 16, dy + 22, 32, 24, "\u25BC", () => {
      state.safeDials[i] = (state.safeDials[i] - 1 + 10) % 10;
    });
  }
  drawButton(
    x + 190 - 60,
    y + 300 - 56,
    120,
    30,
    "TRY COMBINATION",
    () => {
      if (state.foundDigits.some((d) => d === null)) {
        toast("Some digits are still unknown.");
        return;
      }
      if (state.safeDials.join() === state.foundDigits.join()) {
        state.flags.safeOpen = true;
        state.inventory.push("Door Key");
        toast("The safe opens! You found a Door Key.");
      } else {
        toast("The tumblers refuse to turn.");
      }
    },
  );
}

/**
 * Draws the win screen
 */
function drawWinScreen() {
  overlay();
  const w = 440,
    h = 260,
    x = CW / 2 - w / 2,
    y = CH / 2 - h / 2;
  ctx.fillStyle = PALETTE.panel;
  roundRect(x, y, w, h, 10);
  ctx.fill();
  glow(PALETTE.bright, 8);
  ctx.strokeStyle = PALETTE.bright;
  ctx.lineWidth = 2;
  roundRect(x, y, w, h, 10);
  ctx.stroke();
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.fillText("> YOU ESCAPED", x + w / 2, y + 56);
  noGlow();
  ctx.font = '14px "Courier New", monospace';
  ctx.fillStyle = PALETTE.brighter;
  const mins = Math.floor(state.elapsed / 60),
    secs = Math.floor(state.elapsed % 60);
  ctx.fillText("Time: " + mins + "m " + secs + "s", x + w / 2, y + 92);
  if (state.bestTime !== null) {
    ctx.fillStyle = PALETTE.mid;
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(
      "Personal best: " + Math.floor(state.bestTime) + "s",
      x + w / 2,
      y + 114,
    );
  }
  drawButton(x + w / 2 - 70, y + h - 64, 140, 34, "PLAY AGAIN", () => {
    window.location.reload();
  });
}

/**
 * Draws the notes panel showing discovered clues
 */
function drawNotesPanel() {
  overlay();
  const { x, y } = panel(400, 300, "YOUR NOTES");
  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = '13px "Courier New", monospace';
  
  let lineY = y + 60;
  const lineHeight = 28;
  
  // Rug symbols
  ctx.fillText("Rug symbols (floorboard):", x + 30, lineY);
  lineY += lineHeight;
  if (state.flags.rugMoved) {
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText(correctSeq.join("   "), x + 30, lineY);
    lineY += lineHeight + 10;
  } else {
    ctx.fillStyle = PALETTE.mid;
    ctx.fillText("(not yet discovered)", x + 30, lineY);
    lineY += lineHeight + 10;
  }
  
  // Clock hour
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText("Clock hour (from drawer):", x + 30, lineY);
  lineY += lineHeight;
  if (state.flags.drawerOpen) {
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText("Hour " + clockClueHour, x + 30, lineY);
    lineY += lineHeight + 10;
  } else {
    ctx.fillStyle = PALETTE.mid;
    ctx.fillText("(not yet discovered)", x + 30, lineY);
    lineY += lineHeight + 10;
  }
  
  // Painting pattern
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText("Painting pattern:", x + 30, lineY);
  lineY += lineHeight;
  if (state.flags.paintingChecked) {
    ctx.font = '14px "Courier New", monospace';
    const patternLabels = targetOrder.map(p => PATTERN_LABEL[p]);
    ctx.fillText(patternLabels.join(" → "), x + 30, lineY);
    lineY += lineHeight + 10;
  } else {
    ctx.fillStyle = PALETTE.mid;
    ctx.fillText("(not yet discovered)", x + 30, lineY);
    lineY += lineHeight + 10;
  }
  
  // Safe digits
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText("Safe digits (I, II, III, IV):", x + 30, lineY);
  lineY += lineHeight;
  ctx.font = '18px "Courier New", monospace';
  const d1 = state.foundDigits[0] !== null ? state.foundDigits[0] : "?";
  const d2 = state.foundDigits[1] !== null ? state.foundDigits[1] : "?";
  const d3 = state.foundDigits[2] !== null ? state.foundDigits[2] : "?";
  const d4 = state.foundDigits[3] !== null ? state.foundDigits[3] : "?";
  ctx.fillText(`${d1}   ${d2}   ${d3}   ${d4}`, x + 30, lineY);
  lineY += lineHeight + 10;
  
  // Inventory
  ctx.fillStyle = PALETTE.brighter;
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText("Inventory:", x + 30, lineY);
  lineY += lineHeight;
  if (state.inventory.length === 0) {
    ctx.fillStyle = PALETTE.mid;
    ctx.fillText("(empty)", x + 30, lineY);
  } else {
    ctx.font = '13px "Courier New", monospace';
    state.inventory.forEach((item, i) => {
      ctx.fillText("• " + item, x + 30, lineY + i * 20);
    });
  }
}

// ============================================================================
// CRT OVERLAY
// ============================================================================

let crtLayer = null;

/**
 * Creates the CRT effect overlay
 */
function createCRTLayer() {
  crtLayer = document.createElement("canvas");
  crtLayer.width = CW;
  crtLayer.height = CH;
  const c = crtLayer.getContext("2d");
  for (let y = 0; y < CH; y += 3) {
    c.fillStyle = "rgba(0,0,0,0.16)";
    c.fillRect(0, y, CW, 1);
  }
  const vg = c.createRadialGradient(
    CW / 2,
    CH / 2,
    CH * 0.35,
    CW / 2,
    CH / 2,
    CH * 0.78,
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.55)");
  c.fillStyle = vg;
  c.fillRect(0, 0, CW, CH);
  c.strokeStyle = "rgba(0,0,0,0.6)";
  c.lineWidth = 8;
  c.strokeRect(0, 0, CW, CH);
}

// ============================================================================
// STORAGE
// ============================================================================

/**
 * Loads the best time from storage
 */
async function loadBest() {
  try {
    const r = await window.storage.get(
      "cartographer_best_time_v2",
      false,
    );
    if (r && r.value) state.bestTime = parseFloat(r.value);
  } catch (e) {
    /* no record yet */
  }
}

/**
 * Saves the best time to storage
 * @param {number} t - Time to save
 */
async function saveBest(t) {
  try {
    if (state.bestTime === null || t < state.bestTime) {
      state.bestTime = t;
      await window.storage.set(
        "cartographer_best_time_v2",
        String(t),
        false,
      );
    }
  } catch (e) {
    /* best-effort only */
  }
}

// ============================================================================
// MAIN DRAW
// ============================================================================

/**
 * Main draw function - renders the entire game
 */
function draw() {
  state.uiHitRegions = [];
  ctx.clearRect(0, 0, CW, CH);
  ctx.lineCap = "butt";
  ctx.fillStyle = PALETTE.bg0;
  ctx.fillRect(0, 0, CW, CH);

  drawWalls();
  drawFloor();
  drawRug();
  drawPlant();
  drawFireplace();
  drawShelf();
  drawClock();
  drawPainting();
  drawGlobe();
  drawDesk();
  drawChair();
  drawSafe();
  drawCoatRack();
  drawDoor();
  drawPlayer();
  drawPrompt();
  drawHUD();
  drawToast();

  if (state.activePuzzle) {
    switch (state.activePuzzle) {
      case "rug":
        drawRugPanel();
        break;
      case "desk":
        drawDeskPanel();
        break;
      case "clock":
        drawClockPanel();
        break;
      case "painting":
        drawPaintingPanel();
        break;
      case "shelf":
        drawShelfPanel();
        break;
      case "safe":
        drawSafePanel();
        break;
      case "notes":
        drawNotesPanel();
        break;
    }
  }

  if (state.flags.won) drawWinScreen();

  ctx.drawImage(crtLayer, 0, 0);
}

// ============================================================================
// GAME LOOP
// ============================================================================

let lastTime = 0;

/**
 * Main game loop
 * @param {number} t - Current timestamp
 */
function loop(t) {
  const dt = Math.min((t - lastTime) / 1000, 0.05);
  lastTime = t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let canvas = null;
let startOverlay = null;

/**
 * Initializes the game
 * @param {HTMLCanvasElement} canvasElement - The canvas element
 * @param {HTMLElement} overlayElement - The start overlay element
 */
export function initEscapeRoom(canvasElement, overlayElement) {
  canvas = canvasElement;
  startOverlay = overlayElement;
  ctx = canvas.getContext("2d");
  
  // Set canvas internal resolution
  canvas.width = BASE_WIDTH;
  canvas.height = BASE_HEIGHT;
  CW = canvas.width;
  CH = canvas.height;

  // Initialize puzzle data
  digits.d1 = rand(0, 9);
  digits.d2 = rand(0, 9);
  digits.d3 = rand(0, 9);
  digits.d4 = rand(0, 9);
  correctSeq = shuffle(SYMBOLS).slice(0, 3);
  clockClueHour = rand(1, 9);
  shelfPatterns = shuffle(PATTERNS);
  targetOrder = shelfPatterns.slice();
  currentOrder = shuffle(shelfPatterns);
  while (currentOrder.join() === targetOrder.join()) {
    currentOrder = shuffle(shelfPatterns);
  }
  state.clockHour = rand(1, 12);
  state.startTime = performance.now();

  // Create CRT overlay
  createCRTLayer();

  // Set up canvas focus - ensure tabindex is set for keyboard focus
  if (!canvas.hasAttribute("tabindex")) {
    canvas.setAttribute("tabindex", "0");
  }
  
  // Focus management functions
  function grabFocus() {
    canvas.focus();
    if (startOverlay) startOverlay.style.display = "none";
  }

  // Set up focus handlers
  canvas.addEventListener("click", grabFocus);
  if (startOverlay) startOverlay.addEventListener("click", grabFocus);
  
  // Also focus on canvas initialization
  canvas.focus();

  // Set up input handlers - attach to window to catch all key events
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  canvas.addEventListener("click", handleClick);
  
  // Set up mobile controls
  setupMobileControls();

  // Load best time
  loadBest();

  // Start game loop
  lastTime = performance.now();
  requestAnimationFrame(loop);

  // Show initial toast
  toast("Explore the study. Something feels hidden here.");
}

/**
 * Sets up mobile touch controls
 */
function setupMobileControls() {
  const btnUp = document.getElementById("btnUp");
  const btnDown = document.getElementById("btnDown");
  const btnLeft = document.getElementById("btnLeft");
  const btnRight = document.getElementById("btnRight");
  const btnInteract = document.getElementById("btnInteract");
  const btnHint = document.getElementById("btnHint");
  const btnNotes = document.getElementById("btnNotes");

  if (!btnUp) return; // Mobile controls not available

  // Movement buttons
  const setupMovementButton = (btn, key) => {
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      state.keys[key] = true;
    });
    btn.addEventListener("touchend", (e) => {
      e.preventDefault();
      state.keys[key] = false;
    });
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      state.keys[key] = true;
    });
    btn.addEventListener("mouseup", (e) => {
      e.preventDefault();
      state.keys[key] = false;
    });
    btn.addEventListener("mouseleave", (e) => {
      state.keys[key] = false;
    });
  };

  setupMovementButton(btnUp, "w");
  setupMovementButton(btnDown, "s");
  setupMovementButton(btnLeft, "a");
  setupMovementButton(btnRight, "d");

  // Action buttons
  const setupActionButton = (btn, action) => {
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      action();
    });
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      action();
    });
  };

  setupActionButton(btnInteract, () => {
    if (!state.activePuzzle) {
      const it = nearestInteractable();
      if (it) handleInteract(it.ref.id);
      else toast("There's nothing to interact with here.");
    }
  });

  setupActionButton(btnHint, () => {
    showHint();
  });

  setupActionButton(btnNotes, () => {
    state.activePuzzle = state.activePuzzle === "notes" ? null : "notes";
  });
}
