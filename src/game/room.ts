/** Plan de la salle de classe de la Maison du savoir (sans Phaser, pour les tests). */

/** La pièce, en cases : le mur du fond occupe les 3 premières rangées, la porte est en bas au milieu. */
export const ROOM_W = 17;
export const ROOM_H = 12;
export const WALL = 3;
export const ROOM_DOOR = { x: 8, y: ROOM_H - 1 };
/** Places des PNJ : les spécialistes des créatures le long des pupitres, le sage devant le tableau. */
const SPOTS = [
  { x: 3, y: 5 },
  { x: 6, y: 5 },
  { x: 10, y: 5 },
  { x: 13, y: 5 },
  { x: 3, y: 8 },
  { x: 13, y: 8 },
];
export const SAGE = { x: 8, y: 4 };

/** Cases infranchissables de la pièce : murs, PNJ et leurs pupitres, bibliothèques et plantes. */
export function roomBlocking(npcs: number): boolean[][] {
  const grid = Array.from({ length: ROOM_H }, (_, y) =>
    Array.from({ length: ROOM_W }, (_, x) => y < WALL || x === 0 || x === ROOM_W - 1 || (y === ROOM_H - 1 && x !== ROOM_DOOR.x)),
  );
  const spots = [...SPOTS.slice(0, npcs - 1), SAGE];
  for (const s of spots) grid[s.y][s.x] = true;
  // Pupitre devant chaque spécialiste (pas devant le sage, qui se tient au tableau).
  for (const s of SPOTS.slice(0, npcs - 1)) grid[s.y + 1][s.x] = true;
  for (const [x, y] of [[1, WALL], [ROOM_W - 2, WALL], [1, ROOM_H - 2], [ROOM_W - 2, ROOM_H - 2]]) grid[y][x] = true;
  return grid;
}

/** Une place pour chaque PNJ (le sage en dernier), pour savoir où se tient chacun. */
export const npcSpots = (npcs: number) => [...SPOTS.slice(0, npcs - 1), SAGE];

