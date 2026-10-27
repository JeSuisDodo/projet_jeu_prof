import type { Draft } from '../../terminale/util';
import { catalogue } from '../../licenceVariantes';
import { tidy } from '../util';
import { ALGEBRE_L2_VARIANTES } from './algebre';
import { ANALYSE_L2_VARIANTES } from './analyse';
import { EUCLIDIENS_L2_VARIANTES } from './euclidiens';
import { PLUSIEURS_VARIABLES_L2_VARIANTES } from './plusieursVariables';
import { PROBABILITES_L2_VARIANTES } from './probabilites';

/** Les textes passent par `tidy`, comme ceux des formes d'origine de L2. */
const retouche = (d: Draft): Draft => ({
  ...d,
  prompt: tidy(d.prompt),
  hint: tidy(d.hint),
  correction: d.correction.map(tidy),
  answer: d.answer.kind === 'choice' ? { ...d.answer, options: d.answer.options.map(tidy) } : d.answer,
});

/** Catalogue des variantes de Licence 2, pour `enrichChapters`. */
export const VARIANTES_L2 = catalogue([ALGEBRE_L2_VARIANTES, EUCLIDIENS_L2_VARIANTES, ANALYSE_L2_VARIANTES, PLUSIEURS_VARIABLES_L2_VARIANTES, PROBABILITES_L2_VARIANTES], retouche);
