import type { Level } from '../exercises/types';
import { Rng } from '../exercises/rng';

/**
 * Carte d'une région, générée de façon déterministe. Toutes les régions partagent le même relief
 * (rivière, ponts, plateaux, arène du gardien) ; le décor (arbres, rochers, fleurs) dépend de la
 * graine de la région et les couleurs de son thème.
 */

export const TILE = 32;
export const MAP_W = 80;
export const MAP_H = 60;

export enum Tile {
  Ground,
  Grass,
  /** Falaise : bords de la carte et plateaux rocheux. */
  Rock,
  Lava,
  Path,
  Crater,
  Bridge,
  Tree,
  Boulder,
  /** Fleurs et cailloux : décor que l'on peut traverser. */
  Flowers,
  Sign,
}

export const BLOCKING = new Set([Tile.Rock, Tile.Lava, Tile.Tree, Tile.Boulder, Tile.Sign]);

/** Une zone de hautes herbes et le niveau de ses créatures. */
export interface GrassZone {
  cx: number;
  cy: number;
  r: number;
  level: Level;
}

export const GRASS_ZONES: GrassZone[] = [
  // Plaine du sud, près du départ : niveau 1.
  { cx: 17, cy: 49, r: 4.5, level: 1 },
  { cx: 29, cy: 54, r: 3.5, level: 1 },
  { cx: 45, cy: 50, r: 5, level: 1 },
  { cx: 58, cy: 54, r: 3.5, level: 1 },
  // Terres de l'est, au sud de la rivière : niveau 2.
  { cx: 71, cy: 40, r: 4.5, level: 2 },
  // Plateaux du nord-ouest, après le premier pont : niveau 2.
  { cx: 10, cy: 21, r: 4.5, level: 2 },
  { cx: 24, cy: 13, r: 4, level: 2 },
  { cx: 30, cy: 23, r: 3.5, level: 2 },
  // Pentes du volcan, au nord-est : niveau 3.
  { cx: 50, cy: 22, r: 4, level: 3 },
  { cx: 53, cy: 9, r: 3.5, level: 3 },
  { cx: 66, cy: 24, r: 3, level: 3 },
];

export const START = { x: 8, y: 54 };
export const GUIDE = { x: 11, y: 53 };
export const CRATER = { x: 66, y: 11, r: 5 };

/** Panneaux : près du village, aux deux ponts, devant l'arène. Leur texte dépend de la région. */
export const SIGNS = [
  { x: 12, y: 56 },
  { x: 16, y: 34 },
  { x: 44, y: 18 },
  { x: 58, y: 15 },
];

/** Rivière de lave principale (est–ouest) et son bras nord (vers le cratère). */
export const riverY = (x: number) => 31 + Math.round(2.5 * Math.sin(x / 4.5));
const branchX = (y: number) => 41 + Math.round(1.5 * Math.sin(y / 3));
const BRIDGES_MAIN = [17, 18, 19, 55, 56, 57];
const BRIDGE_BRANCH = [20, 21, 22];

export interface RegionMap {
  tiles: Tile[][];
  zoneAt: (x: number, y: number) => GrassZone | null;
}

