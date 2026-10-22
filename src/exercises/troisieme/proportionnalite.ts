import type { Skill } from '../types';
import { dec, decimal, num, skill } from './outils';

/** 3e : proportionnalité, pourcentages, coefficients multiplicateurs, évolutions, ratios. */

const ARTICLES: [string, string][] = [
  ['kg de pommes', '€'],
  ['L d’essence', '€'],
  ['m de tissu', '€'],
  ['cahiers', '€'],
];

const quatrieme = skill('3e-quatrieme-proportionnelle', 'Calculer une quatrième proportionnelle', (rng, level) => {
  const [what, unit] = rng.pick(ARTICLES);
  // Prix unitaire en centimes : les deux prix tombent juste au centime.
  const cents = level === 1 ? rng.int(2, 9) * 50 : rng.int(105, 395);
  let q1: number;
  let q2: number;
  do {
    q1 = rng.int(2, level === 3 ? 12 : 6);
    q2 = rng.int(2, level === 3 ? 15 : 10);
  } while (q1 === q2);
  const p1 = (cents * q1) / 100;
  const p2 = (cents * q2) / 100;
  return {
    prompt: `$${q1}$ ${what} coûtent $${dec(p1)}$ ${unit}. Combien coûtent $${q2}$ ${what} au même tarif ?`,
    answer: decimal(p2),
    hint: 'Le prix est proportionnel à la quantité : passe par le prix d’une unité, ou utilise le produit en croix.',
    correction: [`$\\frac{${dec(p1)} \\times ${q2}}{${q1}} = ${dec(p2)}$`, `$${q2}$ ${what} coûtent $${dec(p2)}$ ${unit}.`],
  };
});

const pourcentageDe = skill('3e-pourcentage', 'Appliquer un pourcentage', (rng, level) => {
  const t = level === 1 ? rng.pick([10, 20, 25, 50, 75]) : rng.pick([5, 12, 15, 30, 35, 40, 60, 85]);
  const n = rng.int(2, level === 3 ? 48 : 20) * 20;
  const v = (t * n) / 100;
  const ctx = rng.pick([`des élèves d'un collège de $${n}$ élèves sont demi-pensionnaires`, `des $${n}$ billes d'un sac sont rouges`, `des $${n}$ spectateurs ont moins de 15 ans`]);
  return {
    prompt: `$${t}\\,\\%$ ${ctx}. Combien cela représente-t-il ?`,
    answer: decimal(v),
    hint: `Prendre $${t}\\,\\%$ d'une quantité, c'est la multiplier par $\\frac{${t}}{100}$.`,
    correction: [`$\\frac{${t}}{100} \\times ${n} = ${dec(v)}$`],
  };
});

const coefMult = skill('3e-coefficient-multiplicateur', 'Trouver le coefficient multiplicateur d’une évolution', (rng, level) => {
  const t = level === 1 ? rng.pick([10, 20, 30, 50]) : rng.pick([3, 5, 8, 12, 15, 25, 40, 2.5, 0.5]);
  const up = level === 1 ? rng.next() < 0.7 : rng.next() < 0.5;
  const k = up ? 1 + t / 100 : 1 - t / 100;
  return {
    prompt: `Par quel nombre faut-il multiplier un prix pour ${up ? 'l’augmenter' : 'le diminuer'} de $${dec(t)}\\,\\%$ ?`,
    answer: decimal(k),
    hint: `${up ? 'Augmenter' : 'Diminuer'} de $t\\,\\%$ revient à multiplier par $1 ${up ? '+' : '-'} \\frac{t}{100}$.`,
    correction: [`$1 ${up ? '+' : '-'} \\frac{${dec(t)}}{100} = ${dec(k)}$`],
  };
});

