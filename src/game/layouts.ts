import type { ChapterDef, TerrainId, ThemeId } from '../content/types';
import { Rng } from '../exercises/rng';
import { type Arena, BLOCKING, Canvas, type GrassZone, MAP_H, MAP_W, type Point, type RegionMap, type Side, Tile, onBorder } from './map';

/**
 * Les reliefs des régions. Chaque relief trace ses obstacles (roche, liquide, arbres) et donne le
 * plan de la région : départ, zones d'herbes, chemins, panneaux, arène. `finish` pose ensuite le
 * tout dans le même ordre pour tous, puis répare les accès : chaque zone, chaque panneau et
 * l'arène restent toujours atteignables à pied, quelle que soit la graine.
 */

interface Layout {
  start: Point;
  guide: Point;
  arena: Arena;
  zones: GrassZone[];
  signs: Point[];
  roads: [number, number][][];
  /** Densités du décor semé sur le sol nu. */
  decor: { tree: number; cliffTree: number; boulder: number; flowers: number };
  /** Nombre maximal de plateaux en hauteur (3 par défaut ; aucun dans les grottes). */
  plateaus?: number;
}

const START = { x: 8, y: 54 };
const GUIDE = { x: 11, y: 53 };
const z = (cx: number, cy: number, r: number, level: 1 | 2 | 3): GrassZone => ({ cx, cy, r, level });
const keepLiquid = (t: Tile) => t === Tile.Lava || t === Tile.Bridge;
/** Fin du chemin : la case devant l'ouverture de l'arène. */
const entrance = (a: Arena): [number, number] =>
  a.open === 'S' ? [a.x - 1, a.y + a.r] : a.open === 'N' ? [a.x - 1, a.y - a.r - 1] : a.open === 'W' ? [a.x - a.r - 1, a.y - 1] : [a.x + a.r, a.y - 1];

/** Plaine coupée par une rivière et son bras nord, deux ponts, plateaux rocheux (la carte d'origine). */
function riviere(c: Canvas): Layout {
  const arena: Arena = { x: 66, y: 11, r: 5, open: 'S' };
  c.cliffs();
  c.blob(32, 43, 3.5, Tile.Rock, 0.6);
  c.blob(66, 47, 2.5, Tile.Rock, 0.6);
  c.blob(14, 11, 3, Tile.Rock, 0.6);
  c.blob(35, 8, 2.5, Tile.Rock, 0.6);
  c.blob(74, 22, 2.5, Tile.Rock, 0.6);
  for (let y = 36; y < 46; y++) for (let x = 4; x < 10; x++) if (c.get(x, y) === Tile.Ground && c.rng.next() < 0.45) c.set(x, y, Tile.Tree);

  const riverY = (x: number) => 31 + Math.round(2.5 * Math.sin(x / 4.5));
  const branchX = (y: number) => 41 + Math.round(1.5 * Math.sin(y / 3));
  for (let x = 3; x < MAP_W - 3; x++) for (let w = -1; w <= 1; w++) c.set(x, riverY(x) + w, Tile.Lava);
  for (let y = 3; y < riverY(41) - 1; y++) for (let w = 0; w <= 1; w++) c.set(branchX(y) + w, y, Tile.Lava);
  // Ponts rectangulaires : ils couvrent toute la largeur de la rivière sous leurs colonnes (ou lignes).
  for (const cols of [[17, 18, 19], [55, 56, 57]]) {
    const ys = cols.map(riverY);
    for (let y = Math.min(...ys) - 1; y <= Math.max(...ys) + 1; y++) for (const x of cols) c.set(x, y, Tile.Bridge);
  }
  const rows = [20, 21, 22];
  const xs = rows.map(branchX);
  for (let x = Math.min(...xs); x <= Math.max(...xs) + 1; x++) for (const y of rows) c.set(x, y, Tile.Bridge);
  c.blob(12, 47, 2, Tile.Lava, 0.4);
  c.blob(62, 44, 2.2, Tile.Lava, 0.4);
  c.blob(26, 37, 1.5, Tile.Lava, 0.3);

  return {
    start: START,
    guide: GUIDE,
    arena,
    zones: [
      z(17, 49, 4.5, 1), z(29, 54, 3.5, 1), z(45, 50, 5, 1), z(58, 54, 3.5, 1),
      z(71, 40, 4.5, 2), z(10, 21, 4.5, 2), z(24, 13, 4, 2), z(30, 23, 3.5, 2),
      z(50, 22, 4, 3), z(53, 9, 3.5, 3), z(66, 24, 3, 3),
    ],
    signs: [{ x: 12, y: 56 }, { x: 16, y: 34 }, { x: 44, y: 18 }, { x: 58, y: 15 }],
    roads: [
      [[START.x, START.y], [17, START.y], [17, 26], [30, 26], [30, 20], [46, 20], [46, 16], entrance(arena)],
      [[17, 42], [55, 42], [55, 36]],
      [[55, 26], [60, 26]],
    ],
    decor: { tree: 0.015, cliffTree: 0.18, boulder: 0.015, flowers: 0.05 },
  };
}

