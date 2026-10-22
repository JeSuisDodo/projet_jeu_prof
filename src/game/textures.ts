import type Phaser from 'phaser';
import { TILE } from './map';

/**
 * Dessine toutes les textures des objets avec le code : aucun fichier d'image n'est nécessaire.
 * Le décor fixe (sol, falaises, lave) est peint à part, dans terrain.ts.
 * Les éléments animés ont plusieurs images (frames) : herbe-0, herbe-1…
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

export function makeTextures(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const texture = (key: string, w: number, h: number, draw: () => void) => {
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
    texture(`grass-${frame}`, TILE, 40, () => {
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
        g.lineStyle(2, 0x173d17).strokePoints(pts, true);
        g.fillStyle(color).fillPoints(pts, true);
        g.lineStyle(1, vein).lineBetween(bx, by, (bx + tx * 2) / 3, (by + ty * 2) / 3);
      };
      for (const a of [-75, -45, 45, 75]) leaf(a, 18, 0x2f7d32, 0x51cf66);
      for (const a of [-25, 25]) leaf(a, 22, 0x37913b, 0x69db7c);
      leaf(0, 24, 0x40a047, 0x8ce99a);
      for (const a of [-55, 55]) leaf(a, 13, 0x4cb052, 0x8ce99a);
    }),
  );

  // Lave : bulles et reflets transparents posés sur la fosse peinte dans le décor.
  const bubbleSets = [
    [9, 11, 4, 23, 21, 5],
    [10, 10, 5, 22, 22, 3],
    [8, 12, 2, 24, 20, 6],
  ];
  bubbleSets.forEach(([x1, y1, r1, x2, y2, r2], frame) =>
    texture(`lava-${frame}`, TILE, TILE, () => {
      g.fillStyle(0xffa94d, 0.55).fillRect(2, 14 + frame * 3, 12 + frame * 3, 2);
      g.fillStyle(0xff922b).fillCircle(x1, y1, r1).fillCircle(x2, y2, r2);
      g.fillStyle(0xffd43b).fillCircle(x1 - r1 / 3, y1 - r1 / 3, r1 / 2.5).fillCircle(x2 - r2 / 3, y2 - r2 / 3, r2 / 2.5);
      g.lineStyle(1, 0xb83a0a, 0.8).strokeCircle(x1, y1, r1).strokeCircle(x2, y2, r2);
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
  tree('tree-0', 0x2b6b2f, 0x3f9142, 0x8ce99a);
  tree('tree-1', 0x9c4a14, 0xd9731a, 0xffc078);

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
    texture(`boss-${frame}`, 56, 64, () => {
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
      // Fissures de magma et parabole gravée sur le torse.
      g.lineStyle(3, frame ? 0xffc078 : 0xff922b);
      g.beginPath();
      g.arc(28, 28, 11, 0.25, Math.PI - 0.25);
      g.strokePath();
      g.lineStyle(2, 0xff6b2c, 0.9).lineBetween(14, 40, 19, 44).lineBetween(42, 38, 37, 45);
    }),
  );

  // Bulle « ! » au-dessus de la gardienne.
  texture('bubble', 16, 20, () => {
    g.fillStyle(OUTLINE).fillRoundedRect(0, 0, 16, 16, 5).fillTriangle(5, 15, 11, 15, 8, 20);
    g.fillStyle(0xffffff).fillRoundedRect(1, 1, 14, 14, 4).fillTriangle(6, 14, 10, 14, 8, 18);
    g.fillStyle(0xe8590c).fillRect(7, 3, 2, 7).fillRect(7, 12, 2, 2);
  });

  // Particules.
  texture('ember', 6, 6, () => {
    g.fillStyle(0xffd43b).fillCircle(3, 3, 3);
  });
  texture('smoke', 16, 16, () => {
    g.fillStyle(0x868e96, 0.6).fillCircle(8, 8, 8);
  });
  texture('leaf', 4, 4, () => {
    g.fillStyle(0x94d82d).fillRect(0, 0, 4, 4);
  });
  texture('dust', 6, 6, () => {
    g.fillStyle(0xe9dcc5, 0.85).fillCircle(3, 3, 3);
  });
  texture('spark', 8, 8, () => {
    g.fillStyle(0xfff3bf).fillCircle(4, 4, 4);
  });

  g.destroy();
}
