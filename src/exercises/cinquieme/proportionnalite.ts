import type { Skill } from '../types';
import { dec, num, yesNo } from './outils';

/** 5e : proportionnalité (reconnaître, quatrième proportionnelle), pourcentages, ratios et échelles. */

const reconnaitre: Skill = {
  id: '5e-reconnaitre-proportionnalite',
  name: 'Reconnaître un tableau de proportionnalité',
  generate(rng, level) {
    const k = level === 3 ? rng.pick([1.5, 2.5, 0.4, 1.2, 0.75]) : rng.int(2, 9);
    const xs = [rng.int(1, 4), rng.int(5, 8), rng.int(9, 15)].map((x) => (level === 3 ? x * 2 : x));
    let ys = xs.map((x) => Math.round(x * k * 100) / 100);
    const yes = rng.next() < 0.5;
    if (!yes) {
      const i = rng.int(1, 2);
      // Un écart « additif » plutôt que multiplicatif : piège classique.
      ys = ys.map((y, j) => (j === i ? y + rng.pick([1, 2, -1]) * (level === 3 ? 0.5 : 1) : y));
    }
    const ratios = xs.map((x, i) => ys[i] / x);
    return {
      skill: '5e-reconnaitre-proportionnalite',
      level,
      prompt: `Le tableau suivant est-il un tableau de proportionnalité ? $\\begin{array}{|c|c|c|c|}\\hline \\text{Quantité} & ${xs.join(' & ')} \\\\ \\hline \\text{Prix (euros)} & ${ys.map(dec).join(' & ')} \\\\ \\hline \\end{array}$`,
      answer: yesNo(yes),
      hint: 'Divise chaque nombre de la deuxième ligne par celui de la première : obtient-on toujours le même nombre ?',
      correction: [
        `$${ys.map((y, i) => `${dec(y)} \\div ${xs[i]} ${Number.isInteger(ratios[i] * 1000) ? '=' : '\\approx'} ${dec(Math.round(ratios[i] * 1000) / 1000)}`).join(' \\; ; \\; ')}$`,
        yes ? `Le quotient est toujours $${dec(k)}$ : c'est un tableau de proportionnalité.` : `Les quotients ne sont pas tous égaux : ce n'est pas un tableau de proportionnalité.`,
      ],
    };
  },
};

const ITEMS = [
  ['kg de pommes', 'kg'],
  ['baguettes', ''],
  ['cahiers', ''],
  ['litres d’essence', 'L'],
  ['places de cinéma', ''],
] as const;

const quatrieme: Skill = {
  id: '5e-quatrieme-proportionnelle',
  name: 'Calculer une quatrième proportionnelle',
  generate(rng, level) {
    const [item] = rng.pick(ITEMS);
    const unitCents = level === 1 ? rng.int(1, 9) * 50 : rng.int(15, 400) * (level === 2 ? 5 : 1);
    let a: number;
    let b: number;
    if (level === 1) {
      a = rng.int(2, 5);
      b = a * rng.int(2, 4);
    } else {
      do {
        a = rng.int(2, 9);
        b = rng.int(2, 15);
      } while (a === b || b % a === 0);
    }
    const pa = (a * unitCents) / 100;
    const pb = (b * unitCents) / 100;
    return {
      skill: '5e-quatrieme-proportionnelle',
      level,
      prompt: `$${a}$ ${item} coûtent $${dec(pa)}$ €. Le prix est proportionnel à la quantité. Combien coûtent $${b}$ ${item} (en €) ?`,
      answer: num(pb),
      hint: level === 1 ? `$${b}$, c'est $${b / a}$ fois $${a}$.` : 'Calcule d’abord le prix d’une unité, puis multiplie.',
      correction:
        level === 1
          ? [`$${b} = ${a} \\times ${b / a}$`, `$${dec(pa)} \\times ${b / a} = ${dec(pb)}$ €`]
          : [`Prix d'une unité : $${dec(pa)} \\div ${a} = ${dec(unitCents / 100)}$ €`, `$${dec(unitCents / 100)} \\times ${b} = ${dec(pb)}$ €`],
    };
  },
};