/** Forêt dense : on avance par des sentiers de clairière en clairière, un ruisseau la traverse. */
function foret(c: Canvas): Layout {
  const arena: Arena = { x: 66, y: 11, r: 5, open: 'S' };
  const zones = [
    z(16, 47, 4, 1), z(28, 53, 3.5, 1), z(28, 41, 3.5, 1), z(13, 36, 3.5, 1),
    z(48, 49, 4, 2), z(62, 53, 3.5, 2), z(54, 37, 3.5, 2), z(34, 28, 4, 2),
    z(52, 22, 3.5, 3), z(28, 13, 3.5, 3), z(70, 31, 3.5, 3),
  ];
  c.cliffs();
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) if (c.get(x, y) === Tile.Ground && c.rng.next() < 0.62) c.set(x, y, Tile.Tree);
  // Clairières autour des zones, du départ, de l'arène, et quelques autres pour respirer.
  for (const zone of zones) c.blob(zone.cx, zone.cy, zone.r + 2.2, Tile.Ground, 1.6);
  c.blob(START.x + 2, START.y - 1, 4, Tile.Ground, 1);
  c.blob(arena.x, arena.y, arena.r + 3, Tile.Ground, 1);
  for (let i = 0; i < 7; i++) c.blob(6 + c.rng.int(0, 68), 6 + c.rng.int(0, 48), 2 + c.rng.next() * 1.5, Tile.Ground, 1.2);
  // Ruisseau sinueux du nord au sud.
  for (let y = 3; y < MAP_H - 3; y++) {
    const x = 40 + Math.round(5 * Math.sin(y / 5) + 2 * Math.sin(y / 2.3));
    for (let w = 0; w < 2; w++) c.set(x + w, y, Tile.Lava);
  }
  return {
    start: START,
    guide: GUIDE,
    arena,
    zones,
    signs: [{ x: 12, y: 56 }, { x: 24, y: 49 }, { x: 38, y: 31 }, { x: 58, y: 15 }],
    roads: [
      [[START.x, START.y], [22, START.y], [22, 45], [46, 45], [46, 38], [36, 38], [36, 24], [50, 24], [50, 16], entrance(arena)],
      [[22, 45], [22, 41], [28, 41]],
      [[22, 50], [14, 50], [14, 36]],
      [[46, 45], [48, 45], [48, 52], [62, 52]],
      [[46, 38], [54, 38]],
      [[50, 24], [70, 24], [70, 31]],
      [[36, 24], [36, 13], [28, 13]],
    ],
    decor: { tree: 0, cliffTree: 0, boulder: 0.01, flowers: 0.08 },
  };
}

/** Montagne : un chemin en lacets monte entre les massifs jusqu'à l'arène, au sommet. */
function montagne(c: Canvas): Layout {
  const arena: Arena = { x: 40, y: 10, r: 5, open: 'S' };
  c.cliffs(3);
  const n = c.noise(1.2);
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (n(x, y) > 0.06) c.set(x, y, Tile.Rock);
  // Le sommet : un massif autour de l'arène.
  c.blob(arena.x, arena.y, arena.r + 4, Tile.Rock, 1.5);
  c.blob(START.x + 2, START.y - 1, 4.5, Tile.Ground, 1);
  for (let i = 0; i < 2; i++) c.blob(10 + c.rng.int(0, 60), 28 + c.rng.int(0, 22), 1.8 + c.rng.next(), Tile.Lava, 0.5);
  return {
    start: START,
    guide: GUIDE,
    arena,
    zones: [
      z(18, 50, 3.5, 1), z(30, 50, 3, 1), z(48, 51, 3.5, 1), z(62, 51, 3, 1),
      z(56, 42, 3.5, 2), z(30, 42, 3.5, 2), z(18, 31, 3.5, 2), z(42, 31, 3.5, 2),
      z(26, 16, 3.5, 3), z(56, 14, 3.5, 3), z(68, 30, 3, 3),
    ],
    signs: [{ x: 12, y: 56 }, { x: 70, y: 42 }, { x: 11, y: 31 }, { x: 42, y: 19 }],
    roads: [
      [[START.x, START.y], [36, START.y], [36, 46], [68, 46], [68, 36], [12, 36], [12, 26], [60, 26], [60, 21], [39, 21], entrance(arena)],
      [[60, 26], [60, 30], [68, 30]],
      [[30, 26], [30, 16], [26, 16]],
      [[60, 21], [60, 14], [56, 14]],
    ],
    decor: { tree: 0.01, cliffTree: 0.1, boulder: 0.04, flowers: 0.04 },
  };
}

