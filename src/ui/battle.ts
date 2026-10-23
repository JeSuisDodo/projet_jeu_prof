import { play } from '../audio/sound';
import { Rng } from '../exercises/rng';
import { skillById } from '../content';
import type { Rarity } from '../content/types';
import { restatesPrompt } from '../exercises/expression';
import { type Exercise, type Response, checkAnswer } from '../exercises/types';
import { RARITY, type RarityInfo, starsOf } from '../game/rarity';
import { type SaveData, pickSkill, recordAttempt } from '../game/save';
import { renderMath } from './math';
import { h, hideOverlay, showOverlay } from './overlay';

/** La créature affrontée, prête à afficher. */
export interface Foe {
  name: string;
  svg: string;
  skills: string[];
  boss: boolean;
  /** Rareté d'une créature sauvage : elle fixe la difficulté des questions. */
  rarity?: Rarity;
}

export interface BattleResult {
  captured: boolean;
  xp: number;
}

const INPUT_HELP: Record<string, string> = {
  number: 'Un nombre (-3, 2,5, 7/3) ou un calcul exact (4!, 2^5, 4×3×2×1, C(5,2)).',
  set: 'Sépare les solutions par un point-virgule, par exemple « -2 ; 5/3 ». Écris « aucune » s’il n’y en a pas.',
  pair: 'Nombres, fractions ou calculs exacts.',
};

/** Le gardien : quatre questions de niveau 3, indice permis. */
const BOSS: RarityInfo = { label: 'Gardien', stars: 4, level: 3, hearts: 4, xp: 60, hint: true };

/**
 * Un combat : chaque bonne réponse retire un cœur à la créature, une erreur la fait fuir
 * en affichant la correction. Chaque réponse est enregistrée dans la progression.
 * Plus la créature est rare, plus ses questions sont difficiles et plus elle a de cœurs.
 */
