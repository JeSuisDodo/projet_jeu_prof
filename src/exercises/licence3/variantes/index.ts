import { catalogue } from '../../licenceVariantes';
import { ALGEBRE_L3_VARIANTES } from './algebre';
import { ANALYSE_L3_VARIANTES } from './analyse';
import { CALCUL_L3_VARIANTES } from './calcul';
import { PROBABILITES_L3_VARIANTES } from './probabilites';

/** Catalogue des variantes de Licence 3, pour `enrichChapters`. */
export const VARIANTES_L3 = catalogue([ALGEBRE_L3_VARIANTES, ANALYSE_L3_VARIANTES, CALCUL_L3_VARIANTES, PROBABILITES_L3_VARIANTES]);
