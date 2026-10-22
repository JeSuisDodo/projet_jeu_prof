/** Créatures de la région du Volcan du Second degré. Chacune porte une ou deux compétences du chapitre. */
export interface Creature {
  id: string;
  name: string;
  description: string;
  skills: string[];
  boss?: boolean;
  svg: string;
}

const svg = (body: string) =>
  `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

const INK = '#2b1d16';

/** Œil avec reflet : donne vie aux créatures. */
const eye = (x: number, y: number, r: number, iris = '#212529') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="2"/>
   <circle cx="${x + r * 0.2}" cy="${y + r * 0.1}" r="${r * 0.6}" fill="${iris}"/>
   <circle cx="${x - r * 0.15}" cy="${y - r * 0.3}" r="${r * 0.25}" fill="#fff"/>`;

/** Dégradés propres à chaque créature (identifiants préfixés pour ne pas se mélanger dans le carnet). */
const radial = (id: string, light: string, dark: string) =>
  `<radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`;

const ground = '<ellipse cx="60" cy="110" rx="34" ry="6" fill="#000" opacity="0.18"/>';

export const CREATURES: Creature[] = [
  {
    id: 'parabolux',
    name: 'Parabolux',
    description: 'Un serpent de braise dont le corps dessine une parabole parfaite.',
    skills: ['image', 'sommet'],
    svg: svg(
      `<defs>${radial('pbx-head', '#ffd8a8', '#e8590c')}
         <linearGradient id="pbx-body" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffa94d"/><stop offset="1" stop-color="#d9480f"/></linearGradient></defs>
       ${ground}
       <path d="M16 34 Q60 150 104 34" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
       <path d="M16 34 Q60 150 104 34" fill="none" stroke="url(#pbx-body)" stroke-width="15" stroke-linecap="round"/>
       <path d="M18 34 Q60 146 102 34" fill="none" stroke="#ffe8cc" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round"/>
       <path d="M22 40 Q60 138 98 40" fill="none" stroke="#fff4e6" stroke-width="2" opacity="0.6"/>
       <circle cx="60" cy="92" r="4" fill="#ffd43b" stroke="${INK}" stroke-width="1.5"/>
       <path d="M8 32 l-6 -6 M10 30 l-2 -9" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
       <circle cx="104" cy="28" r="15" fill="url(#pbx-head)" stroke="${INK}" stroke-width="3"/>
       <path d="M96 16 l4 -10 l5 9 l5 -9 l2 11" fill="#ffd43b" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
       ${eye(108, 25, 5)}
       <path d="M110 36 q4 2 8 0" stroke="${INK}" stroke-width="2" fill="none"/>
       <path d="M117 37 l6 3 l-6 2" fill="#e03131" stroke="${INK}" stroke-width="1.2"/>`,
    ),
  },
  {
    id: 'deltaire',
    name: 'Deltaïre',
    description: "Un oiseau triangulaire. Il sait d'un regard combien de solutions a une équation.",
    skills: ['discriminant', 'nb-solutions'],
    svg: svg(
      `<defs>${radial('dlt-body', '#a5d8ff', '#1971c2')}${radial('dlt-belly', '#ffffff', '#a5d8ff')}</defs>
       ${ground}
       <path d="M22 70 Q-2 50 4 30 Q20 46 34 52 Z" fill="#339af0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
       <path d="M98 70 Q122 50 116 30 Q100 46 86 52 Z" fill="#339af0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
       <path d="M10 34 l10 10 M14 30 l8 12" stroke="#1864ab" stroke-width="2"/>
       <path d="M110 34 l-10 10 M106 30 l-8 12" stroke="#1864ab" stroke-width="2"/>
       <polygon points="60,10 104,96 16,96" fill="url(#dlt-body)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
       <polygon points="60,46 84,90 36,90" fill="url(#dlt-belly)"/>
       <text x="60" y="84" text-anchor="middle" font-size="20" font-weight="700" fill="#1864ab" font-family="serif">Δ</text>
       <path d="M60 10 l-6 -8 l6 3 l6 -3 z" fill="#fab005" stroke="${INK}" stroke-width="1.5"/>
       ${eye(50, 52, 6)}${eye(70, 52, 6)}
       <polygon points="60,60 68,68 60,72 52,68" fill="#fab005" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
       <path d="M42 96 l-4 10 M48 96 l0 10 M72 96 l0 10 M78 96 l4 10" stroke="#e67700" stroke-width="4" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'racinelle',
    name: 'Racinelle',
    description: "Une plante qui pousse sur les cendres. Ses racines plongent exactement là où le trinôme s'annule.",
    skills: ['resoudre', 'autre-racine'],
    svg: svg(
      `<defs>${radial('rcn-leaf', '#b2f2bb', '#2f9e44')}${radial('rcn-bulb', '#ffc9c9', '#e03131')}${radial('rcn-pot', '#a47148', '#5c3d2e')}</defs>
       ${ground}
       <path d="M44 84 Q38 100 26 112 M60 84 L60 114 M76 84 Q82 100 94 112 M52 84 Q48 98 44 110" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
       <path d="M44 84 Q38 100 26 112 M60 84 L60 114 M76 84 Q82 100 94 112 M52 84 Q48 98 44 110" stroke="#c08552" stroke-width="4" fill="none" stroke-linecap="round"/>
       <circle cx="26" cy="112" r="3" fill="#ffd43b" stroke="${INK}" stroke-width="1.5"/>
       <circle cx="94" cy="112" r="3" fill="#ffd43b" stroke="${INK}" stroke-width="1.5"/>
       <path d="M60 74 Q56 52 60 34" stroke="${INK}" stroke-width="9" fill="none"/>
       <path d="M60 74 Q56 52 60 34" stroke="#37b24d" stroke-width="5" fill="none"/>
       <path d="M58 52 Q30 30 14 44 Q34 62 58 56 Z" fill="url(#rcn-leaf)" stroke="${INK}" stroke-width="3"/>
       <path d="M62 46 Q90 22 106 36 Q86 56 62 50 Z" fill="url(#rcn-leaf)" stroke="${INK}" stroke-width="3"/>
       <path d="M56 54 Q36 46 22 46 M64 48 Q84 38 98 38" stroke="#2b8a3e" stroke-width="1.5" fill="none"/>
       <circle cx="60" cy="24" r="14" fill="url(#rcn-bulb)" stroke="${INK}" stroke-width="3"/>
       <path d="M48 18 q12 -14 24 0" fill="#ff8787" stroke="${INK}" stroke-width="2"/>
       ${eye(54, 25, 4)}${eye(66, 25, 4)}
       <path d="M56 32 q4 3 8 0" stroke="${INK}" stroke-width="2" fill="none"/>
       <path d="M28 70 Q60 62 92 70 L86 86 Q60 92 34 86 Z" fill="url(#rcn-pot)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
       <path d="M34 74 Q60 68 86 74" stroke="#c08552" stroke-width="2" fill="none"/>`,
    ),
  },
  {
    id: 'canonyx',
    name: 'Canonyx',
    description: 'Un crabe de lave qui range tout sous forme canonique, et coupe tout en facteurs avec ses pinces.',
    skills: ['forme-canonique', 'factorisation'],
    svg: svg(
      `<defs>${radial('cnx-shell', '#ffa8a8', '#c92a2a')}${radial('cnx-claw', '#ff8787', '#a61e4d')}</defs>
       ${ground}
       <path d="M34 92 L22 108 M44 96 L38 112 M76 96 L82 112 M86 92 L98 108" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
       <path d="M34 92 L22 108 M44 96 L38 112 M76 96 L82 112 M86 92 L98 108" stroke="#e03131" stroke-width="4" stroke-linecap="round"/>
       <path d="M30 70 Q10 58 16 34 M90 70 Q110 58 104 34" stroke="${INK}" stroke-width="10" fill="none" stroke-linecap="round"/>
       <path d="M30 70 Q10 58 16 34 M90 70 Q110 58 104 34" stroke="#e03131" stroke-width="6" fill="none" stroke-linecap="round"/>
       <path d="M4 32 Q8 8 22 16 L18 30 Q12 26 14 36 Z" fill="url(#cnx-claw)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
       <path d="M116 32 Q112 8 98 16 L102 30 Q108 26 106 36 Z" fill="url(#cnx-claw)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
       <ellipse cx="60" cy="76" rx="38" ry="24" fill="url(#cnx-shell)" stroke="${INK}" stroke-width="4"/>
       <path d="M30 70 Q60 56 90 70" stroke="#ffc9c9" stroke-width="3" fill="none" opacity="0.8"/>
       <path d="M40 84 Q60 94 80 84" stroke="#a61e4d" stroke-width="2.5" fill="none"/>
       <circle cx="46" cy="72" r="3" fill="#ff922b"/><circle cx="74" cy="72" r="3" fill="#ff922b"/><circle cx="60" cy="68" r="2.5" fill="#ff922b"/>
       <path d="M48 56 L46 42 M72 56 L74 42" stroke="${INK}" stroke-width="4"/>
       ${eye(46, 40, 6)}${eye(74, 40, 6)}
       <path d="M54 82 q6 4 12 0" stroke="${INK}" stroke-width="2" fill="none"/>`,
    ),
  },
  {
    id: 'signombre',
    name: 'Signombre',
    description: "Une chauve-souris des grottes. Elle vole au-dessus de l'axe quand le trinôme est positif, en dessous sinon.",
    skills: ['signe', 'extremum'],
    svg: svg(
      `<defs>${radial('sgn-body', '#b197fc', '#5f3dc4')}${radial('sgn-wing', '#9775fa', '#3b2a8c')}</defs>
       ${ground}
       <line x1="6" y1="104" x2="114" y2="104" stroke="#868e96" stroke-width="2" stroke-dasharray="4 4"/>
       <path d="M60 52 Q32 14 4 40 Q16 44 18 58 Q30 50 36 62 Q42 56 48 70 Z" fill="url(#sgn-wing)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
       <path d="M60 52 Q88 14 116 40 Q104 44 102 58 Q90 50 84 62 Q78 56 72 70 Z" fill="url(#sgn-wing)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
       <path d="M56 50 L18 44 M56 52 L30 54 M64 50 L102 44 M64 52 L90 54" stroke="#b197fc" stroke-width="1.5"/>
       <ellipse cx="60" cy="64" rx="18" ry="22" fill="url(#sgn-body)" stroke="${INK}" stroke-width="3"/>
       <ellipse cx="60" cy="72" rx="10" ry="11" fill="#d0bfff"/>
       <path d="M47 48 L42 30 L54 42 Z M73 48 L78 30 L66 42 Z" fill="#7048e8" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
       ${eye(53, 58, 5, '#f59f00')}${eye(67, 58, 5, '#f59f00')}
       <path d="M55 68 l2 4 l2 -3 l2 3 l2 -4" stroke="${INK}" stroke-width="1.8" fill="#fff" stroke-linejoin="round"/>
       <text x="60" y="84" text-anchor="middle" font-size="12" font-weight="700" fill="#5f3dc4">±</text>
       <path d="M52 86 l-2 6 M68 86 l2 6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'trinomax',
    name: 'Trinomax, gardien du cratère',
    description: 'Le gardien de la région. Il mélange toutes les compétences du chapitre.',
    skills: [
      'resoudre',
      'sommet',
      'signe',
      'forme-canonique',
      'factorisation',
      'discriminant',
      'extremum',
      'autre-racine',
    ],
    boss: true,
    svg: svg(
      `<defs>${radial('tnx-rock', '#adb5bd', '#343a40')}${radial('tnx-core', '#fff3bf', '#f76707')}</defs>
       ${ground}
       <rect x="30" y="92" width="18" height="18" rx="5" fill="url(#tnx-rock)" stroke="${INK}" stroke-width="3"/>
       <rect x="72" y="92" width="18" height="18" rx="5" fill="url(#tnx-rock)" stroke="${INK}" stroke-width="3"/>
       <rect x="2" y="40" width="22" height="46" rx="10" fill="url(#tnx-rock)" stroke="${INK}" stroke-width="3"/>
       <rect x="96" y="40" width="22" height="46" rx="10" fill="url(#tnx-rock)" stroke="${INK}" stroke-width="3"/>
       <rect x="20" y="32" width="80" height="66" rx="16" fill="url(#tnx-rock)" stroke="${INK}" stroke-width="4"/>
       <path d="M32 44 l10 8 l-4 10 M88 46 l-8 10 l6 8 M50 90 l6 -8" stroke="#f76707" stroke-width="3" fill="none" stroke-linecap="round"/>
       <circle cx="60" cy="66" r="15" fill="url(#tnx-core)" stroke="${INK}" stroke-width="3"/>
       <path d="M49 60 Q60 84 71 60" stroke="#c92a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
       <rect x="34" y="6" width="52" height="32" rx="10" fill="url(#tnx-rock)" stroke="${INK}" stroke-width="4"/>
       <path d="M40 16 l8 4 M80 16 l-8 4" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
       <circle cx="49" cy="24" r="5" fill="#ff6b6b" stroke="${INK}" stroke-width="2"/><circle cx="71" cy="24" r="5" fill="#ff6b6b" stroke="${INK}" stroke-width="2"/>
       <circle cx="48" cy="22" r="1.6" fill="#fff"/><circle cx="70" cy="22" r="1.6" fill="#fff"/>
       <text x="60" y="94" text-anchor="middle" font-size="11" font-weight="700" fill="#ffd8a8">ax²+bx+c</text>`,
    ),
  },
];

export const creatureById = (id: string): Creature => {
  const creature = CREATURES.find((c) => c.id === id);
  if (!creature) throw new Error(`Créature inconnue : ${id}`);
  return creature;
};

/** Nombre d'espèces différentes à capturer avant que le gardien accepte le combat. */
export const SPECIES_FOR_BOSS = 3;
