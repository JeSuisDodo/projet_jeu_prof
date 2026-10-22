import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { GRADES } from '../src/content';
import { SIXIEME } from '../src/content/sixieme';
import { frac, parseFrac } from '../src/exercises/fraction';
import { Rng } from '../src/exercises/rng';
import { digitAt, enLettres, roundTo } from '../src/exercises/sixieme/nombres';
import { oneDigit } from '../src/exercises/sixieme/operations';
import { num } from '../src/exercises/sixieme/outils';
import { type Answer, type Exercise, type Level, type Response, checkAnswer } from '../src/exercises/types';

/** Vérifications propres à la 6e, en plus des tests communs de tests/content.test.ts. */

const skills = SIXIEME.chapters.flatMap((c) => c.skills);
const skill = (id: string) => {
  const s = skills.find((x) => x.id === id);
  if (!s) throw new Error(`Compétence absente : ${id}`);
  return s;
};

function* draws(id: string, count = 120): Generator<Exercise> {
  for (const level of [1, 2, 3] as Level[])
    for (let seed = 1; seed <= count; seed++) yield skill(id).generate(new Rng(seed * 104729 + level), level);
}

function badResponse(answer: Answer): Response {
  switch (answer.kind) {
    case 'number':
      return String(answer.value.n / answer.value.d + 1000);
    case 'set':
      return answer.values.length ? '1000' : '0';
    case 'pair':
      return ['1000', '1000'];
    case 'choice':
      return (answer.correct + 1) % answer.options.length;
  }
}

const value = (a: Answer) => {
  if (a.kind !== 'number') throw new Error('réponse numérique attendue');
  return a.value.n / a.value.d;
};

/** Lit un nombre écrit par `num` : « 12\,345{,}6 ». */
const readNum = (s: string) => Number(s.replace(/\\,/g, '').replace('{,}', '.'));

describe('outils de 6e', () => {
  it('écrit les nombres à la française', () => {
    expect(num(12345.6)).toBe('12\\,345{,}6');
    expect(num(0.1 + 0.2)).toBe('0{,}3');
    expect(num(1000000)).toBe('1\\,000\\,000');
    expect(num(-3.5)).toBe('-3{,}5');
  });

  it('écrit les nombres en lettres (orthographe rectifiée)', () => {
    expect(enLettres(21)).toBe('vingt-et-un');
    expect(enLettres(71)).toBe('soixante-et-onze');
    expect(enLettres(80)).toBe('quatre-vingts');
    expect(enLettres(81)).toBe('quatre-vingt-un');
    expect(enLettres(91)).toBe('quatre-vingt-onze');
    expect(enLettres(200)).toBe('deux-cents');
    expect(enLettres(201)).toBe('deux-cent-un');
    expect(enLettres(1000)).toBe('mille');
    expect(enLettres(80_000)).toBe('quatre-vingt-mille');
    expect(enLettres(200_300)).toBe('deux-cent-mille-trois-cents');
    expect(enLettres(3_000_017)).toBe('trois-millions-dix-sept');
    expect(enLettres(1_001_001)).toBe('un-million-mille-un');
  });

  it('arrondit et lit les rangs sans erreur de virgule', () => {
    expect(roundTo(2.45, 1)).toBe(2.5);
    expect(roundTo(12.349, 2)).toBe(12.35);
    expect(roundTo(7.5, 0)).toBe(8);
    expect(digitAt(4538.27, 2)).toBe(5);
    expect(digitAt(4538.27, -2)).toBe(7);
    expect(oneDigit(398)).toBe(400);
    expect(oneDigit(21)).toBe(20);
  });

  it('accepte une unité après le nombre', () => {
    expect(parseFrac('12 cm')).toEqual(frac(12));
    expect(parseFrac('3,5 m²')).toEqual(frac(7, 2));
    expect(parseFrac('45°')).toEqual(frac(45));
    expect(parseFrac('90 min')).toEqual(frac(90));
    expect(parseFrac('2 h')).toEqual(frac(2));
    expect(parseFrac('7,5 cm3')).toEqual(frac(15, 2));
    expect(parseFrac('2/3')).toEqual(frac(2, 3));
  });
});

