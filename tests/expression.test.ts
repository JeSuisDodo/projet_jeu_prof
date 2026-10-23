import { describe, expect, it } from 'vitest';
import { evalExpression, restatesPrompt } from '../src/exercises/expression';
import { frac, parseFrac, parseFracList } from '../src/exercises/fraction';
import { checkAnswer } from '../src/exercises/types';

describe('Réponses écrites sous forme de calcul', () => {
  it('évalue factorielles, produits, puissances et combinaisons', () => {
    expect(parseFrac('4!')).toEqual(frac(24));
    expect(parseFrac('4×3×2×1')).toEqual(frac(24));
    expect(parseFrac('4x3x2x1')).toEqual(frac(24));
    expect(parseFrac('4 * 3 * 2 * 1')).toEqual(frac(24));
    expect(parseFrac('2^10')).toEqual(frac(1024));
    expect(parseFrac('2**3')).toEqual(frac(8));
    expect(parseFrac('6³')).toEqual(frac(216));
    expect(parseFrac('10^-3')).toEqual(frac(1, 1000));
    expect(parseFrac('C(5,2)')).toEqual(frac(10));
    expect(parseFrac('binom(5;2)')).toEqual(frac(10));
    expect(parseFrac('2 parmi 5')).toEqual(frac(10));
    expect(parseFrac('A(5,2)')).toEqual(frac(20));
    expect(parseFrac('10!/(8!×2!)')).toEqual(frac(45));
    expect(parseFrac('(1/2)^3')).toEqual(frac(1, 8));
    expect(parseFrac('2(3+1)')).toEqual(frac(8));
    expect(parseFrac('1,5×2')).toEqual(frac(3));
    expect(parseFrac('n = 4!')).toEqual(frac(24));
    expect(parseFrac('-2^2')).toEqual(frac(-4));
  });

  it('refuse ce qui est illisible ou trop grand', () => {
    expect(evalExpression('4!!!')).toBeNull();
    expect(evalExpression('30!')).toBeNull();
    expect(evalExpression('1/0')).toBeNull();
    expect(evalExpression('2^1000')).toBeNull();
    expect(evalExpression('(2+3')).toBeNull();
    expect(evalExpression('2x')).toBeNull();
    expect(parseFrac('abc')).toBeNull();
  });

  it('accepte « 4! » pour ranger 4 livres', () => {
    expect(checkAnswer({ kind: 'number', value: frac(24) }, '4!')).toBe(true);
    expect(checkAnswer({ kind: 'number', value: frac(24) }, '3!')).toBe(false);
    expect(parseFracList('2^3 ; 1/2')).toEqual([frac(8), frac(1, 2)]);
  });

  it('repère un calcul de l’énoncé simplement recopié', () => {
    expect(restatesPrompt('Calcule $7 \\times 8$.', '7×8')).toBe(true);
    expect(restatesPrompt('Calcule $7 \\times 8$.', '8*7')).toBe(true);
    expect(restatesPrompt('Calcule $7 \\times 8$.', '56')).toBe(false);
    expect(restatesPrompt('Calcule $A = 3 + 4 \\times 2$.', '3+8')).toBe(true);
    expect(restatesPrompt('Calcule $C = \\dfrac{3}{4} + 1$.', '7/4')).toBe(false);
    expect(restatesPrompt('Écris $3^{-2}$ sous la forme d’une fraction.', '3^-2')).toBe(true);
    expect(restatesPrompt('Calcule $2{,}5 \\times 4$.', '10')).toBe(false);
    expect(restatesPrompt('Calcule $2{,}5 \\times 4$.', '4×2,5')).toBe(true);
    expect(restatesPrompt('De combien de façons peut-on ranger 4 livres différents sur une étagère ?', '4!')).toBe(false);
    expect(restatesPrompt('Développe $2x + 3$.', '2×3')).toBe(false);
  });
});