/** Côte : la mer à l'est, une lagune, des îles reliées au rivage par de longs pontons. */
function cote(c: Canvas): Layout {
  const arena: Arena = { x: 66, y: 11, r: 5, open: 'W' };
  c.cliffs();
  const shore = (y: number) => 50 + Math.round(4 * Math.sin(y / 6) + 2 * Math.sin(y / 2.5));
  for (let y = 0; y < MAP_H; y++) for (let x = shore(y); x < MAP_W; x++) c.set(x, y, Tile.Lava);
  // Les bords nord et sud restent des falaises jusqu'à la mer.
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (onBorder(x, y) && c.get(x, y) !== Tile.Lava) c.set(x, y, Tile.Rock);
  c.blob(67, 44, 5.5, Tile.Ground, 1.4);
  c.blob(70, 27, 5, Tile.Ground, 1.4);
  c.blob(arena.x, arena.y, arena.r + 3, Tile.Ground, 1.2);
  c.blob(26, 28, 3.5, Tile.Lava, 1);
  return {
    start: START,
    guide: GUIDE,
    arena,
    zones: [
      z(16, 48, 4, 1), z(28, 51, 3.5, 1), z(42, 47, 3.5, 1), z(13, 38, 3.5, 1),
      z(28, 38, 3.5, 2), z(40, 20, 4, 2), z(20, 14, 3.5, 2), z(42, 31, 3, 2),
      z(67, 44, 3.5, 3), z(70, 27, 3.5, 3), z(46, 9, 3, 3),
    ],
    signs: [{ x: 12, y: 56 }, { x: 33, y: 44 }, { x: 19, y: 27 }, { x: 52, y: 9 }],
    roads: [
      [[START.x, START.y], [34, START.y], [34, 34], [20, 34], [20, 22], [46, 22], [46, 10], entrance(arena)],
      [[34, 44], [67, 44]],
      [[34, 34], [44, 34], [44, 27], [70, 27]],
      [[20, 22], [20, 14]],
      [[34, 40], [28, 40]],
    ],
    decor: { tree: 0.03, cliffTree: 0.12, boulder: 0.02, flowers: 0.03 },
  };
}

/** Archipel : des îles au milieu de l'eau (ou du ciel), reliées par de longues passerelles. */
function archipel(c: Canvas): Layout {
  const arena: Arena = { x: 64, y: 12, r: 5, open: 'S' };
  const zones = [
    z(24, 48, 3.5, 1), z(12, 37, 3.5, 1), z(37, 52, 3, 1), z(32, 39, 3, 1),
    z(48, 46, 3.5, 2), z(61, 52, 3, 2), z(24, 24, 3.5, 2), z(45, 30, 3.5, 2),
    z(61, 35, 3.5, 3), z(37, 14, 3.5, 3), z(71, 45, 3, 3),
  ];
  c.fill(Tile.Lava);
  c.blob(10, 52, 6.5, Tile.Ground, 1.4);
  for (const zone of zones) c.blob(zone.cx, zone.cy, zone.r + 2.4, Tile.Ground, 1.6);
  c.blob(arena.x, arena.y, arena.r + 3.5, Tile.Ground, 1.2);
  for (let i = 0; i < 6; i++) c.blob(8 + c.rng.int(0, 64), 6 + c.rng.int(0, 48), 1.5 + c.rng.next() * 1.5, Tile.Ground, 1.2);
  // La bordure reste liquide.
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (onBorder(x, y)) c.set(x, y, Tile.Lava);
  return {
    start: START,
    guide: GUIDE,
    arena,
    zones,
    signs: [{ x: 13, y: 55 }, { x: 30, y: 36 }, { x: 47, y: 33 }, { x: 62, y: 19 }],
    roads: [
      [[START.x, START.y], [24, START.y], [24, 38], [45, 38], [45, 30], [60, 30], [63, 30], entrance(arena)],
      [[24, 48], [37, 48], [37, 52]],
      [[24, 38], [12, 38]],
      [[45, 38], [48, 38], [48, 46], [61, 46], [61, 52]],
      [[61, 46], [71, 46]],
      [[45, 30], [24, 30], [24, 24]],
      [[60, 30], [60, 35]],
      [[24, 24], [37, 24], [37, 14]],
    ],
    decor: { tree: 0.05, cliffTree: 0, boulder: 0.02, flowers: 0.08 },
  };
}

