import { describe, expect, it } from 'vitest';
import { allChapters } from '../src/content';
import { TERRAINS, buildMap, reachableFrom, terrainOf } from '../src/game/layouts';
import { BLOCKING, MAP_H, MAP_W, Tile, seedFor } from '../src/game/map';

// Chaque relief, avec plusieurs graines (dont des cartes retournées), et chaque région du jeu.
const cases: [string, number, (typeof TERRAINS)[number]][] = [
  ...TERRAINS.flatMap((t) => [2026, ...Array.from({ length: 12 }, (_, i) => i * 7919 + 1)].map((seed): [string, number, typeof t] => [t, seed, t])),
  ...allChapters().map((c): [string, number, (typeof TERRAINS)[number]] => [c.id, seedFor(c.id), terrainOf(c)]),
];

describe.each(cases)('carte %s, graine %i', (_name, seed, terrain) => {
  const map = buildMap(seed, terrain);
  const ok = reachableFrom(map.tiles, map.start);
  const at = (x: number, y: number) => ok[y]?.[x] === true;

  it('le départ est praticable et la bordure fermée', () => {
    expect(BLOCKING.has(map.tiles[map.start.y][map.start.x])).toBe(false);
    for (let x = 0; x < MAP_W; x++) for (const y of [0, MAP_H - 1]) expect(BLOCKING.has(map.tiles[y][x])).toBe(true);
    for (let y = 0; y < MAP_H; y++) for (const x of [0, MAP_W - 1]) expect(BLOCKING.has(map.tiles[y][x])).toBe(true);
  });

  it('le gardien de l’arène et chaque zone de hautes herbes sont atteignables', () => {
    expect(at(map.arena.x, map.arena.y)).toBe(true);
    expect(map.tiles[map.arena.y][map.arena.x]).toBe(Tile.Crater);
    expect(map.zones.map((zone) => zone.level)).toEqual([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3]);
    for (const zone of map.zones) {
      let grass = 0;
      for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (at(x, y) && map.zoneAt(x, y) === zone) grass++;
      expect(grass, `zone ${zone.cx},${zone.cy}`).toBeGreaterThan(5);
    }
  });

  it('on ne reste jamais coincé au pied d’une corniche', () => {
    for (let y = 0; y < MAP_H; y++)
      for (let x = 0; x < MAP_W; x++) {
        if (map.tiles[y][x] !== Tile.Ledge) continue;
        // On saute du plateau (au nord) vers une case d'où l'on peut revenir à pied (au sud).
        expect(map.raised[y - 1][x], `corniche ${x},${y}`).toBe(true);
        expect(at(x, y - 1) && at(x, y + 1), `corniche ${x},${y}`).toBe(true);
      }
  });

  it('on peut parler à la gardienne et lire chaque panneau', () => {
    const besideReachable = (x: number, y: number) =>
      [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => at(x + dx, y + dy));
    expect(besideReachable(map.guide.x, map.guide.y)).toBe(true);
    expect(map.signs).toHaveLength(4);
    for (const s of map.signs) {
      expect(map.tiles[s.y][s.x]).toBe(Tile.Sign);
      expect(besideReachable(s.x, s.y), `panneau ${s.x},${s.y}`).toBe(true);
    }
  });

  it('la Maison du savoir est près du départ et l’on peut entrer par sa porte', () => {
    const { x, y } = map.house;
    for (let dy = -2; dy <= 0; dy++) for (let dx = -1; dx <= 1; dx++) expect(map.tiles[y + dy][x + dx]).toBe(Tile.House);
    expect(at(x, y + 1), `porte ${x},${y}`).toBe(true);
    expect(Math.hypot(x - map.start.x, y - map.start.y)).toBeLessThan(20);
  });
});

describe('reliefs', () => {
  it('chaque relief a son propre visage', () => {
    // Part de chaque type de case et morcellement du liquide (un lac ou cent mares) :
    // deux reliefs ne doivent pas se ressembler.
    const pools = (grid: Tile[][]) => {
      const seen = grid.map((row) => row.map(() => false));
      let count = 0;
      for (let y = 0; y < MAP_H; y++)
        for (let x = 0; x < MAP_W; x++) {
          if (seen[y][x] || grid[y][x] !== Tile.Lava) continue;
          count++;
          const stack = [[x, y]];
          seen[y][x] = true;
          while (stack.length) {
            const [px, py] = stack.pop()!;
            for (const [nx, ny] of [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]])
              if (grid[ny]?.[nx] === Tile.Lava && !seen[ny][nx]) {
                seen[ny][nx] = true;
                stack.push([nx, ny]);
              }
          }
        }
      return count;
    };
    const profile = (t: (typeof TERRAINS)[number]) => {
      const grid = buildMap(7, t).tiles;
      const tiles = grid.flat();
      return [...[Tile.Rock, Tile.Lava, Tile.Tree].map((k) => tiles.filter((x) => x === k).length / tiles.length), pools(grid) / 200];
    };
    const profiles = TERRAINS.map(profile);
    for (let i = 0; i < profiles.length; i++)
      for (let j = i + 1; j < profiles.length; j++) {
        const gap = Math.max(...profiles[i].map((v, k) => Math.abs(v - profiles[j][k])));
        expect(gap, `${TERRAINS[i]} / ${TERRAINS[j]}`).toBeGreaterThan(0.03);
      }
  });

  it('presque tous les reliefs ont des plateaux, avec escaliers et corniches', () => {
    for (const t of TERRAINS.filter((t) => t !== 'canyon' && t !== 'archipel')) {
      const tiles = [2026, 1, 7920, 15839].flatMap((seed) => buildMap(seed, t).tiles.flat());
      expect(tiles.filter((x) => x === Tile.Stairs).length, t).toBeGreaterThan(0);
      expect(tiles.filter((x) => x === Tile.Ledge).length, t).toBeGreaterThan(0);
    }
  });

  it('les régions d’une même île ne se suivent pas avec le même relief', () => {
    const chapters = allChapters();
    for (let i = 1; i < chapters.length; i++)
      if (chapters[i].id.split('-')[0] === chapters[i - 1].id.split('-')[0])
        expect(terrainOf(chapters[i]), `${chapters[i - 1].id} → ${chapters[i].id}`).not.toBe(terrainOf(chapters[i - 1]));
  });
});
