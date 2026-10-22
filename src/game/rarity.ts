import type { ChapterDef, CreatureDef, Rarity } from '../content/types';
import type { Rng } from '../exercises/rng';
import type { Level } from '../exercises/types';

/**
 * Raretés des créatures. Une créature rare se montre peu, pose des questions plus difficiles,
 * résiste plus longtemps et rapporte plus d'expérience. Une légendaire ne donne pas d'indice.
 */
export interface RarityInfo {
  label: string;
  stars: number;
  /** Niveau des questions posées. */
  level: Level;
  /** Bonnes réponses nécessaires pour la capturer. */
  hearts: number;
  xp: number;
  hint: boolean;
}

export const RARITY: Record<Rarity, RarityInfo> = {
  commune: { label: 'Commune', stars: 1, level: 1, hearts: 1, xp: 10, hint: true },
  'peu-commune': { label: 'Peu commune', stars: 2, level: 2, hearts: 2, xp: 20, hint: true },
  rare: { label: 'Rare', stars: 3, level: 3, hearts: 3, xp: 35, hint: true },
  legendaire: { label: 'Légendaire', stars: 4, level: 3, hearts: 4, xp: 60, hint: false },
};

/** Rareté par défaut selon la place dans la liste du chapitre, pour 3 à 6 créatures. */
const BY_COUNT: Record<number, Rarity[]> = {
  1: ['commune'],
  2: ['commune', 'rare'],
  3: ['commune', 'peu-commune', 'rare'],
  4: ['commune', 'peu-commune', 'rare', 'legendaire'],
  5: ['commune', 'commune', 'peu-commune', 'rare', 'legendaire'],
  6: ['commune', 'commune', 'peu-commune', 'peu-commune', 'rare', 'legendaire'],
};

export function rarityOf(chapter: ChapterDef, creature: CreatureDef): Rarity {
  if (creature.rarity) return creature.rarity;
  const n = chapter.creatures.length;
  const list = BY_COUNT[Math.min(6, n)];
  const i = chapter.creatures.indexOf(creature);
  // Au-delà de six, les créatures en trop prennent la rareté de leur rang proportionnel.
  return list[Math.min(list.length - 1, Math.floor((Math.max(0, i) * list.length) / Math.max(1, n)))];
}

/**
 * Chances de croiser chaque rareté selon le niveau des herbes : près du départ presque que des
 * communes, dans les herbes reculées davantage de rares, et parfois une légendaire.
 */
export const ENCOUNTER_ODDS: Record<Level, Record<Rarity, number>> = {
  1: { commune: 70, 'peu-commune': 25, rare: 5, legendaire: 0 },
  2: { commune: 40, 'peu-commune': 40, rare: 17, legendaire: 3 },
  3: { commune: 20, 'peu-commune': 35, rare: 35, legendaire: 10 },
};

/** Probabilité de rencontrer chaque créature du chapitre dans des herbes de ce niveau. */
export function encounterTable(chapter: ChapterDef, level: Level): { creature: CreatureDef; p: number }[] {
  const rarities = chapter.creatures.map((c) => rarityOf(chapter, c));
  const count = (r: Rarity) => rarities.filter((x) => x === r).length;
  const weights = chapter.creatures.map((_, i) => ENCOUNTER_ODDS[level][rarities[i]] / count(rarities[i]));
  const total = weights.reduce((a, b) => a + b, 0);
  // Une région sans créature à ce niveau de rareté : on retombe sur un tirage uniforme.
  if (total === 0) return chapter.creatures.map((creature) => ({ creature, p: 1 / chapter.creatures.length }));
  return chapter.creatures.map((creature, i) => ({ creature, p: weights[i] / total }));
}

export function pickEncounter(chapter: ChapterDef, level: Level, rng: Rng): CreatureDef {
  const table = encounterTable(chapter, level);
  let r = rng.next();
  for (const { creature, p } of table) {
    r -= p;
    if (r < 0) return creature;
  }
  return table[table.length - 1].creature;
}

/** « ★★★☆ » */
export const starsOf = (rarity: Rarity) => '★'.repeat(RARITY[rarity].stars) + '☆'.repeat(4 - RARITY[rarity].stars);