/** Marais : des mares partout, que l'on traverse sur des pontons. */
function marais(c: Canvas): Layout {
  const arena: Arena = { x: 64, y: 11, r: 5, open: 'S' };
  const zones = [
    z(18, 47, 4, 1), z(31, 53, 3, 1), z(34, 43, 3.5, 1), z(12, 36, 3.5, 1),
    z(52, 48, 4, 2), z(65, 53, 3, 2), z(57, 35, 3.5, 2), z(30, 28, 4, 2),
    z(48, 22, 3.5, 3), z(22, 14, 3.5, 3), z(69, 29, 3, 3),
  ];
  c.cliffs();
  for (let i = 0; i < 80; i++) {
    const x = 5 + c.rng.int(0, 69);
    const y = 5 + c.rng.int(0, 49);
    const r = 1.4 + c.rng.next() * 2.4;
    const free = (p: Point, d: number) => Math.hypot(p.x - x, p.y - y) > d + r;
    if (!free(START, 5) || !free(GUIDE, 3) || !free(arena, arena.r + 3)) continue;
    if (zones.some((zone) => Math.hypot(zone.cx - x, zone.cy - y) < zone.r + r + 1)) continue;
    c.blob(x, y, r, Tile.Lava, 1);
  }
  // Bosquets humides.
  for (let i = 0; i < 9; i++) {
    const cx = 6 + c.rng.int(0, 68);
    const cy = 6 + c.rng.int(0, 48);
    for (let y = cy - 3; y <= cy + 3; y++)
      for (let x = cx - 3; x <= cx + 3; x++) if (c.get(x, y) === Tile.Ground && Math.hypot(x - cx, y - cy) < 3 && c.rng.next() < 0.5) c.set(x, y, Tile.Tree);
  }
  return {
    start: START,
    guide: GUIDE,
    arena,
    zones,
    signs: [{ x: 12, y: 56 }, { x: 26, y: 47 }, { x: 47, y: 33 }, { x: 50, y: 15 }],
    roads: [
      [[START.x, START.y], [24, START.y], [24, 40], [48, 40], [48, 28], [36, 28], [36, 16], entrance(arena)],
      [[24, 50], [31, 50]],
      [[24, 40], [24, 36], [12, 36]],
      [[48, 40], [52, 40], [52, 48], [65, 48], [65, 53]],
      [[48, 34], [57, 34]],
      [[48, 28], [48, 22]],
      [[36, 20], [22, 20], [22, 14]],
      [[64, 34], [69, 34], [69, 29]],
    ],
    decor: { tree: 0.03, cliffTree: 0.1, boulder: 0.01, flowers: 0.07 },
  };
}

/** Désert : de grandes étendues, des mesas rocheuses et quelques oasis bordées de palmiers. */
function desert(c: Canvas): Layout {
  const arena: Arena = { x: 64, y: 11, r: 5, open: 'W' };
  const zones = [
    z(18, 47, 4, 1), z(33, 52, 3.5, 1), z(40, 43, 3.5, 1), z(12, 35, 3.5, 1),
    z(57, 48, 4, 2), z(68, 39, 3.5, 2), z(30, 30, 4, 2), z(46, 31, 3.5, 2),
    z(22, 16, 3.5, 3), z(44, 14, 3.5, 3), z(66, 25, 3, 3),
  ];
  c.cliffs();
  const clear = (x: number, y: number, d: number) =>
    Math.hypot(x - START.x, y - START.y) > d + 6 && Math.hypot(x - arena.x, y - arena.y) > d + arena.r + 2 && zones.every((zone) => Math.hypot(zone.cx - x, zone.cy - y) > zone.r + d + 1);
  for (let i = 0, placed = 0; i < 40 && placed < 7; i++) {
    const x = 8 + c.rng.int(0, 64);
    const y = 8 + c.rng.int(0, 44);
    const rx = 3 + c.rng.next() * 3;
    if (!clear(x, y, rx)) continue;
    c.ellipse(x, y, rx, 1.8 + c.rng.next() * 1.2, Tile.Rock, 0.8);
    placed++;
  }
  for (let i = 0, placed = 0; i < 40 && placed < 3; i++) {
    const x = 8 + c.rng.int(0, 64);
    const y = 8 + c.rng.int(0, 44);
    const r = 2 + c.rng.next() * 0.8;
    if (!clear(x, y, r + 2)) continue;
    c.blob(x, y, r, Tile.Lava, 0.6);
    for (let yy = y - r - 3; yy <= y + r + 3; yy++)
      for (let xx = x - r - 3; xx <= x + r + 3; xx++) {
        const d = Math.hypot(xx - x, yy - y);
        if (d > r + 0.8 && d < r + 2.2 && c.get(Math.round(xx), Math.round(yy)) === Tile.Ground && c.rng.next() < 0.45) c.set(Math.round(xx), Math.round(yy), Tile.Tree);
      }
    placed++;
  }
  return {
    start: START,
    guide: GUIDE,
    arena,
    zones,
    signs: [{ x: 12, y: 56 }, { x: 28, y: 46 }, { x: 54, y: 30 }, { x: 46, y: 9 }],
    roads: [
      [[START.x, START.y], [26, START.y], [26, 38], [52, 38], [52, 22], [36, 22], [36, 10], entrance(arena)],
      [[26, 47], [18, 47]],
      [[26, 38], [26, 35], [12, 35]],
      [[52, 38], [52, 48], [57, 48]],
      [[52, 38], [68, 38]],
      [[36, 22], [30, 22], [30, 30]],
      [[36, 16], [22, 16]],
      [[52, 25], [66, 25]],
    ],
    decor: { tree: 0.015, cliffTree: 0.03, boulder: 0.03, flowers: 0.015 },
  };
}

