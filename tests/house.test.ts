import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { GRADES, allChapters, gradeById } from '../src/content';
import { teachersOf } from '../src/ui/house';

/** Chaque morceau de LaTeX entre $…$ doit se rendre sans erreur. */
const renders = (text: string) =>
  text.split('$').every((part, i) => {
    if (i % 2 === 0) return true;
    katex.renderToString(part, { throwOnError: true });
    return true;
  });

describe('Maison du savoir', () => {
  it.each(allChapters().map((c) => [c.id, c] as const))('%s : un PNJ par créature et un sage, toutes les notions couvertes', (_id, chapter) => {
    const teachers = teachersOf(chapter);
    expect(teachers).toHaveLength(chapter.creatures.length + 1);
    expect(new Set(teachers.map((t) => t.name)).size).toBe(teachers.length);
    const covered = new Set(teachers.flatMap((t) => t.skills.map((s) => s.id)));
    for (const s of chapter.skills) expect(covered.has(s.id), s.id).toBe(true);
    teachers.forEach((t) => expect(t.skills.length).toBeGreaterThan(0));
  });

  it('les cours portent sur des compétences du niveau et s’affichent', () => {
    for (const grade of GRADES) {
      const ids = new Set(grade.chapters.flatMap((c) => c.skills.map((s) => s.id)));
      for (const [id, paragraphs] of Object.entries(grade.lessons ?? {})) {
        expect(ids.has(id), `${grade.id} : ${id}`).toBe(true);
        expect(paragraphs.length).toBeGreaterThan(0);
        for (const p of paragraphs) {
          expect(p.split('$').length % 2, `$ non fermé dans ${id}`).toBe(1);
          expect(renders(p), id).toBe(true);
        }
      }
    }
  });

  it('chaque notion de 1re spécialité a son cours', () => {
    const grade = gradeById('1re-spe');
    for (const c of grade.chapters) for (const s of c.skills) expect(grade.lessons?.[s.id], s.id).toBeDefined();
  });
});

describe('intérieur de la maison', () => {
  it.each([2, 4, 6, 7])('avec %i PNJ, chacun est accessible depuis la porte', async (n) => {
    const { ROOM_DOOR, ROOM_H, ROOM_W, npcSpots, roomBlocking } = await import('../src/game/room');
    const grid = roomBlocking(n);
    const seen = grid.map((row) => row.map(() => false));
    const stack = [[ROOM_DOOR.x, ROOM_DOOR.y]];
    seen[ROOM_DOOR.y][ROOM_DOOR.x] = true;
    while (stack.length) {
      const [x, y] = stack.pop()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= ROOM_W || ny >= ROOM_H || seen[ny][nx] || grid[ny][nx]) continue;
        seen[ny][nx] = true;
        stack.push([nx, ny]);
      }
    }
    const spots = npcSpots(n);
    expect(spots).toHaveLength(n);
    spots.forEach((s, i) => {
      // Devant le pupitre d'un spécialiste, devant le sage.
      const front = i === n - 1 ? { x: s.x, y: s.y + 1 } : { x: s.x, y: s.y + 2 };
      expect(seen[front.y][front.x], `PNJ ${i}`).toBe(true);
    });
  });
});