const pourcentage: Skill = {
  id: '5e-pourcentage',
  name: 'Appliquer un pourcentage',
  generate(rng, level) {
    const t = level === 1 ? rng.pick([10, 25, 50, 20]) : rng.pick([5, 15, 30, 35, 40, 60, 75, 12]);
    const n = level === 1 ? rng.int(2, 20) * 20 : rng.int(2, 40) * 20;
    const part = (t * n) / 100;
    if (level === 3) {
      const down = rng.next() < 0.5;
      const after = down ? n - part : n + part;
      return {
        skill: '5e-pourcentage',
        level,
        prompt: down ? `Un article coûte $${n}$ €. Pendant les soldes, son prix baisse de $${t}\\,\\%$. Quel est son nouveau prix (en €) ?` : `Un club compte $${n}$ adhérents. Leur nombre augmente de $${t}\\,\\%$. Combien y a-t-il d'adhérents maintenant ?`,
        answer: num(after),
        hint: `Calcule d'abord $${t}\\,\\%$ de $${n}$, puis ${down ? 'retire-le' : 'ajoute-le'}.`,
        correction: [`$${t}\\,\\%$ de $${n}$ : $\\dfrac{${t}}{100} \\times ${n} = ${dec(part)}$`, `$${n} ${down ? '-' : '+'} ${dec(part)} = ${dec(after)}$`],
      };
    }
    return {
      skill: '5e-pourcentage',
      level,
      prompt: `Calcule $${t}\\,\\%$ de $${n}$.`,
      answer: num(part),
      hint: `Prendre $${t}\\,\\%$ d'un nombre, c'est le multiplier par $\\dfrac{${t}}{100}$.`,
      correction: [`$\\dfrac{${t}}{100} \\times ${n} = ${n} \\div 100 \\times ${t} = ${dec(part)}$`],
    };
  },
};

const ratio: Skill = {
  id: '5e-ratio',
  name: 'Partager selon un ratio',
  generate(rng, level) {
    const parts = level === 3 ? [rng.int(1, 4), rng.int(1, 5), rng.int(2, 6)] : [rng.int(1, 5), rng.int(2, 7)];
    if (parts[0] === parts[1]) parts[1]++;
    const unit = rng.int(2, level === 1 ? 10 : 25);
    const sum = parts.reduce((a, b) => a + b, 0);
    const total = sum * unit;
    const askBig = rng.next() < 0.5;
    const target = askBig ? Math.max(...parts) : Math.min(...parts);
    const names = level === 3 ? 'Ali, Bea et Chloé' : 'Ali et Bea';
    return {
      skill: '5e-ratio',
      level,
      prompt: `${names} se partagent $${total}$ billes dans le ratio $${parts.join(' : ')}$. Combien de billes reçoit celui ou celle qui en a le ${askBig ? 'plus' : 'moins'} ?`,
      answer: num(target * unit),
      hint: `Un ratio $${parts.join(' : ')}$ signifie qu'on fait $${parts.join(' + ')}$ parts égales.`,
      correction: [`$${parts.join(' + ')} = ${sum}$ parts ; une part vaut $${total} \\div ${sum} = ${unit}$ billes.`, `$${target} \\times ${unit} = ${target * unit}$ billes.`],
    };
  },
};

const echelle: Skill = {
  id: '5e-echelle',
  name: 'Utiliser une échelle',
  generate(rng, level) {
    const scale = level === 1 ? rng.pick([100, 1000, 500]) : rng.pick([10000, 25000, 50000, 100000, 200000]);
    const cm = level === 1 ? rng.int(2, 15) : rng.int(2, 24) / 2;
    const realCm = cm * scale;
    const unit = level === 1 ? 'm' : 'km';
    const real = unit === 'm' ? realCm / 100 : realCm / 100000;
    if (level === 3 && rng.next() < 0.5) {
      return {
        skill: '5e-echelle',
        level,
        prompt: `Sur une carte à l'échelle $\\dfrac{1}{${scale}}$, quelle longueur (en cm) représente une distance réelle de $${dec(real)}\\text{ km}$ ?`,
        answer: num(cm),
        hint: `Convertis d'abord la distance réelle en centimètres ($1\\text{ km} = 100\\,000\\text{ cm}$).`,
        correction: [`$${dec(real)}\\text{ km} = ${realCm}\\text{ cm}$`, `$${realCm} \\div ${scale} = ${dec(cm)}\\text{ cm}$`],
      };
    }
    return {
      skill: '5e-echelle',
      level,
      prompt: `Sur un plan à l'échelle $\\dfrac{1}{${scale}}$, deux points sont distants de $${dec(cm)}\\text{ cm}$. Quelle est la distance réelle (en ${unit}) ?`,
      answer: num(real),
      hint: `$1\\text{ cm}$ sur le plan représente $${scale}\\text{ cm}$ en réalité.`,
      correction: [`$${dec(cm)} \\times ${scale} = ${realCm}\\text{ cm}$`, `$${realCm}\\text{ cm} = ${dec(real)}\\text{ ${unit}}$`],
    };
  },
};

export const PROPORTIONNALITE_SKILLS: Skill[] = [reconnaitre, quatrieme, pourcentage, ratio, echelle];
