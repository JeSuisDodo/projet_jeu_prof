import type { Level } from '../exercises/types';
import { Rng } from '../exercises/rng';

/** Carte de la région du Volcan du Second degré, générée de façon déterministe. */

export const TILE = 32;
export const MAP_W = 48;
export const MAP_H = 36;

export enum Tile {
  Ground,
  Grass,
  Rock,
  Lava,
  Path,
  Crater,
  Bridge,
}

export const BLOCKING = new Set([Tile.Rock, Tile.Lava]);

/** Une zone de hautes herbes : ses créatures et leur niveau. */
export interface GrassZone {
  cx: number;
  cy: number;
  r: number;
  level: Level;
  creatures: string[];
}

export const GRASS_ZONES: GrassZone[] = [
  // Sud, près du départ : niveau 1.
  { cx: 11, cy: 27, r: 4, level: 1, creatures: ['parabolux', 'deltaire'] },
  { cx: 23, cy: 30, r: 3.5, level: 1, creatures: ['racinelle', 'parabolux'] },
  { cx: 36, cy: 27, r: 4, level: 1, creatures: ['deltaire', 'racinelle'] },
  // Nord, après la rivière de lave : niveau 2.
  { cx: 8, cy: 9, r: 4, level: 2, creatures: ['canonyx', 'parabolux'] },
  { cx: 20, cy: 7, r: 3.5, level: 2, creatures: ['signombre', 'deltaire'] },
  { cx: 27, cy: 12, r: 3, level: 2, creatures: ['racinelle', 'canonyx'] },
  // Au pied du cratère : niveau 3.
  { cx: 35, cy: 13, r: 3, level: 3, creatures: ['signombre', 'canonyx', 'racinelle'] },
];

export const START = { x: 5, y: 31 };
export const GUIDE = { x: 7, y: 30 };
export const CRATER = { x: 41, y: 8, r: 4 };
const BRIDGES = [12, 13, 34, 35];

export const riverY = (x: number) => 17 + Math.round(2.5 * Math.sin(x / 3.5));

export interface RegionMap {
  tiles: Tile[][];
  zoneAt: (x: number, y: number) => GrassZone | null;
}

export function buildMap(seed = 2026): RegionMap {
  const rng = new Rng(seed);
  const tiles: Tile[][] = Array.from({ length: MAP_H }, () => Array<Tile>(MAP_W).fill(Tile.Ground));
  const set = (x: number, y: number, t: Tile) => {
    if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) tiles[y][x] = t;
  };
  const dist = (x: number, y: number, cx: number, cy: number) => Math.hypot(x - cx, y - cy);

  for (const zone of GRASS_ZONES) {
    for (let y = 0; y < MAP_H; y++)
      for (let x = 0; x < MAP_W; x++)
        if (dist(x, y, zone.cx, zone.cy) <= zone.r + rng.next() * 1.2 - 0.4) set(x, y, Tile.Grass);
  }

  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++)
      if (tiles[y][x] === Tile.Ground && rng.next() < 0.035) set(x, y, Tile.Rock);

  // Chemin du départ au premier pont, puis du pont au cratère.
  const walk = (x0: number, y0: number, x1: number, y1: number) => {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) set(x, y0, Tile.Path);
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) set(x1, y, Tile.Path);
  };
  walk(START.x, START.y, 12, riverY(12) + 2);
  walk(13, riverY(13) - 1, 30, 4);
  walk(30, 4, CRATER.x - 5, 4);

  for (let x = 2; x < MAP_W - 2; x++) {
    const y = riverY(x);
    const t = BRIDGES.includes(x) ? Tile.Bridge : Tile.Lava;
    set(x, y, t);
    set(x, y + 1, t);
  }
  for (let y = 28; y < 33; y++) for (let x = 27; x < 32; x++) if (dist(x, y, 29, 30.5) < 1.8) set(x, y, Tile.Lava);

  for (let y = CRATER.y - CRATER.r - 1; y <= CRATER.y + CRATER.r + 1; y++)
    for (let x = CRATER.x - CRATER.r - 1; x <= CRATER.x + CRATER.r + 1; x++) {
      const d = dist(x, y, CRATER.x, CRATER.y);
      const opening = y > CRATER.y && Math.abs(x - CRATER.x) <= 1;
      if (d <= CRATER.r || (d <= CRATER.r + 1 && opening)) set(x, y, Tile.Crater);
      else if (d <= CRATER.r + 1) set(x, y, Tile.Rock);
    }

  for (let y = START.y - 2; y <= START.y + 2; y++)
    for (let x = START.x - 2; x <= START.x + 3; x++) if (tiles[y]?.[x] === Tile.Rock) set(x, y, Tile.Ground);

  for (let x = 0; x < MAP_W; x++) for (const y of [0, 1, MAP_H - 2, MAP_H - 1]) set(x, y, Tile.Rock);
  for (let y = 0; y < MAP_H; y++) for (const x of [0, 1, MAP_W - 2, MAP_W - 1]) set(x, y, Tile.Rock);

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
