import { describe, expect, it } from 'vitest';
import { allChapters } from '../src/content';
import { BLOCKING, CRATER, GRASS_ZONES, GUIDE, MAP_H, MAP_W, SIGNS, START, Tile, buildMap, seedFor } from '../src/game/map';

/** Cases atteignables à pied depuis le départ. */
function reachable(tiles: Tile[][]) {
  const seen = new Set<string>([`${START.x},${START.y}`]);
  const queue = [[START.x, START.y]];
  while (queue.length) {
    const [x, y] = queue.pop()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H || seen.has(key) || BLOCKING.has(tiles[ny][nx])) continue;
      seen.add(key);
      queue.push([nx, ny]);
    }
  }
  return seen;
}

// Le décor change d'une région à l'autre : chaque graine doit laisser tout atteignable.
const seeds = [2026, ...Array.from({ length: 40 }, (_, i) => i * 7919 + 1), ...allChapters().map((c) => seedFor(c.id))];

describe.each(seeds)('carte, graine %i', (seed) => {
  const map = buildMap(seed);

  it('le départ est praticable', () => {
    expect(BLOCKING.has(map.tiles[START.y][START.x])).toBe(false);
  });

  it('le gardien du cratère et chaque zone de hautes herbes sont atteignables', () => {
    const ok = reachable(map.tiles);
    expect(ok.has(`${CRATER.x},${CRATER.y}`)).toBe(true);
    for (const zone of GRASS_ZONES) {
      const grass = [...ok].map((k) => k.split(',').map(Number)).filter(([x, y]) => map.zoneAt(x, y) === zone);
      expect(grass.length, `zone ${zone.cx},${zone.cy}`).toBeGreaterThan(5);
    }
  });

  it('on peut parler à la gardienne et lire chaque panneau', () => {
    const ok = reachable(map.tiles);
    const besideReachable = (x: number, y: number) =>
      [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => ok.has(`${x + dx},${y + dy}`));
    expect(besideReachable(GUIDE.x, GUIDE.y)).toBe(true);
    for (const s of SIGNS) {
      expect(map.tiles[s.y][s.x]).toBe(Tile.Sign);
      expect(besideReachable(s.x, s.y), `panneau ${s.x},${s.y}`).toBe(true);
    }
  });
});
