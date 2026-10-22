import { describe, expect, it } from 'vitest';
import { allChapters } from '../src/content';
import { Rng } from '../src/exercises/rng';
import { ENCOUNTER_ODDS, RARITY, encounterTable, pickEncounter, rarityOf } from '../src/game/rarity';

describe('rareté des créatures', () => {
  it('chaque région a des communes et au moins une rare, les plus rares en fin de liste', () => {
    const order = ['commune', 'peu-commune', 'rare', 'legendaire'];
    for (const chapter of allChapters()) {
      const rarities = chapter.creatures.map((c) => rarityOf(chapter, c));
      expect(rarities[0], chapter.id).toBe('commune');
      expect(rarities.some((r) => r === 'rare' || r === 'legendaire'), chapter.id).toBe(true);
      const ranks = rarities.map((r) => order.indexOf(r));
      expect(ranks, chapter.id).toEqual([...ranks].sort((a, b) => a - b));
    }
  });

  it('plus une créature est rare, plus ses questions sont difficiles et plus elle résiste', () => {
    const list = Object.values(RARITY);
    for (let i = 1; i < list.length; i++) {
      expect(list[i].level).toBeGreaterThanOrEqual(list[i - 1].level);
      expect(list[i].hearts).toBeGreaterThan(list[i - 1].hearts);
      expect(list[i].xp).toBeGreaterThan(list[i - 1].xp);
    }
    expect(RARITY.commune.level).toBe(1);
    expect(RARITY.rare.level).toBe(3);
  });

  it('les tables de rencontre forment des probabilités, et les rares se cachent au fond', () => {
    for (const chapter of allChapters())
      for (const level of [1, 2, 3] as const) {
        const table = encounterTable(chapter, level);
        expect(table.reduce((s, e) => s + e.p, 0)).toBeCloseTo(1, 9);
        const rareOdds = table.filter((e) => ['rare', 'legendaire'].includes(rarityOf(chapter, e.creature))).reduce((s, e) => s + e.p, 0);
        if (level > 1) {
          const below = encounterTable(chapter, (level - 1) as 1 | 2)
            .filter((e) => ['rare', 'legendaire'].includes(rarityOf(chapter, e.creature)))
            .reduce((s, e) => s + e.p, 0);
          expect(rareOdds, `${chapter.id} niveau ${level}`).toBeGreaterThan(below);
        }
      }
    // Pas de légendaire dans les herbes près du départ.
    expect(ENCOUNTER_ODDS[1].legendaire).toBe(0);
  });

  it('le tirage suit la table', () => {
    const chapter = allChapters().find((c) => c.creatures.some((x) => rarityOf(c, x) === 'legendaire'))!;
    const rng = new Rng(42);
    const counts = new Map<string, number>();
    const N = 20000;
    for (let i = 0; i < N; i++) {
      const c = pickEncounter(chapter, 3, rng);
      counts.set(c.id, (counts.get(c.id) ?? 0) + 1);
    }
    for (const { creature, p } of encounterTable(chapter, 3)) expect((counts.get(creature.id) ?? 0) / N).toBeCloseTo(p, 1);
  });
});
