import type Phaser from 'phaser';
import type { ThemeId } from '../content/types';
import { TILE } from './map';
import { type Theme, shade } from './themes';

/**
 * Dessine toutes les textures des objets avec le code : aucun fichier d'image n'est nécessaire.
 * Le décor fixe (sol, falaises, lave) est peint à part, dans terrain.ts.
 * Les éléments animés ont plusieurs images (frames) : herbe-0, herbe-1…
 * Les textures du décor dépendent du thème de la région et sont préfixées par son nom
 * (« neige-grass-0 ») ; chacune n'est dessinée qu'une fois, à la première visite.
 */

const OUTLINE = 0x2b1d16;

export type Facing = 'down' | 'up' | 'side';
export const FACINGS: Facing[] = ['down', 'up', 'side'];

interface Part {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  color: number;
  /** false : pas de contour (reflets, petits détails). */
  outline?: boolean;
}

/** Taille de la texture de la maison et point posé sur le bas de la porte (milieu de la façade). */
export const HOUSE_TEX = { w: 136, h: 124, doorX: 52, groundY: 117 };

export function makeTextures(scene: Phaser.Scene, theme: ThemeId, T: Theme): void {
  const g = scene.add.graphics();
  const texture = (key: string, w: number, h: number, draw: () => void) => {
    if (scene.textures.exists(key)) return;
    g.clear();
    draw();
    g.generateTexture(key, w, h);
  };

  /** Dessine des pièces avec un contour sombre commun, façon pixel art. */
  const parts = (list: Part[]) => {
    for (const p of list)
      if (p.outline !== false) g.fillStyle(OUTLINE).fillRoundedRect(p.x - 1, p.y - 1, p.w + 2, p.h + 2, (p.r ?? 0) + 1);
    for (const p of list) g.fillStyle(p.color).fillRoundedRect(p.x, p.y, p.w, p.h, p.r ?? 0);
  };
  const shadow = (cx: number, cy: number, w: number, h: number, a = 0.3) => g.fillStyle(0x000000, a).fillEllipse(cx, cy, w, h);

  // Hautes herbes : un buisson de feuilles en volume, trois positions pour onduler.
  [0, 2, -2].forEach((sway, frame) =>
    texture(`${theme}-grass-${frame}`, TILE, 40, () => {
      shadow(16, 36, 28, 8, 0.28);
      const leaf = (angle: number, len: number, color: number, vein: number) => {
        const a = (angle * Math.PI) / 180;
        const bx = 16;
        const by = 36;
        const tx = bx + Math.sin(a) * len + sway * (len / 20);
        const ty = by - Math.cos(a) * len;
        const nx = Math.cos(a) * 4;
        const ny = Math.sin(a) * 4;
        const mx = (bx + tx) / 2;
        const my = (by + ty) / 2;
        const pts = [
          { x: bx, y: by },
          { x: mx - nx, y: my - ny },
          { x: tx, y: ty },
          { x: mx + nx, y: my + ny },
        ];
        g.lineStyle(2, shade(T.bush, -0.6)).strokePoints(pts, true);
        g.fillStyle(color).fillPoints(pts, true);
        g.lineStyle(1, vein).lineBetween(bx, by, (bx + tx * 2) / 3, (by + ty * 2) / 3);
      };
      for (const a of [-75, -45, 45, 75]) leaf(a, 18, shade(T.bush, -0.15), shade(T.bush, 0.3));
      for (const a of [-25, 25]) leaf(a, 22, T.bush, shade(T.bush, 0.4));
      leaf(0, 24, shade(T.bush, 0.1), shade(T.bush, 0.5));
      for (const a of [-55, 55]) leaf(a, 13, shade(T.bush, 0.2), shade(T.bush, 0.5));
    }),
  );

  // Liquide : bulles et reflets transparents posés sur la fosse peinte dans le décor.
  const bubbleSets = [
    [9, 11, 4, 23, 21, 5],
    [10, 10, 5, 22, 22, 3],
    [8, 12, 2, 24, 20, 6],
  ];
  bubbleSets.forEach(([x1, y1, r1, x2, y2, r2], frame) =>
    texture(`${theme}-lava-${frame}`, TILE, TILE, () => {
      g.fillStyle(T.liquidLight, 0.55).fillRect(2, 14 + frame * 3, 12 + frame * 3, 2);
      g.fillStyle(shade(T.liquid, 0.25)).fillCircle(x1, y1, r1).fillCircle(x2, y2, r2);
      g.fillStyle(shade(T.liquidLight, 0.3)).fillCircle(x1 - r1 / 3, y1 - r1 / 3, r1 / 2.5).fillCircle(x2 - r2 / 3, y2 - r2 / 3, r2 / 2.5);
      g.lineStyle(1, shade(T.liquid, -0.3), 0.8).strokeCircle(x1, y1, r1).strokeCircle(x2, y2, r2);
    }),
  );

  // Arbres : deux essences, feuillage en boules superposées avec ombre et lumière.
  const tree = (key: string, dark: number, mid: number, light: number) =>
    texture(key, TILE, 52, () => {
      shadow(16, 48, 28, 8);
      parts([{ x: 13, y: 32, w: 6, h: 16, r: 2, color: 0x7a4e2d }]);
      g.fillStyle(0x5c3a1a).fillRect(14, 36, 2, 10);
      g.fillStyle(OUTLINE).fillCircle(16, 20, 15).fillCircle(8, 26, 9).fillCircle(24, 26, 9);
      g.fillStyle(dark).fillCircle(16, 20, 14).fillCircle(8, 26, 8).fillCircle(24, 26, 8);
      g.fillStyle(mid).fillCircle(14, 17, 10).fillCircle(22, 22, 6).fillCircle(9, 24, 5);
      g.fillStyle(light).fillCircle(11, 13, 5).fillCircle(18, 11, 3).fillCircle(7, 21, 2);
    });
  tree(`${theme}-tree-0`, shade(T.tree, -0.3), T.tree, shade(T.tree, 0.5));
  tree(`${theme}-tree-1`, shade(T.treeAlt, -0.3), T.treeAlt, shade(T.treeAlt, 0.5));

  texture('boulder', TILE, TILE, () => {
    shadow(16, 27, 28, 8);
    g.fillStyle(OUTLINE).fillEllipse(16, 18, 28, 22);
    g.fillStyle(0x7d746d).fillEllipse(16, 18, 26, 20);
    g.fillStyle(0xa39a92).fillEllipse(13, 15, 18, 12);
    g.fillStyle(0xd6cfc8).fillEllipse(10, 12, 7, 4);
    g.lineStyle(1, 0x4a423c).lineBetween(18, 16, 22, 20).lineBetween(22, 20, 21, 25);
  });

  texture('sign', TILE, TILE, () => {
    shadow(16, 29, 18, 5);
    parts([
      { x: 14, y: 16, w: 4, h: 13, color: 0x7a4e2d },
      { x: 4, y: 4, w: 24, h: 14, r: 3, color: 0xc08552 },
    ]);
    g.fillStyle(0xe0a96d).fillRect(5, 5, 22, 2);
    g.fillStyle(0x5c3a1a).fillRect(8, 9, 16, 2).fillRect(8, 13, 11, 2);
  });

  // Maison du savoir, vue de trois quarts : façade éclairée, pignon et mur droit dans l'ombre, toit à
  // deux pans, ombre portée vers la droite. La façade (88 px) tient sur les 3 cases de la maison ;
  // le côté, la profondeur et le toit débordent sur la marge laissée libre autour.
  texture('house', HOUSE_TEX.w, HOUSE_TEX.h, () => {
    const poly = (color: number, pts: [number, number][], line = true) => {
      const p = pts.map(([x, y]) => ({ x, y }));
      g.fillStyle(color).fillPoints(p, true);
      if (line) g.lineStyle(2, OUTLINE).strokePoints(p, true);
    };
    const wall = 0xf1e3c4;
    const wallShade = 0xc9b48c;
    const roof = 0xc0392b;
    const roofLight = 0xe55039;
    const roofDark = 0x7f2418;
    const wood = 0x7a4e2d;
    // Ombre portée au sol, vers la droite et derrière.
    g.fillStyle(0x000000, 0.22).fillPoints([{ x: 96, y: 118 }, { x: 118, y: 100 }, { x: 134, y: 104 }, { x: 134, y: 114 }, { x: 116, y: 122 }], true);
    shadow(54, 118, 100, 9, 0.28);
    // Mur de côté (profondeur), dans l'ombre, et son pignon.
    poly(wallShade, [[96, 64], [116, 48], [116, 100], [96, 116]]);
    poly(shade(wallShade, -0.08), [[96, 64], [116, 48], [106, 28]]);
    g.fillStyle(shade(wood, -0.2)).fillPoints([{ x: 96, y: 86 }, { x: 116, y: 70 }, { x: 116, y: 73 }, { x: 96, y: 89 }], true);
    // Petite lucarne sur le côté.
    poly(0xd9a441, [[102, 80], [110, 74], [110, 84], [102, 90]]);
    // Façade.
    poly(wall, [[8, 64], [96, 64], [96, 116], [8, 116]]);
    g.fillStyle(0xd9c59c).fillRect(9, 65, 86, 6);
    g.fillStyle(0xe7d5ae).fillRect(9, 108, 86, 7);
    g.fillStyle(wood).fillRect(9, 86, 86, 3).fillRect(9, 65, 3, 50).fillRect(92, 65, 3, 50);
    // Toit : tranche du pan arrière au-dessus du pignon, puis pan avant.
    poly(roofDark, [[106, 25], [122, 46], [118, 50], [106, 32]]);
    poly(roof, [[2, 70], [100, 70], [106, 26], [16, 26]]);
    g.fillStyle(roofLight).fillPoints([{ x: 16, y: 28 }, { x: 105, y: 28 }, { x: 104, y: 38 }, { x: 13, y: 38 }], true);
    g.lineStyle(1, roofDark, 0.8);
    for (const t of [0.35, 0.55, 0.75]) {
      const y = 26 + 44 * t;
      g.lineBetween(16 - 14 * t, y, 106 - 6 * t, y);
    }
    // Faîtage et bord du toit, qui jette une ombre sur le haut des murs.
    g.fillStyle(shade(roofLight, 0.2)).fillRect(16, 25, 90, 3);
    g.fillStyle(roofDark).fillRect(2, 69, 98, 4);
    g.fillStyle(0x000000, 0.18).fillRect(9, 73, 86, 5);
    g.fillStyle(0x000000, 0.18).fillPoints([{ x: 96, y: 66 }, { x: 116, y: 50 }, { x: 116, y: 56 }, { x: 96, y: 72 }], true);
    // Cheminée en volume.
    poly(0x8a5a44, [[74, 8], [84, 8], [84, 34], [74, 38]]);
    poly(0x6b4433, [[84, 8], [90, 4], [90, 30], [84, 34]]);
    poly(0x9c6a52, [[72, 6], [82, 6], [88, 2], [78, 2]]);
    // Fenêtres en retrait : embrasure sombre en haut et à gauche, appui en saillie.
    for (const wx of [18, 70]) {
      poly(0xffe08a, [[wx, 90], [wx + 16, 90], [wx + 16, 104], [wx, 104]]);
      g.fillStyle(0xb8860b).fillRect(wx + 1, 91, 15, 2).fillRect(wx + 1, 91, 2, 13);
      g.fillStyle(wood).fillRect(wx + 7, 91, 2, 13).fillRect(wx + 1, 96, 15, 2);
      g.fillStyle(wood).fillRect(wx - 2, 104, 20, 3);
      g.fillStyle(shade(wood, -0.3)).fillRect(wx - 2, 107, 20, 1);
    }
    // Porte en retrait sous son linteau, et marche de pierre en volume.
    poly(shade(wood, -0.35), [[41, 90], [63, 90], [63, 116], [41, 116]]);
    poly(0x8b5a2b, [[44, 93], [63, 93], [63, 116], [44, 116]], false);
    g.fillStyle(0x6d4422).fillRect(53, 94, 2, 22);
    g.fillStyle(0xfab005).fillCircle(59, 106, 2);
    g.fillStyle(wood).fillRect(38, 87, 28, 4);
    poly(0xb0a395, [[36, 116], [68, 116], [68, 120], [36, 120]]);
    poly(0x8f8478, [[68, 116], [72, 113], [72, 117], [68, 120]], false);
    // Livre ouvert au-dessus de la porte, sur le pan du toit.
    poly(0xfff8e1, [[38, 44], [66, 44], [66, 60], [38, 60]]);
    g.fillStyle(0x1c7ed6).fillRect(51, 44, 2, 16);
    g.fillStyle(0x868e96).fillRect(41, 48, 8, 1).fillRect(41, 52, 8, 1).fillRect(41, 56, 6, 1);
    g.fillStyle(0x868e96).fillRect(55, 48, 8, 1).fillRect(55, 52, 8, 1).fillRect(55, 56, 6, 1);
    g.fillStyle(0x000000, 0.2).fillRect(39, 60, 28, 2);
  });

  // Personnage : face, dos et profil ; respiration (bob) et marche (jambes et bras qui alternent).
  const hero = (key: string, facing: Facing, step: number, bob: number) =>
    texture(key, 24, 32, () => {
      shadow(12, 30, 16, 5);
      const skin = 0xffd8a8;
      const jacket = 0x1c7ed6;
      const pants = 0x2b3a67;
      const cap = 0xe8590c;
      const b = bob;
      if (facing === 'side') {
        parts([
          { x: 9 - step, y: 22, w: 3, h: 6, color: pants },
          { x: 12 + step, y: 22, w: 3, h: 6, color: pants },
          { x: 8 - step, y: 27, w: 5, h: 3, r: 1, color: 0x343a40 },
          { x: 12 + step, y: 27, w: 5, h: 3, r: 1, color: 0x343a40 },
          { x: 4, y: 15 + b, w: 5, h: 7, r: 2, color: 0xfab005 },
          { x: 8, y: 14 + b, w: 9, h: 9, r: 3, color: jacket },
          { x: 7, y: 3 + b, w: 11, h: 11, r: 5, color: skin },
          { x: 6, y: 1 + b, w: 12, h: 5, r: 3, color: cap },
          { x: 14, y: 5 + b, w: 6, h: 2, r: 1, color: 0xc2410c },
          { x: 11 + step, y: 15 + b, w: 3, h: 7, r: 1, color: jacket },
        ]);
        g.fillStyle(0x5c3a1a).fillRect(7, 6 + b, 3, 5);
        g.fillStyle(0x212529).fillRect(15, 8 + b, 2, 3);
        g.fillStyle(0xffffff).fillRect(15, 8 + b, 1, 1);
        g.fillStyle(skin).fillRect(11 + step, 21 + b, 3, 2);
        g.fillStyle(0x5c3a1a).fillRect(8, 21 + b, 9, 2);
        g.fillStyle(0xffffff).fillRect(10, 2 + b, 2, 2);
        return;
      }
      const lift = (side: number) => (step === side ? 2 : 0);
      parts([
        { x: 8, y: 22, w: 3, h: 6 - lift(-1), color: pants },
        { x: 13, y: 22, w: 3, h: 6 - lift(1), color: pants },
        { x: 7, y: 27 - lift(-1), w: 4, h: 3, r: 1, color: 0x343a40 },
        { x: 13, y: 27 - lift(1), w: 4, h: 3, r: 1, color: 0x343a40 },
        { x: 4, y: 15 + b + step, w: 3, h: 7, r: 1, color: jacket },
        { x: 17, y: 15 + b - step, w: 3, h: 7, r: 1, color: jacket },
        { x: 6, y: 14 + b, w: 12, h: 9, r: 3, color: jacket },
        { x: 6, y: 3 + b, w: 12, h: 11, r: 5, color: skin },
        { x: 5, y: 1 + b, w: 14, h: 5, r: 3, color: cap },
      ]);
      g.fillStyle(skin).fillRect(4, 21 + b + step, 3, 2).fillRect(17, 21 + b - step, 3, 2);
      g.fillStyle(0x5c3a1a).fillRect(6, 21 + b, 12, 2);
      if (facing === 'down') {
        g.fillStyle(0xc2410c).fillRect(6, 5 + b, 12, 2);
        g.fillStyle(0xffffff).fillRect(11, 2 + b, 2, 2);
        g.fillStyle(0x5c3a1a).fillRect(6, 7 + b, 2, 4).fillRect(16, 7 + b, 2, 4);
        g.fillStyle(0x212529).fillRect(9, 8 + b, 2, 3).fillRect(13, 8 + b, 2, 3);
        g.fillStyle(0xffffff).fillRect(9, 8 + b, 1, 1).fillRect(13, 8 + b, 1, 1);
        g.fillStyle(0xe8a87c).fillRect(11, 11 + b, 2, 1);
        g.fillStyle(0xf8f9fa).fillRect(9, 14 + b, 6, 2);
        g.fillStyle(0xfab005).fillRect(7, 14 + b, 1, 7).fillRect(16, 14 + b, 1, 7).fillRect(11, 21 + b, 2, 2);
      } else {
        g.fillStyle(0x5c3a1a).fillRect(7, 6 + b, 10, 7);
        g.fillStyle(OUTLINE).fillRoundedRect(6, 14 + b, 12, 9, 3);
        g.fillStyle(0xfab005).fillRoundedRect(7, 15 + b, 10, 7, 2);
        g.fillStyle(0xe67700).fillRect(9, 18 + b, 6, 3);
      }
    });
  for (const facing of FACINGS) {
    hero(`hero-${facing}-idle-0`, facing, 0, 0);
    hero(`hero-${facing}-idle-1`, facing, 0, 1);
    [-1, 0, 1, 0].forEach((step, i) => hero(`hero-${facing}-walk-${i}`, facing, step, i % 2));
  }

  [0, 1].forEach((frame) =>
    texture(`guide-${frame}`, 24, 32, () => {
      shadow(12, 30, 18, 5);
      g.fillStyle(OUTLINE).fillTriangle(12, 9 + frame, 2, 29, 22, 29);
      g.fillStyle(0x2b8a3e).fillTriangle(12, 10 + frame, 3, 28, 21, 28);
      g.fillStyle(0x40c057).fillTriangle(12, 12 + frame, 8, 28, 12, 28);
      g.fillStyle(0xfab005).fillRect(7, 20, 10, 2);
      parts([{ x: 6, y: 3 + frame, w: 12, h: 11, r: 5, color: 0xffd8a8 }]);
      g.fillStyle(0xf1f3f5).fillCircle(12, 3 + frame, 5).fillRect(6, 4 + frame, 2, 6).fillRect(16, 4 + frame, 2, 6);
      g.fillStyle(0x212529).fillRect(9, 8 + frame, 2, 2).fillRect(13, 8 + frame, 2, 2);
      // Le bâton se lève et s'abaisse, son orbe brille.
      parts([{ x: 19, y: 7 - frame * 2, w: 2, h: 21 + frame * 2, color: 0x8b5a2b }]);
      g.fillStyle(0x74c0fc).fillCircle(20, 5 - frame * 2, 3);
      g.fillStyle(0xe7f5ff).fillCircle(19, 4 - frame * 2, 1);
    }),
  );

  [0, 1].forEach((frame) =>
    texture(`${theme}-boss-${frame}`, 56, 64, () => {
      shadow(28, 60, 46, 10, 0.35);
      parts([
        { x: 2, y: 22 - frame * 2, w: 10, h: 24, r: 5, color: 0x495057 },
        { x: 44, y: 22 - frame * 2, w: 10, h: 24, r: 5, color: 0x495057 },
        { x: 14, y: 46, w: 10, h: 12, r: 3, color: 0x343a40 },
        { x: 32, y: 46, w: 10, h: 12, r: 3, color: 0x343a40 },
        { x: 10, y: 16, w: 36, h: 34, r: 9, color: 0x5c636a },
        { x: 16, y: 2, w: 24, h: 18, r: 6, color: 0x3d4247 },
      ]);
      g.fillStyle(0x868e96).fillRoundedRect(13, 19, 14, 8, 4);
      g.fillStyle(frame ? 0xffa8a8 : 0xff6b6b).fillCircle(23, 11, frame ? 3.5 : 3).fillCircle(33, 11, frame ? 3.5 : 3);
      g.fillStyle(0xffffff).fillCircle(22, 10, 1).fillCircle(32, 10, 1);
      // Fissures lumineuses et arc gravé sur le torse.
      g.lineStyle(3, frame ? shade(T.bossGlow, 0.4) : T.bossGlow);
      g.beginPath();
      g.arc(28, 28, 11, 0.25, Math.PI - 0.25);
      g.strokePath();
      g.lineStyle(2, T.bossGlow, 0.9).lineBetween(14, 40, 19, 44).lineBetween(42, 38, 37, 45);
    }),
  );

  // Bulle « ! » au-dessus de la gardienne.
  texture('bubble', 16, 20, () => {
    g.fillStyle(OUTLINE).fillRoundedRect(0, 0, 16, 16, 5).fillTriangle(5, 15, 11, 15, 8, 20);
    g.fillStyle(0xffffff).fillRoundedRect(1, 1, 14, 14, 4).fillTriangle(6, 14, 10, 14, 8, 18);
    g.fillStyle(0xe8590c).fillRect(7, 3, 2, 7).fillRect(7, 12, 2, 2);
  });

  // Particules.
  texture(`${theme}-particle`, 6, 6, () => {
    g.fillStyle(T.particle).fillCircle(3, 3, 3);
  });
  texture('smoke', 16, 16, () => {
    g.fillStyle(0x868e96, 0.6).fillCircle(8, 8, 8);
  });
  texture(`${theme}-leaf`, 4, 4, () => {
    g.fillStyle(shade(T.bush, 0.35)).fillRect(0, 0, 4, 4);
  });
  texture('dust', 6, 6, () => {
    g.fillStyle(0xe9dcc5, 0.85).fillCircle(3, 3, 3);
  });
  texture('spark', 8, 8, () => {
    g.fillStyle(0xfff3bf).fillCircle(4, 4, 4);
  });

  g.destroy();
}
