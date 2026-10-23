import { play } from '../audio/sound';
import { lessonFor } from '../content';
import type { ChapterDef, CreatureDef } from '../content/types';
import { Rng } from '../exercises/rng';
import type { Level, Skill } from '../exercises/types';
import { creatureSvg } from '../game/creatureArt';
import { seedFor } from '../game/map';
import { RARITY, rarityOf, starsOf } from '../game/rarity';
import { type SaveData, recordLesson } from '../game/save';
import { escapeHtml, renderMath } from './math';
import { h, hideOverlay, showOverlay } from './overlay';

/**
 * La Maison du savoir d'une région : un PNJ par créature sauvage explique les notions sur
 * lesquelles elle interroge, et un sage prépare au combat contre le gardien (toutes les notions).
 * Chaque notion donne son cours (s'il est écrit) et un exemple corrigé tiré par le générateur
 * des combats, au niveau choisi.
 */

const FIRST_NAMES = ['Lina', 'Hugo', 'Maëlle', 'Yanis', 'Inès', 'Théo', 'Chloé', 'Nassim', 'Jade', 'Arthur', 'Léna', 'Sacha', 'Zoé', 'Malo', 'Aya', 'Noé'];
const HAIR = ['#5c3a1a', '#212529', '#e8a33d', '#a0522d', '#868e96', '#c92a2a'];

export interface Teacher {
  name: string;
  /** La créature étudiée ; absente pour le sage du gardien. */
  creature?: CreatureDef;
  skills: Skill[];
  hue: number;
  hair: string;
}

/** Les PNJ de la maison : un par créature (noms tirés de la région), puis le sage. */
export function teachersOf(chapter: ChapterDef): Teacher[] {
  const rng = new Rng(seedFor(`${chapter.id}-maison`));
  const names = rng.shuffle([...FIRST_NAMES]);
  const byId = new Map(chapter.skills.map((s) => [s.id, s]));
  const list: Teacher[] = chapter.creatures.map((creature, i) => ({
    name: `Prof. ${names[i]}`,
    creature,
    skills: creature.skills.map((id) => byId.get(id)).filter((s): s is Skill => !!s),
    hue: creature.look.hue,
    hair: HAIR[i % HAIR.length],
  }));
  list.push({ name: 'Sage Euclide', skills: chapter.skills, hue: 45, hair: '#f1f3f5' });
  return list;
}

/** Portrait d'un PNJ : robe à la couleur de sa créature, livre sous le bras. */
export function teacherSvg(t: Teacher, sage = false): string {
  const robe = `hsl(${t.hue} 55% 45%)`;
  const robeLight = `hsl(${t.hue} 60% 60%)`;
  return `<svg viewBox="0 0 64 80" class="npc" aria-hidden="true">
    <ellipse cx="32" cy="76" rx="20" ry="4" fill="rgba(0,0,0,.2)"/>
    <path d="M14 74 L20 38 Q32 32 44 38 L50 74 Z" fill="${robe}" stroke="#2b1d16" stroke-width="2"/>
    <path d="M28 38 L32 74 L36 38 Z" fill="${robeLight}"/>
    <circle cx="32" cy="24" r="12" fill="#ffd8a8" stroke="#2b1d16" stroke-width="2"/>
    ${
      sage
        ? `<path d="M22 28 Q32 50 42 28 Q38 36 32 36 Q26 36 22 28 Z" fill="${t.hair}" stroke="#2b1d16" stroke-width="1.5"/>
           <path d="M18 18 L32 0 L46 18 Z" fill="hsl(230 50% 40%)" stroke="#2b1d16" stroke-width="2"/>
           <circle cx="36" cy="9" r="1.6" fill="#ffe066"/><circle cx="29" cy="13" r="1.2" fill="#ffe066"/>`
        : `<path d="M20 22 Q20 10 32 10 Q44 10 44 22 Q40 15 32 16 Q24 15 20 22 Z" fill="${t.hair}" stroke="#2b1d16" stroke-width="1.5"/>`
    }
    <circle cx="27.5" cy="25" r="1.8" fill="#212529"/><circle cx="36.5" cy="25" r="1.8" fill="#212529"/>
    <circle cx="27.5" cy="25" r="4" fill="none" stroke="#495057" stroke-width="1.2"/><circle cx="36.5" cy="25" r="4" fill="none" stroke="#495057" stroke-width="1.2"/>
    <path d="M28 31 Q32 33.5 36 31" fill="none" stroke="#a0522d" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="38" y="46" width="14" height="17" rx="2" fill="#fff8e1" stroke="#2b1d16" stroke-width="2" transform="rotate(-12 45 54)"/>
    <rect x="38" y="46" width="3" height="17" fill="hsl(${(t.hue + 180) % 360} 60% 45%)" transform="rotate(-12 45 54)"/>
  </svg>`;
}

/** Ce que dit le PNJ en accueil, selon sa créature. */
function greeting(t: Teacher, chapter: ChapterDef, save: SaveData): string {
  if (!t.creature) return `Le gardien ${chapter.boss.name} pose des questions sur tout le chapitre. Révise ici chaque notion avant de l’affronter.`;
  const caught = (save.captures[t.creature.id] ?? 0) > 0;
  return caught
    ? `Tu as déjà capturé ${t.creature.name} ! Reviens réviser si une question t’a fait trébucher.`
    : `J’étudie ${t.creature.name}. Pour le capturer, il faut maîtriser ${t.skills.length > 1 ? 'ces notions' : 'cette notion'} :`;
}

const levelName: Record<Level, string> = { 1: 'Facile', 2: 'Moyen', 3: 'Difficile' };

