/** Évalue numériquement une expression LaTeX simple produite par les générateurs (tests uniquement). */

function group(s: string, open: number): [string, number] {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}' && --depth === 0) return [s.slice(open + 1, i), i + 1];
  }
  throw new Error(`accolade non fermée : ${s}`);
}

/** Traduit le LaTeX en expression JavaScript (multiplications implicites comprises). */
export function texToJs(tex: string): string {
  let s = tex
    .replace(/\\left|\\right/g, '')
    .replace(/\\,|\;|\s+/g, '')
    .replace(/\\times/g, '*')
    .replace(/\\(cos|sin)x/g, '\\$1(x)');
  let out = '';
  let i = 0;
  while (i < s.length) {
    if (s.startsWith('\\frac', i)) {
      const [a, j] = group(s, i + 5);
      const [b, k] = group(s, j);
      out += `((${texToJs(a)})/(${texToJs(b)}))`;
      i = k;
    } else if (s.startsWith('\\sqrt', i)) {
      const [a, j] = group(s, i + 5);
      out += `Math.sqrt(${texToJs(a)})`;
      i = j;
    } else if (s.startsWith('\\pi', i)) {
      out += ' PI ';
      i += 3;
    } else if (s.startsWith('\\cos', i) || s.startsWith('\\sin', i)) {
      out += ` ${s.slice(i + 1, i + 4)}`;
      i += 4;
    } else if (s.startsWith('e^{', i)) {
      const [a, j] = group(s, i + 2);
      out += ` exp(${texToJs(a)})`;
      i = j;
    } else if (s.startsWith('e^x', i)) {
      out += ' exp(x)';
      i += 3;
    } else if (s[i] === 'e') {
      out += ' E ';
      i++;
    } else if (s[i] === '^') {
      if (s[i + 1] === '{') {
        const [a, j] = group(s, i + 1);
        out += `**(${texToJs(a)})`;
        i = j;
      } else {
        out += `**${s[i + 1]}`;
        i += 2;
      }
    } else {
      out += s[i++];
    }
  }
  // Multiplications implicites : « 3x », « 2 PI », « )( », « x exp(… ».
  return out
    .replace(/(\d|x|PI|E|\))\s*(?=x|PI|E\b|exp|cos|sin|Math|\()/g, '$1*')
    .replace(/(x|PI|E|\))\s*(?=\d)/g, '$1*')
    // Moins unaire : « -x**2 » est refusé par JavaScript.
    .replace(/(^|\()\s*-/g, '$1(-1)*');
}

export function texEval(tex: string, x = 0): number {
  const js = texToJs(tex);
  const f = new Function('x', 'PI', 'E', 'exp', 'cos', 'sin', `return (${js});`);
  return f(x, Math.PI, Math.E, Math.exp, Math.cos, Math.sin) as number;
}
