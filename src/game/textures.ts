import type Phaser from 'phaser';
import { TILE } from './map';

/**
 * Dessine toutes les textures du jeu avec le code : aucun fichier d'image n'est nécessaire.
 * Les éléments animés ont plusieurs images (frames) : herbe-0, herbe-1…
 */
export function makeTextures(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const speckle = (seed: number, color: number, count: number, size: number) => {
    let s = seed;
    for (let i = 0; i < count; i++) {
      s = (s * 9301 + 49297) % 233280;
      const x = (s / 233280) * TILE;
      s = (s * 9301 + 49297) % 233280;
      const y = (s / 233280) * TILE;
      g.fillStyle(color, 1).fillRect(Math.floor(x), Math.floor(y), size, size);
    }
  };
  const texture = (key: string, w: number, h: number, draw: () => void) => {
    g.clear();
    draw();
    g.generateTexture(key, w, h);
  };
  const tile = (key: string, draw: () => void) => texture(key, TILE, TILE, draw);

  tile('ground', () => {
    g.fillStyle(0x5b4a43).fillRect(0, 0, TILE, TILE);
    speckle(1, 0x6d5a52, 10, 2);
    speckle(2, 0x4a3c36, 6, 2);
  });

  // Herbe : trois positions des brins, jouées en boucle pour qu'elle ondule.
  [0, 2, -2].forEach((lean, frame) =>
    tile(`grass-${frame}`, () => {
      g.fillStyle(0x5c7f2e).fillRect(0, 0, TILE, TILE);
      speckle(3, 0x3f5b1f, 6, 2);
      g.lineStyle(2, 0x86a83f);
      for (let i = 0; i < 6; i++) {
        const x = 3 + i * 5;
        g.lineBetween(x, 28, x + 2 + lean, 14 + (i % 3) * 3);
      }
    }),
  );

  tile('rock', () => {
    g.fillStyle(0x5b4a43).fillRect(0, 0, TILE, TILE);
    g.fillStyle(0x2f2826).fillRoundedRect(2, 4, 28, 26, 8);
    g.fillStyle(0x4a403c).fillRoundedRect(6, 6, 16, 10, 5);
  });

  // Lave : des bulles qui gonflent et éclatent.
  const bubbles = [
    [9, 10, 5, 24, 22, 6],
    [10, 9, 6, 23, 23, 4],
    [8, 11, 3, 24, 21, 7],
  ];
  bubbles.forEach(([x1, y1, r1, x2, y2, r2], frame) =>
    tile(`lava-${frame}`, () => {
      g.fillStyle(0xd9480f).fillRect(0, 0, TILE, TILE);
      g.fillStyle(frame === 1 ? 0xe8590c : 0xc2410c).fillRect(0, 14 + frame * 2, TILE, 3);
      g.fillStyle(0xff922b).fillCircle(x1, y1, r1).fillCircle(x2, y2, r2);
      g.fillStyle(0xffd43b).fillCircle(x1, y1, r1 / 2.5).fillCircle(x2, y2, r2 / 2.5);
    }),
  );

  tile('path', () => {
    g.fillStyle(0x9c8466).fillRect(0, 0, TILE, TILE);
    speckle(4, 0xb39b7a, 8, 2);
    speckle(5, 0x7f6a51, 6, 2);
  });
  tile('crater', () => {
    g.fillStyle(0x7a3b2e).fillRect(0, 0, TILE, TILE);
    speckle(6, 0xa34a32, 8, 3);
  });
  tile('bridge', () => {
    g.fillStyle(0xd9480f).fillRect(0, 0, TILE, TILE);
    g.fillStyle(0x8b5a2b).fillRect(0, 2, TILE, 28);
    g.lineStyle(2, 0x5c3a1a);
    for (let x = 0; x <= TILE; x += 8) g.lineBetween(x, 2, x, 30);
  });

  // Personnage : 2 images de respiration, 4 images de marche (jambes et bras qui alternent).
  const hero = (key: string, legL: number, legR: number, bob: number) =>
    texture(key, 24, 30, () => {
      g.fillStyle(0x000000, 0.25).fillEllipse(12, 27, 18, 6);
      g.fillStyle(0x343a40).fillRect(7, 22 - legL, 4, 5 + legL).fillRect(13, 22 - legR, 4, 5 + legR);
      g.fillStyle(0x1c7ed6).fillRoundedRect(5, 12 + bob, 14, 12, 4);
      g.fillStyle(0xffd8a8).fillCircle(12, 8 + bob, 6);
      g.fillStyle(0x5c3a1a).fillRect(6, 1 + bob, 12, 4);
      g.fillStyle(0x212529).fillRect(13, 7 + bob, 2, 2);
      g.fillStyle(0xfab005).fillRect(4, 14 + bob, 3, 8);
    });
  hero('hero-idle-0', 0, 0, 0);
  hero('hero-idle-1', 0, 0, 1);
  hero('hero-walk-0', 2, 0, 0);
  hero('hero-walk-1', 0, 0, 1);
  hero('hero-walk-2', 0, 2, 0);
  hero('hero-walk-3', 0, 0, 1);

  [0, 1].forEach((frame) =>
    texture(`guide-${frame}`, 24, 30, () => {
      g.fillStyle(0x000000, 0.25).fillEllipse(12, 27, 18, 6);
      g.fillStyle(0x2b8a3e).fillTriangle(12, 8 + frame, 3, 27, 21, 27);
      g.fillStyle(0xffd8a8).fillCircle(12, 8 + frame, 6);
      g.fillStyle(0xf8f9fa).fillRect(6, 1 + frame, 12, 4);
      // Le bâton se lève et s'abaisse.
      g.fillStyle(0x8b5a2b).fillRect(20, 6 - frame * 2, 2, 21 + frame * 2);
      g.fillStyle(0x74c0fc).fillCircle(21, 5 - frame * 2, 3);
    }),
  );

  [0, 1].forEach((frame) =>
    texture(`boss-${frame}`, 48, 58, () => {
      g.fillStyle(0x000000, 0.3).fillEllipse(24, 54, 40, 10);
      g.fillStyle(0x495057).fillRoundedRect(8, 14, 32, 38, 8);
      g.fillStyle(0x495057).fillRoundedRect(1, 20 - frame * 2, 8, 20, 4).fillRoundedRect(39, 20 - frame * 2, 8, 20, 4);
      g.fillStyle(0x343a40).fillRoundedRect(13, 2, 22, 16, 5);
      g.fillStyle(frame ? 0xffa8a8 : 0xff6b6b).fillCircle(19, 10, frame ? 3 : 2.5).fillCircle(29, 10, frame ? 3 : 2.5);
      g.lineStyle(3, frame ? 0xffc078 : 0xff922b);
      g.beginPath();
      g.arc(24, 22, 10, 0.2, Math.PI - 0.2);
      g.strokePath();
    }),
  );

  // Bulle « ! » au-dessus de la gardienne.
  texture('bubble', 16, 20, () => {
    g.fillStyle(0xffffff).fillRoundedRect(0, 0, 16, 16, 5).fillTriangle(5, 15, 11, 15, 8, 20);
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
    g.fillStyle(0xc9b79c, 0.8).fillCircle(3, 3, 3);
  });
  texture('spark', 8, 8, () => {
    g.fillStyle(0xfff3bf).fillCircle(4, 4, 4);
  });

  g.destroy();
}
