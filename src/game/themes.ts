import type { ThemeId } from '../content/types';

/**
 * Couleurs de chaque ambiance. Quelques teintes de base suffisent : les ombres, reflets et
 * bordures en sont dérivés (`shade`), pour que chaque thème garde le même relief.
 */
export interface Theme {
  ground: number;
  path: number;
  rock: number;
  /** « Liquide » infranchissable : lave, eau, sable mouvant… */
  liquid: number;
  liquidDeep: number;
  /** Reflets et bulles du liquide. */
  liquidLight: number;
  /** Lueur autour du liquide et de l'arène du gardien. */
  glow: number;
  /** Sol de l'arène du gardien (le cratère du volcan). */
  arena: number;
  bush: number;
  tree: number;
  treeAlt: number;
  petals: number[];
  /** Particules d'ambiance : leur couleur et leur comportement. */
  particle: number;
  ambience: 'embers' | 'bubbles' | 'sparkles' | 'spray' | 'snow' | 'leaves' | 'dust' | 'fireflies' | 'butterflies';
  /** Fumée au-dessus de l'arène (volcan seulement). */
  smoke?: boolean;
  /** Couleur des fissures du gardien sur la carte. */
  bossGlow: number;
  /** Couleur d'accent de l'interface (étiquette de région). */
  accent: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  volcan: {
    ground: 0x7d985a, path: 0xcdb38d, rock: 0xc59c76, liquid: 0xd9480f, liquidDeep: 0x4a1d0f, liquidLight: 0xffa94d,
    glow: 0xff8c1a, arena: 0x5a2e24, bush: 0x37913b, tree: 0x3f9142, treeAlt: 0xd9731a,
    petals: [0xfff3bf, 0xffc9c9, 0xd0bfff, 0xffd8a8], particle: 0xffd43b, ambience: 'embers', smoke: true,
    bossGlow: 0xff922b, accent: '#e8590c',
  },
  prairie: {
    ground: 0x82b35c, path: 0xd9c49a, rock: 0xb8b2a6, liquid: 0x339af0, liquidDeep: 0x1c4f80, liquidLight: 0xa5d8ff,
    glow: 0x74c0fc, arena: 0x8c7a5b, bush: 0x40a047, tree: 0x48a84c, treeAlt: 0xf08c00,
    petals: [0xffffff, 0xffec99, 0xfcc2d7, 0xd0bfff], particle: 0xffffff, ambience: 'butterflies',
    bossGlow: 0x74c0fc, accent: '#2f9e44',
  },
  foret: {
    ground: 0x5e8a46, path: 0xb89c72, rock: 0x8f8a7e, liquid: 0x1f6f78, liquidDeep: 0x0c3338, liquidLight: 0x66d9e8,
    glow: 0x63e6be, arena: 0x4a3b2a, bush: 0x2b8a3e, tree: 0x2b7a35, treeAlt: 0x5c940d,
    petals: [0xffffff, 0xffe066, 0xb2f2bb], particle: 0xa9e34b, ambience: 'leaves',
    bossGlow: 0x63e6be, accent: '#2b8a3e',
  },
  neige: {
    ground: 0xdfe8ef, path: 0xb7c4cf, rock: 0x9aa7b5, liquid: 0x4dabf7, liquidDeep: 0x1d4f7a, liquidLight: 0xe7f5ff,
    glow: 0xd0ebff, arena: 0x7a8ea3, bush: 0x2f7d6a, tree: 0x1f6650, treeAlt: 0x5f8f8a,
    petals: [0xffffff, 0xd0ebff], particle: 0xffffff, ambience: 'snow',
    bossGlow: 0x74c0fc, accent: '#1c7ed6',
  },
  desert: {
    ground: 0xe3c58a, path: 0xc9a46a, rock: 0xd08f5a, liquid: 0xb07d3e, liquidDeep: 0x5c3d1a, liquidLight: 0xf0d29a,
    glow: 0xffd43b, arena: 0x9c6b3c, bush: 0x6b9b37, tree: 0x5a8f29, treeAlt: 0x8a9a3b,
    petals: [0xff8787, 0xffd43b, 0xffffff], particle: 0xf3dfb5, ambience: 'dust',
    bossGlow: 0xffd43b, accent: '#e67700',
  },
  marais: {
    ground: 0x6f8a52, path: 0x9c8f6a, rock: 0x7a7f6a, liquid: 0x5c8a3a, liquidDeep: 0x223a16, liquidLight: 0xc0eb75,
    glow: 0xa9e34b, arena: 0x3f3a2a, bush: 0x4f7d2a, tree: 0x3d6b2a, treeAlt: 0x6b7d2a,
    petals: [0xe599f7, 0xffffff, 0xffe066], particle: 0xd8f5a2, ambience: 'bubbles',
    bossGlow: 0xa9e34b, accent: '#5c940d',
  },
  cristal: {
    ground: 0x7a8fb0, path: 0xb6b0d4, rock: 0x9b8ec4, liquid: 0x9c36b5, liquidDeep: 0x3b0f4a, liquidLight: 0xf3d9fa,
    glow: 0xda77f2, arena: 0x4b3a6b, bush: 0x5f6fc0, tree: 0x4c5fb8, treeAlt: 0x9c5fc4,
    petals: [0xf3d9fa, 0xd0ebff, 0xffffff], particle: 0xf3d9fa, ambience: 'sparkles',
    bossGlow: 0xda77f2, accent: '#9c36b5',
  },
  plage: {
    ground: 0xf0dcae, path: 0xd8c08a, rock: 0xb59a7a, liquid: 0x1098ad, liquidDeep: 0x0b4f5c, liquidLight: 0xc5f6fa,
    glow: 0x66d9e8, arena: 0xc29b62, bush: 0x5c9f3a, tree: 0x3f9142, treeAlt: 0x82a83a,
    petals: [0xffa8a8, 0xffffff, 0xffe066], particle: 0xe3fafc, ambience: 'spray',
    bossGlow: 0x66d9e8, accent: '#0c8599',
  },
  automne: {
    ground: 0x9a9a5a, path: 0xc9a77a, rock: 0xa58e78, liquid: 0x3b7ea1, liquidDeep: 0x173a4f, liquidLight: 0xa5d8ff,
    glow: 0xffa94d, arena: 0x6b4a32, bush: 0xb5651d, tree: 0xc2551b, treeAlt: 0xe0a21b,
    petals: [0xffe066, 0xff922b, 0xffffff], particle: 0xff922b, ambience: 'leaves',
    bossGlow: 0xff922b, accent: '#d9480f',
  },
  nuit: {
    ground: 0x34506b, path: 0x6a7891, rock: 0x5a6680, liquid: 0x1c2f6b, liquidDeep: 0x0a1230, liquidLight: 0xbac8ff,
    glow: 0x91a7ff, arena: 0x252f4a, bush: 0x2b6b5a, tree: 0x23574f, treeAlt: 0x4c4f8a,
    petals: [0xfff3bf, 0xbac8ff, 0xffffff], particle: 0xfff3bf, ambience: 'fireflies',
    bossGlow: 0xfff3bf, accent: '#4263eb',
  },
};

/** Éclaircit (k > 0) ou assombrit (k < 0) une couleur 0xRRGGBB, k entre -1 et 1. */
export function shade(color: number, k: number): number {
  const mix = (c: number) => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k));
  const r = mix((color >> 16) & 255);
  const g = mix((color >> 8) & 255);
  const b = mix(color & 255);
  return (r << 16) | (g << 8) | b;
}
