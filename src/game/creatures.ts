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

export const CREATURES: Creature[] = [
  {
    id: 'parabolux',
    name: 'Parabolux',
    description: 'Un serpent de braise dont le corps dessine une parabole parfaite.',
    skills: ['image', 'sommet'],
    svg: svg(
      `<path d="M14 30 Q60 150 106 30" fill="none" stroke="#f08c00" stroke-width="14" stroke-linecap="round"/>
       <path d="M14 30 Q60 150 106 30" fill="none" stroke="#ffd43b" stroke-width="4" stroke-dasharray="6 10"/>
       <circle cx="106" cy="26" r="13" fill="#f08c00"/><circle cx="110" cy="22" r="3" fill="#212529"/>
       <path d="M117 30 l8 3 l-8 2" fill="#e03131"/>`,
    ),
  },
  {
    id: 'deltaire',
    name: 'Deltaïre',
    description: "Un oiseau triangulaire. Il sait d'un regard combien de solutions a une équation.",
    skills: ['discriminant', 'nb-solutions'],
    svg: svg(
      `<polygon points="60,16 104,96 16,96" fill="#4dabf7" stroke="#1864ab" stroke-width="5" stroke-linejoin="round"/>
       <polygon points="60,44 82,84 38,84" fill="#d0ebff"/>
       <circle cx="52" cy="58" r="4" fill="#212529"/><circle cx="68" cy="58" r="4" fill="#212529"/>
       <polygon points="60,64 66,72 54,72" fill="#fab005"/>
       <path d="M16 96 L2 70 M104 96 L118 70" stroke="#1864ab" stroke-width="6" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'racinelle',
    name: 'Racinelle',
    description: 'Une plante qui pousse sur les cendres. Ses racines plongent exactement là où le trinôme s\'annule.',
    skills: ['resoudre', 'autre-racine'],
    svg: svg(
      `<path d="M60 70 L60 30" stroke="#2b8a3e" stroke-width="8"/>
       <ellipse cx="42" cy="34" rx="18" ry="9" fill="#51cf66" transform="rotate(-25 42 34)"/>
       <ellipse cx="78" cy="34" rx="18" ry="9" fill="#51cf66" transform="rotate(25 78 34)"/>
       <circle cx="60" cy="22" r="10" fill="#ff8787"/>
       <rect x="30" y="66" width="60" height="10" rx="5" fill="#5c3d2e"/>
       <path d="M44 76 Q40 96 30 110 M60 76 L60 112 M76 76 Q80 96 90 110" stroke="#8d6e63" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'canonyx',
    name: 'Canonyx',
    description: 'Un crabe de lave qui range tout sous forme canonique, et coupe tout en facteurs avec ses pinces.',
    skills: ['forme-canonique', 'factorisation'],
    svg: svg(
      `<ellipse cx="60" cy="72" rx="34" ry="22" fill="#e03131" stroke="#862e2e" stroke-width="4"/>
       <circle cx="48" cy="48" r="6" fill="#fff"/><circle cx="72" cy="48" r="6" fill="#fff"/>
       <circle cx="48" cy="48" r="3" fill="#212529"/><circle cx="72" cy="48" r="3" fill="#212529"/>
       <path d="M30 64 Q12 50 18 30 M90 64 Q108 50 102 30" stroke="#e03131" stroke-width="7" fill="none"/>
       <path d="M10 30 L18 18 L26 30 Z M94 30 L102 18 L110 30 Z" fill="#c92a2a"/>
       <path d="M36 90 L26 106 M48 94 L44 110 M72 94 L76 110 M84 90 L94 106" stroke="#862e2e" stroke-width="5" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'signombre',
    name: 'Signombre',
    description: "Une chauve-souris des grottes. Elle vole au-dessus de l'axe quand le trinôme est positif, en dessous sinon.",
    skills: ['signe', 'extremum'],
    svg: svg(
      `<path d="M60 50 Q30 20 6 44 Q20 50 22 64 Q36 56 44 70 Z" fill="#7048e8"/>
       <path d="M60 50 Q90 20 114 44 Q100 50 98 64 Q84 56 76 70 Z" fill="#7048e8"/>
       <ellipse cx="60" cy="62" rx="16" ry="20" fill="#5f3dc4"/>
       <path d="M50 46 L46 34 L56 42 M70 46 L74 34 L64 42" fill="#5f3dc4" stroke="#5f3dc4" stroke-width="3"/>
       <circle cx="54" cy="58" r="3.5" fill="#ffe066"/><circle cx="66" cy="58" r="3.5" fill="#ffe066"/>
       <text x="60" y="78" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">±</text>`,
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
      `<rect x="22" y="34" width="76" height="72" rx="12" fill="#495057" stroke="#212529" stroke-width="4"/>
       <path d="M30 50 Q60 110 90 50" fill="none" stroke="#ff922b" stroke-width="6"/>
       <rect x="34" y="14" width="52" height="30" rx="8" fill="#343a40"/>
       <circle cx="48" cy="29" r="5" fill="#ff6b6b"/><circle cx="72" cy="29" r="5" fill="#ff6b6b"/>
       <rect x="4" y="44" width="18" height="40" rx="8" fill="#495057"/><rect x="98" y="44" width="18" height="40" rx="8" fill="#495057"/>
       <text x="60" y="88" text-anchor="middle" font-size="18" font-weight="700" fill="#ffd8a8">ax²</text>`,
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
