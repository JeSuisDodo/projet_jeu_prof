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
  /** Case en hauteur, sur un plateau. */
  const up = (x: number, y: number) => raised?.[y]?.[x] === true;
  /** Falaise qui borde un plateau : elle se dessine comme le rebord du plateau, pas comme un rocher. */
  const near = (x: number, y: number, test: (x: number, y: number) => boolean) =>
    [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => (dx || dy) && test(x + dx, y + dy)));
  const ring = (x: number, y: number) => at(x, y) === Tile.Rock && !up(x, y) && near(x, y, up);
  // Seulement là où le rebord se voit : entre le sol du plateau et le sol d'en bas. Collé à une
  // montagne ou à un autre rocher, il reste un rocher ordinaire.
  const rimCache = new Map<number, boolean>();
  const rim = (x: number, y: number) => {
    const k = y * MAP_W + x;
    let v = rimCache.get(k);
    if (v === undefined) {
      const lowFloor = (a: number, b: number) => !isRock(at(a, b)) && !up(a, b);
      const highFloor = (a: number, b: number) => !isRock(at(a, b)) && up(a, b);
      const sides = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dx, dy]) => [x + dx, y + dy]);
      v =
        ring(x, y) &&
        near(x, y, highFloor) &&
        // Un bord exposé, ou un angle du rebord entièrement entouré par le plateau et son rebord.
        (sides.some(([a, b]) => lowFloor(a, b)) || sides.every(([a, b]) => highFloor(a, b) || ring(a, b)));
      rimCache.set(k, v);
    }
    return v;
  };
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

  // Pierres des falaises, dessinées pierre par pierre : un bourrelet de blocs arrondis, clairs en haut,
  // sombres en bas, cernés d'un trait foncé. Les pierres sont alignées sur la grille du monde, donc
  // continues d'une case à l'autre.
  const stone = {
    light: shade(T.rock, 0.22),
    mid: shade(T.rock, -0.1),
    deep: shade(T.rock, -0.35),
    line: shade(T.rock, -0.68),
  };
  // Pierres de tailles variées, calées sur les coordonnées du monde : une même paroi se prolonge
  // d'une case à l'autre sans couture.
  const hash = (n: number) => {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const pieces = (from: number, len: number, seed: number, min: number, span: number) => {
    const out: [number, number][] = [];
    let p = Math.floor(from / 96) * 96;
    let i = p;
    while (p < from + len) {
      const size = min + Math.floor(hash(i * 1.37 + seed) * span);
      const a = Math.max(p, from);
      const b = Math.min(p + size, from + len);
      if (b - a >= 3) out.push([a, b - a]);
      p += size;
      i++;
    }
    return out;
  };
  /** Un caillou arrondi : éclairé en haut à gauche, plus sombre vers le bas. */
  const rock = (x: number, y: number, w: number, h: number, base: number, glow: number) => {
    const r = Math.max(1, Math.min(4, w / 2 - 0.5, h / 2 - 0.5));
    g.fillStyle(base).fillRoundedRect(x, y, w, h, r);
    g.fillStyle(shade(base, -0.28)).fillRoundedRect(x, y + h * 0.6, w, h * 0.4, { tl: 0, tr: 0, bl: r, br: r });
    if (w > 4 && h > 4) g.fillStyle(glow).fillRoundedRect(x + 1, y + 1, Math.max(2, w * 0.55), Math.max(2, h * 0.35), Math.min(2, r));
  };
  /** Bourrelet du dessus : une lèvre de roche épaisse et arrondie, à peine fendue. */
  const ridge = (x0: number, y0: number, w: number, h: number, roundL = false, roundR = false) => {
    const r = { tl: roundL ? 4 : 0, bl: roundL ? 4 : 0, tr: roundR ? 4 : 0, br: roundR ? 4 : 0 };
    g.fillStyle(stone.line).fillRoundedRect(x0, y0, w, h, r);
    g.fillStyle(stone.mid).fillRoundedRect(x0 + (roundL ? 1 : 0), y0 + 1, w - (roundL ? 1 : 0) - (roundR ? 1 : 0), h - 2, {
      tl: roundL ? 3 : 0, bl: roundL ? 3 : 0, tr: roundR ? 3 : 0, br: roundR ? 3 : 0,
    });
    g.fillStyle(stone.light).fillRect(x0 + (roundL ? 3 : 0), y0 + 2, w - (roundL ? 3 : 0) - (roundR ? 3 : 0), Math.max(2, (h - 2) * 0.4));
    g.fillStyle(stone.deep).fillRect(x0 + (roundL ? 2 : 0), y0 + h - 3, w - (roundL ? 2 : 0) - (roundR ? 2 : 0), 2);
    for (const [px] of pieces(x0, w, 7, 9, 9)) {
      if (px <= x0 + 1) continue;
      g.fillStyle(stone.line).fillRect(px, y0 + h * 0.45, 1, h * 0.55 - 1);
    }
  };
  /** Paroi vue de face : deux rangées de rochers décalées, plus sombres au pied. */
  const wall = (x0: number, y0: number, w: number, h: number) => {
    g.fillStyle(stone.line).fillRect(x0, y0, w, h);
    if (h < 12) {
      for (const [px, pw] of pieces(x0, w, 3, 7, 7)) rock(px, y0, pw - 1, h - 1, stone.mid, stone.light);
      return;
    }
    const top = Math.ceil(h * 0.5);
    for (const [px, pw] of pieces(x0, w, 3, 7, 7)) rock(px, y0, pw - 1, top - 1, stone.mid, stone.light);
    for (const [px, pw] of pieces(x0, w, 11, 8, 8)) rock(px, y0 + top, pw - 1, h - top - 1, stone.deep, stone.mid);
  };
  /**
   * Flanc vu de côté : un talus en pente qui descend du rebord vers le sol d'en bas, strié de
   * couches de roche en biais. `outer` est le côté qui donne sur le vide ; l'ouest est éclairé.
   * `top` et `bottom` arrondissent les angles du talus côté vide.
   */
  const slope = (x0: number, y0: number, w: number, h: number, outer: 'W' | 'E', top: number, bottom: number) => {
    const lit = outer === 'W';
    const out = lit ? x0 : x0 + w;
    const inn = lit ? x0 + w : x0;
    const corner = (t: number, b: number) => (lit ? { tl: t, bl: b, tr: 0, br: 0 } : { tr: t, br: b, tl: 0, bl: 0 });
    g.fillStyle(stone.line).fillRoundedRect(x0, y0, w, h, corner(top, bottom));
    g.fillStyle(lit ? stone.mid : stone.deep).fillRoundedRect(lit ? x0 + 1 : x0, y0, w - 1, h, corner(Math.max(0, top - 1), Math.max(0, bottom - 1)));
    // Le haut du talus, près du rebord, prend plus de lumière que le pied.
    const band = Math.round(w * 0.55);
    g.fillStyle(lit ? stone.light : stone.mid).fillRect(lit ? inn - band : inn, y0 + top * 0.7, band, h - top * 0.7 - bottom * 0.7);
    const foot = Math.round(w * 0.22);
    g.fillStyle(lit ? stone.deep : shade(stone.deep, -0.2)).fillRect(lit ? out + 1 : out - foot, y0 + top, foot, h - top - bottom);
    // Couches de roche en biais : elles plongent vers le vide.
    g.lineStyle(2, shade(lit ? stone.mid : stone.deep, -0.4), 0.8);
    for (let k = -w; k < h; k += 6) {
      const ya = y0 + k;
      const yb = ya + w * 0.7;
      // Découpe du segment dans le talus, hors des angles arrondis.
      const t0 = Math.max(0, (y0 + top - ya) / (yb - ya));
      const t1 = Math.min(1, (y0 + h - bottom - 1 - ya) / (yb - ya));
      if (t1 <= t0) continue;
      g.lineBetween(inn + (out - inn) * t0, ya + (yb - ya) * t0, inn + (out - inn) * t1, ya + (yb - ya) * t1);
    }
    // Lèvre du rebord côté plateau, et petits éboulis au pied côté vide.
    g.fillStyle(lit ? shade(stone.light, 0.15) : stone.light).fillRect(lit ? inn - 3 : inn, y0 + (top ? 2 : 0), 3, h - (top ? 2 : 0));
    g.fillStyle(stone.line).fillRect(lit ? inn - 4 : inn + 3, y0 + (top ? 2 : 0), 1, h - (top ? 2 : 0));
    for (const [py, ph] of pieces(y0 + top, h - top - bottom, lit ? 5 : 9, 6, 7)) {
      if (ph < 5) continue;
      const bw = 3 + Math.floor(hash(py * 0.37) * 3);
      rock(lit ? out + 1 : out - bw - 1, py + 1, bw, ph - 2, lit ? stone.deep : shade(stone.deep, -0.15), stone.mid);
    }
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
        if (raised[y][x]) g.fillStyle(0xffffff, 0.15).fillRect(px, py, TILE, TILE);
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

  // 8. Ombres portées des falaises et des corniches sur le sol (lumière venant du nord-ouest) :
  // dégradé, plus sombre au pied de la paroi.
  each(
    (t) => !isRock(t),
    (x, y, px, py) => {
      // Le dessus d'un plateau ne reçoit pas l'ombre de son propre rebord.
      if (up(x, y)) return;
      if (isRock(at(x, y - 1)) || at(x, y - 1) === Tile.Ledge) {
        for (let k = 0; k < 8; k++) g.fillStyle(0x1b1412, 0.34 * (1 - k / 8)).fillRect(px, py + k * 2, TILE, 2);
      }
      if (isRock(at(x - 1, y))) {
        for (let k = 0; k < 5; k++) g.fillStyle(0x1b1412, 0.24 * (1 - k / 5)).fillRect(px + k * 2, py, 2, TILE);
      }
    },
  );

  // 9. Falaises : dessus clair aux plaques de roche, paroi striée au sud, flancs ombrés.
  each(Tile.Rock, (x, y, px, py) => {
    if (rim(x, y)) return;
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
      // Paroi vue de face : un bourrelet de pierres au bord, puis des blocs en arcade.
      const l = isRock(at(x - 1, y)) ? 0 : 2;
      const r = isRock(at(x + 1, y)) ? 0 : 2;
      ridge(px + l, py + 8, TILE - l - r, 7, l > 0, r > 0);
      wall(px + l, py + 15, TILE - l - r, TILE - 16);
      g.fillStyle(stone.line).fillRect(px + l, py + TILE - 2, TILE - l - r, 2);
    }
  });

  // 10. Rebords des plateaux : un épais bourrelet de pierres qui suit tout le contour. Au sud, il
  // surmonte une paroi en arcade ; à l'est et à l'ouest, un talus en pente ; au nord, une simple
  // rangée de pierres. Une corniche ou un escalier voisin prolonge la falaise : pas de paroi de ce côté.
  const low = (t: Tile, x: number, y: number) => !isRock(t) && t !== Tile.Ledge && t !== Tile.Stairs && !up(x, y);
  each(Tile.Rock, (x, y, px, py) => {
    if (!rim(x, y)) return;
    const south = low(at(x, y + 1), x, y + 1);
    const west = low(at(x - 1, y), x - 1, y);
    const east = low(at(x + 1, y), x + 1, y);
    const north = low(at(x, y - 1), x, y - 1);
    g.fillStyle(T.ground).fillRect(px, py, TILE, TILE);
    g.fillStyle(0xffffff, 0.15).fillRect(px, py, TILE, TILE);
    // Talus en pente sur les flancs, angles largement arrondis là où deux faces se rejoignent.
    const W = TILE - 6;
    const R = 16;
    const free = (side: boolean, corner: boolean, ox: number, oy: number) => {
      if (side && corner) g.fillStyle(T.ground).fillRect(ox, oy, R, R);
    };
    free(west, north, px, py);
    free(west, south, px, py + TILE - R);
    free(east, north, px + TILE - R, py);
    free(east, south, px + TILE - R, py + TILE - R);
    if (west) slope(px, py, W, TILE, 'W', north ? R : 0, south ? R : 0);
    if (east) slope(px + TILE - W, py, W, TILE, 'E', north ? R : 0, south ? R : 0);
    if (north) ridge(px + (west ? W - 4 : 0), py, TILE - (west ? W - 4 : 0) - (east ? W - 4 : 0), 9, west, east);
    if (south) {
      // La paroi de face part du pied des talus voisins.
      const l = west ? W - 3 : 0;
      const r = east ? W - 3 : 0;
      ridge(px + l, py + 3, TILE - l - r, 8, l > 0, r > 0);
      wall(px + l, py + 11, TILE - l - r, TILE - 12);
      g.fillStyle(stone.line).fillRect(px + l, py + TILE - 2, TILE - l - r, 2);
    }
  });

  // 11. Escaliers : des marches de pierre grise entre deux piliers, encastrées dans la falaise.
  each(Tile.Stairs, (x, y, px, py) => {
    // Un escalier entre deux cases à gauche et à droite se monte d'est en ouest : marches verticales.
    const sideways = !BLOCKS(at(x - 1, y)) && !BLOCKS(at(x + 1, y)) && (BLOCKS(at(x, y - 1)) || BLOCKS(at(x, y + 1)));
    const tread = 0xc9ccd3;
    const riser = 0x7d828c;
    const post = 0x9c4a32;
    const postDark = 0x4a2216;
    g.fillStyle(0x3c3f45).fillRect(px, py, TILE, TILE);
    if (sideways) {
      for (let k = 0; k < TILE; k += 6) {
        g.fillStyle(tread).fillRect(px + k, py + 5, 4, TILE - 10);
        g.fillStyle(riser).fillRect(px + k + 4, py + 5, 2, TILE - 10);
      }
      const rail = (ry: number, piece: boolean) => {
        g.fillStyle(postDark).fillRect(px, ry, TILE, 4);
        g.fillStyle(post).fillRect(px, ry + 1, TILE, 2);
        if (piece) g.fillStyle(postDark).fillRect(px + 2, ry - 2, 4, 8).fillStyle(post).fillRect(px + 3, ry - 1, 2, 6);
      };
      if (at(x, y - 1) !== Tile.Stairs) rail(py, true);
      if (at(x, y + 1) !== Tile.Stairs) rail(py + TILE - 4, true);
    } else {
      for (let k = 0; k < TILE; k += 6) {
        g.fillStyle(tread).fillRect(px + 5, py + k, TILE - 10, 4);
        g.fillStyle(riser).fillRect(px + 5, py + k + 4, TILE - 10, 2);
      }
      // Deux piliers de bois rouge, comme des poteaux de rampe.
      const pillar = (fx: number) => {
        g.fillStyle(postDark).fillRect(fx, py, 5, TILE);
        g.fillStyle(post).fillRect(fx + 1, py, 3, TILE);
        g.fillStyle(shade(post, 0.35)).fillRect(fx + 1, py, 1, TILE);
        g.fillStyle(postDark).fillRect(fx - 1, py, 7, 3);
      };
      if (at(x - 1, y) !== Tile.Stairs) pillar(px);
      if (at(x + 1, y) !== Tile.Stairs) pillar(px + TILE - 5);
    }
  });

  // 12. Corniches : la falaise sud du plateau en plus basse, d'où l'on saute vers le sud. Même bourrelet
  // de pierres que les falaises voisines, puis une paroi courte.
  const isLedge = (t: Tile) => t === Tile.Ledge;
  each(Tile.Ledge, (x, y, px, py) => {
    g.fillStyle(0xffffff, 0.15).fillRect(px, py, TILE, 3);
    const l = isLedge(at(x - 1, y)) || isRock(at(x - 1, y)) ? 0 : 3;
    const r = isLedge(at(x + 1, y)) || isRock(at(x + 1, y)) ? 0 : 3;
    ridge(px + l, py + 3, TILE - l - r, 8, l > 0, r > 0);
    wall(px + l, py + 11, TILE - l - r, 9);
    g.fillStyle(stone.line).fillRect(px + l, py + 20, TILE - l - r, 2);
    for (let k = 0; k < 4; k++) g.fillStyle(0x1b1412, 0.3 * (1 - k / 4)).fillRect(px, py + 22 + k * 2, TILE, 2);
    // Petite flèche : on descend par ici.
    g.fillStyle(stone.light, 0.95).fillTriangle(px + 12, py + 13, px + 20, py + 13, px + 16, py + 18);
  });

  const rt = scene.add.renderTexture(0, 0, MAP_W * TILE, MAP_H * TILE).setOrigin(0);
  rt.draw(g);
  g.destroy();
  return rt;
}
