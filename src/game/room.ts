/** Plan de la salle de la Maison du savoir (sans Phaser, pour les tests). */

export interface Cell {
  x: number;
  y: number;
}

/** Les coins de la salle ; chacun a son mobilier, et un PNJ s'y installe. */
export type StationKind = 'bibliotheque' | 'bureau' | 'globe' | 'laboratoire' | 'lecture' | 'aquarium' | 'tableau';

export interface Station {
  kind: StationKind;
  /** Case du PNJ (ses pieds), debout ou assis selon le coin. */
  npc: Cell;
  /** Le PNJ est assis (au bureau, dans le fauteuil) : on ne voit que le haut de son corps. */
  seated?: boolean;
  /** Cases occupées par le mobilier du coin, même sans PNJ. */
  furniture: Cell[];
  /** Case d'où l'on parle au PNJ (toujours libre et accessible depuis la porte). */
  talk: Cell;
}

/** La pièce, en cases : le mur du fond occupe les 3 premières rangées, la porte est en bas au milieu. */
export const ROOM_W = 20;
export const ROOM_H = 14;
export const WALL = 3;
export const ROOM_DOOR: Cell = { x: 10, y: ROOM_H - 1 };

const c = (x: number, y: number): Cell => ({ x, y });

/**
 * Les postes des spécialistes, dans l'ordre des créatures : la première s'étudie à la
 * bibliothèque, la deuxième au bureau, etc. Les coins sans PNJ gardent leur mobilier.
 */
export const STATIONS: Station[] = [
  // Bibliothèque : étagères du mur, une étagère isolée, l'échelle ; le PNJ cherche un livre.
  { kind: 'bibliotheque', npc: c(3, 4), furniture: [c(1, 6), c(2, 6), c(3, 6), c(5, 3)], talk: c(4, 4) },
  // Grand bureau en haut à droite : le PNJ y est assis, sur sa chaise.
  { kind: 'bureau', npc: c(16, 4), seated: true, furniture: [c(15, 5), c(16, 5), c(17, 5)], talk: c(16, 6) },
  // Mappemonde sur son pied.
  { kind: 'globe', npc: c(3, 9), furniture: [c(2, 9)], talk: c(4, 9) },
  // Paillasse avec fioles et alambic : le PNJ se tient derrière.
  { kind: 'laboratoire', npc: c(16, 8), furniture: [c(15, 9), c(16, 9), c(17, 9)], talk: c(16, 10) },
  // Coin lecture : fauteuil, guéridon et lampe.
  { kind: 'lecture', npc: c(2, 12), seated: true, furniture: [c(3, 12), c(1, 11)], talk: c(2, 11) },
  // Aquarium.
  { kind: 'aquarium', npc: c(15, 12), furniture: [c(16, 12), c(17, 12)], talk: c(14, 12) },
];

/** Le sage devant le tableau, derrière son lutrin. */
export const SAGE_STATION: Station = { kind: 'tableau', npc: c(10, 4), furniture: [c(10, 5)], talk: c(10, 6) };

/** Décor libre : plantes, table ronde et tabourets. */
export const DECOR: { kind: 'plante' | 'table' | 'tabouret'; at: Cell }[] = [
  { kind: 'plante', at: c(7, 3) },
  { kind: 'plante', at: c(13, 3) },
  { kind: 'plante', at: c(18, 3) },
  { kind: 'plante', at: c(18, 12) },
  { kind: 'table', at: c(6, 9) },
  { kind: 'tabouret', at: c(5, 9) },
  { kind: 'tabouret', at: c(7, 9) },
  { kind: 'table', at: c(13, 9) },
  { kind: 'tabouret', at: c(12, 9) },
  { kind: 'tabouret', at: c(14, 9) },
];

/** Postes occupés pour `npcs` PNJ (le sage en dernier). */
export const stationsFor = (npcs: number): Station[] => [...STATIONS.slice(0, npcs - 1), SAGE_STATION];

/** Cases infranchissables : murs, mobilier de tous les coins, décor et PNJ présents. */
export function roomBlocking(npcs: number): boolean[][] {
  const grid = Array.from({ length: ROOM_H }, (_, y) =>
    Array.from({ length: ROOM_W }, (_, x) => y < WALL || x === 0 || x === ROOM_W - 1 || (y === ROOM_H - 1 && x !== ROOM_DOOR.x)),
  );
  for (const s of [...STATIONS, SAGE_STATION]) for (const f of s.furniture) grid[f.y][f.x] = true;
  for (const d of DECOR) grid[d.at.y][d.at.x] = true;
  for (const s of stationsFor(npcs)) grid[s.npc.y][s.npc.x] = true;
  return grid;
}
