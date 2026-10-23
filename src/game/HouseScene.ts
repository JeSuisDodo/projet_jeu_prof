import Phaser from 'phaser';
import type { ChapterDef } from '../content/types';
import { play } from '../audio/sound';
import { teacherSvg, teachersOf } from '../ui/house';
import { creatureSvg } from './creatureArt';
import { TILE } from './map';
import type { Facing } from './textures';
import { shade } from './themes';
import { DECOR, ROOM_DOOR, SIDE_SLANT, ROOM_H, ROOM_W, SAGE_STATION, STATIONS, type Station, WALL, roomBlocking, stationsFor } from './room';

const SPEED = 140;

/** Ce que l'intérieur demande à l'interface. */
export interface HouseHooks {
  isBusy: () => boolean;
  /** Le joueur parle au PNJ n° `index` de `teachersOf(chapter)`. */
  talk: (index: number) => Promise<void>;
  isCalm: () => boolean;
}

/** Une image SVG (portrait de PNJ, créature) en adresse de données, à la taille voulue. */
const svgData = (svg: string, w: number, h: number) => {
  const sized = svg.replace('<svg ', `<svg width="${w}" height="${h}" ${svg.includes('xmlns=') ? '' : 'xmlns="http://www.w3.org/2000/svg" '}`);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(sized)))}`;
};

/**
 * L'intérieur de la Maison du savoir : une salle de classe où l'on se déplace comme dehors.
 * Chaque PNJ se tient derrière son pupitre, sa créature à côté de lui ; on lui parle en
 * s'approchant. La porte, en bas, ramène devant la maison.
 */
export class HouseScene extends Phaser.Scene {
  private chapter!: ChapterDef;
  private onExit: () => void = () => {};
  private player!: Phaser.GameObjects.Sprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private blocking: boolean[][] = [];
  private stations: Station[] = [];
  private bubbles: Phaser.GameObjects.Image[] = [];

  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private facing: Facing = 'up';
  private near = -1;
  private leaving = false;

  constructor(private hooks: HouseHooks) {
    super('house');
  }

  init(data: { chapter: ChapterDef; onExit: () => void }): void {
    this.chapter = data.chapter;
    this.onExit = data.onExit;
    this.facing = 'up';
    this.near = -1;
    this.leaving = false;
    this.bubbles = [];
  }

  create(): void {
    const teachers = teachersOf(this.chapter);
    this.blocking = roomBlocking(teachers.length);
    this.stations = stationsFor(teachers.length);
    this.drawRoom();

    teachers.forEach((t, i) => {
      const station = this.stations[i];
      const spot = station.npc;
      const px = (spot.x + 0.5) * TILE;
      // Assis, le PNJ est un peu plus haut et ses jambes disparaissent derrière le meuble.
      const feet = (spot.y + (station.seated ? 0.75 : 0.9)) * TILE;
      const key = `npc-${this.chapter.id}-${i}`;
      const petKey = `pet-${this.chapter.id}-${i}`;
      const place = () => {
        if (!station.seated) this.add.ellipse(px + 2, feet - 1, 26, 8, 0x000000, 0.32).setDepth((spot.y + 0.5) * TILE - 1);
        this.add.image(px, feet, key).setOrigin(0.5, 1).setDepth((spot.y + 0.5) * TILE);
        // La créature étudiée se tient près de son spécialiste, du côté libre.
        if (t.creature && this.textures.exists(petKey)) {
          const left = spot.x > ROOM_W / 2;
          this.add.ellipse(px + (left ? -26 : 26), (spot.y + 1) * TILE + 3, 22, 7, 0x000000, 0.28).setDepth((spot.y + 1) * TILE + 5).setVisible(station.kind !== 'bureau');
          const pet = this.add.image(px + (left ? -26 : 26), (spot.y + 1) * TILE + 4, petKey).setOrigin(0.5, 1).setDepth((spot.y + 1) * TILE + 6);
          // Au bureau, elle se pose au bout du meuble, à côté des livres.
          if (station.kind === 'bureau') pet.setPosition(px + 52, (spot.y + 1) * TILE + 30).setDepth((spot.y + 2) * TILE);
          if (!this.hooks.isCalm()) this.tweens.add({ targets: pet, y: pet.y - 3, duration: 700 + i * 60, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        }
      };
      const load = (k: string, svg: string, w: number, h: number) =>
        new Promise<void>((resolve) => {
          if (this.textures.exists(k)) return resolve();
          this.textures.once(`addtexture-${k}`, () => resolve());
          this.textures.addBase64(k, svgData(svg, w, h));
        });
      void Promise.all([load(key, teacherSvg(t, !t.creature), 38, 48), t.creature ? load(petKey, creatureSvg(t.creature), 30, 30) : Promise.resolve()]).then(() => {
        if (this.scene.isActive()) place();
      });
      const label = this.add
        .text(px, (spot.y - (station.seated ? 0.85 : 0.75)) * TILE, t.name, { fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#fffaf3', backgroundColor: '#2b2220cc', padding: { x: 4, y: 2 } })
        .setOrigin(0.5, 1)
        .setResolution(3)
        .setDepth(10_000);
      if (!t.creature) label.setBackgroundColor('#b8860bdd');
      const bubble = this.add.image(px, label.y - 16, 'bubble').setDepth(10_001);
      this.bubbles.push(bubble);
      if (!this.hooks.isCalm()) this.tweens.add({ targets: bubble, y: bubble.y - 4, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: i * 80 });
    });

    this.player = this.add.sprite((ROOM_DOOR.x + 0.5) * TILE, (ROOM_H - 1.5) * TILE, 'hero-up-idle-0').setOrigin(0.5, 0.92);
    this.playerShadow = this.add.ellipse(this.player.x, this.player.y, 22, 7, 0x000000, 0.32);
    this.player.play('hero-up-idle');

    const cam = this.cameras.main;
    cam.setBackgroundColor('#1b1412');
    const fit = () => {
      cam.setZoom(Math.min(window.innerWidth, window.innerHeight) < 640 ? 1 : 1.5);
      // La pièce reste centrée dans la direction où elle tient à l'écran ; sinon la caméra suit.
      const viewW = cam.width / cam.zoom;
      const viewH = cam.height / cam.zoom;
      const roomW = ROOM_W * TILE;
      const roomH = ROOM_H * TILE;
      cam.setBounds(Math.min(0, (roomW - viewW) / 2), Math.min(0, (roomH - viewH) / 2), Math.max(roomW, viewW), Math.max(roomH, viewH));
      cam.startFollow(this.player, true, 0.15, 0.15);
    };
    fit();
    this.scale.on('resize', fit);
    this.events.once('shutdown', () => this.scale.off('resize', fit));
    if (!this.hooks.isCalm()) cam.fadeIn(350);
    this.keys = this.input.keyboard!.addKeys('UP,DOWN,LEFT,RIGHT,Z,Q,S,D,W,A,E,SPACE', false) as Record<string, Phaser.Input.Keyboard.Key>;
  }

  /**
   * La salle en volume, vue de trois quarts comme la carte : plancher, murs épais (on voit leur
   * dessus sombre et la face du mur du fond), lumière des fenêtres au sol, puis le mobilier de
   * chaque coin. Chaque meuble montre son dessus clair et sa face plus sombre, avec son ombre ;
   * il est trié en profondeur avec le joueur, qui passe derrière ou devant.
   */
  private drawRoom(): void {
    const W = ROOM_W * TILE;
    const H = ROOM_H * TILE;
    const floor = this.add.graphics().setDepth(-3);
    // Plancher en perspective : les lattes fuient vers le fond de la pièce, plus serrées au loin.
    const top = WALL * TILE;
    const slant = SIDE_SLANT;
    const planks = 22;
    const rows = 14;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const rowY = (k: number) => top + (H - top) * Math.pow(k / rows, 1.35);
    const seamX = (i: number, y: number) => {
      const t = (y - top) / (H - top);
      return lerp(slant + (i * (W - 2 * slant)) / planks, (i * W) / planks, t);
    };
    floor.fillStyle(0x8a5a30).fillRect(0, 0, W, H);
    for (let k = 0; k < rows; k++)
      for (let i = 0; i < planks; i++) {
        // Lattes décalées d'une rangée à l'autre, comme un vrai parquet.
        if ((i + k) % 5 === 0 && k > 0) continue;
        const y0 = rowY(k);
        const y1 = rowY(k + 1);
        const tone = [0xb67f4b, 0xae7744, 0xbb8652, 0xa9723f, 0xb27a46][(i * 7 + k * 3) % 5];
        floor.fillStyle(tone).fillPoints([{ x: seamX(i, y0) + 1, y: y0 + 1 }, { x: seamX(i + 1, y0) - 1, y: y0 + 1 }, { x: seamX(i + 1, y1) - 1, y: y1 - 1 }, { x: seamX(i, y1) + 1, y: y1 - 1 }], true);
        floor.fillStyle(0xffffff, 0.06).fillPoints([{ x: seamX(i, y0) + 1, y: y0 + 1 }, { x: seamX(i + 1, y0) - 1, y: y0 + 1 }, { x: seamX(i + 1, y0 + 2) - 1, y: y0 + 3 }, { x: seamX(i, y0 + 2) + 1, y: y0 + 3 }], true);
        if ((i * 13 + k * 7) % 11 === 0) floor.fillStyle(0x7a4e2d, 0.6).fillEllipse((seamX(i, y0) + seamX(i + 1, y1)) / 2, (y0 + y1) / 2, 6, 3);
      }
    // Le fond de la pièce est un peu plus sombre que le devant.
    for (let i = 0; i < 6; i++) floor.fillStyle(0x000000, 0.05).fillRect(0, top, W, (H - top) * (0.5 - i * 0.08));
    // Les tapis suivent la perspective du plancher : plus étroits vers le fond.
    const P = (x: number, y: number) => {
      const t = Math.max(0, (y - top) / (H - top));
      return { x: W / 2 + (x - W / 2) * lerp((W - 2 * slant) / W, 1, t), y };
    };
    const quad = (x: number, y: number, w: number, h: number) => [P(x, y), P(x + w, y), P(x + w, y + h), P(x, y + h)];
    const rug = { x: 7 * TILE, y: 6.6 * TILE, w: 6 * TILE, h: 5 * TILE };
    floor.fillStyle(0x000000, 0.25).fillPoints(quad(rug.x + 4, rug.y + 5, rug.w, rug.h), true);
    floor.fillStyle(0x7a1f2b).fillPoints(quad(rug.x, rug.y, rug.w, rug.h), true);
    floor.lineStyle(4, 0xe0a84a).strokePoints(quad(rug.x + 8, rug.y + 8, rug.w - 16, rug.h - 16), true);
    floor.lineStyle(2, 0xe0a84a, 0.7).strokePoints(quad(rug.x + 18, rug.y + 18, rug.w - 36, rug.h - 36), true);
    const mx = rug.x + rug.w / 2;
    const my = rug.y + rug.h / 2;
    floor.fillStyle(0xe0a84a).fillPoints([P(mx, rug.y + 34), P(mx + 30, my), P(mx, rug.y + rug.h - 34), P(mx - 30, my)], true);
    floor.fillStyle(0x7a1f2b).fillEllipse(P(mx, my).x, my, 24, 20);
    for (let x = rug.x + 4; x < rug.x + rug.w - 2; x += 6) {
      const back = P(x, rug.y);
      const front = P(x, rug.y + rug.h);
      floor.fillStyle(0xf1e3c4).fillRect(back.x, rug.y - 4, 2, 4).fillRect(front.x, rug.y + rug.h, 2, 4);
    }
    // Petits tapis des coins lecture et bureau.
    floor.fillStyle(0x2f6d5a).fillPoints(quad(1.1 * TILE, 10.6 * TILE, 3.3 * TILE, 2.4 * TILE), true);
    floor.lineStyle(2, 0xc3e6cb).strokePoints(quad(1.1 * TILE + 5, 10.6 * TILE + 5, 3.3 * TILE - 10, 2.4 * TILE - 10), true);
    floor.fillStyle(0x3b4f8f).fillPoints(quad(14.6 * TILE, 3.4 * TILE, 3.8 * TILE, 3.2 * TILE), true);
    floor.lineStyle(2, 0xd0bfff).strokePoints(quad(14.6 * TILE + 5, 3.4 * TILE + 5, 3.8 * TILE - 10, 3.2 * TILE - 10), true);

    const wall = this.add.graphics().setDepth(-2);
    // Mur du fond : dessus (épaisseur) sombre, face éclairée en papier peint rayé, lambris, plinthe.
    wall.fillStyle(0xf3e6c8).fillRect(0, 0, W, WALL * TILE);
    for (let x = 0; x < W; x += 16) wall.fillStyle(0xeadbb6).fillRect(x, 0, 8, WALL * TILE);
    wall.fillStyle(0x9a6b42).fillRect(0, 2 * TILE + 4, W, TILE - 4);
    for (let x = 6; x < W; x += 28) wall.fillStyle(0x87592f).fillRect(x, 2 * TILE + 9, 22, TILE - 16);
    wall.fillStyle(0x5c3a1a).fillRect(0, WALL * TILE - 4, W, 4);
    wall.fillStyle(0x3b2616).fillRect(0, 0, W, 8);
    // Murs de côté en perspective : leur face intérieure s'élargit vers nous, avec le lambris.
    const sideWall = this.add.graphics().setDepth(-1);
    for (const left of [true, false]) {
      const X = (x: number) => (left ? x : W - x);
      sideWall.fillStyle(0xd9c79f).fillPoints([{ x: X(0), y: 0 }, { x: X(slant), y: 0 }, { x: X(slant), y: top }, { x: X(0), y: H }], true);
      for (let k = 1; k < 4; k++) sideWall.lineStyle(1, 0xc9b48c).lineBetween(X((slant * k) / 4), 0, X((slant * k) / 4), top + ((H - top) * (4 - k)) / 4);
      sideWall.fillStyle(0x87592f).fillPoints([{ x: X(slant), y: top - 26 }, { x: X(slant), y: top }, { x: X(0), y: H }, { x: X(0), y: H - 60 }], true);
      sideWall.fillStyle(0x5c3a1a).fillPoints([{ x: X(slant), y: top - 3 }, { x: X(slant), y: top }, { x: X(0), y: H }, { x: X(0), y: H - 8 }], true);
      sideWall.lineStyle(2, 0x3b2616).lineBetween(X(slant), 0, X(slant), top);
      // Ombre portée du mur sur le plancher, le long de la plinthe.
      sideWall.fillStyle(0x000000, 0.22).fillPoints([{ x: X(slant), y: top }, { x: X(slant + 14), y: top }, { x: X(18), y: H }, { x: X(0), y: H }], true);
    }
    for (let i = 0; i < 4; i++) wall.fillStyle(0x000000, 0.16 - i * 0.035).fillRect(0, top + i * 5, W, 5);

    // Fenêtres, et leur lumière posée en biais sur le plancher.
    for (const wx of [6 * TILE - 4, 13.6 * TILE]) {
      wall.fillStyle(0x3b2616).fillRect(wx - 3, 10, 48, 50);
      wall.fillStyle(0x8ecdf0).fillRect(wx, 13, 42, 44);
      wall.fillStyle(0xbfe3f7).fillRect(wx, 13, 42, 14);
      wall.fillStyle(0xffffff, 0.8).fillRect(wx + 4, 17, 10, 4);
      wall.fillStyle(0x6d8b3a).fillEllipse(wx + 30, 54, 26, 10);
      wall.fillStyle(0x7a4e2d).fillRect(wx + 20, 13, 3, 44).fillRect(wx, 34, 42, 3);
      wall.fillStyle(0x7a4e2d).fillRect(wx - 6, 57, 54, 5);
      wall.fillStyle(0x5c3a1a).fillRect(wx - 6, 62, 54, 2);
      // Rideaux.
      wall.fillStyle(0xc0392b).fillRect(wx - 9, 8, 8, 52).fillRect(wx + 43, 8, 8, 52);
      wall.fillStyle(0xe55039).fillRect(wx - 9, 8, 3, 52).fillRect(wx + 43, 8, 3, 52);
      floor.fillStyle(0xfff3bf, 0.16).fillPoints([{ x: wx, y: WALL * TILE }, { x: wx + 42, y: WALL * TILE }, { x: wx + 82, y: WALL * TILE + 120 }, { x: wx + 40, y: WALL * TILE + 120 }], true);
    }

    // Tableau noir au centre, avec le titre du chapitre et quelques formules à la craie.
    const bx = 8 * TILE;
    wall.fillStyle(0x3b2616).fillRect(bx - 4, 8, 4 * TILE + 8, 2 * TILE + 4);
    wall.fillStyle(0x8b5a2b).fillRect(bx - 2, 10, 4 * TILE + 4, 2 * TILE);
    wall.fillStyle(0x24453a).fillRect(bx + 3, 14, 4 * TILE - 6, 2 * TILE - 10);
    wall.fillStyle(0x2f5a4b).fillRect(bx + 3, 14, 4 * TILE - 6, 6);
    wall.fillStyle(0x8b5a2b).fillRect(bx - 4, 2 * TILE + 8, 4 * TILE + 8, 5);
    wall.fillStyle(0xf8f9fa).fillRect(bx + 20, 2 * TILE + 5, 8, 3).fillRect(bx + 34, 2 * TILE + 5, 5, 3);
    this.add
      .text(bx + 2 * TILE, 30, this.chapter.title, { fontFamily: 'Georgia, serif', fontSize: '12px', color: '#f1f3f5', align: 'center', wordWrap: { width: 4 * TILE - 14 } })
      .setOrigin(0.5)
      .setResolution(3)
      .setDepth(-1);
    this.add.text(bx + 12, 50, 'x² + 1 = ?', { fontFamily: 'Georgia, serif', fontSize: '9px', color: '#c3e6cb' }).setResolution(3).setDepth(-1).setAlpha(0.8);
    // Horloge et cadres.
    wall.fillStyle(0x3b2616).fillCircle(12.6 * TILE, 20, 11);
    wall.fillStyle(0xfff8e1).fillCircle(12.6 * TILE, 20, 9);
    wall.lineStyle(2, 0x212529).lineBetween(12.6 * TILE, 20, 12.6 * TILE, 14).lineBetween(12.6 * TILE, 20, 12.6 * TILE + 5, 22);
    wall.fillStyle(0x3b2616).fillRect(7.1 * TILE - 2, 12, 22, 28);
    wall.fillStyle(0xffd8a8).fillRect(7.1 * TILE, 14, 18, 24);
    wall.fillStyle(0x5c940d).fillTriangle(7.1 * TILE, 38, 7.1 * TILE + 9, 24, 7.1 * TILE + 18, 38);

    // Murs de côté et du bas : on voit leur épaisseur (dessus sombre, liseré clair) ; la porte et son paillasson.
    const side = this.add.graphics().setDepth(H + 50);
    side.fillStyle(0x3b2616).fillRect(0, 0, 4, H).fillRect(W - 4, 0, 4, H).fillRect(0, H - 16, W, 16);
    side.fillStyle(0x6d4422).fillRect(4, H - 18, W - 8, 3);
    // Pénombre vers l'avant et dans les coins : la pièce se creuse.
    const shade3d = this.add.graphics().setDepth(H + 40);
    for (let i = 0; i < 8; i++) shade3d.fillStyle(0x000000, 0.035).fillRect(0, H - 16 - (8 - i) * 9, W, (8 - i) * 9);
    for (let i = 0; i < 6; i++) shade3d.fillStyle(0x000000, 0.03).fillRect(0, 0, (6 - i) * 10, H).fillRect(W - (6 - i) * 10, 0, (6 - i) * 10, H);
    const dx = ROOM_DOOR.x * TILE;
    side.fillStyle(0x1b1412).fillRect(dx - 4, H - 18, TILE + 8, 18);
    side.fillStyle(0x6d4422).fillRect(dx - 6, H - 18, 3, 18).fillRect(dx + TILE + 3, H - 18, 3, 18);
    floor.fillStyle(0x8f6a3a).fillRoundedRect(dx - 6, H - 2 * TILE + 4, TILE + 12, TILE - 10, 4);
    floor.lineStyle(1, 0x5c3a1a).strokeRoundedRect(dx - 3, H - 2 * TILE + 7, TILE + 6, TILE - 16, 3);

    for (const s of STATIONS) this.drawStation(s);
    this.drawStation(SAGE_STATION);
    for (const d of DECOR) this.drawDecor(d.kind, d.at.x, d.at.y);
  }

  /**
   * Un meuble en volume : dessus (top) clair, face avant plus sombre, contour, ombre au sol.
   * (x, y) est le coin haut-gauche du dessus, en pixels ; `depthY` la ligne de tri.
   */
  private box(x: number, y: number, w: number, top: number, front: number, color: number, depthY?: number): Phaser.GameObjects.Graphics {
    const g = this.add.graphics().setDepth(depthY ?? y + top + front);
    const h = top + front;
    // Ombre portée vers l'avant-droite (la lumière vient des fenêtres du fond).
    g.fillStyle(0x000000, 0.35).fillPoints([{ x: x + 2, y: y + h - 2 }, { x: x + w + 2, y: y + h - 2 }, { x: x + w + 14, y: y + h + 9 }, { x: x + 12, y: y + h + 9 }], true);
    // Côté visible : celui qui regarde le milieu de la pièce.
    const sideW = 7;
    const toRight = x + w / 2 < (ROOM_W * TILE) / 2;
    const sx = toRight ? x + w : x;
    const out = toRight ? sideW : -sideW;
    g.fillStyle(0x2b1d16).fillPoints([{ x: sx, y: y - 1 }, { x: sx + out + (toRight ? 1 : -1), y: y + 3 }, { x: sx + out + (toRight ? 1 : -1), y: y + h + 1 }, { x: sx, y: y + h + 1 }], true);
    g.fillStyle(shade(color, -0.35)).fillPoints([{ x: sx, y }, { x: sx + out, y: y + 4 }, { x: sx + out, y: y + h }, { x: sx, y: y + h }], true);
    g.fillStyle(shade(color, 0.05)).fillPoints([{ x: sx, y }, { x: sx + out, y: y + 4 }, { x: sx + out, y: y + top + 3 }, { x: sx, y: y + top }], true);
    g.fillStyle(0x2b1d16).fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(shade(color, 0.18)).fillRect(x, y, w, top);
    g.fillStyle(shade(color, 0.35)).fillRect(x, y, w, 2);
    g.fillStyle(shade(color, -0.22)).fillRect(x, y + top, w, front);
    g.fillStyle(shade(color, -0.4)).fillRect(x, y + top, w, 2);
    return g;
  }

  /** Étagère vue de face : montants, planches et livres de toutes les couleurs. */
  private bookshelf(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, rows: number, seed: number): void {
    const colors = [0xc92a2a, 0x2f9e44, 0x1c7ed6, 0xfab005, 0x7048e8, 0xe8590c, 0x0c8599, 0xf1e3c4];
    // Dessus du meuble, vu d'en haut, et son ombre sur le sol.
    g.fillStyle(0x000000, 0.3).fillRect(x + 4, y + h, w, 8);
    g.fillStyle(0x2b1d16).fillRect(x - 3, y - 9, w + 6, 9);
    g.fillStyle(0xa8743f).fillRect(x - 2, y - 8, w + 4, 6);
    g.fillStyle(0x2b1d16).fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(0x6d4422).fillRect(x, y, w, h);
    g.fillStyle(0x8b5a2b).fillRect(x, y, w, 4).fillRect(x, y, 4, h).fillRect(x + w - 4, y, 4, h);
    const rowH = (h - 6) / rows;
    for (let r = 0; r < rows; r++) {
      const base = y + 4 + (r + 1) * rowH;
      g.fillStyle(0x4a2e18).fillRect(x + 4, base - rowH + 2, w - 8, rowH - 4);
      let bx = x + 5;
      let k = seed + r * 7;
      while (bx < x + w - 9) {
        const bw = 4 + (k % 3);
        const bh = rowH - 6 - ((k * 5) % 4);
        g.fillStyle(colors[k % colors.length]).fillRect(bx, base - bh - 2, bw, bh);
        g.fillStyle(0xffffff, 0.25).fillRect(bx, base - bh - 2, 1, bh);
        bx += bw + 1;
        k += 3;
        if (k % 11 === 0) bx += 4;
      }
      g.fillStyle(0x8b5a2b).fillRect(x + 4, base - 2, w - 8, 3);
    }
  }

  private drawStation(s: Station): void {
    const T = TILE;
    const cx = (s.npc.x + 0.5) * T;
    switch (s.kind) {
      case 'bibliotheque': {
        // Étagères hautes contre le mur, de la case 1 à 5, et une étagère isolée devant.
        const g = this.add.graphics().setDepth(WALL * T - 1);
        this.bookshelf(g, T + 2, 4, 4 * T - 4, WALL * T - 4, 3, 1);
        g.fillStyle(0x3b2616).fillRect(T, WALL * T - 4, 4 * T, 4);
        const free = this.box(T, 5.6 * T - 34, 3 * T, 10, 0, 0x8b5a2b, 7 * T);
        this.bookshelf(free, T + 2, 5.6 * T - 24, 3 * T - 4, 40, 2, 5);
        // Échelle appuyée contre les étagères.
        const ladder = this.add.graphics().setDepth(4 * T);
        ladder.lineStyle(3, 0x5c3a1a).lineBetween(5 * T + 6, 6, 5 * T + 4, 4 * T - 2).lineBetween(5 * T + 24, 6, 5 * T + 28, 4 * T - 2);
        for (let y = 14; y < 4 * T - 4; y += 12) ladder.lineStyle(2, 0x8b5a2b).lineBetween(5 * T + 6, y, 5 * T + 26, y);
        // Pile de livres au sol.
        const pile = this.add.graphics().setDepth(5 * T);
        [[0x1c7ed6, 0], [0xc92a2a, 5], [0xfab005, 10]].forEach(([col, dy], i) => {
          pile.fillStyle(0x2b1d16).fillRect(4 * T + 2 + i, 5 * T - 6 - dy, 20, 6);
          pile.fillStyle(col).fillRect(4 * T + 3 + i, 5 * T - 5 - dy, 18, 4);
        });
        break;
      }
      case 'bureau': {
        // Bibliothèque basse derrière le bureau, chaise, grand bureau avec lampe, livres et encrier.
        const back = this.add.graphics().setDepth(WALL * T - 1);
        this.bookshelf(back, 15 * T, 1.2 * T, 3 * T, 1.8 * T, 2, 9);
        const chair = this.add.graphics().setDepth((s.npc.y + 0.3) * T);
        chair.fillStyle(0x2b1d16).fillRoundedRect(cx - 15, s.npc.y * T - 14, 30, 34, 6);
        chair.fillStyle(0x7a1f2b).fillRoundedRect(cx - 13, s.npc.y * T - 12, 26, 30, 5);
        chair.fillStyle(0x9c2b3a).fillRoundedRect(cx - 10, s.npc.y * T - 9, 20, 8, 3);
        const desk = this.box(15 * T - 4, 5 * T - 6, 3 * T + 8, 18, 18, 0x8b5a2b);
        desk.fillStyle(0x6d4422).fillRect(15 * T + 6, 5 * T + 16, 22, 10).fillRect(17 * T - 2, 5 * T + 16, 22, 10);
        desk.fillStyle(0xfab005).fillCircle(15 * T + 17, 5 * T + 21, 2).fillCircle(17 * T + 9, 5 * T + 21, 2);
        // Lampe verte de bureau, livres ouverts, encrier et plume.
        desk.fillStyle(0x2b1d16).fillRect(15 * T + 4, 5 * T - 22, 3, 18);
        desk.fillStyle(0x2f9e44).fillPoints([{ x: 15 * T - 4, y: 5 * T - 20 }, { x: 15 * T + 16, y: 5 * T - 20 }, { x: 15 * T + 12, y: 5 * T - 28 }, { x: 15 * T, y: 5 * T - 28 }], true);
        desk.fillStyle(0xfff3bf, 0.35).fillEllipse(15 * T + 6, 5 * T + 2, 34, 12);
        desk.fillStyle(0xfff8e1).fillRect(16 * T - 2, 5 * T - 3, 30, 10);
        desk.fillStyle(0x1c7ed6).fillRect(16 * T + 12, 5 * T - 3, 2, 10);
        desk.fillStyle(0x212529).fillRect(17 * T + 10, 5 * T - 4, 7, 7);
        desk.lineStyle(1, 0xf8f9fa).lineBetween(17 * T + 14, 5 * T - 4, 17 * T + 20, 5 * T - 16);
        break;
      }
      case 'globe': {
        const x = (2 + 0.5) * T;
        const y = 9 * T;
        const g = this.add.graphics().setDepth(y + T);
        g.fillStyle(0x000000, 0.25).fillEllipse(x, y + T - 4, 26, 8);
        g.fillStyle(0x5c3a1a).fillRect(x - 2, y + 10, 4, T - 12).fillRect(x - 10, y + T - 6, 20, 4);
        g.lineStyle(3, 0xb8860b).beginPath();
        g.arc(x, y + 2, 15, Math.PI * 0.6, Math.PI * 2.4);
        g.strokePath();
        g.fillStyle(0x1c7ed6).fillCircle(x, y + 2, 12);
        g.fillStyle(0x2f9e44).fillEllipse(x - 4, y - 2, 10, 7).fillEllipse(x + 5, y + 6, 7, 6);
        g.fillStyle(0xffffff, 0.35).fillCircle(x - 5, y - 4, 4);
        // Carte au trésor punaisée au mur de côté… posée sur un chevalet.
        const easel = this.add.graphics().setDepth(8 * T);
        easel.lineStyle(3, 0x5c3a1a).lineBetween(1.3 * T, 8 * T, 1.6 * T, 6.9 * T).lineBetween(2.2 * T, 8 * T, 1.9 * T, 6.9 * T);
        easel.fillStyle(0x2b1d16).fillRect(1.1 * T, 6.9 * T, 1.3 * T, 0.75 * T);
        easel.fillStyle(0xf3d9a4).fillRect(1.1 * T + 2, 6.9 * T + 2, 1.3 * T - 4, 0.75 * T - 4);
        easel.lineStyle(1, 0xc92a2a).strokeCircle(1.9 * T, 7.2 * T, 3);
        easel.lineStyle(1, 0x8b5a2b, 0.8).lineBetween(1.3 * T, 7.4 * T, 1.85 * T, 7.25 * T);
        break;
      }
      case 'laboratoire': {
        const table = this.box(15 * T - 2, 9 * T - 8, 3 * T + 4, 16, 18, 0x868e96);
        table.fillStyle(0x495057).fillRect(15 * T + 2, 9 * T + 10, 4, 14).fillRect(18 * T - 6, 9 * T + 10, 4, 14);
        // Fioles colorées, erlenmeyer et alambic qui fait des bulles.
        const flask = (x: number, color: number, tall: number) => {
          table.fillStyle(0x2b1d16).fillRect(x - 1, 9 * T - 4 - tall, 8, tall + 2);
          table.fillStyle(0xe7f5ff).fillRect(x, 9 * T - 3 - tall, 6, tall);
          table.fillStyle(color).fillRect(x, 9 * T - 3 - tall / 2, 6, tall / 2);
        };
        flask(15 * T + 4, 0x51cf66, 12);
        flask(15 * T + 14, 0xff6b6b, 16);
        flask(15 * T + 24, 0x845ef7, 10);
        table.fillStyle(0x2b1d16).fillTriangle(17 * T - 2, 9 * T - 2, 17 * T + 22, 9 * T - 2, 17 * T + 10, 9 * T - 26);
        table.fillStyle(0xe7f5ff).fillTriangle(17 * T + 1, 9 * T - 3, 17 * T + 19, 9 * T - 3, 17 * T + 10, 9 * T - 22);
        table.fillStyle(0xffd43b).fillTriangle(17 * T + 4, 9 * T - 3, 17 * T + 16, 9 * T - 3, 17 * T + 10, 9 * T - 12);
        if (!this.hooks.isCalm())
          this.add
            .particles(17 * T + 10, 9 * T - 24, 'dust', { speedY: { min: -18, max: -8 }, speedX: { min: -4, max: 4 }, lifespan: 1200, scale: { start: 0.5, end: 0.1 }, alpha: { start: 0.8, end: 0 }, frequency: 350, tint: 0xfff3bf })
            .setDepth(10 * T);
        // Squelette d'étagère à flacons, contre le mur droit.
        const rack = this.add.graphics().setDepth(8 * T);
        rack.fillStyle(0x2b1d16).fillRect(18 * T + 2, 6.6 * T, 22, 1.4 * T);
        rack.fillStyle(0x8b5a2b).fillRect(18 * T + 4, 6.6 * T + 2, 18, 1.4 * T - 4);
        for (const [dy, col] of [[8, 0x74c0fc], [26, 0xffa94d]] as const) rack.fillStyle(col).fillRect(18 * T + 7, 6.6 * T + dy, 5, 10).fillRect(18 * T + 14, 6.6 * T + dy + 2, 5, 8);
        break;
      }
      case 'lecture': {
        // Fauteuil (dossier derrière le PNJ, accoudoirs devant), guéridon avec théière, lampe sur pied.
        const y = s.npc.y * T;
        const back = this.add.graphics().setDepth(y + 2);
        back.fillStyle(0x2b1d16).fillRoundedRect(cx - 19, y - 16, 38, 40, 10);
        back.fillStyle(0x2b8a3e).fillRoundedRect(cx - 17, y - 14, 34, 36, 9);
        back.fillStyle(0x40c057).fillRoundedRect(cx - 13, y - 10, 26, 10, 5);
        const arms = this.add.graphics().setDepth(y + T);
        arms.fillStyle(0x000000, 0.25).fillEllipse(cx, y + T - 2, 44, 10);
        arms.fillStyle(0x2b1d16).fillRoundedRect(cx - 21, y + 8, 12, 22, 4).fillRoundedRect(cx + 9, y + 8, 12, 22, 4).fillRect(cx - 18, y + 20, 36, 10);
        arms.fillStyle(0x2f9e44).fillRoundedRect(cx - 19, y + 10, 8, 18, 3).fillRoundedRect(cx + 11, y + 10, 8, 18, 3).fillRect(cx - 16, y + 22, 32, 6);
        const tx = 3.5 * T;
        const table = this.box(tx - 13, y + 6, 26, 8, 14, 0x8b5a2b);
        table.fillStyle(0xf1f3f5).fillRoundedRect(tx - 8, y - 2, 14, 10, 4);
        table.fillStyle(0xf1f3f5).fillRect(tx + 5, y + 1, 5, 2);
        table.fillStyle(0x74c0fc).fillCircle(tx - 1, y + 3, 2);
        const lamp = this.add.graphics().setDepth(12 * T);
        lamp.fillStyle(0x000000, 0.25).fillEllipse(1.5 * T, 12 * T - 2, 18, 6);
        lamp.fillStyle(0x2b1d16).fillRect(1.5 * T - 1, 11 * T - 4, 3, T).fillRect(1.5 * T - 7, 12 * T - 5, 14, 3);
        lamp.fillStyle(0xffd8a8).fillPoints([{ x: 1.5 * T - 12, y: 11 * T - 2 }, { x: 1.5 * T + 12, y: 11 * T - 2 }, { x: 1.5 * T + 7, y: 11 * T - 16 }, { x: 1.5 * T - 7, y: 11 * T - 16 }], true);
        lamp.fillStyle(0xfff3bf, 0.25).fillCircle(1.5 * T, 11 * T + 4, 22);
        break;
      }
      case 'aquarium': {
        const x = 16 * T;
        const y = 12 * T - 20;
        const g = this.box(x - 2, y + 30, 2 * T + 4, 6, 12, 0x5c3a1a, 13 * T);
        g.fillStyle(0x2b1d16).fillRect(x - 2, y - 2, 2 * T + 4, 34);
        g.fillStyle(0x4dabf7).fillRect(x, y, 2 * T, 30);
        g.fillStyle(0x74c0fc).fillRect(x, y, 2 * T, 6);
        g.fillStyle(0xe9dcc5).fillRect(x, y + 24, 2 * T, 6);
        g.fillStyle(0x2f9e44).fillRect(x + 8, y + 10, 3, 16).fillRect(x + 12, y + 14, 3, 12).fillRect(x + 48, y + 12, 3, 14);
        g.fillStyle(0xff922b).fillEllipse(x + 30, y + 14, 10, 6).fillTriangle(x + 35, y + 14, x + 40, y + 10, x + 40, y + 18);
        g.fillStyle(0xffe066).fillEllipse(x + 44, y + 20, 7, 4);
        g.fillStyle(0xffffff, 0.35).fillRect(x + 3, y + 3, 4, 20);
        if (!this.hooks.isCalm())
          this.add
            .particles(x + 22, y + 24, 'dust', { speedY: { min: -14, max: -6 }, lifespan: 1300, scale: { start: 0.35, end: 0.15 }, alpha: { start: 0.9, end: 0 }, frequency: 500, tint: 0xe7f5ff })
            .setDepth(13 * T + 1);
        break;
      }
      case 'tableau': {
        // Lutrin du sage, avec un grand livre ouvert.
        const y = 5 * T;
        const g = this.add.graphics().setDepth(y + T - 4);
        g.fillStyle(0x000000, 0.25).fillEllipse(cx, y + T - 6, 30, 8);
        g.fillStyle(0x2b1d16).fillRect(cx - 4, y + 4, 8, T - 10).fillRect(cx - 12, y + T - 10, 24, 5);
        g.fillStyle(0x8b5a2b).fillRect(cx - 2, y + 4, 4, T - 10);
        g.fillStyle(0x2b1d16).fillPoints([{ x: cx - 17, y: y + 8 }, { x: cx + 17, y: y + 8 }, { x: cx + 13, y: y - 4 }, { x: cx - 13, y: y - 4 }], true);
        g.fillStyle(0x8b5a2b).fillPoints([{ x: cx - 15, y: y + 6 }, { x: cx + 15, y: y + 6 }, { x: cx + 12, y: y - 2 }, { x: cx - 12, y: y - 2 }], true);
        g.fillStyle(0xfff8e1).fillRect(cx - 12, y - 3, 11, 7).fillRect(cx + 1, y - 3, 11, 7);
        g.fillStyle(0xc92a2a).fillRect(cx - 1, y - 3, 2, 10);
        break;
      }
    }
  }

  private drawDecor(kind: 'plante' | 'table' | 'tabouret', x: number, y: number): void {
    const px = (x + 0.5) * TILE;
    const bottom = (y + 1) * TILE;
    const g = this.add.graphics().setDepth(bottom);
    if (kind === 'plante') {
      g.fillStyle(0x000000, 0.25).fillEllipse(px + 2, bottom - 3, 26, 8);
      g.fillStyle(0x2b1d16).fillRect(px - 10, bottom - 18, 20, 16);
      g.fillStyle(0xc0582b).fillRect(px - 9, bottom - 17, 18, 14);
      g.fillStyle(0xe8743b).fillRect(px - 9, bottom - 17, 18, 4);
      g.fillStyle(0x2b8a3e).fillCircle(px, bottom - 30, 11).fillCircle(px - 9, bottom - 22, 8).fillCircle(px + 9, bottom - 22, 8);
      g.fillStyle(0x40c057).fillCircle(px - 3, bottom - 33, 5).fillCircle(px + 6, bottom - 26, 4);
    } else if (kind === 'table') {
      g.fillStyle(0x000000, 0.25).fillEllipse(px + 3, bottom - 4, 34, 10);
      g.fillStyle(0x2b1d16).fillRect(px - 3, bottom - 18, 6, 14);
      g.fillStyle(0x2b1d16).fillEllipse(px, bottom - 20, 36, 18);
      g.fillStyle(0x6d4422).fillEllipse(px, bottom - 18, 34, 14);
      g.fillStyle(0x9c6a3c).fillEllipse(px, bottom - 21, 34, 12);
      g.fillStyle(0xfff8e1).fillRect(px - 9, bottom - 25, 10, 7);
      g.fillStyle(0xf8f9fa).fillRoundedRect(px + 3, bottom - 26, 7, 6, 2);
    } else {
      g.fillStyle(0x000000, 0.22).fillEllipse(px + 2, bottom - 4, 18, 6);
      g.fillStyle(0x2b1d16).fillRect(px - 6, bottom - 14, 3, 10).fillRect(px + 3, bottom - 14, 3, 10);
      g.fillStyle(0x2b1d16).fillEllipse(px, bottom - 15, 18, 9);
      g.fillStyle(0x8b5a2b).fillEllipse(px, bottom - 16, 16, 7);
    }
  }

  update(_time: number, deltaMs: number): void {
    this.player.setDepth(this.player.y);
    this.playerShadow.setPosition(this.player.x + 1, this.player.y - 1).setDepth(this.player.y - 1);
    if (this.leaving) return;
    if (this.hooks.isBusy()) {
      this.input.keyboard!.resetKeys();
      this.player.play(`hero-${this.facing}-idle`, true);
      return;
    }
    const k = this.keys;
    let dx = 0;
    let dy = 0;
    if (k.LEFT.isDown || k.Q.isDown || k.A.isDown) dx -= 1;
    if (k.RIGHT.isDown || k.D.isDown) dx += 1;
    if (k.UP.isDown || k.Z.isDown || k.W.isDown) dy -= 1;
    if (k.DOWN.isDown || k.S.isDown) dy += 1;
    const pointer = this.input.activePointer;
    if (dx === 0 && dy === 0 && pointer.isDown) {
      const target = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
      const vx = target.x - this.player.x;
      const vy = target.y - this.player.y;
      if (Math.hypot(vx, vy) > 8) [dx, dy] = [vx, vy];
    }
    let moved = false;
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      const step = (SPEED * deltaMs) / 1000;
      const before = { x: this.player.x, y: this.player.y };
      this.tryMove((dx / len) * step, 0);
      this.tryMove(0, (dy / len) * step);
      this.facing = Math.abs(dx) > Math.abs(dy) ? 'side' : dy < 0 ? 'up' : 'down';
      this.player.setFlipX(this.facing === 'side' && dx < 0);
      moved = this.player.x !== before.x || this.player.y !== before.y;
    }
    this.player.play(`hero-${this.facing}-${moved ? 'walk' : 'idle'}`, true);

    // La porte : on ressort devant la maison.
    if (this.player.y > (ROOM_H - 0.8) * TILE) return this.leave();

    const interact = Phaser.Input.Keyboard.JustDown(k.E) || Phaser.Input.Keyboard.JustDown(k.SPACE);
    // On parle au PNJ le plus proche, à deux pas au plus (le meuble peut être entre nous).
    let near = -1;
    let best = 72;
    this.stations.forEach((s, i) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, (s.npc.x + 0.5) * TILE, (s.npc.y + 0.6) * TILE);
      if (d < best) [near, best] = [i, d];
    });
    if (near >= 0 && (near !== this.near || interact)) {
      this.bubbles[near]?.setVisible(false);
      void this.hooks.talk(near);
    }
    this.near = near;
  }

  private tryMove(mx: number, my: number): void {
    const nx = this.player.x + mx;
    const ny = this.player.y + my;
    const blocked = [
      [nx - 8, ny - 6],
      [nx + 8, ny - 6],
      [nx - 8, ny + 2],
      [nx + 8, ny + 2],
    ].some(([cx, cy]) => {
      const row = this.blocking[Math.floor(cy / TILE)];
      return row === undefined || row[Math.floor(cx / TILE)] !== false;
    });
    if (!blocked) this.player.setPosition(nx, ny);
  }

  private leave(): void {
    this.leaving = true;
    play('sign');
    const done = () => this.onExit();
    if (this.hooks.isCalm()) return done();
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', done);
  }
}