describe('contenu de 6e', () => {
  it('est une île du collège, en tête de l’accueil', () => {
    expect(GRADES[0].id).toBe('6e');
    expect(SIXIEME.stage).toBe('college');
    expect(SIXIEME.chapters).toHaveLength(15);
  });

  it('préfixe tous ses identifiants par « 6e- »', () => {
    for (const c of SIXIEME.chapters) {
      expect(c.id.startsWith('6e-')).toBe(true);
      for (const s of c.skills) expect(s.id.startsWith('6e-'), s.id).toBe(true);
      for (const cr of [...c.creatures, c.boss]) expect(cr.id.startsWith('6e-'), cr.id).toBe(true);
    }
  });

  it('refuse une mauvaise réponse', () => {
    for (const s of skills)
      for (const ex of draws(s.id, 40)) expect(checkAnswer(ex.answer, badResponse(ex.answer)), `${s.id} : ${ex.prompt}`).toBe(false);
  });

  it('ne donne jamais de résultat négatif', () => {
    for (const s of skills)
      for (const ex of draws(s.id, 40)) {
        if (ex.answer.kind === 'number') expect(value(ex.answer), `${s.id} : ${ex.prompt}`).toBeGreaterThanOrEqual(0);
        if (ex.answer.kind === 'pair') for (const v of ex.answer.values) expect(v.n, `${s.id} : ${ex.prompt}`).toBeGreaterThanOrEqual(0);
      }
  });

  it('calcule juste les opérations posées', () => {
    const ops: [string, RegExp, (a: number, b: number) => number][] = [
      ['6e-addition', /^Calcule \$(.+)\$\.$/, () => 0],
      ['6e-soustraction', /^Calcule \$(.+) - (.+)\$\.$/, (a, b) => a - b],
      ['6e-multiplication', /^Calcule \$(.+) \\times (.+)\$\.$/, (a, b) => a * b],
    ];
    for (const [id, re, f] of ops)
      for (const ex of draws(id)) {
        const m = re.exec(ex.prompt)!;
        expect(m, ex.prompt).not.toBeNull();
        const expected = id === '6e-addition' ? m[1].split(' + ').map(readNum).reduce((a, b) => a + b, 0) : f(readNum(m[1]), readNum(m[2]));
        expect(value(ex.answer), ex.prompt).toBeCloseTo(expected, 6);
      }
  });

  it('trouve le quotient et le reste de la division euclidienne', () => {
    for (const ex of draws('6e-division-euclidienne')) {
      const [, a, b] = /\$(.+)\$ par \$(\d+)\$/.exec(ex.prompt)!;
      if (ex.answer.kind !== 'pair') throw new Error();
      const [q, r] = ex.answer.values.map((v) => v.n);
      expect(q * Number(b) + r).toBe(readNum(a));
      expect(r).toBeLessThan(Number(b));
    }
  });

  it('respecte les priorités opératoires', () => {
    // On évalue l'expression avec JavaScript, qui applique les mêmes priorités.
    for (const id of ['6e-priorites', '6e-parentheses'])
      for (const ex of draws(id)) {
        const expr = /\$(.+)\$/.exec(ex.prompt)![1].replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\[/g, '(').replace(/\]/g, ')');
        expect(value(ex.answer), ex.prompt).toBeCloseTo(Function(`return ${expr}`)() as number, 6);
      }
  });

  it('lit les nombres écrits en lettres', () => {
    for (const ex of draws('6e-lettres')) expect(enLettres(value(ex.answer)), ex.prompt).toBe(/« (.+) »/.exec(ex.prompt)![1]);
  });

  it('encadre et arrondit juste', () => {
    for (const ex of draws('6e-encadrer')) {
      const v = readNum(/Encadre \$(.+?)\$/.exec(ex.prompt)![1]);
      if (ex.answer.kind !== 'pair') throw new Error();
      const [lo, hi] = ex.answer.values.map((f) => f.n / f.d);
      expect(lo < v && v < hi, ex.prompt).toBe(true);
    }
    for (const ex of draws('6e-arrondir')) {
      const v = readNum(/de \$(.+)\$\./.exec(ex.prompt)![1]);
      expect(Math.abs(value(ex.answer) - v), ex.prompt).toBeLessThanOrEqual(0.5 + 1e-9);
    }
  });

  it('vérifie les critères de divisibilité', () => {
    for (const ex of draws('6e-criteres')) {
      const [, n, d] = /\$(.+)\$ est-il divisible par \$(\d+)\$/.exec(ex.prompt)!;
      if (ex.answer.kind !== 'choice') throw new Error();
      expect(ex.answer.correct === 0, ex.prompt).toBe(readNum(n) % Number(d) === 0);
    }
  });

  it('écrit un LaTeX valide partout (énoncés, options, indices, corrections, répliques)', () => {
    const check = (text: string, where: string) => {
      const parts = text.split('$');
      expect(parts.length % 2, `$ non appariés : ${where} : ${text}`).toBe(1);
      parts.forEach((part, i) => {
        if (i % 2) expect(() => katex.renderToString(part, { throwOnError: true, strict: 'error' }), `${where} : ${part}`).not.toThrow();
      });
    };
    for (const s of skills)
      for (const ex of draws(s.id, 10)) {
        const texts = [ex.prompt, ex.hint, ...ex.correction, ...(ex.answer.kind === 'choice' ? ex.answer.options : [])];
        texts.forEach((t) => check(t, s.id));
      }
    for (const c of SIXIEME.chapters) (c.guide ?? []).forEach((t) => check(t, c.id));
  }, 60_000);
});
