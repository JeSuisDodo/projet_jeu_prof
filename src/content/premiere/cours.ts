/**
 * Cours de la Maison du savoir pour la 1re spécialité, par identifiant de compétence : la règle,
 * puis la méthode, en quelques phrases. L'exemple corrigé est tiré par le générateur des combats.
 */
export const COURS_PREMIERE: Record<string, string[]> = {
  // Second degré
  image: [
    'Calculer l’image de $k$ par $f$, c’est remplacer chaque $x$ par $k$ dans l’expression de $f(x)$.',
    'Méthode : écris le calcul en entier, avec des parenthèses autour des nombres négatifs, puis respecte les priorités : d’abord le carré, ensuite les produits, enfin les sommes. Attention : $(-3)^2 = 9$, mais $-3^2 = -9$.',
  ],
  discriminant: [
    'Pour le trinôme $ax^2 + bx + c$ (avec $a \\neq 0$), le discriminant est $\\Delta = b^2 - 4ac$.',
    'Méthode : repère bien $a$, $b$ et $c$ avec leur signe (le coefficient de $x^2$, celui de $x$, et la constante), puis calcule $b^2$ et $4ac$ séparément avant de soustraire.',
  ],
  'nb-solutions': [
    'Le signe de $\\Delta = b^2 - 4ac$ donne le nombre de solutions réelles de $ax^2 + bx + c = 0$.',
    'Si $\\Delta > 0$ : deux solutions. Si $\\Delta = 0$ : une seule solution (dite double). Si $\\Delta < 0$ : aucune solution réelle.',
  ],
  resoudre: [
    'Pour résoudre $ax^2 + bx + c = 0$, on calcule d’abord $\\Delta = b^2 - 4ac$.',
    'Si $\\Delta > 0$, les deux solutions sont $x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a}$ et $x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}$. Si $\\Delta = 0$, l’unique solution est $x_0 = -\\frac{b}{2a}$. Si $\\Delta < 0$, il n’y a pas de solution réelle.',
    'Astuce : vérifie ta réponse en remplaçant $x$ par une solution dans l’équation, tu dois trouver $0$.',
  ],
  sommet: [
    'La parabole de $f(x) = ax^2 + bx + c$ a pour sommet $S(\\alpha\\,;\\,\\beta)$ avec $\\alpha = -\\frac{b}{2a}$ et $\\beta = f(\\alpha)$.',
    'Méthode : calcule d’abord $\\alpha$, puis remplace $x$ par $\\alpha$ dans $f(x)$ pour obtenir $\\beta$.',
  ],
  'forme-canonique': [
    'Tout trinôme s’écrit sous forme canonique $f(x) = a(x - \\alpha)^2 + \\beta$, où $(\\alpha\\,;\\,\\beta)$ sont les coordonnées du sommet.',
    'Méthode : $a$ est le même que dans la forme développée ; $\\alpha = -\\frac{b}{2a}$ et $\\beta = f(\\alpha)$. Attention au signe : $a(x + 2)^2$ correspond à $\\alpha = -2$.',
  ],
  factorisation: [
    'Si le trinôme a deux racines $x_1$ et $x_2$, il se factorise en $f(x) = a(x - x_1)(x - x_2)$ ; avec une racine double $x_0$, $f(x) = a(x - x_0)^2$. Si $\\Delta < 0$, il ne se factorise pas.',
    'Méthode : calcule $\\Delta$, trouve les racines, puis n’oublie pas le coefficient $a$ devant les parenthèses.',
  ],
  'autre-racine': [
    'Si $x_1$ et $x_2$ sont les racines de $ax^2 + bx + c$, alors leur somme vaut $x_1 + x_2 = -\\frac{b}{a}$ et leur produit $x_1 x_2 = \\frac{c}{a}$.',
    'Méthode : connaissant une racine $x_1$, on obtient l’autre par $x_2 = -\\frac{b}{a} - x_1$ (ou par $x_2 = \\frac{c}{a x_1}$ si $x_1 \\neq 0$). Pas besoin de calculer $\\Delta$ !',
  ],
  signe: [
    'Un trinôme est du signe de $a$, sauf entre ses racines (quand il en a).',
    'Méthode : cherche les racines $x_1 < x_2$. Si $a > 0$, $f(x) < 0$ entre $x_1$ et $x_2$ et $f(x) > 0$ à l’extérieur ; si $a < 0$, c’est l’inverse. Si $\\Delta < 0$, $f(x)$ a toujours le signe de $a$. Fais attention aux crochets : inégalité large, racines comprises ; stricte, racines exclues.',
  ],
  extremum: [
    'Si $a > 0$, la parabole est tournée vers le haut : $f$ a un minimum. Si $a < 0$, elle est tournée vers le bas : $f$ a un maximum.',
    'Dans les deux cas, l’extremum vaut $\\beta = f(\\alpha)$ et il est atteint en $\\alpha = -\\frac{b}{2a}$.',
  ],

  // Suites numériques
  '1re-suite-explicite': [
    'Une suite est définie de façon explicite quand $u_n$ est donné directement en fonction de $n$, par exemple $u_n = 2n^2 - 3$.',
    'Méthode : pour calculer $u_k$, on remplace $n$ par $k$, comme pour l’image d’un nombre par une fonction.',
  ],
  '1re-suite-recurrente': [
    'Une suite est définie par récurrence quand on donne son premier terme et une relation pour passer d’un terme au suivant, par exemple $u_0 = 2$ et $u_{n+1} = 3u_n - 1$.',
    'Méthode : on calcule les termes un par un : $u_1$ à partir de $u_0$, puis $u_2$ à partir de $u_1$, etc. On ne peut pas sauter d’étape.',
  ],
  '1re-suite-suivant': [
    'Pour exprimer $u_{n+1}$, on remplace $n$ par $n + 1$ dans la formule de $u_n$.',
    'Méthode : mets $(n + 1)$ entre parenthèses, puis développe avec $(n + 1)^2 = n^2 + 2n + 1$ et réduis.',
  ],
  '1re-suite-variation': [
    'Une suite est croissante si $u_{n+1} - u_n \\geq 0$ pour tout $n$, décroissante si $u_{n+1} - u_n \\leq 0$ pour tout $n$.',
    'Méthode : calcule $u_{n+1} - u_n$, simplifie, puis étudie son signe pour $n \\geq 0$.',
  ],
  '1re-suite-seuil': [
    'Chercher un seuil, c’est trouver le premier rang $n$ à partir duquel $u_n$ dépasse une valeur donnée.',
    'Méthode : calcule les termes les uns après les autres (à la calculatrice ou avec un petit programme « tant que ») et arrête-toi au premier qui dépasse le seuil. La réponse est son rang $n$, pas sa valeur.',
  ],

  // Suites arithmétiques et géométriques
  '1re-arith-terme': [
    'Une suite arithmétique de raison $r$ ajoute $r$ à chaque étape : $u_{n+1} = u_n + r$.',
    'Terme général : $u_n = u_0 + nr$, et plus généralement $u_n = u_p + (n - p)r$.',
  ],
  '1re-arith-raison': [
    'Entre deux termes d’une suite arithmétique, on a ajouté autant de fois la raison que d’étapes : $u_q - u_p = (q - p)r$.',
    'Méthode : $r = \\frac{u_q - u_p}{q - p}$.',
  ],
  '1re-geo-terme': [
    'Une suite géométrique de raison $q$ multiplie par $q$ à chaque étape : $u_{n+1} = q \\times u_n$.',
    'Terme général : $u_n = u_0 \\times q^n$, et plus généralement $u_n = u_p \\times q^{n - p}$.',
  ],
  '1re-geo-raison': [
    'La raison d’une suite géométrique est le quotient de deux termes consécutifs : $q = \\frac{u_{n+1}}{u_n}$ (si $u_n \\neq 0$).',
    'Si on connaît deux termes séparés de deux rangs, $u_{n+2} = u_n \\times q^2$ : on calcule $q^2 = \\frac{u_{n+2}}{u_n}$, puis on prend la racine carrée qui convient (positive si $q > 0$).',
  ],
  '1re-arith-somme': [
    'Somme des entiers : $1 + 2 + \\dots + n = \\frac{n(n + 1)}{2}$.',
    'Pour une suite arithmétique : somme $=$ (nombre de termes) $\\times \\frac{\\text{premier terme} + \\text{dernier terme}}{2}$. Attention : de $u_0$ à $u_n$, il y a $n + 1$ termes.',
  ],
  '1re-geo-somme': [
    'Pour $q \\neq 1$ : $1 + q + q^2 + \\dots + q^n = \\frac{1 - q^{n+1}}{1 - q}$.',
    'Pour une suite géométrique : $u_0 + u_1 + \\dots + u_n = u_0 \\times \\frac{1 - q^{n+1}}{1 - q}$ (il y a $n + 1$ termes).',
  ],
  '1re-suite-nature': [
    'Pour reconnaître une suite, on regarde comment on passe d’un terme au suivant.',
    'Si $u_{n+1} - u_n$ est une constante $r$, la suite est arithmétique de raison $r$. Si $u_{n+1} = q \\times u_n$ avec $q$ constant, elle est géométrique de raison $q$. Une formule explicite $u_n = an + b$ donne une suite arithmétique, $u_n = b \\times q^n$ une suite géométrique.',
  ],

  // Dérivation
  '1re-taux-variation': [
    'Le taux de variation de $f$ entre $a$ et $b$ est $\\frac{f(b) - f(a)}{b - a}$ : c’est le coefficient directeur de la droite qui passe par les points d’abscisses $a$ et $b$ de la courbe.',
    'Méthode : calcule $f(a)$ et $f(b)$ séparément, puis fais le quotient.',
  ],
  '1re-derive-tangente': [
    'Le nombre dérivé $f\'(a)$ est le coefficient directeur de la tangente à la courbe au point d’abscisse $a$.',
    'Méthode : si la tangente passe par $A(x_A\\,;\\,y_A)$ et $B(x_B\\,;\\,y_B)$, alors $f\'(x_A) = \\frac{y_B - y_A}{x_B - x_A}$.',
  ],
  '1re-nombre-derive': [
    'Pour calculer $f\'(a)$, on dérive d’abord $f$ pour obtenir la fonction $f\'$, puis on remplace $x$ par $a$.',
    'Rappel : $(x^n)\' = nx^{n-1}$, la dérivée d’une constante est $0$, et $(kx)\' = k$.',
  ],
  '1re-derivee-polynome': [
    'On dérive un polynôme terme à terme : $(ax^n)\' = n\\,a\\,x^{n-1}$.',
    'Exemples : $(5x^3)\' = 15x^2$, $(-4x)\' = -4$, $(7)\' = 0$. La dérivée d’une somme est la somme des dérivées.',
  ],
  '1re-tangente': [
    'La tangente à la courbe de $f$ au point d’abscisse $a$ a pour équation $y = f\'(a)(x - a) + f(a)$.',
    'Méthode : calcule $f(a)$, puis $f\'(a)$, remplace dans la formule et développe pour obtenir $y = mx + p$.',
  ],
  '1re-derivee-operations': [
    'Produit : $(uv)\' = u\'v + uv\'$. Inverse : $\\left(\\frac{1}{v}\\right)\' = -\\frac{v\'}{v^2}$. Quotient : $\\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}$.',
    'Racine : $(\\sqrt{x})\' = \\frac{1}{2\\sqrt{x}}$ pour $x > 0$. Méthode : nomme $u$ et $v$, calcule $u\'$ et $v\'$, puis applique la formule sans te presser.',
  ],

  // Applications de la dérivation
  '1re-points-critiques': [
    'Les valeurs où $f\'(x) = 0$ sont les endroits où la tangente est horizontale : les extremums sont à chercher parmi elles.',
    'Méthode : dérive $f$, puis résous $f\'(x) = 0$ (équation du premier ou du second degré selon $f$).',
  ],
  '1re-variations': [
    'Si $f\'(x) > 0$ sur un intervalle, $f$ y est croissante ; si $f\'(x) < 0$, elle y est décroissante.',
    'Méthode : dérive $f$, étudie le signe de $f\'$ (racines, signe de $a$), puis dresse le tableau de variations.',
  ],
  '1re-extremum-local': [
    'Si $f\'$ s’annule en $a$ en changeant de signe, $f$ admet un extremum local en $a$ : un maximum si $f\'$ passe de $+$ à $-$, un minimum si elle passe de $-$ à $+$.',
    'Méthode : trouve les solutions de $f\'(x) = 0$, regarde le signe de $f\'$ autour, et calcule la valeur $f(a)$ si on te la demande.',
  ],
  '1re-derivee-composee': [
    'Si $g(x) = f(ax + b)$, alors $g\'(x) = a \\times f\'(ax + b)$.',
    'Exemples : $((3x - 1)^4)\' = 3 \\times 4(3x - 1)^3 = 12(3x - 1)^3$ et $(\\sqrt{2x + 5})\' = \\frac{2}{2\\sqrt{2x + 5}}$. N’oublie pas de multiplier par $a$ !',
  ],
  '1re-optimisation': [
    'Optimiser, c’est chercher pour quelle valeur une quantité (bénéfice, aire, coût…) est la plus grande ou la plus petite.',
    'Méthode : dérive la fonction, cherche où la dérivée s’annule, vérifie le changement de signe (de $+$ à $-$ pour un maximum), puis réponds à la question posée avec l’unité.',
  ],

  // Fonction exponentielle
  '1re-exp-proprietes': [
    'Pour tous réels $a$ et $b$ : $e^a \\times e^b = e^{a + b}$, $\\frac{e^a}{e^b} = e^{a - b}$, $(e^a)^n = e^{na}$ et $\\frac{1}{e^a} = e^{-a}$. De plus $e^0 = 1$.',
    'Méthode : transforme tout en une seule puissance de $e$, en additionnant ou soustrayant les exposants.',
  ],
  '1re-exp-equation': [
    'La fonction exponentielle est strictement croissante, donc $e^a = e^b$ équivaut à $a = b$.',
    'Méthode : écris les deux membres sous la forme $e^{\\dots}$, puis résous l’égalité des exposants. Rappel : $e^x > 0$ pour tout $x$, donc $e^x = -2$ n’a pas de solution.',
  ],
  '1re-exp-inequation': [
    'Comme l’exponentielle est strictement croissante, $e^a < e^b$ équivaut à $a < b$ : le sens de l’inégalité est conservé.',
    'Méthode : compare les exposants, puis résous l’inéquation du premier degré obtenue (attention si tu divises par un nombre négatif !).',
  ],
  '1re-exp-derivee': [
    'La fonction exponentielle est sa propre dérivée : $(e^x)\' = e^x$. Plus généralement, $(e^{kx})\' = k\\,e^{kx}$ et $(e^{ax + b})\' = a\\,e^{ax + b}$.',
    'Pour un produit comme $(ax + b)e^x$, on utilise $(uv)\' = u\'v + uv\'$, ce qui donne $(ax + a + b)e^x$.',
  ],
  '1re-exp-extremum': [
    'Pour $f(x) = (ax + b)e^x$, on trouve $f\'(x) = (ax + a + b)e^x$. Comme $e^x > 0$, $f\'(x)$ a le signe de $ax + a + b$.',
    'Méthode : résous $ax + a + b = 0$ et regarde le changement de signe : de $-$ à $+$, c’est un minimum ; de $+$ à $-$, un maximum.',
  ],

  // Trigonométrie
  '1re-trigo-conversion': [
    'Un tour complet mesure $360°$, soit $2\\pi$ radians : donc $180° = \\pi$ rad.',
    'Méthode : pour passer des degrés aux radians, multiplie par $\\frac{\\pi}{180}$ ; pour passer des radians aux degrés, multiplie par $\\frac{180}{\\pi}$. Exemple : $\\frac{\\pi}{3}$ rad $= 60°$.',
  ],
  '1re-trigo-valeurs': [
    'Valeurs à connaître : $\\cos 0 = 1$, $\\cos\\frac{\\pi}{6} = \\frac{\\sqrt{3}}{2}$, $\\cos\\frac{\\pi}{4} = \\frac{\\sqrt{2}}{2}$, $\\cos\\frac{\\pi}{3} = \\frac{1}{2}$, $\\cos\\frac{\\pi}{2} = 0$ ; pour le sinus, les mêmes valeurs dans l’ordre inverse.',
    'Pour un angle comme $\\frac{2\\pi}{3}$ ou $\\frac{5\\pi}{4}$, place le point sur le cercle trigonométrique et repère le signe du cosinus (abscisse) et du sinus (ordonnée).',
  ],
  '1re-trigo-associes': [
    'Sur le cercle trigonométrique, les symétries donnent : $\\cos(-x) = \\cos x$, $\\sin(-x) = -\\sin x$, $\\cos(\\pi - x) = -\\cos x$, $\\sin(\\pi - x) = \\sin x$, $\\cos(\\pi + x) = -\\cos x$, $\\sin(\\pi + x) = -\\sin x$.',
    'Et avec $\\frac{\\pi}{2}$ : $\\cos\\left(\\frac{\\pi}{2} - x\\right) = \\sin x$ et $\\sin\\left(\\frac{\\pi}{2} - x\\right) = \\cos x$. En cas de doute, fais un dessin du cercle.',
  ],
  '1re-trigo-mesure-principale': [
    'Un angle a une infinité de mesures, qui diffèrent d’un multiple de $2\\pi$. La mesure principale est celle qui est dans $]-\\pi\\,;\\,\\pi]$.',
    'Méthode : pour $\\frac{n\\pi}{d}$, retire ou ajoute des tours complets $2\\pi = \\frac{2d\\pi}{d}$ jusqu’à tomber entre $-\\pi$ et $\\pi$.',
  ],
  '1re-trigo-equation': [
    'Sur un tour du cercle, $\\cos x = \\cos a$ a pour solutions $a$ et $-a$ (points de même abscisse), $\\sin x = \\sin a$ a pour solutions $a$ et $\\pi - a$ (points de même ordonnée), à $2\\pi$ près.',
    'Méthode : reconnais une valeur remarquable ($\\frac{1}{2}$, $\\frac{\\sqrt{2}}{2}$, $\\frac{\\sqrt{3}}{2}$…) pour trouver $a$, puis écris les deux solutions et garde celles qui sont dans l’intervalle demandé.',
  ],
  '1re-trigo-parite': [
    'Une fonction $f$ définie sur $\\mathbb{R}$ est paire si $f(-x) = f(x)$ (courbe symétrique par rapport à l’axe des ordonnées), impaire si $f(-x) = -f(x)$ (symétrique par rapport à l’origine).',
    'Méthode : calcule $f(-x)$ avec $\\cos(-x) = \\cos x$, $\\sin(-x) = -\\sin x$ et $(-x)^2 = x^2$, puis compare avec $f(x)$. Une fonction peut n’être ni paire ni impaire.',
  ],

  // Produit scalaire
  '1re-ps-coordonnees': [
    'Dans un repère orthonormé, si $\\vec{u}(x\\,;\\,y)$ et $\\vec{v}(x\'\\,;\\,y\')$, alors $\\vec{u} \\cdot \\vec{v} = xx\' + yy\'$.',
    'Méthode : multiplie les abscisses entre elles, les ordonnées entre elles, puis additionne. Le résultat est un nombre, pas un vecteur.',
  ],
  '1re-ps-norme-angle': [
    'Avec les normes et l’angle : $\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\| \\times \\|\\vec{v}\\| \\times \\cos(\\vec{u}, \\vec{v})$.',
    'Pour trouver l’angle, on isole le cosinus : $\\cos(\\vec{u}, \\vec{v}) = \\frac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{u}\\| \\times \\|\\vec{v}\\|}$, puis on reconnaît une valeur remarquable.',
  ],
  '1re-ps-orthogonal': [
    'Deux vecteurs sont orthogonaux si et seulement si leur produit scalaire est nul : $\\vec{u} \\cdot \\vec{v} = 0$.',
    'Méthode : écris $xx\' + yy\' = 0$ avec l’inconnue $m$, puis résous l’équation du premier degré.',
  ],
  '1re-ps-al-kashi': [
    'Formule d’Al-Kashi dans un triangle $ABC$ : $BC^2 = AB^2 + AC^2 - 2 \\times AB \\times AC \\times \\cos\\widehat{BAC}$.',
    'C’est un « Pythagore généralisé » : si l’angle est droit, $\\cos\\widehat{BAC} = 0$ et on retrouve Pythagore.',
  ],
  '1re-ps-polarisation': [
    'Identités de polarisation : $\\|\\vec{u} + \\vec{v}\\|^2 = \\|\\vec{u}\\|^2 + 2\\,\\vec{u} \\cdot \\vec{v} + \\|\\vec{v}\\|^2$ et $\\|\\vec{u} - \\vec{v}\\|^2 = \\|\\vec{u}\\|^2 - 2\\,\\vec{u} \\cdot \\vec{v} + \\|\\vec{v}\\|^2$.',
    'Méthode : remplace les normes connues, puis isole $\\vec{u} \\cdot \\vec{v}$.',
  ],
  '1re-ps-figure': [
    'Dans une figure, on peut utiliser le projeté orthogonal : si $H$ est le projeté de $C$ sur $(AB)$, alors $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = \\overrightarrow{AB} \\cdot \\overrightarrow{AH}$, qui vaut $AB \\times AH$ si les vecteurs sont de même sens, $-AB \\times AH$ sinon.',
    'On peut aussi utiliser $\\|\\vec{u}\\| \\times \\|\\vec{v}\\| \\times \\cos$ de l’angle, ou placer un repère et calculer avec les coordonnées. Deux côtés perpendiculaires donnent un produit scalaire nul.',
  ],

  // Géométrie repérée
  '1re-geo-vecteur-normal': [
    'Un vecteur normal à une droite est un vecteur non nul orthogonal à sa direction.',
    'Si la droite a pour équation $ax + by + c = 0$, le vecteur $\\vec{n}(a\\,;\\,b)$ lui est normal (et tous les vecteurs qui lui sont colinéaires aussi).',
  ],
  '1re-geo-equation-normale': [
    'Une droite de vecteur normal $\\vec{n}(a\\,;\\,b)$ a une équation de la forme $ax + by + c = 0$.',
    'Méthode : écris $ax + by + c = 0$ avec les bons $a$ et $b$, puis remplace $x$ et $y$ par les coordonnées du point donné pour trouver $c$.',
  ],
  '1re-geo-perpendiculaire': [
    'Si $d : ax + by + c = 0$, alors $\\vec{u}(-b\\,;\\,a)$ dirige $d$ et $\\vec{n}(a\\,;\\,b)$ lui est normal.',
    'Une droite perpendiculaire à $d$ a pour vecteur normal un vecteur directeur de $d$ : son équation est de la forme $-bx + ay + c\' = 0$. On trouve $c\'$ avec le point par lequel elle passe.',
  ],
  '1re-geo-cercle-centre': [
    'Le cercle de centre $\\Omega(a\\,;\\,b)$ et de rayon $r$ a pour équation $(x - a)^2 + (y - b)^2 = r^2$.',
    'Si l’équation est développée, comme $x^2 + y^2 - 4x + 6y - 3 = 0$, on fait apparaître les carrés : $x^2 - 4x = (x - 2)^2 - 4$ et $y^2 + 6y = (y + 3)^2 - 9$. Attention aux signes : $(x + 3)^2$ correspond à $a = -3$.',
  ],
  '1re-geo-cercle-rayon': [
    'Dans l’équation $(x - a)^2 + (y - b)^2 = k$, le nombre $k$ est le carré du rayon : $k = r^2$.',
    'Si le cercle passe par $A$, alors $r^2 = \\Omega A^2 = (x_A - a)^2 + (y_A - b)^2$. Si $[AB]$ est un diamètre, le centre est le milieu de $[AB]$ et $r = \\frac{AB}{2}$.',
  ],
  '1re-geo-distance-droite': [
    'La distance d’un point $M$ à une droite $d$ est la distance $MH$, où $H$ est le projeté orthogonal de $M$ sur $d$ : c’est la plus courte distance entre $M$ et un point de $d$.',
    'Méthode : si $d : ax + by + c = 0$, le vecteur $\\overrightarrow{MH}$ est colinéaire à $\\vec{n}(a\\,;\\,b)$. On cherche donc $H(x_M + ta\\,;\\,y_M + tb)$ sur $d$ : en remplaçant dans l’équation, on trouve $t$, puis $H$, et enfin $MH = \\sqrt{(x_H - x_M)^2 + (y_H - y_M)^2}$.',
  ],

  // Probabilités conditionnelles
  '1re-proba-tableau': [
    'La probabilité de $B$ sachant $A$, notée $P_A(B)$, est la probabilité de $B$ quand on sait que $A$ est réalisé.',
    'Dans un tableau d’effectifs : $P_A(B) = \\frac{\\text{effectif de } A \\cap B}{\\text{effectif de } A}$. On se restreint à la ligne (ou colonne) de $A$, ce n’est plus le total général au dénominateur.',
  ],
  '1re-proba-intersection': [
    'Formule : $P(A \\cap B) = P(A) \\times P_A(B)$.',
    'Dans un arbre, la probabilité d’un chemin est le produit des probabilités sur ses branches. Pour $P(A \\cap \\overline{B})$, utilise $P_A(\\overline{B}) = 1 - P_A(B)$.',
  ],
  '1re-proba-totales': [
    'Formule des probabilités totales : $P(B) = P(A \\cap B) + P(\\overline{A} \\cap B) = P(A) \\times P_A(B) + P(\\overline{A}) \\times P_{\\overline{A}}(B)$.',
    'Dans un arbre : on additionne les probabilités de tous les chemins qui mènent à $B$.',
  ],
  '1re-proba-inversion': [
    'Pour « inverser » un conditionnement : $P_B(A) = \\frac{P(A \\cap B)}{P(B)}$.',
    'Méthode : calcule $P(A \\cap B)$ avec l’arbre (produit sur le chemin), $P(B)$ avec la formule des probabilités totales, puis fais le quotient.',
  ],
  '1re-proba-independance': [
    'Deux événements $A$ et $B$ sont indépendants si $P(A \\cap B) = P(A) \\times P(B)$ ; de façon équivalente (si $P(A) \\neq 0$), $P_A(B) = P(B)$ : savoir que $A$ est réalisé ne change rien pour $B$.',
    'Méthode : calcule $P(A) \\times P(B)$ et compare avec $P(A \\cap B)$.',
  ],

  // Variables aléatoires
  '1re-va-loi-manquante': [
    'Dans la loi d’une variable aléatoire, la somme de toutes les probabilités vaut $1$.',
    'Méthode : additionne les probabilités connues et retire le total de $1$ pour trouver celle qui manque.',
  ],
  '1re-va-probabilite': [
    'Pour calculer $P(X \\leq k)$ ou $P(X > k)$, on additionne les probabilités de toutes les valeurs de $X$ qui conviennent.',
    'Attention aux inégalités : $P(X < 3)$ ne contient pas la valeur $3$, mais $P(X \\leq 3)$ la contient. Astuce : $P(X > k) = 1 - P(X \\leq k)$.',
  ],
  '1re-va-esperance': [
    'L’espérance de $X$ est la moyenne des valeurs pondérées par leurs probabilités : $E(X) = x_1 p_1 + x_2 p_2 + \\dots + x_n p_n$.',
    'Interprétation : c’est la valeur moyenne de $X$ si on répète l’expérience un très grand nombre de fois.',
  ],
  '1re-va-variance': [
    'La variance mesure la dispersion autour de l’espérance : $V(X) = p_1(x_1 - E)^2 + \\dots + p_n(x_n - E)^2$, ou plus rapidement $V(X) = E(X^2) - E(X)^2$.',
    'Méthode : calcule d’abord $E(X)$, puis $E(X^2) = x_1^2 p_1 + \\dots + x_n^2 p_n$. L’écart type est $\\sigma(X) = \\sqrt{V(X)}$.',
  ],
  '1re-va-linearite': [
    'Pour $Y = aX + b$ : $E(Y) = aE(X) + b$ et $V(Y) = a^2 V(X)$.',
    'Attention : le $b$ disparaît dans la variance (décaler toutes les valeurs ne change pas leur dispersion) et $a$ y est au carré.',
  ],
  '1re-va-jeu': [
    'Pour étudier un jeu, on note $X$ le gain algébrique (gain moins mise) et on calcule son espérance.',
    'Si $E(X) > 0$, le jeu est favorable au joueur ; si $E(X) < 0$, il est défavorable ; si $E(X) = 0$, il est équitable. Pour trouver la mise qui rend le jeu équitable, on la prend égale à l’espérance de ce que l’on gagne.',
  ],
};
