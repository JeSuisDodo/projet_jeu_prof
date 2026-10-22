import type { Skill } from '../types';
import { bound, dec, decText, numDec, skill } from './util';

/** Chapitre « Vitesses et grandeurs composées » (4e). */

/** Durée en heures écrite « 1 h 30 min ». */
const hm = (h: number) => {
  const total = Math.round(h * 60);
  const H = Math.floor(total / 60);
  const M = total % 60;
  return H === 0 ? `${M} min` : M === 0 ? `${H} h` : `${H} h ${M} min`;
};

const DURATIONS = [0.25, 0.5, 0.75, 1.5, 2, 2.5, 3, 1.25, 0.2, 0.4];

const vitesse = skill('4e-vitesse-moyenne', 'Calculer une vitesse moyenne', (rng, level) => {
  const v = rng.int(bound(level, 3, 4, 5), bound(level, 12, 25, 26)) * (level === 1 ? 10 : 4);
  const t = level === 1 ? rng.int(1, 4) : rng.pick(DURATIONS);
  const d = v * t;
  return {
    prompt: `${rng.pick(['Un train', 'Une cycliste', 'Un bus', 'Un drone'])} parcourt ${decText(d)} km en ${hm(t)}. Quelle est sa vitesse moyenne, en km/h ?`,
    answer: numDec(v),
    hint: '$v = \\dfrac{d}{t}$, avec la durée $t$ en heures.',
    correction: [...(t === Math.floor(t) ? [] : [`$\\text{${hm(t)}} = ${dec(t)}\\ \\mathrm{h}$`]), `$v = \\dfrac{${dec(d)}}{${dec(t)}} = ${v}\\ \\mathrm{km/h}$`],
  };
});

const distance = skill('4e-distance-parcourue', 'Calculer une distance parcourue', (rng, level) => {
  const v = rng.int(2, bound(level, 12, 25, 30)) * (level === 3 ? 3 : 5);
  const t = level === 1 ? rng.int(1, 5) : rng.pick(DURATIONS);
  const d = v * t;
  return {
    prompt: `Une voiture roule à ${v} km/h de moyenne pendant ${hm(t)}. Quelle distance parcourt-elle, en km ?`,
    answer: numDec(d),
    hint: '$d = v \\times t$, avec $t$ en heures.',
    correction: [`$d = ${v} \\times ${dec(t)} = ${dec(d)}\\ \\mathrm{km}$`],
  };
});

const duree = skill('4e-duree-trajet', 'Calculer une durée de trajet', (rng, level) => {
  const v = rng.pick(level === 1 ? [10, 20, 30, 60] : [12, 15, 40, 45, 80, 90, 120]);
  const t = level === 1 ? rng.pick([0.5, 1, 2, 1.5]) : rng.pick(DURATIONS);
  const d = v * t;
  const minutes = Math.round(t * 60);
  return {
    prompt: `Un scooter roule à ${v} km/h de moyenne. Combien de minutes met-il pour parcourir ${decText(d)} km ?`,
    answer: numDec(minutes),
    hint: '$t = \\dfrac{d}{v}$ donne la durée en heures ; multiplie ensuite par 60.',
    correction: [`$t = \\dfrac{${dec(d)}}{${v}} = ${dec(t)}\\ \\mathrm{h} = ${dec(t)} \\times 60\\ \\mathrm{min} = ${minutes}\\ \\mathrm{min}$`],
  };
});

const conversionVitesse = skill('4e-conversion-vitesse', 'Convertir des m/s en km/h', (rng, level) => {
  const toKmh = level === 1 || rng.next() < 0.5;
  if (toKmh) {
    const ms = level === 3 ? rng.int(11, 99) / 2 : rng.int(2, 40);
    const kmh = ms * 3.6;
    return {
      prompt: `${rng.pick(['Un guépard', 'Un sprinteur', 'Le vent', 'Un manège'])} va à ${decText(ms)} m/s. Convertis cette vitesse en km/h.`,
      answer: numDec(kmh),
      hint: 'En une heure il y a 3 600 s, et 1 km = 1 000 m : on multiplie par $3{,}6$.',
      correction: [`$${dec(ms)}\\ \\mathrm{m/s} = \\dfrac{${dec(ms)} \\times 3\\,600}{1\\,000}\\ \\mathrm{km/h} = ${dec(kmh)}\\ \\mathrm{km/h}$`],
    };
  }
  const kmh = rng.int(1, 40) * 18;
  const ms = kmh / 3.6;
  return {
    prompt: `Une voiture roule à ${kmh} km/h. Convertis cette vitesse en m/s.`,
    answer: numDec(ms),
    hint: 'On divise par $3{,}6$ pour passer des km/h aux m/s.',
    correction: [`$${kmh}\\ \\mathrm{km/h} = \\dfrac{${kmh} \\times 1\\,000}{3\\,600}\\ \\mathrm{m/s} = ${dec(ms)}\\ \\mathrm{m/s}$`],
  };
});

const debit = skill('4e-grandeur-composee', 'Utiliser un débit ou une consommation', (rng, level) => {
  const cases = [
    () => {
      const rate = rng.int(4, 20);
      const min = rng.int(3, 25);
      return {
        prompt: `Un robinet a un débit de ${rate} L/min. Combien de litres remplit-il en ${min} minutes ?`,
        value: rate * min,
        corr: `$${rate}\\ \\mathrm{L/min} \\times ${min}\\ \\mathrm{min} = ${rate * min}\\ \\mathrm{L}$`,
        hint: 'Volume = débit × durée.',
      };
    },
    () => {
      const rate = rng.int(2, 12) * 5;
      const vol = rate * rng.int(3, 20);
      return {
        prompt: `Une piscine gonflable de ${vol} L se remplit avec un débit de ${rate} L/min. Combien de minutes faut-il ?`,
        value: vol / rate,
        corr: `$${vol} \\div ${rate} = ${vol / rate}\\ \\mathrm{min}$`,
        hint: 'Durée = volume ÷ débit.',
      };
    },
    () => {
      const kwh = rng.int(1, 9) / (level === 1 ? 1 : 2);
      const price = rng.pick([0.2, 0.25, 0.3, 0.4]);
      const h = rng.int(2, 10);
      return {
        prompt: `Un radiateur consomme ${decText(kwh)} kWh par heure. Le kWh coûte ${decText(price)} €. Combien coûtent ${h} heures de chauffage, en euros ?`,
        value: Math.round(kwh * h * price * 100) / 100,
        corr: `$${dec(kwh)} \\times ${h} = ${dec(kwh * h)}\\ \\mathrm{kWh}$, puis $${dec(kwh * h)} \\times ${dec(price)} = ${dec(Math.round(kwh * h * price * 100) / 100)}$ €.`,
        hint: 'Calcule d’abord l’énergie consommée, puis son prix.',
      };
    },
  ];
  const c = rng.pick(level === 1 ? cases.slice(0, 2) : cases)();
  return { prompt: c.prompt, answer: numDec(c.value), hint: c.hint, correction: [c.corr] };
});

export const VITESSES_SKILLS: Skill[] = [vitesse, distance, duree, conversionVitesse, debit];