/** Canyon : un réseau de grottes, des salles reliées par des couloirs étroits. */
function canyon(c: Canvas): Layout {
  const arena: Arena = { x: 64, y: 12, r: 5, open: 'S' };
  const zones = [
    z(22, 48, 3.5, 1), z(35, 53, 3, 1), z(14, 36, 3.5, 1), z(34, 40, 3.5, 1),
    z(50, 50, 3.5, 2), z(65, 44, 3.5, 2), z(48, 32, 4, 2), z(26, 24, 3.5, 2),
    z(66, 30, 3.5, 3), z(40, 14, 3.5, 3), z(18, 12, 3, 3),
  ];
  const at = (cx: number, cy: number) => zones.find((zone) => zone.cx === cx && zone.cy === cy)!;
  const links: [GrassZone | Point, GrassZone | Point][] = [
    [START, at(22, 48)], [at(22, 48), at(35, 53)], [at(22, 48), at(34, 40)], [at(34, 40), at(14, 36)],
    [at(34, 40), at(48, 32)], [at(35, 53), at(50, 50)], [at(50, 50), at(65, 44)], [at(48, 32), at(26, 24)],
    [at(48, 32), at(66, 30)], [at(26, 24), at(18, 12)], [at(26, 24), at(40, 14)], [at(65, 44), at(66, 30)],
  ];
  const xy = (p: GrassZone | Point): [number, number] => ('cx' in p ? [p.cx, p.cy] : [p.x, p.y]);
  c.fill(Tile.Rock);
  for (const [a, b] of links) c.polyline([xy(a), xy(b)], 3, () => Tile.Ground);
  c.polyline([[66, 30], [63, 30], entrance(arena)], 3, () => Tile.Ground);
  c.blob(START.x + 2, START.y - 2, 5.5, Tile.Ground, 1.2);
  for (const zone of zones) c.blob(zone.cx, zone.cy, zone.r + 2.2, Tile.Ground, 1.4);
  c.blob(arena.x, arena.y, arena.r + 3, Tile.Ground, 1);
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (onBorder(x, y)) c.set(x, y, Tile.Rock);
  // Petites vasques au fond de quelques salles.
  for (const zone of [zones[3], zones[6], zones[9]]) c.blob(zone.cx + zone.r + 1, zone.cy - 1, 1.2, Tile.Lava, 0.3, (t) => t === Tile.Rock);
  return {
    start: START,
    guide: GUIDE,
    arena,
    zones,
    signs: [{ x: 12, y: 57 }, { x: 37, y: 43 }, { x: 51, y: 35 }, { x: 61, y: 19 }],
    roads: [[[START.x, START.y], [22, START.y], [22, 48], [34, 48], [34, 40], [48, 40], [48, 32], [66, 32], [66, 30], [63, 30], entrance(arena)]],
    decor: { tree: 0.01, cliffTree: 0, boulder: 0.05, flowers: 0.04 },
    plateaus: 0,
  };
}

/** Lac : un grand lac au centre, l'arène sur son île, un chemin qui en fait le tour. */
function lac(c: Canvas): Layout {
  const arena: Arena = { x: 44, y: 27, r: 5, open: 'S' };
  c.cliffs();
  const n = c.noise(0.6);
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) if (Math.hypot((x - 42) / 22, (y - 30) / 13) < 1 + 0.12 * n(x, y)) c.set(x, y, Tile.Lava);
  c.blob(arena.x, arena.y + 1, arena.r + 3, Tile.Ground, 1.2);
  // Arbres sur la rive.
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) {
      if (c.get(x, y) !== Tile.Ground) continue;
      const shore = [c.get(x - 2, y), c.get(x + 2, y), c.get(x, y - 2), c.get(x, y + 2)].includes(Tile.Lava);
      if (shore && c.rng.next() < 0.15) c.set(x, y, Tile.Tree);
    }
  return {
    start: START,
    guide: GUIDE,
    arena,
    zones: [
      z(14, 49, 3.5, 1), z(28, 52, 3.5, 1), z(46, 52, 3.5, 1), z(9, 37, 3, 1),
      z(62, 52, 3.5, 2), z(73, 42, 3, 2), z(73, 26, 3, 2), z(9, 22, 3, 2),
      z(24, 8, 3, 3), z(44, 8, 3, 3), z(62, 8, 3, 3),
    ],
    signs: [{ x: 12, y: 56 }, { x: 70, y: 30 }, { x: 14, y: 30 }, { x: 47, y: 46 }],
    roads: [
      [[START.x, START.y], [20, START.y], [20, 48], [68, 48], [68, 12], [16, 12], [16, 47]],
      [[43, 48], entrance(arena)],
      [[68, 42], [73, 42]],
      [[68, 26], [73, 26]],
      [[16, 22], [9, 22]],
      [[16, 37], [9, 37]],
    ],
    decor: { tree: 0.02, cliffTree: 0.12, boulder: 0.015, flowers: 0.06 },
  };
}

const LAYOUTS: Record<TerrainId, (c: Canvas) => Layout> = { riviere, foret, montagne, cote, archipel, marais, desert, canyon, lac };
export const TERRAINS = Object.keys(LAYOUTS) as TerrainId[];

