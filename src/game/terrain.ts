import type Phaser from 'phaser';
import { BLOCKING, MAP_H, MAP_W, TILE, Tile } from './map';

const BLOCKS = (t: Tile) => BLOCKING.has(t);
import { type Theme, shade } from './themes';

/**
 * Peint le décor fixe de la carte dans une seule texture : sol, chemins, falaises en relief,
 * fosses de lave, ponts, cratère, plateaux avec leurs escaliers et corniches. Les angles exposés
 * sont arrondis et chaque élément a ses ombres et ses reflets, pour donner du volume.
 */
export function paintTerrain(scene: Phaser.Scene, tiles: Tile[][], T: Theme, raised?: boolean[][]): Phaser.GameObjects.RenderTexture {
  const g = scene.make.graphics({}, false);
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H ? Tile.Rock : tiles[y][x]);
  const isLavaLike = (t: Tile) => t === Tile.Lava || t === Tile.Bridge;
  const isRock = (t: Tile) => t === Tile.Rock;
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const each = (type: Tile | ((t: Tile) => boolean), draw: (x: number, y: number, px: number, py: number) => void) => {
    const match = typeof type === 'function' ? type : (t: Tile) => t === type;
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (match(at(x, y))) draw(x, y, x * TILE, y * TILE);
  };

  /** Rayons d'angle : arrondi là où les deux côtés de l'angle donnent sur autre chose. */
  const corners = (x: number, y: number, same: (t: Tile) => boolean, r: number) => ({
    tl: !same(at(x, y - 1)) && !same(at(x - 1, y)) ? r : 0,
    tr: !same(at(x, y - 1)) && !same(at(x + 1, y)) ? r : 0,
    bl: !same(at(x, y + 1)) && !same(at(x - 1, y)) ? r : 0,
    br: !same(at(x, y + 1)) && !same(at(x + 1, y)) ? r : 0,
  });

  /**
   * Une case d'une zone (chemin, lave, falaise…) : bordure sombre seulement sur les côtés
   * exposés, pour que les cases voisines se fondent sans quadrillage.
   */
  const solid = (x: number, y: number, same: (t: Tile) => boolean, edge: number, base: number, r: number, border = 2) => {
    const px = x * TILE;
    const py = y * TILE;
    const c = corners(x, y, same, r);
    const l = same(at(x - 1, y)) ? 0 : border;
    const rr = same(at(x + 1, y)) ? 0 : border;
    const t = same(at(x, y - 1)) ? 0 : border;
    const b = same(at(x, y + 1)) ? 0 : border;
    g.fillStyle(edge).fillRoundedRect(px, py, TILE, TILE, c);
    const shrink = (v: number) => Math.max(0, v - border);
    g.fillStyle(base).fillRoundedRect(px + l, py + t, TILE - l - rr, TILE - t - b, {
      tl: shrink(c.tl),
      tr: shrink(c.tr),
      bl: shrink(c.bl),
      br: shrink(c.br),
    });
    return { c, l, rr, t, b };
  };

  // 1. Sol : taches de lumière et touffes d'herbe rase.
  g.fillStyle(T.ground).fillRect(0, 0, MAP_W * TILE, MAP_H * TILE);
  each(
    (t) => t !== Tile.Rock,
    (_x, _y, px, py) => {
      if (rand() < 0.3) g.fillStyle(rand() < 0.5 ? shade(T.ground, 0.1) : shade(T.ground, -0.1), 0.6).fillCircle(px + rand() * TILE, py + rand() * TILE, 10 + rand() * 8);
    },
  );
  each(
    (t) => t === Tile.Ground || t === Tile.Grass || t === Tile.Flowers || t === Tile.Ledge,
    (_x, _y, px, py) => {
      g.lineStyle(1, shade(T.ground, 0.3), 0.9);
      for (let i = 0; i < 2; i++) {
        const tx = px + 4 + rand() * 22;
        const ty = py + 6 + rand() * 20;
        g.lineBetween(tx, ty, tx - 2, ty - 3).lineBetween(tx + 2, ty, tx + 2, ty - 4).lineBetween(tx + 4, ty, tx + 6, ty - 3);
      }
    },
  );

  // Plateaux : le sol en hauteur reçoit plus de lumière.
  if (raised)
    each(
      () => true,
      (x, y, px, py) => {
        if (raised[y][x]) g.fillStyle(0xffffff, 0.09).fillRect(px, py, TILE, TILE);
      },
    );

  // 2. Sol assombri et lueur autour du liquide et de l'arène.
  each(
    (t) => t === Tile.Lava || t === Tile.Crater,
    (_x, _y, px, py) => {
      g.fillStyle(shade(T.liquidDeep, 0.2), 0.16).fillCircle(px + 16, py + 16, 44);
      g.fillStyle(T.glow, 0.1).fillCircle(px + 16, py + 16, 28);
    },
  );

  // 3. Chemins de terre battue, bords arrondis, cailloux.
  const isPath = (t: Tile) => t === Tile.Path;
  each(Tile.Path, (x, y, px, py) => {
    solid(x, y, isPath, shade(T.path, -0.25), T.path, 12);
    for (let i = 0; i < 3; i++) g.fillStyle(rand() < 0.5 ? shade(T.path, -0.12) : shade(T.path, 0.25)).fillRect(px + 4 + rand() * 24, py + 4 + rand() * 24, 2, 2);
  });

  // 4. Fleurs et cailloux.
  const petals = T.petals;
  each(Tile.Flowers, (_x, _y, px, py) => {
    for (let i = 0; i < 3; i++) {
      const fx = px + 6 + rand() * 20;
      const fy = py + 6 + rand() * 20;
      if (rand() < 0.35) {
        g.fillStyle(0x5c5248).fillEllipse(fx, fy + 1, 7, 4);
        g.fillStyle(0xa39a8f).fillEllipse(fx, fy, 6, 4);
      } else {
        g.fillStyle(0x2f6b2f).fillRect(fx, fy + 2, 1, 3);
        g.fillStyle(petals[Math.floor(rand() * petals.length)]);
        g.fillCircle(fx - 2, fy, 2).fillCircle(fx + 2, fy, 2).fillCircle(fx, fy - 2, 2).fillCircle(fx, fy + 2, 2);
        g.fillStyle(0xfab005).fillCircle(fx, fy, 1.2);
      }
    }
  });

  // 5. Arène du gardien : sol sombre, fissures lumineuses.
  const isCrater = (t: Tile) => t === Tile.Crater;
  each(Tile.Crater, (x, y, px, py) => {
    solid(x, y, isCrater, shade(T.arena, -0.4), T.arena, 12);
    g.lineStyle(2, T.glow, 0.8);
    const sx = px + 4 + rand() * 18;
    const sy = py + 4 + rand() * 18;
    g.lineBetween(sx, sy, sx + 6, sy + 5).lineBetween(sx + 6, sy + 5, sx + 4, sy + 11);
    g.fillStyle(shade(T.arena, 0.2)).fillRect(px + rand() * 26, py + rand() * 26, 4, 3);
  });

  // 6. Fosses de liquide : creusées dans le sol, paroi sombre au fond, rebord éclairé devant.
  each(isLavaLike, (x, y, px, py) => {
    const { c } = solid(x, y, isLavaLike, shade(T.liquidDeep, -0.3), T.liquid, 14);
    if (!isLavaLike(at(x, y - 1))) {
      // Paroi intérieure du fond de la fosse, vue en perspective.
      g.fillStyle(T.liquidDeep).fillRoundedRect(px, py, TILE, 10, { tl: c.tl ? 10 : 0, tr: c.tr ? 10 : 0, bl: 0, br: 0 });
      g.fillStyle(shade(T.liquid, -0.4)).fillRect(px + (c.tl ? 7 : 0), py + 10, TILE - (c.tl ? 7 : 0) - (c.tr ? 7 : 0), 3);
    }
    if (!isLavaLike(at(x, y + 1)))
      g.fillStyle(shade(T.liquidLight, 0.4), 0.75).fillRect(px + (c.bl ? 11 : 0), py + TILE - 3, TILE - (c.bl ? 11 : 0) - (c.br ? 11 : 0), 2);
    if (rand() < 0.5) g.fillStyle(shade(T.liquid, 0.12)).fillEllipse(px + 8 + rand() * 16, py + 14 + rand() * 12, 12, 4);
  });

  // 7. Ponts de bois, avec garde-corps et ombre portée sur le liquide.
  each(Tile.Bridge, (x, y, px, py) => {
    // Un pont dont une extrémité (en haut ou en bas) donne sur la lave se traverse d'ouest en est.
    const end = (dy: number) => {
      let cy = y;
      while (at(x, cy) === Tile.Bridge) cy += dy;
      return at(x, cy);
    };
    const vertical = end(-1) !== Tile.Lava && end(1) !== Tile.Lava;
    g.lineStyle(1, 0x5c3a1a);
    if (vertical) {
      g.fillStyle(0x000000, 0.3).fillRect(px + 3, py, TILE - 3, TILE);
      g.fillStyle(0xa8743f).fillRect(px, py, TILE, TILE - 3);
      for (let k = 0; k <= TILE; k += 8) {
        g.lineBetween(px, py + k, px + TILE, py + k);
        g.fillStyle(0xc99260).fillRect(px, py + k + 1, TILE, 1);
      }
      if (at(x - 1, y) !== Tile.Bridge) g.fillStyle(0x5c3a1a).fillRect(px, py, 5, TILE).fillStyle(0xd19a63).fillRect(px + 1, py, 2, TILE);
      if (at(x + 1, y) !== Tile.Bridge) g.fillStyle(0x5c3a1a).fillRect(px + TILE - 5, py, 5, TILE).fillStyle(0xd19a63).fillRect(px + TILE - 4, py, 2, TILE);
    } else {
      g.fillStyle(0x000000, 0.3).fillRect(px, py + 5, TILE, TILE - 3);
      g.fillStyle(0xa8743f).fillRect(px, py + 2, TILE, TILE - 5);
      for (let k = 0; k <= TILE; k += 8) {
        g.lineBetween(px + k, py + 2, px + k, py + TILE - 3);
        g.fillStyle(0xc99260).fillRect(px + k + 1, py + 2, 1, TILE - 5);
      }
      if (at(x, y - 1) !== Tile.Bridge) g.fillStyle(0x5c3a1a).fillRect(px, py, TILE, 5).fillStyle(0xd19a63).fillRect(px, py + 1, TILE, 2);
      if (at(x, y + 1) !== Tile.Bridge) g.fillStyle(0x5c3a1a).fillRect(px, py + TILE - 6, TILE, 5).fillStyle(0xd19a63).fillRect(px, py + TILE - 5, TILE, 2);
    }
  });

  // 8. Ombres portées des falaises et des corniches sur le sol (lumière venant du nord-ouest).
  each(
    (t) => !isRock(t),
    (x, y, px, py) => {
      if (isRock(at(x, y - 1)) || at(x, y - 1) === Tile.Ledge) g.fillStyle(0x1b1412, 0.3).fillRect(px, py, TILE, 8);
      if (isRock(at(x - 1, y))) g.fillStyle(0x1b1412, 0.22).fillRect(px, py, 7, TILE);
    },
  );

  // 9. Falaises : dessus clair aux plaques de roche, paroi striée au sud, flancs ombrés.
  each(Tile.Rock, (x, y, px, py) => {
    const faceSouth = !isRock(at(x, y + 1));
    const { c } = solid(x, y, isRock, shade(T.rock, -0.55), T.rock, 12);
    // Plaques de roche sur le dessus, éclairées en haut à gauche.
    for (let i = 0; i < 3; i++) {
      const rx = px + 2 + rand() * 20;
      const ry = py + 2 + rand() * (faceSouth ? 6 : 20);
      const w = 8 + rand() * 6;
      g.fillStyle(shade(T.rock, -0.15)).fillRoundedRect(rx + 1, ry + 1, w, 6, 3);
      g.fillStyle(shade(T.rock, 0.15)).fillRoundedRect(rx, ry, w, 5, 3);
    }
    if (!isRock(at(x, y - 1))) g.fillStyle(shade(T.rock, 0.35)).fillRect(px + (c.tl ? 8 : 2), py + 2, TILE - (c.tl ? 8 : 2) - (c.tr ? 8 : 2), 2);
    if (!isRock(at(x + 1, y))) g.fillStyle(shade(T.rock, -0.32)).fillRect(px + TILE - 7, py + (c.tr ? 10 : 0), 5, TILE - (c.tr ? 10 : 0) - (c.br ? 10 : 0));
    if (!isRock(at(x - 1, y))) g.fillStyle(shade(T.rock, 0.2)).fillRect(px + 2, py + (c.tl ? 10 : 0), 3, TILE - (c.tl ? 10 : 0) - (c.bl ? 10 : 0));
    if (faceSouth) {
      // Paroi vue de face : la falaise a de la hauteur.
      const top = py + 12;
      g.fillStyle(shade(T.rock, -0.65)).fillRoundedRect(px, top, TILE, TILE - 12, { tl: 0, tr: 0, bl: c.bl, br: c.br });
      g.fillStyle(shade(T.rock, -0.38)).fillRoundedRect(px + (isRock(at(x - 1, y)) ? 0 : 2), top, TILE - (isRock(at(x - 1, y)) ? 0 : 2) - (isRock(at(x + 1, y)) ? 0 : 2), TILE - 15, {
        tl: 0,
        tr: 0,
        bl: Math.max(0, c.bl - 2),
        br: Math.max(0, c.br - 2),
      });
      g.fillStyle(shade(T.rock, -0.22)).fillRect(px, top, TILE, 2);
      g.lineStyle(2, shade(T.rock, -0.55));
      for (let k = 5; k < TILE; k += 8) g.lineBetween(px + k, top + 4, px + k - 1, py + TILE - 5);
      g.lineStyle(1, shade(T.rock, -0.15));
      for (let k = 8; k < TILE; k += 8) g.lineBetween(px + k, top + 4, px + k, top + 10);
    }
  });

  // 10. Escaliers taillés dans la falaise : marches éclairées sur le dessus, contremarches sombres.
  const isStairs = (t: Tile) => t === Tile.Stairs;
  each(Tile.Stairs, (x, y, px, py) => {
    // Un escalier entre deux cases à gauche et à droite se monte d'est en ouest : marches verticales.
    const sideways = !BLOCKS(at(x - 1, y)) && !BLOCKS(at(x + 1, y)) && (BLOCKS(at(x, y - 1)) || BLOCKS(at(x, y + 1)));
    solid(x, y, isStairs, shade(T.rock, -0.55), shade(T.rock, -0.1), 4);
    for (let k = 0; k < 4; k++) {
      if (sideways) {
        g.fillStyle(shade(T.rock, 0.3)).fillRect(px + 2 + k * 8, py + 2, 5, TILE - 4);
        g.fillStyle(shade(T.rock, -0.4)).fillRect(px + 7 + k * 8, py + 2, 2, TILE - 4);
      } else {
        g.fillStyle(shade(T.rock, 0.3)).fillRect(px + 2, py + 2 + k * 8, TILE - 4, 5);
        g.fillStyle(shade(T.rock, -0.4)).fillRect(px + 2, py + 7 + k * 8, TILE - 4, 2);
      }
    }
  });

  // 11. Corniches : rebord de terre au bas de la case, d'où l'on saute vers le sud.
  const isLedge = (t: Tile) => t === Tile.Ledge;
  each(Tile.Ledge, (x, y, px, py) => {
    const l = isLedge(at(x - 1, y)) ? 0 : 4;
    const r = isLedge(at(x + 1, y)) ? 0 : 4;
    const radius = { tl: l ? 4 : 0, tr: r ? 4 : 0, bl: l ? 4 : 0, br: r ? 4 : 0 };
    g.fillStyle(shade(T.rock, -0.6)).fillRoundedRect(px + l, py + 16, TILE - l - r, 14, radius);
    g.fillStyle(shade(T.rock, -0.25)).fillRoundedRect(px + l, py + 16, TILE - l - r, 9, radius);
    g.fillStyle(shade(T.ground, 0.35)).fillRect(px + l + (l ? 2 : 0), py + 15, TILE - l - r - (l ? 2 : 0) - (r ? 2 : 0), 2);
    // Petite flèche gravée : on descend par ici.
    g.fillStyle(shade(T.rock, 0.25), 0.8).fillTriangle(px + 12, py + 19, px + 20, py + 19, px + 16, py + 23);
  });

  const rt = scene.add.renderTexture(0, 0, MAP_W * TILE, MAP_H * TILE).setOrigin(0);
  rt.draw(g);
  g.destroy();
  return rt;
}