export function runBattle(creature: Foe, save: SaveData, onChange: () => void): Promise<BattleResult> {
  return new Promise((resolve) => {
    const rng = new Rng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    const info = creature.boss ? BOSS : RARITY[creature.rarity ?? 'commune'];
    const level = info.level;
    const maxHp = info.hearts;
    let hp = maxHp;
    let usedHint = false;

    const panel = h('div', 'panel battle');
    showOverlay(panel);

    const finish = (result: BattleResult) => {
      hideOverlay();
      resolve(result);
    };

    const head = (appear = false, lostHeart = -1) => {
      const el = h('div', 'battle-head');
      const hearts = Array.from({ length: maxHp }, (_, i) =>
        i < hp ? '<span>♥</span>' : `<span class="${i === lostHeart ? 'lost' : ''}">♡</span>`,
      ).join('');
      const rarity = creature.boss ? '' : (creature.rarity ?? 'commune');
      const intro = creature.boss
        ? 'Combat de gardien'
        : rarity === 'legendaire'
          ? 'Une créature légendaire surgit !'
          : rarity === 'rare'
            ? 'Une créature rare surgit !'
            : 'Une créature sauvage surgit !';
      const badge = rarity ? `<span class="rarity ${rarity}" title="${info.label}">${starsOf(rarity)} ${info.label}</span>` : '';
      el.innerHTML = `
        <div class="portrait ${appear ? 'appear' : ''} ${rarity}"><div class="creature">${creature.svg}</div></div>
        <div>
          <div class="muted">${intro}</div>
          <h2>${creature.name} <small class="muted">niv. ${level}</small></h2>
          ${badge}
          <div class="hearts" aria-label="${hp} cœurs sur ${maxHp}">${hearts}</div>
        </div>`;
      return el;
    };

    let firstQuestion = true;
    const ask = () => {
      const skill = skillById(pickSkill(save, creature.skills, rng));
      const ex = skill.generate(rng, level);
      panel.replaceChildren(head(firstQuestion));
      firstQuestion = false;
      panel.append(h('div', 'skill', `Compétence : ${skill.name}`));
      panel.append(h('div', 'question', renderMath(ex.prompt)));

      const zone = h('div');
      const hintBox = h('div');
      const feedback = h('div');
      const actions = h('div', 'row actions');
      panel.append(zone, hintBox, feedback, actions);

      let answered = false;
      const submit = (response: Response) => {
        if (answered) return;
        // Recopier le calcul demandé ne compte pas comme une réponse : on redemande le résultat.
        const typed = typeof response === 'string' ? [response] : Array.isArray(response) ? response : [];
        if (typed.some((r) => restatesPrompt(ex.prompt, r))) {
          feedback.className = 'feedback hint';
          feedback.innerHTML = 'C’est le calcul de l’énoncé : effectue-le et donne le résultat.';
          zone.querySelector<HTMLInputElement>('input')?.select();
          return;
        }
        answered = true;
        const ok = checkAnswer(ex.answer, response);
        recordAttempt(save, ex.skill, ok);
        onChange();
        zone.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button').forEach((el) => (el.disabled = true));
        if (ex.answer.kind === 'choice') {
          const buttons = zone.querySelectorAll('button');
          buttons[ex.answer.correct]?.classList.add('right');
          if (!ok && typeof response === 'number') buttons[response]?.classList.add('wrong');
        }
        showResult(ex, ok, zone, feedback, actions);
      };

      buildInput(ex, zone, submit);

      const hintBtn = h('button', 'secondary', info.hint ? 'Indice' : 'Pas d’indice') as HTMLButtonElement;
      if (!info.hint) {
        hintBtn.disabled = true;
        hintBtn.title = 'Une créature légendaire ne se laisse pas aider.';
      }
      hintBtn.onclick = () => {
        usedHint = true;
        hintBtn.disabled = true;
        hintBox.className = 'hint';
        hintBox.innerHTML = renderMath(ex.hint);
      };
      const fleeBtn = h('button', 'secondary', 'Fuir') as HTMLButtonElement;
      fleeBtn.onclick = () => finish({ captured: false, xp: 0 });
      actions.append(hintBtn, fleeBtn);
      zone.querySelector<HTMLElement>('input, button')?.focus();
    };

    const showResult = (ex: Exercise, ok: boolean, zone: HTMLElement, feedback: HTMLElement, actions: HTMLElement) => {
      actions.replaceChildren();
      const next = h('button', '', 'Continuer') as HTMLButtonElement;
      if (ok) {
        hp--;
        panel.querySelector('.battle-head')?.replaceWith(head(false, hp));
        const portrait = panel.querySelector('.portrait');
        portrait?.classList.add(hp === 0 ? 'captured' : 'hit');
        play(hp === 0 ? 'capture' : 'correct');
        if (hp === 0 && portrait) {
          // Gerbe d'étincelles autour de la créature capturée.
          for (let i = 0; i < 10; i++) {
            const spark = h('span', 'spark');
            spark.style.setProperty('--angle', `${i * 36}deg`);
            portrait.append(spark);
          }
        }
        if (hp === 0) {
          const base = info.xp;
          const xp = usedHint ? Math.round(base * 0.6) : base;
          feedback.className = 'feedback good';
          feedback.innerHTML = `<strong>Bravo ! ${creature.name} est capturé.</strong> +${xp} points d'expérience.`;
          next.textContent = 'Continuer l’aventure';
          next.onclick = () => finish({ captured: true, xp });
        } else {
          feedback.className = 'feedback good';
          feedback.innerHTML = `<strong>Juste !</strong> ${creature.name} faiblit, encore ${hp} ${hp > 1 ? 'questions' : 'question'}.`;
          next.onclick = ask;
        }
      } else {
        panel.querySelector('.portrait')?.classList.add('fled');
        play('wrong');
        setTimeout(() => play('flee'), 300);
        zone.querySelector('form')?.classList.add('wrong');
        feedback.className = 'feedback bad';
        feedback.innerHTML =
          `<strong>Pas tout à fait…</strong> ${creature.name} s'enfuit. Voici la correction :` +
          `<ol>${ex.correction.map((line) => `<li>${renderMath(line)}</li>`).join('')}</ol>` +
          `<p class="small muted">Pour revoir « ${skillById(ex.skill).name} », entre dans la Maison du savoir, près du départ.</p>`;
        next.onclick = () => finish({ captured: false, xp: 0 });
      }
      actions.append(next);
      next.focus();
    };

    ask();
  });
}

/** Zone de réponse adaptée au type de réponse attendu. */
function buildInput(ex: Exercise, zone: HTMLElement, submit: (r: Response) => void): void {
  const answer = ex.answer;
  if (answer.kind === 'choice') {
    const grid = h('div', 'choices');
    answer.options.forEach((opt, i) => {
      const b = h('button', '', renderMath(opt)) as HTMLButtonElement;
      b.onclick = () => submit(i);
      grid.append(b);
    });
    zone.append(grid);
    return;
  }

  const form = document.createElement('form');
  form.autocomplete = 'off';
  const validate = h('button', '', 'Valider') as HTMLButtonElement;
  validate.type = 'submit';

  if (answer.kind === 'pair') {
    const grid = h('div', 'pair');
    const inputs = answer.labels.map((label) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'decimal';
      input.setAttribute('aria-label', label);
      grid.append(h('span', '', renderMath(`$${label} =$`)), input);
      return input;
    });
    form.append(grid);
    form.onsubmit = (e) => {
      e.preventDefault();
      if (inputs.some((i) => i.value.trim() === '')) return;
      submit([inputs[0].value, inputs[1].value]);
    };
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = answer.kind === 'set' ? 'Solutions' : 'Ta réponse';
    input.setAttribute('aria-label', 'Ta réponse');
    form.append(input);
    form.onsubmit = (e) => {
      e.preventDefault();
      if (input.value.trim() === '') return;
      submit(input.value);
    };
  }
  form.append(h('div', 'help', INPUT_HELP[answer.kind]));
  const row = h('div', 'row actions');
  row.append(validate);
  form.append(row);
  zone.append(form);
}
