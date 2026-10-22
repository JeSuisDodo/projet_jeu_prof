import type { Level } from '../exercises/types';
import { Rng } from '../exercises/rng';
import type { TerrainId } from '../content/types';

/**
 * Cases, dimensions et outils de dessin des cartes. Chaque région a un relief (forêt, montagne,
 * côte…) décrit dans `layouts.ts` ; le décor fin dépend de la graine de la région et les couleurs
 * de son thème.
 */

export const TILE = 32;
export const MAP_W = 80;
export const MAP_H = 60;

export enum Tile {
  Ground,
  Grass,
  /** Falaise : bords de la carte, montagnes, parois des grottes. */
  Rock,
  /** « Liquide » infranchissable : lave, eau, mer… selon le thème. */
  Lava,
  Path,
  Crater,
  Bridge,
  Tree,
  Boulder,
  /** Fleurs et cailloux : décor que l'on peut traverser. */
  Flowers,
  Sign,
  /** Escalier taillé dans la falaise d'un plateau : on y monte et on en descend. */
  Stairs,
  /** Corniche au sud d'un plateau : on saute par-dessus vers le bas, on ne la remonte pas. */
  Ledge,
}

/** Cases infranchissables. La corniche l'est aussi, sauf en sautant vers le sud (voir WorldScene). */
export const BLOCKING = new Set([Tile.Rock, Tile.Lava, Tile.Tree, Tile.Boulder, Tile.Sign, Tile.Ledge]);

export interface Point {
  x: number;
  y: number;
}

/** Une zone de hautes herbes et le niveau de ses créatures. */
export interface GrassZone {
  cx: number;
  cy: number;
  r: number;
  level: Level;
}

export type Side = 'N' | 'S' | 'E' | 'W';

/** Arène du gardien : un cercle de rayon r, ouvert d'un côté. */
export interface Arena extends Point {
  r: number;
  open: Side;
}

export interface RegionMap {
  terrain: TerrainId;
  tiles: Tile[][];
  zones: GrassZone[];
  start: Point;
  guide: Point;
  arena: Arena;
  /** Panneaux : près du départ, deux le long du chemin, devant l'arène. Leur texte dépend de la région. */
  signs: Point[];
  /** Cases en hauteur, sur un plateau : le décor y est plus clair. */
  raised: boolean[][];
  zoneAt: (x: number, y: number) => GrassZone | null;
}

/** Graine du décor d'une région, tirée de son identifiant. */
export function seedFor(regionId: string): number {
  let h = 2166136261;
  for (let i = 0; i < regionId.length; i++) h = Math.imul(h ^ regionId.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Direction de `to` vu depuis `from`, pour les répliques : « au nord-est ». */
export function directionWord(from: Point, to: Point): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const ns = dy < -Math.abs(dx) / 2 ? 'nord' : dy > Math.abs(dx) / 2 ? 'sud' : '';
  const ew = dx > Math.abs(dy) / 2 ? 'est' : dx < -Math.abs(dy) / 2 ? 'ouest' : '';
  return `au ${[ns, ew].filter(Boolean).join('-') || 'centre'}`;
}

/** Une case est-elle sur la bordure infranchissable (deux cases depuis le bord) ? */
export const onBorder = (x: number, y: number) => x < 2 || y < 2 || x >= MAP_W - 2 || y >= MAP_H - 2;

/** Feuille de dessin d'une carte : les reliefs s'y tracent avant que `layouts.ts` n'ajoute chemins et décor. */
export class Canvas {
  readonly tiles: Tile[][];

  constructor(
    readonly rng: Rng,
    fill = Tile.Ground,
  ) {
    this.tiles = Array.from({ length: MAP_H }, () => Array<Tile>(MAP_W).fill(fill));
  }

  fill(t: Tile): void {
    for (const row of this.tiles) row.fill(t);
  }

  inside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;
  }

  get(x: number, y: number): Tile {
    return this.inside(x, y) ? this.tiles[y][x] : Tile.Rock;
  }

  set(x: number, y: number, t: Tile): void {
    if (this.inside(x, y)) this.tiles[y][x] = t;
  }

  /** Disque au bord irrégulier ; `keep` protège certaines cases. */
  blob(cx: number, cy: number, r: number, t: Tile, jitter = 1, keep?: (old: Tile) => boolean): void {
    this.ellipse(cx, cy, r, r, t, jitter, keep);
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, t: Tile, jitter = 1, keep?: (old: Tile) => boolean): void {
    for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++)
      for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
        const d = Math.hypot((x - cx) / rx, (y - cy) / ry) * Math.min(rx, ry);
        if (d <= Math.min(rx, ry) + this.rng.next() * jitter - jitter / 2 && !keep?.(this.get(x, y))) this.set(x, y, t);
      }
  }

  /** Falaises du pourtour, au bord irrégulier. */
  cliffs(base = 2): void {
    for (let y = 0; y < MAP_H; y++)
      for (let x = 0; x < MAP_W; x++) {
        const edge = Math.min(x, y, MAP_W - 1 - x, MAP_H - 1 - y);
        const depth = base + Math.round(1.2 + 1.2 * Math.sin(x / 5 + y / 7));
        if (edge < depth) this.set(x, y, Tile.Rock);
      }
  }

  /**
   * Trace une suite de segments en L (d'abord horizontal, puis vertical) de largeur `width`.
   * `paint` décide de la case posée à partir de l'ancienne.
   */
  polyline(points: [number, number][], width: number, paint: (old: Tile) => Tile | null): void {
    const put = (x: number, y: number) => {
      if (onBorder(x, y)) return;
      const t = paint(this.get(x, y));
      if (t !== null) this.set(x, y, t);
    };
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      for (let x = Math.min(x0, x1); x <= Math.max(x0, x1) + width - 1; x++) for (let w = 0; w < width; w++) put(x, y0 + w);
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let w = 0; w < width; w++) put(x1 + w, y);
    }
  }

  /** Chemin de terre : il franchit le liquide par des ponts et ouvre un passage dans la roche et les arbres. */
  road(points: [number, number][], width = 2): void {
    this.polyline(points, width, (old) =>
      old === Tile.Lava || old === Tile.Bridge ? Tile.Bridge : old === Tile.Crater || old === Tile.Sign ? null : Tile.Path,
    );
  }

  /** Bruit lisse dans [-1 ; 1], somme de sinusoïdes aux phases tirées au hasard. */
  noise(scale = 1): (x: number, y: number) => number {
    const waves = Array.from({ length: 4 }, () => ({
      fx: (0.05 + this.rng.next() * 0.12) / scale,
      fy: (0.05 + this.rng.next() * 0.12) / scale,
      p: this.rng.next() * Math.PI * 2,
    }));
    return (x, y) => waves.reduce((s, w) => s + Math.sin(x * w.fx + y * w.fy + w.p) + Math.sin(x * w.fy - y * w.fx + w.p * 1.7), 0) / 8;
  }
}
