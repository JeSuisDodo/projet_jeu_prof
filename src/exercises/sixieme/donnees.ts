import type { Skill } from '../types';
import { byLevel, deg, distinctInts, fix, num, numAnswer, skill, table } from './outils';

/** Organisation et gestion de données : lire des tableaux, compter des effectifs, diagramme circulaire. */

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

const lireTableau: Skill = skill('lire-tableau', 'Lire et exploiter un tableau', (rng, level) => {
  const n = byLevel(level, 4, 5, 5);
  const days = JOURS.slice(0, n);
  const values = distinctInts(rng, n, byLevel(level, 5, 20, 100), byLevel(level, 40, 150, 999));
  const what = rng.pick(['livres empruntés au CDI', 'repas servis à la cantine', 'visiteurs au musée']);
  const t = table([[`\\text{Jour}`, ...days.map((d) => `\\text{${d}}`)], [`\\text{Nombre}`, ...values.map(num)]]);
  const kind = level === 1 ? 'read' : level === 2 ? rng.pick(['read', 'total']) : rng.pick(['total', 'gap']);
  const i = rng.int(0, n - 1);
  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const [question, value, why] =
    kind === 'read'
      ? [`Combien y a-t-il eu de ${what} le ${days[i].toLowerCase()} ?`, values[i], `On lit la colonne « ${days[i]} » : $${num(values[i])}$.`]
      : kind === 'total'
        ? [`Combien y a-t-il eu de ${what} en tout sur ces jours ?`, total, `$${values.map(num).join(' + ')} = ${num(total)}$`]
        : [`Quel est l'écart entre le jour où il y en a eu le plus et celui où il y en a eu le moins ?`, max - min, `$${num(max)} - ${num(min)} = ${num(max - min)}$`];
  return {
    prompt: `Le tableau donne le nombre de ${what} chaque jour. $${t}$ ${question}`,
    answer: numAnswer(value),
    hint: 'Repère la bonne ligne et la bonne colonne avant de calculer.',
    correction: [why],
  };
});

const tableauDouble: Skill = skill('tableau-double', 'Compléter un tableau à double entrée', (rng, level) => {
  const acts = ['Sport', 'Musique', 'Théâtre'];
  const f = distinctInts(rng, 3, 2, byLevel(level, 15, 30, 60));
  const g = distinctInts(rng, 3, 2, byLevel(level, 15, 30, 60));
  const tf = f.reduce((a, b) => a + b, 0);
  const tg = g.reduce((a, b) => a + b, 0);
  const rows: (number | string)[][] = [f.slice(), g.slice(), f.map((x, i) => x + g[i])];
  const totals: (number | string)[] = [tf, tg, tf + tg];
  // On cache une case ; au niveau 3, une case de la ligne ou de la colonne des totaux.
  const r = rng.int(0, 2);
  const c = level === 3 ? rng.int(0, 3) : rng.int(0, 2);
  const hidden = c === 3 ? totals[r] : rows[r][c];
  if (c === 3) totals[r] = '?';
  else rows[r][c] = '?';
  const labels = ['\\text{Filles}', '\\text{Garçons}', '\\text{Total}'];
  const t = table([
    ['', ...acts.map((a) => `\\text{${a}}`), '\\text{Total}'],
    ...rows.map((row, i) => [labels[i], ...row.map((x) => (typeof x === 'number' ? num(x) : x)), typeof totals[i] === 'number' ? num(totals[i] as number) : (totals[i] as string)]),
  ]);
  return {
    prompt: `Ce tableau indique l'activité préférée des élèves d'un collège. Quel nombre remplace le point d'interrogation ? $${t}$`,
    answer: numAnswer(hidden as number),
    hint: 'Chaque total est la somme des cases de sa ligne (ou de sa colonne) : utilise une ligne ou une colonne où il ne manque qu’un nombre.',
    correction: [`Le nombre manquant est $${num(hidden as number)}$.`],
  };
});

const effectif: Skill = skill('effectif', 'Compter un effectif dans une liste', (rng, level) => {
  const size = byLevel(level, 10, 14, 18);
  const values = Array.from({ length: size }, () => rng.int(8, 20));
  const kind = byLevel(level, 'equal', rng.pick(['equal', 'above']), rng.pick(['above', 'mode']));
  const target = rng.pick(values);
  const threshold = rng.int(11, 16);
  const counts = new Map<number, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  const best = Math.max(...counts.values());
  const modes = [...counts.entries()].filter(([, c]) => c === best).map(([v]) => v);
  if (kind === 'mode' && modes.length > 1) {
    // Un seul mode : on ajoute une note de plus à l'un d'eux.
    values.push(modes[0]);
    counts.set(modes[0], best + 1);
  }
  const mode = kind === 'mode' ? modes[0] : 0;
  const [question, value] =
    kind === 'equal'
      ? [`Combien d'élèves ont eu exactement $${target}$ ?`, values.filter((v) => v === target).length]
      : kind === 'above'
        ? [`Combien d'élèves ont eu une note supérieure ou égale à $${threshold}$ ?`, values.filter((v) => v >= threshold).length]
        : [`Quelle est la note obtenue par le plus grand nombre d'élèves ?`, mode];
  return {
    prompt: `Voici les notes sur 20 d'une classe à un contrôle : $${values.join(' ;\\ ')}$. ${question}`,
    answer: numAnswer(value),
    hint: 'Barre les notes au fur et à mesure que tu les comptes pour n’en oublier aucune.',
    correction: [kind === 'mode' ? `La note $${mode}$ apparaît $${counts.get(mode)}$ fois, plus que toutes les autres.` : `On compte : il y en a $${value}$.`],
  };
});

const circulaire: Skill = skill('diagramme-circulaire', 'Lire un diagramme circulaire', (rng, level) => {
  const [angle, frac] = rng.pick(byLevel(level, [[180, 2], [90, 4]] as [number, number][], [[180, 2], [90, 4], [120, 3], [60, 6]], [[120, 3], [60, 6], [45, 8], [72, 5], [36, 10], [30, 12]]));
  const total = frac * rng.int(2, byLevel(level, 10, 15, 25));
  const part = fix(total / frac);
  const sport = rng.pick(['le football', 'la natation', 'le basket', 'la danse']);
  return {
    prompt: `Dans un diagramme circulaire représentant les $${total}$ élèves de 6e, le secteur « ${sport} » a un angle de $${deg(angle)}$. Combien d'élèves ont choisi ${sport} ?`,
    answer: numAnswer(part),
    hint: `Le disque entier ($360^\\circ$) représente tous les élèves. Quelle fraction du disque représente un angle de $${deg(angle)}$ ?`,
    correction: [`$${deg(angle)}$ représente $\\frac{${angle}}{360} = \\frac{1}{${frac}}$ du disque.`, `$${total} \\div ${frac} = ${num(part)}$ élèves.`],
  };
});

export const DONNEES_SKILLS: Skill[] = [lireTableau, tableauDouble, effectif, circulaire];
