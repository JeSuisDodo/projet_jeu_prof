import { Rng } from '../exercises/rng';
import { skillById } from '../exercises/secondDegre';
import { type Exercise, type Level, type Response, checkAnswer } from '../exercises/types';
import type { Creature } from '../game/creatures';
import { type SaveData, pickSkill, recordAttempt } from '../game/save';
import { renderMath } from './math';
import { h, hideOverlay, showOverlay } from './overlay';

export interface BattleResult {
  captured: boolean;
  xp: number;
}

const INPUT_HELP: Record<string, string> = {
  number: 'Un entier, un décimal ou une fraction, par exemple -3, 2,5 ou 7/3.',
  set: 'Sépare les solutions par un point-virgule, par exemple « -2 ; 5/3 ». Écris « aucune » s’il n’y en a pas.',
  pair: 'Entiers, décimaux ou fractions.',
};

/**
 * Un combat : chaque bonne réponse retire un cœur à la créature, une erreur la fait fuir
 * en affichant la correction. Chaque réponse est enregistrée dans la progression.
 */
export function runBattle(creature: Creature, level: Level, save: SaveData, onChange: () => void): Promise<BattleResult> {
  return new Promise((resolve) => {
    const rng = new Rng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    const maxHp = creature.boss ? 4 : level;
    let hp = maxHp;
    let usedHint = false;

    const panel = h('div', 'panel battle');
    showOverlay(panel);

    const finish = (result: BattleResult) => {
      hideOverlay();
      resolve(result);
    };

    const head = () => {
      const el = h('div', 'battle-head');
      el.innerHTML = `
        <div class="portrait">${creature.svg}</div>
        <div>
          <div class="muted">${creature.boss ? 'Combat de gardien' : 'Une créature sauvage surgit !'}</div>
          <h2>${creature.name} <small class="muted">niv. ${creature.boss ? 3 : level}</small></h2>
          <div class="hearts" aria-label="${hp} cœurs sur ${maxHp}">${'♥'.repeat(hp)}${'♡'.repeat(maxHp - hp)}</div>
        </div>`;
      return el;
    };

    const ask = () => {
      const skill = skillById(pickSkill(save, creature.skills, rng));
      const ex = skill.generate(rng, creature.boss ? 3 : level);
      panel.replaceChildren(head());
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
        showResult(ex, ok, feedback, actions);
      };

      buildInput(ex, zone, submit);

      const hintBtn = h('button', 'secondary', 'Indice') as HTMLButtonElement;
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

    const showResult = (ex: Exercise, ok: boolean, feedback: HTMLElement, actions: HTMLElement) => {
      actions.replaceChildren();
      const next = h('button', '', 'Continuer') as HTMLButtonElement;
      if (ok) {
        hp--;
        panel.querySelector('.battle-head')?.replaceWith(head());
        panel.querySelector('.portrait')?.classList.add('hit');
        if (hp === 0) {
          const base = creature.boss ? 60 : 10 * level;
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
        feedback.className = 'feedback bad';
        feedback.innerHTML =
          `<strong>Pas tout à fait…</strong> ${creature.name} s'enfuit. Voici la correction :` +
          `<ol>${ex.correction.map((line) => `<li>${renderMath(line)}</li>`).join('')}</ol>`;
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