const evolution = skill('3e-evolution', 'Calculer un prix après une évolution', (rng, level) => {
  const t = level === 1 ? rng.pick([10, 20, 50]) : rng.pick([5, 15, 25, 30, 40, 12]);
  const up = rng.next() < 0.5;
  const p = level === 3 ? rng.int(10, 80) * 5 : rng.int(2, 30) * 10;
  const k = up ? 100 + t : 100 - t;
  const v = (p * k) / 100;
  const reverse = level === 3 && rng.next() < 0.5;
  if (reverse) {
    // Retrouver le prix initial : on divise par le coefficient (et non on retire le pourcentage).
    return {
      prompt: `Après ${up ? 'une hausse' : 'une baisse'} de $${t}\\,\\%$, un article coûte $${dec(v)}$ €. Quel était son prix avant ${up ? 'la hausse' : 'la baisse'}, en € ?`,
      answer: decimal(p),
      hint: `Le nouveau prix vaut l'ancien multiplié par $${dec(k / 100)}$ : pour revenir en arrière, on divise.`,
      correction: [`$\\text{ancien prix} \\times ${dec(k / 100)} = ${dec(v)}$`, `$\\text{ancien prix} = \\frac{${dec(v)}}{${dec(k / 100)}} = ${dec(p)}$ €`],
    };
  }
  return {
    prompt: `Un article coûte $${p}$ €. Son prix ${up ? 'augmente' : 'baisse'} de $${t}\\,\\%$. Quel est son nouveau prix, en € ?`,
    answer: decimal(v),
    hint: `${up ? 'Augmenter' : 'Baisser'} de $${t}\\,\\%$, c'est multiplier par $${dec(k / 100)}$.`,
    correction: [`$${p} \\times ${dec(k / 100)} = ${dec(v)}$`, `Le nouveau prix est $${dec(v)}$ €.`],
  };
});

const successives = skill('3e-evolutions-successives', 'Enchaîner deux évolutions', (rng, level) => {
  const t1 = rng.pick(level === 1 ? [10, 20, 50] : [10, 20, 25, 30, 40, 50]);
  const t2 = level === 1 ? t1 : rng.pick([10, 20, 25, 30, 40, 50]);
  const up1 = level === 1 ? true : rng.next() < 0.5;
  const up2 = level === 1 ? false : rng.next() < 0.5;
  const k1 = 1 + (up1 ? t1 : -t1) / 100;
  const k2 = 1 + (up2 ? t2 : -t2) / 100;
  const g = Math.round((k1 * k2 - 1) * 10000) / 100;
  return {
    prompt: `Un prix ${up1 ? 'augmente' : 'baisse'} de $${t1}\\,\\%$, puis ${up2 ? 'augmente' : 'baisse'} de $${t2}\\,\\%$. Quelle est l'évolution globale, en % ? (Donne un nombre négatif pour une baisse.)`,
    answer: decimal(g),
    hint: 'Les pourcentages ne s’ajoutent pas : on multiplie les coefficients multiplicateurs.',
    correction: [
      `$${dec(k1)} \\times ${dec(k2)} = ${dec(k1 * k2)}$`,
      `$${dec(k1 * k2)} - 1 = ${dec(g / 100)}$, soit une évolution de $${dec(g)}\\,\\%$.`,
    ],
  };
});

const ratio = skill('3e-ratio', 'Partager selon un ratio', (rng, level) => {
  const a = rng.int(1, level === 1 ? 4 : 7);
  let b = rng.int(1, level === 1 ? 4 : 7);
  if (a === b) b += 1;
  const c = level === 3 ? rng.int(1, 5) : 0;
  const parts = a + b + c;
  const unit = rng.int(2, level === 1 ? 10 : 25);
  const total = parts * unit;
  const names = c ? 'Alice, Bilal et Chloé' : 'Alice et Bilal';
  const r = c ? `${a} : ${b} : ${c}` : `${a} : ${b}`;
  const who = rng.pick(c ? ['Alice', 'Bilal', 'Chloé'] : ['Alice', 'Bilal']);
  const share = who === 'Alice' ? a : who === 'Bilal' ? b : c;
  return {
    prompt: `${names} se partagent $${total}$ € selon le ratio $${r}$. Combien reçoit ${who}, en € ?`,
    answer: num(share * unit),
    hint: 'Additionne les nombres du ratio pour connaître le nombre de parts, puis calcule la valeur d’une part.',
    correction: [`Nombre de parts : $${c ? `${a} + ${b} + ${c}` : `${a} + ${b}`} = ${parts}$.`, `Une part vaut $\\frac{${total}}{${parts}} = ${unit}$ €.`, `${who} reçoit $${share} \\times ${unit} = ${share * unit}$ €.`],
  };
});

export const PROPORTIONNALITE_3E: Skill[] = [quatrieme, pourcentageDe, coefMult, evolution, successives, ratio];

/* ---------- Grandeurs composées ---------- */