/** Relief par défaut d'un thème, quand le chapitre n'en précise pas. */
const THEME_TERRAIN: Record<ThemeId, TerrainId> = {
  volcan: 'riviere', prairie: 'riviere', foret: 'foret', neige: 'montagne', desert: 'desert',
  marais: 'marais', cristal: 'canyon', plage: 'cote', automne: 'foret', nuit: 'lac',
};

export const terrainOf = (chapter: Pick<ChapterDef, 'terrain' | 'theme'>): TerrainId => chapter.terrain ?? THEME_TERRAIN[chapter.theme];

/** Disque de l'arène (sol sombre), entouré d'un anneau de roche ouvert d'un côté. */
function carveArena(c: Canvas, a: Arena): void {
  for (let y = a.y - a.r - 2; y <= a.y + a.r + 2; y++)
    for (let x = a.x - a.r - 2; x <= a.x + a.r + 2; x++) {
      const d = Math.hypot(x - a.x, y - a.y);
      const across = a.open === 'S' || a.open === 'N' ? x >= a.x - 2 && x <= a.x + 1 : y >= a.y - 2 && y <= a.y + 1;
      const side = { S: y > a.y, N: y < a.y, E: x > a.x, W: x < a.x }[a.open];
      if (d <= a.r || (d <= a.r + 1.5 && across && side)) c.set(x, y, Tile.Crater);
      else if (d <= a.r + 1.5) c.set(x, y, Tile.Rock);
    }
}

/** Cases atteignables à pied depuis `from`. */
export function reachableFrom(tiles: Tile[][], from: Point): boolean[][] {
  const seen = tiles.map((row) => row.map(() => false));
  const stack = [[from.x, from.y]];
  seen[from.y][from.x] = true;
  while (stack.length) {
    const [x, y] = stack.pop()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H || seen[ny][nx] || BLOCKING.has(tiles[ny][nx])) continue;
      seen[ny][nx] = true;
      stack.push([nx, ny]);
    }
  }
  return seen;
}

/**
 * Relie `target` au reste de la carte par le chemin le moins coûteux : franchir un obstacle coûte
 * plus cher que marcher, les panneaux et la bordure sont interdits. Les obstacles traversés
 * deviennent chemin (pont sur le liquide, escalier dans la falaise d'un plateau).
 */
function connect(c: Canvas, ok: boolean[][], target: Point, cliff: Set<number>): void {
  const cost = (t: Tile) => (t === Tile.Sign ? Infinity : BLOCKING.has(t) ? 8 : 1);
  const dist = c.tiles.map((row) => row.map(() => Infinity));
  const prev = new Map<number, number>();
  const key = (x: number, y: number) => y * MAP_W + x;
  dist[target.y][target.x] = 0;
  const open: [number, number, number][] = [[0, target.x, target.y]];
  while (open.length) {
    let best = 0;
    for (let i = 1; i < open.length; i++) if (open[i][0] < open[best][0]) best = i;
    const [d, x, y] = open.splice(best, 1)[0];
    if (d > dist[y][x]) continue;
    if (ok[y][x]) {
      // Remonte jusqu'à la cible en creusant.
      let k: number | undefined = key(x, y);
      while (k !== undefined) {
        const cx = k % MAP_W;
        const cy = Math.floor(k / MAP_W);
        const t = c.get(cx, cy);
        if (BLOCKING.has(t)) c.set(cx, cy, t === Tile.Lava ? Tile.Bridge : cliff.has(k) ? Tile.Stairs : Tile.Path);
        k = prev.get(k);
      }
      return;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (onBorder(nx, ny)) continue;
      const nd = d + cost(c.get(nx, ny));
      if (nd < dist[ny][nx]) {
        dist[ny][nx] = nd;
        prev.set(key(nx, ny), key(x, y));
        open.push([nd, nx, ny]);
      }
    }
  }
}

/** Zones d'herbes reculées que l'on hisse sur un plateau, loin du départ, de l'arène et des panneaux. */
function plateauSites(L: Layout): { zone: GrassZone; R: number }[] {
  const chosen: { zone: GrassZone; R: number }[] = [];
  const far = (p: Point, x: number, y: number, d: number) => Math.hypot(p.x - x, p.y - y) > d;
  for (const zone of [...L.zones].sort((a, b) => b.level - a.level)) {
    if (chosen.length >= (L.plateaus ?? 3)) break;
    const R = zone.r + 2;
    const { cx, cy } = zone;
    const fits =
      cx - R > 2 && cy - R > 2 && cx + R < MAP_W - 4 && cy + R < MAP_H - 4 &&
      far(L.arena, cx, cy, R + L.arena.r + 3) &&
      far(L.start, cx, cy, R + 5) &&
      far(L.guide, cx, cy, R + 4) &&
      L.signs.every((s) => far(s, cx, cy, R + 2)) &&
      // La falaise ne coupe pas une autre zone d'herbes en deux.
      L.zones.every((o) => o === zone || Math.abs(Math.hypot(o.cx - cx, o.cy - cy) - R) > o.r + 1.5) &&
      chosen.every((p) => far({ x: p.zone.cx, y: p.zone.cy }, cx, cy, p.R + R + 4));
    if (fits) chosen.push({ zone, R });
  }
  return chosen;
}