/** Graine du décor d'une région, tirée de son identifiant. */
export function seedFor(regionId: string): number {
  let h = 2166136261;
  for (let i = 0; i < regionId.length; i++) h = Math.imul(h ^ regionId.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function buildMap(seed = 2026): RegionMap {
  const rng = new Rng(seed);
  const tiles: Tile[][] = Array.from({ length: MAP_H }, () => Array<Tile>(MAP_W).fill(Tile.Ground));
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;
  const set = (x: number, y: number, t: Tile) => {
    if (inside(x, y)) tiles[y][x] = t;
  };
  const get = (x: number, y: number) => (inside(x, y) ? tiles[y][x] : Tile.Rock);
  const dist = (x: number, y: number, cx: number, cy: number) => Math.hypot(x - cx, y - cy);
  const blob = (cx: number, cy: number, r: number, t: Tile, jitter = 1) => {
    for (let y = Math.floor(cy - r - 2); y <= cy + r + 2; y++)
      for (let x = Math.floor(cx - r - 2); x <= cx + r + 2; x++)
        if (dist(x, y, cx, cy) <= r + rng.next() * jitter - jitter / 2) set(x, y, t);
  };

  // Falaises du pourtour, au bord irrégulier.
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) {
      const edge = Math.min(x, y, MAP_W - 1 - x, MAP_H - 1 - y);
      const depth = 2 + Math.round(1.2 + 1.2 * Math.sin(x / 5 + y / 7));
      if (edge < depth) set(x, y, Tile.Rock);
    }

  // Plateaux rocheux à l'intérieur.
  blob(32, 43, 3.5, Tile.Rock, 0.6);
  blob(66, 47, 2.5, Tile.Rock, 0.6);
  blob(14, 11, 3, Tile.Rock, 0.6);
  blob(35, 8, 2.5, Tile.Rock, 0.6);
  blob(74, 22, 2.5, Tile.Rock, 0.6);

  for (const zone of GRASS_ZONES) blob(zone.cx, zone.cy, zone.r, Tile.Grass, 1.4);

  // Forêt du sud-ouest et arbres épars.
  for (let y = 36; y < 46; y++)
    for (let x = 4; x < 10; x++) if (get(x, y) === Tile.Ground && rng.next() < 0.45) set(x, y, Tile.Tree);
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) {
      if (get(x, y) !== Tile.Ground) continue;
      const nearCliff = [get(x - 1, y), get(x + 1, y), get(x, y - 1), get(x, y + 1)].includes(Tile.Rock);
      const r = rng.next();
      if (nearCliff && r < 0.18) set(x, y, Tile.Tree);
      else if (r < 0.015) set(x, y, Tile.Tree);
      else if (r < 0.03) set(x, y, Tile.Boulder);
      else if (r < 0.08) set(x, y, Tile.Flowers);
    }

  // Chemins : départ → premier pont → bras nord → cratère, et une branche vers l'est.
  const road = (points: [number, number][]) => {
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (const w of [0, 1]) set(x, y0 + w, Tile.Path);
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (const w of [0, 1]) set(x1 + w, y, Tile.Path);
    }
  };
  road([
    [START.x, START.y],
    [17, START.y],
    [17, 26],
    [30, 26],
    [30, 20],
    [46, 20],
    [46, 16],
    [CRATER.x - 1, 16],
  ]);
  road([
    [17, 42],
    [55, 42],
    [55, 36],
  ]);
  road([
    [55, 26],
    [60, 26],
  ]);

  // Lave : rivière, bras nord, lacs.
  for (let x = 3; x < MAP_W - 3; x++) for (let w = -1; w <= 1; w++) set(x, riverY(x) + w, Tile.Lava);
  for (let y = 3; y < riverY(41) - 1; y++) for (let w = 0; w <= 1; w++) set(branchX(y) + w, y, Tile.Lava);
  // Ponts rectangulaires : ils couvrent toute la largeur de la lave sous leurs colonnes (ou lignes).
  for (const cols of [BRIDGES_MAIN.slice(0, 3), BRIDGES_MAIN.slice(3)]) {
    const ys = cols.map(riverY);
    for (let y = Math.min(...ys) - 1; y <= Math.max(...ys) + 1; y++) for (const x of cols) set(x, y, Tile.Bridge);
  }
  const xs = BRIDGE_BRANCH.map(branchX);
  for (let x = Math.min(...xs); x <= Math.max(...xs) + 1; x++) for (const y of BRIDGE_BRANCH) set(x, y, Tile.Bridge);
  blob(12, 47, 2, Tile.Lava, 0.4);
  blob(62, 44, 2.2, Tile.Lava, 0.4);
  blob(26, 33 + 4, 1.5, Tile.Lava, 0.3);

  // Arène du gardien (le cratère) : un cercle de roche ouvert au sud.
  for (let y = CRATER.y - CRATER.r - 2; y <= CRATER.y + CRATER.r + 2; y++)
    for (let x = CRATER.x - CRATER.r - 2; x <= CRATER.x + CRATER.r + 2; x++) {
      const d = dist(x, y, CRATER.x, CRATER.y);
      const opening = y > CRATER.y && x >= CRATER.x - 2 && x <= CRATER.x + 1;
      if (d <= CRATER.r || (d <= CRATER.r + 1.5 && opening)) set(x, y, Tile.Crater);
      else if (d <= CRATER.r + 1.5) set(x, y, Tile.Rock);
    }

  // Autour du départ, du guide et des panneaux : rien ne bloque.
  const clear = (cx: number, cy: number, r: number) => {
    for (let y = cy - r; y <= cy + r; y++)
      for (let x = cx - r; x <= cx + r; x++) {
        const t = get(x, y);
        if (t === Tile.Tree || t === Tile.Boulder || t === Tile.Flowers || t === Tile.Grass) set(x, y, Tile.Ground);
      }
  };
  clear(START.x, START.y, 2);
  clear(GUIDE.x, GUIDE.y, 1);
  for (const s of SIGNS) {
    clear(s.x, s.y, 1);
    set(s.x, s.y, Tile.Sign);
  }

  const zoneAt = (x: number, y: number) => {
    if (tiles[y]?.[x] !== Tile.Grass) return null;
    let best: GrassZone | null = null;
    let bestD = Infinity;
    for (const zone of GRASS_ZONES) {
      const d = dist(x, y, zone.cx, zone.cy) - zone.r;
      if (d < bestD) [best, bestD] = [zone, d];
    }
    return best;
  };

  return { tiles, zoneAt };
}