const vitesse = skill('3e-vitesse', 'Calculer une vitesse moyenne', (rng, level) => {
  const v = level === 1 ? rng.int(4, 12) * 10 : rng.int(8, 26) * 5;
  const minutes = level === 1 ? rng.pick([60, 120, 180, 30]) : rng.pick([12, 15, 30, 45, 75, 90]);
  const d = (v * minutes) / 60;
  return {
    prompt: `Un car parcourt $${dec(d)}$ km en $${minutes >= 60 && minutes % 60 === 0 ? `${minutes / 60}$ h` : minutes > 60 ? `1$ h $${minutes - 60}$ min` : `${minutes}$ min`}. Quelle est sa vitesse moyenne, en km/h ?`,
    answer: decimal(v),
    hint: '$v = \\frac{d}{t}$ avec $t$ en heures : par exemple $45$ min $= 0{,}75$ h.',
    correction: [`$t = ${minutes}$ min $= ${dec(minutes / 60)}$ h`, `$v = \\frac{${dec(d)}}{${dec(minutes / 60)}} = ${v}$ km/h`],
  };
});

const duree = skill('3e-duree', 'Calculer une durée de trajet', (rng, level) => {
  const v = rng.pick(level === 1 ? [60, 90, 120] : [40, 50, 75, 80, 100, 130]);
  const minutes = rng.pick(level === 1 ? [30, 60, 90, 120] : [12, 18, 24, 36, 45, 48, 54, 72]);
  const d = (v * minutes) / 60;
  return {
    prompt: `Une voiture roule à $${v}$ km/h de moyenne. Combien de minutes lui faut-il pour parcourir $${dec(d)}$ km ?`,
    answer: num(minutes),
    hint: '$t = \\frac{d}{v}$ donne une durée en heures ; multiplie par 60 pour l’avoir en minutes.',
    correction: [`$t = \\frac{${dec(d)}}{${v}} = ${dec(minutes / 60)}$ h`, `$${dec(minutes / 60)} \\times 60 = ${minutes}$ min`],
  };
});

const conversion = skill('3e-conversion-vitesse', 'Convertir des km/h en m/s (et inversement)', (rng, level) => {
  const ms = level === 1 ? rng.int(1, 10) * 5 : rng.int(2, 40);
  const kmh = ms * 3.6;
  const toMs = rng.next() < 0.5;
  return toMs
    ? {
        prompt: `Convertis $${dec(kmh)}$ km/h en m/s.`,
        answer: num(ms),
        hint: '$1$ km/h $= \\frac{1000 \\text{ m}}{3600 \\text{ s}}$ : on divise par $3{,}6$.',
        correction: [`$${dec(kmh)}$ km/h $= \\frac{${dec(kmh)} \\times 1000}{3600}$ m/s $= ${ms}$ m/s`],
      }
    : {
        prompt: `Convertis $${ms}$ m/s en km/h.`,
        answer: decimal(kmh),
        hint: 'En une heure ($3600$ s), on parcourt $3600$ fois plus : on multiplie par $3{,}6$ pour passer en km/h.',
        correction: [`$${ms}$ m/s $= \\frac{${ms} \\times 3600}{1000}$ km/h $= ${dec(kmh)}$ km/h`],
      };
});

const debit = skill('3e-debit', 'Utiliser un débit', (rng, level) => {
  const q = rng.pick(level === 1 ? [5, 10, 20] : [6, 8, 12, 15, 25]);
  const minutes = rng.int(level === 1 ? 2 : 5, level === 3 ? 90 : 30);
  const vol = q * minutes;
  const ask = level === 1 ? 'volume' : rng.pick(['volume', 'temps'] as const);
  return ask === 'volume'
    ? {
        prompt: `Un robinet a un débit de $${q}$ L/min. Quel volume d'eau, en L, coule en $${minutes}$ minutes ?`,
        answer: num(vol),
        hint: 'Volume = débit × durée.',
        correction: [`$${q} \\times ${minutes} = ${vol}$ L`],
      }
    : {
        prompt: `Une baignoire de $${vol}$ L se remplit avec un débit de $${q}$ L/min. Combien de minutes faut-il ?`,
        answer: num(minutes),
        hint: 'Durée = volume ÷ débit.',
        correction: [`$\\frac{${vol}}{${q}} = ${minutes}$ min`],
      };
});

export const GRANDEURS_3E: Skill[] = [vitesse, duree, conversion, debit];