/**
 * Hisse une zone sur un plateau aux angles arrondis : une falaise d'une case l'entoure. Là où un
 * chemin la traverse, on taille un escalier. Le contenu du plateau ne change pas.
 */
function raisePlateau(c: Canvas, zone: GrassZone, R: number, raised: boolean[][], cliff: Set<number>): void {
  const inside = (x: number, y: number) =>
    Math.cbrt(Math.abs((x - zone.cx) / (R + 1)) ** 3 + Math.abs((y - zone.cy) / R) ** 3) < 1;
  const walk = (t: Tile) => t === Tile.Path || t === Tile.Stairs;
  const cells: [number, number][] = [];
  for (let y = Math.floor(zone.cy - R - 2); y <= zone.cy + R + 2; y++)
    for (let x = Math.floor(zone.cx - R - 3); x <= zone.cx + R + 3; x++) {
      if (!c.inside(x, y)) continue;
      if (inside(x, y)) {
        raised[y][x] = true;
        continue;
      }
      // Toute case qui touche le plateau, même en diagonale, fait partie de la falaise : pas de fuite.
      const touches = [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => inside(x + dx, y + dy)));
      if (touches && !onBorder(x, y)) cells.push([x, y]);
    }
  const before = (x: number, y: number) => c.get(x, y);
  const verdict = cells.map(([x, y]) => {
    const t = before(x, y);
    if (t === Tile.Lava || t === Tile.Bridge || t === Tile.Crater) return null;
    // Un chemin qui monte sur le plateau : chemin des deux côtés, dans l'axe.
    const across = (ax: number, ay: number, bx: number, by: number) =>
      walk(before(ax, ay)) && walk(before(bx, by)) && inside(ax, ay) !== inside(bx, by);
    const crossing = t === Tile.Path && (across(x, y - 1, x, y + 1) || across(x - 1, y, x + 1, y));
    return crossing ? Tile.Stairs : Tile.Rock;
  });
  cells.forEach(([x, y], i) => {
    const t = verdict[i];
    if (t === null) return;
    c.set(x, y, t);
    cliff.add(y * MAP_W + x);
  });
  // Un passage dégagé au pied de la falaise sud, pour que l'on puisse y atterrir d'un saut.
  for (const [x, y] of cells) {
    const below = c.get(x, y + 1);
    const foot = inside(x, y - 1) && !inside(x, y + 1) && !cliff.has((y + 1) * MAP_W + x) && !onBorder(x, y + 1);
    if (foot && (below === Tile.Tree || below === Tile.Boulder || below === Tile.Rock)) c.set(x, y + 1, Tile.Ground);
  }
}