/**
 * Conversation avec un PNJ de la maison (index dans `teachersOf`) : ses notions, puis le cours et
 * l'exemple corrigé de celle choisie. La promesse se résout quand on lui dit au revoir.
 */
export function openTeacher(chapter: ChapterDef, save: SaveData, index: number, onChange: () => void): Promise<void> {
  return new Promise((resolve) => {
    const rng = new Rng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    const teachers = teachersOf(chapter).filter((_, i) => i === index);
    const panel = h('div', 'panel house');
    const leave = () => {
      play('click');
      hideOverlay();
      resolve();
    };
    const exitButton = () => {
      const b = h('button', 'secondary', 'Au revoir') as HTMLButtonElement;
      b.onclick = leave;
      return b;
    };
    const read = (id: string) => save.lessons?.[id] ?? 0;

    const hall = () => {
      panel.replaceChildren();
      panel.scrollTop = 0;
      const head = h('div', 'house-head');
      head.innerHTML = `<p class="muted small">Maison du savoir · ${escapeHtml(chapter.region)} · ${escapeHtml(chapter.title)}</p>`;
      const room = h('div', 'npcs one');
      teachers.forEach((t, i) => {
        const card = h('div', `npc-card ${t.creature ? '' : 'sage'}`);
        card.style.animationDelay = `${i * 50}ms`;
        const rarity = t.creature ? rarityOf(chapter, t.creature) : null;
        card.innerHTML = `
          <div class="npc-top">
            ${teacherSvg(t, !t.creature)}
            ${t.creature ? `<div class="npc-pet" title="${escapeHtml(t.creature.name)}">${creatureSvg(t.creature)}</div>` : ''}
            <div>
              <strong>${escapeHtml(t.name)}</strong>
              <div class="muted small">${
                t.creature && rarity
                  ? `Spécialiste de ${escapeHtml(t.creature.name)}<br><span class="rarity ${rarity}">${starsOf(rarity)} ${RARITY[rarity].label}</span>`
                  : `Prépare au combat contre ${escapeHtml(chapter.boss.name)}`
              }</div>
            </div>
          </div>
          <p class="npc-say">${escapeHtml(greeting(t, chapter, save))}</p>`;
        const list = h('div', 'npc-skills');
        for (const s of t.skills) {
          const b = h('button', `notion ${read(s.id) ? 'read' : ''}`, `${read(s.id) ? '<span class="tick" title="Déjà lu">✓</span>' : ''}${escapeHtml(s.name)}`) as HTMLButtonElement;
          b.onclick = () => lesson(t, s, 1);
          list.append(b);
        }
        card.append(list);
        room.append(card);
      });
      const actions = h('div', 'row actions');
      actions.append(exitButton());
      panel.append(head, room, actions);
      (panel.querySelector('.notion') as HTMLButtonElement | null)?.focus({ preventScroll: true });
    };

    const lesson = (t: Teacher, skill: Skill, level: Level, again = false) => {
      if (!again) {
        recordLesson(save, skill.id);
        onChange();
        play('dialog');
      }
      const ex = skill.generate(rng, level);
      const course = lessonFor(skill.id);
      const askedBy = [...chapter.creatures, chapter.boss].filter((c) => c.skills.includes(skill.id)).map((c) => c.name);
      panel.replaceChildren();
      panel.scrollTop = 0;
      const head = h('div', 'lesson-head');
      head.innerHTML = `${teacherSvg(t, !t.creature)}<div><div class="muted small">${escapeHtml(t.name)} t’explique</div><h2>${escapeHtml(skill.name)}</h2>
        ${askedBy.length ? `<div class="muted small">Questions posées par ${askedBy.map(escapeHtml).join(', ')}</div>` : ''}</div>`;
      const body = h('div', 'lesson');
      if (course) body.append(h('div', 'course', `<h3>Le cours</h3>${course.map((p) => `<p>${renderMath(p)}</p>`).join('')}`));
      else body.append(h('p', 'muted', 'Regarde bien cet exemple corrigé : c’est exactement le genre de question que posent les créatures.'));

      const example = h('div', 'example');
      const levels = ([1, 2, 3] as Level[])
        .map((l) => `<button class="lvl ${l === level ? 'on' : ''}" data-level="${l}" aria-pressed="${l === level}">${levelName[l]}</button>`)
        .join('');
      const options =
        ex.answer.kind === 'choice'
          ? `<ul class="options">${ex.answer.options.map((o, i) => `<li class="${i === (ex.answer as { correct: number }).correct ? 'right' : ''}">${renderMath(o)}</li>`).join('')}</ul>`
          : '';
      example.innerHTML = `<div class="example-head"><h3>Exemple corrigé</h3><div class="levels" role="group" aria-label="Difficulté">${levels}</div></div>
        <div class="question">${renderMath(ex.prompt)}</div>${options}
        <div class="hint"><strong>Astuce :</strong> ${renderMath(ex.hint)}</div>
        <div class="feedback good"><strong>Correction</strong><ol>${ex.correction.map((line) => `<li>${renderMath(line)}</li>`).join('')}</ol></div>`;
      example.querySelectorAll<HTMLButtonElement>('.lvl').forEach((b) => (b.onclick = () => lesson(t, skill, Number(b.dataset.level) as Level, true)));
      body.append(example);

      const actions = h('div', 'row actions');
      const another = h('button', '', 'Un autre exemple') as HTMLButtonElement;
      another.onclick = () => lesson(t, skill, level, true);
      const back = h('button', 'secondary', 'Autres notions') as HTMLButtonElement;
      back.onclick = hall;
      actions.append(another, back, exitButton());
      panel.append(head, body, actions);
      another.focus({ preventScroll: true });
    };

    hall();
    showOverlay(panel);
  });
}