function finish(c: Canvas, L: Layout): boolean[][] {
  const { rng } = c;
  // Bordure toujours fermée, même si une clairière ou une île la déborde.
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (onBorder(x, y) && !BLOCKING.has(c.get(x, y))) c.set(x, y, Tile.Rock);
  for (const zone of L.zones) c.blob(zone.cx, zone.cy, zone.r, Tile.Grass, 1.4, keepLiquid);
  for (const road of L.roads) c.road(road);
  carveArena(c, L.arena);

  // Plateaux en hauteur : on y monte par des escaliers, on en redescend aussi en sautant des corniches.
  const raised = c.tiles.map((row) => row.map(() => false));
  const cliff = new Set<number>();
  for (const { zone, R } of plateauSites(L)) raisePlateau(c, zone, R, raised, cliff);

  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) {
      if (c.get(x, y) !== Tile.Ground) continue;
      const nearCliff = [c.get(x - 1, y), c.get(x + 1, y), c.get(x, y - 1), c.get(x, y + 1)].includes(Tile.Rock);
      const r = rng.next();
      const { tree, cliffTree, boulder, flowers } = L.decor;
      if (nearCliff && r < cliffTree) c.set(x, y, Tile.Tree);
      else if (r < tree) c.set(x, y, Tile.Tree);
      else if (r < tree + boulder) c.set(x, y, Tile.Boulder);
      else if (r < tree + boulder + flowers) c.set(x, y, Tile.Flowers);
    }

  // Autour du départ, de la gardienne et des panneaux : rien ne bloque.
  const clear = (cx: number, cy: number, r: number) => {
    for (let y = cy - r; y <= cy + r; y++)
      for (let x = cx - r; x <= cx + r; x++) {
        const t = c.get(x, y);
        const rock = t === Tile.Rock && !onBorder(x, y) && !cliff.has(y * MAP_W + x);
        if (t === Tile.Tree || t === Tile.Boulder || t === Tile.Flowers || t === Tile.Grass || rock) c.set(x, y, Tile.Ground);
      }
  };
  clear(L.start.x, L.start.y, 2);
  clear(L.guide.x, L.guide.y, 1);
  for (const s of L.signs) {
    clear(s.x, s.y, 1);
    c.set(s.x, s.y, Tile.Sign);
  }

  // Réparation : chaque cible doit être atteignable depuis le départ.
  const zoneCell = (zone: GrassZone): Point => {
    let best = { x: zone.cx, y: zone.cy };
    let bestD = Infinity;
    for (let y = Math.floor(zone.cy - zone.r); y <= zone.cy + zone.r; y++)
      for (let x = Math.floor(zone.cx - zone.r); x <= zone.cx + zone.r; x++) {
        const d = Math.hypot(x - zone.cx, y - zone.cy);
        if (c.get(x, y) === Tile.Grass && d < bestD) [best, bestD] = [{ x, y }, d];
      }
    return best;
  };
  const beside = (p: Point): Point => [{ x: p.x, y: p.y + 1 }, { x: p.x - 1, y: p.y }, { x: p.x + 1, y: p.y }, { x: p.x, y: p.y - 1 }].find((q) => !onBorder(q.x, q.y))!;
  const targets = [{ x: L.arena.x, y: L.arena.y }, ...L.zones.map(zoneCell), beside(L.guide), ...L.signs.map(beside)];
  for (const target of targets) {
    const ok = reachableFrom(c.tiles, L.start);
    if (!ok[target.y][target.x]) connect(c, ok, target, cliff);
  }

  // Corniches : sur la falaise sud d'un plateau, entre deux cases déjà reliées au départ. Elles ne
  // font qu'offrir un raccourci vers le bas : personne ne peut s'y retrouver coincé.
  // Un recoin au pied d'un plateau, coupé du reste, est d'abord relié : on pourra y sauter sans s'y bloquer.
  let ok = reachableFrom(c.tiles, L.start);
  for (const k of cliff) {
    const x = k % MAP_W;
    const y = Math.floor(k / MAP_W);
    const below = { x, y: y + 1 };
    if (c.get(x, y) !== Tile.Rock || !raised[y - 1]?.[x] || raised[below.y]?.[x] || cliff.has(below.y * MAP_W + x)) continue;
    if (!ok[y - 1][x] || ok[below.y][x] || BLOCKING.has(c.get(below.x, below.y)) || onBorder(below.x, below.y)) continue;
    connect(c, ok, below, cliff);
    ok = reachableFrom(c.tiles, L.start);
  }
  const ledge = (x: number, y: number) =>
    c.get(x, y) === Tile.Rock && cliff.has(y * MAP_W + x) && raised[y - 1]?.[x] === true && !raised[y + 1]?.[x] &&
    !cliff.has((y + 1) * MAP_W + x) && ok[y - 1]?.[x] === true && ok[y + 1]?.[x] === true;
  const ledges: Point[] = [];
  for (let y = 1; y < MAP_H - 1; y++)
    for (let x = 1; x < MAP_W - 1; x++) if (ledge(x, y) && (ledge(x - 1, y) || ledge(x + 1, y))) ledges.push({ x, y });
  for (const p of ledges) c.set(p.x, p.y, Tile.Ledge);
  return raised;
}

/** Retourne la carte de gauche à droite : chaque relief existe dans les deux sens. */
function mirror(c: Canvas, L: Layout, raised: boolean[][]): Layout {
  for (const row of c.tiles) row.reverse();
  for (const row of raised) row.reverse();
  const fx = (p: Point) => ({ x: MAP_W - 1 - p.x, y: p.y });
  const open: Side = L.arena.open === 'E' ? 'W' : L.arena.open === 'W' ? 'E' : L.arena.open;
  return {
    ...L,
    start: fx(L.start),
    guide: fx(L.guide),
    arena: { ...L.arena, ...fx(L.arena), open },
    zones: L.zones.map((zone) => ({ ...zone, cx: MAP_W - 1 - zone.cx })),
    signs: L.signs.map(fx),
  };
}

export function buildMap(seed: number, terrain: TerrainId = 'riviere'): RegionMap {
  const rng = new Rng(seed);
  const c = new Canvas(rng);
  let L = LAYOUTS[terrain](c);
  const raised = finish(c, L);
  // La région d'origine (graine par défaut) garde son sens ; les autres sont retournées une fois sur deux.
  if (seed !== 2026 && rng.next() < 0.5) L = mirror(c, L, raised);
  const zones = L.zones;
  const zoneAt = (x: number, y: number) => {
    if (c.tiles[y]?.[x] !== Tile.Grass) return null;
    let best: GrassZone | null = null;
    let bestD = Infinity;
    for (const zone of zones) {
      const d = Math.hypot(x - zone.cx, y - zone.cy) - zone.r;
      if (d < bestD) [best, bestD] = [zone, d];
    }
    return best;
  };
  return { terrain, tiles: c.tiles, zones, start: L.start, guide: L.guide, arena: L.arena, signs: L.signs, raised, zoneAt };
}
