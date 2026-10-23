import Phaser from 'phaser';
import type { ChapterDef } from '../content/types';
import { play } from '../audio/sound';
import { teacherSvg, teachersOf } from '../ui/house';
import { creatureSvg } from './creatureArt';
import { TILE } from './map';
import type { Facing } from './textures';
import { ROOM_DOOR, ROOM_H, ROOM_W, SAGE, WALL, npcSpots, roomBlocking } from './room';

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
  private blocking: boolean[][] = [];
  private npcs: { x: number; y: number }[] = [];
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
    this.npcs = npcSpots(teachers.length);
    this.drawRoom();

    teachers.forEach((t, i) => {
      const spot = this.npcs[i];
      const px = (spot.x + 0.5) * TILE;
      const feet = (spot.y + 0.9) * TILE;
      const key = `npc-${this.chapter.id}-${i}`;
      const petKey = `pet-${this.chapter.id}-${i}`;
      const place = () => {
        this.add.image(px, feet, key).setOrigin(0.5, 1).setDepth(feet);
        if (t.creature && this.textures.exists(petKey)) this.add.image(px + 24, feet + 2, petKey).setOrigin(0.5, 1).setDepth(feet + 1);
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
        .text(px, (spot.y - 0.75) * TILE, t.name, { fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#fffaf3', backgroundColor: '#2b2220cc', padding: { x: 4, y: 2 } })
        .setOrigin(0.5, 1)
        .setResolution(3)
        .setDepth(10_000);
      if (!t.creature) label.setBackgroundColor('#b8860bdd');
      const bubble = this.add.image(px, label.y - 16, 'bubble').setDepth(10_001);
      this.bubbles.push(bubble);
      if (!this.hooks.isCalm()) this.tweens.add({ targets: bubble, y: bubble.y - 4, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: i * 80 });
    });

    this.player = this.add.sprite((ROOM_DOOR.x + 0.5) * TILE, (ROOM_H - 1.6) * TILE, 'hero-up-idle-0').setOrigin(0.5, 0.92);
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

  /** Plancher, mur du fond (fenêtres, tableau, bibliothèques), tapis, pupitres, plantes et porte. */
  private drawRoom(): void {
    const g = this.add.graphics().setDepth(-1);
    const W = ROOM_W * TILE;
    const H = ROOM_H * TILE;
    const outline = 0x2b1d16;
    // Plancher en lattes.
    g.fillStyle(0xb07a4a).fillRect(0, 0, W, H);
    for (let y = WALL; y < ROOM_H; y++) {
      for (let x = 0; x < ROOM_W * 2; x++) {
        const shift = (y % 2) * 16;
        const px = x * 16 + shift - 16;
        g.fillStyle((x * 7 + y * 3) % 5 === 0 ? 0xa36d3f : 0xb98352).fillRect(Math.max(0, px), y * TILE + 1, Math.min(15, px + 15), TILE - 2);
      }
    }
    g.fillStyle(0x000000, 0.18).fillRect(TILE, WALL * TILE, W - 2 * TILE, 10);
    // Tapis central.
    g.fillStyle(outline).fillRoundedRect(5 * TILE - 2, 6.6 * TILE - 2, 7 * TILE + 4, 3.4 * TILE + 4, 10);
    g.fillStyle(0x1c7ed6).fillRoundedRect(5 * TILE, 6.6 * TILE, 7 * TILE, 3.4 * TILE, 8);
    g.lineStyle(3, 0xfab005).strokeRoundedRect(5 * TILE + 8, 6.6 * TILE + 8, 7 * TILE - 16, 3.4 * TILE - 16, 6);
    g.fillStyle(0xfab005).fillCircle(8.5 * TILE, 8.3 * TILE, 10);
    g.fillStyle(0x1c7ed6).fillCircle(8.5 * TILE, 8.3 * TILE, 6);
    // Mur du fond, en volume : plinthe et rebord sombres.
    g.fillStyle(0xf1e3c4).fillRect(0, 0, W, WALL * TILE);
    g.fillStyle(0xd9c59c).fillRect(0, 0, W, 10);
    g.fillStyle(0x8b5a2b).fillRect(0, WALL * TILE - 10, W, 10);
    g.fillStyle(0x6d4422).fillRect(0, WALL * TILE - 3, W, 3);
    // Bibliothèques à gauche et à droite.
    const shelf = (x0: number) => {
      g.fillStyle(outline).fillRect(x0 - 2, 6, 3 * TILE + 4, WALL * TILE - 12);
      g.fillStyle(0x7a4e2d).fillRect(x0, 8, 3 * TILE, WALL * TILE - 16);
      const colors = [0xc92a2a, 0x2f9e44, 0x1c7ed6, 0xfab005, 0x7048e8, 0xe8590c];
      for (let row = 0; row < 3; row++) {
        const y = 12 + row * 26;
        g.fillStyle(0x5c3a1a).fillRect(x0 + 2, y + 22, 3 * TILE - 4, 3);
        for (let k = 0; k < 11; k++) {
          const bh = 14 + ((k * 5 + row * 3) % 3) * 3;
          g.fillStyle(colors[(k + row * 2) % colors.length]).fillRect(x0 + 4 + k * 8, y + 22 - bh, 6, bh);
        }
      }
    };
    shelf(TILE * 1);
    shelf(W - TILE * 4);
    // Fenêtres.
    for (const wx of [4.6 * TILE, 10.6 * TILE]) {
      g.fillStyle(outline).fillRect(wx - 2, 14, 54, 44);
      g.fillStyle(0x9ad0f5).fillRect(wx, 16, 50, 40);
      g.fillStyle(0xd0ebff).fillRect(wx + 4, 20, 14, 10);
      g.fillStyle(0x7a4e2d).fillRect(wx + 24, 16, 2, 40).fillRect(wx, 35, 50, 2).fillRect(wx - 4, 56, 58, 5);
    }
    // Tableau noir avec le titre du chapitre.
    g.fillStyle(outline).fillRect(6.9 * TILE - 2, 10, 3.2 * TILE + 4, 2 * TILE + 4);
    g.fillStyle(0x8b5a2b).fillRect(6.9 * TILE, 12, 3.2 * TILE, 2 * TILE);
    g.fillStyle(0x2b4a3a).fillRect(6.9 * TILE + 4, 16, 3.2 * TILE - 8, 2 * TILE - 8);
    this.add
      .text(8.5 * TILE, 12 + TILE, this.chapter.title, {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#f1f3f5',
        align: 'center',
        wordWrap: { width: 3.2 * TILE - 14 },
      })
      .setOrigin(0.5)
      .setResolution(3)
      .setDepth(0);
    // Murs de côté et mur du bas, avec la porte.
    g.fillStyle(0x8b5a2b).fillRect(0, WALL * TILE, TILE / 2, H - WALL * TILE).fillRect(W - TILE / 2, WALL * TILE, TILE / 2, H - WALL * TILE);
    g.fillStyle(0x6d4422).fillRect(0, H - TILE / 2, W, TILE / 2);
    g.fillStyle(0x3b2414).fillRect(ROOM_DOOR.x * TILE, H - TILE / 2, TILE, TILE / 2);
    g.fillStyle(0xe9dcc5).fillRect(ROOM_DOOR.x * TILE + 4, H - TILE - 2, TILE - 8, 6);
    // Pupitres devant les spécialistes.
    for (const s of this.npcs.slice(0, -1)) {
      const x = s.x * TILE;
      const y = (s.y + 1) * TILE;
      const desk = this.add.graphics().setDepth(y + TILE);
      desk.fillStyle(outline).fillRect(x - 6, y + 2, TILE + 12, TILE - 6);
      desk.fillStyle(0x8b5a2b).fillRect(x - 4, y + 4, TILE + 8, 12);
      desk.fillStyle(0x6d4422).fillRect(x - 4, y + 16, TILE + 8, 8);
      desk.fillStyle(0xfff8e1).fillRect(x + 6, y + 5, 18, 8);
      desk.fillStyle(0x1c7ed6).fillRect(x + 14, y + 5, 2, 8);
    }
    // Lutrin du sage.
    const sx = (SAGE.x + 0.5) * TILE;
    const sy = (SAGE.y + 1.2) * TILE;
    const lectern = this.add.graphics().setDepth(sy + 8);
    lectern.fillStyle(outline).fillRect(sx - 12, sy - 2, 24, 14);
    lectern.fillStyle(0x8b5a2b).fillRect(sx - 10, sy, 20, 10);
    // Plantes dans les coins.
    for (const [x, y] of [[1, WALL], [ROOM_W - 2, WALL], [1, ROOM_H - 2], [ROOM_W - 2, ROOM_H - 2]]) {
      const px = (x + 0.5) * TILE;
      const py = (y + 1) * TILE;
      const plant = this.add.graphics().setDepth(py);
      plant.fillStyle(0x000000, 0.25).fillEllipse(px, py - 2, 24, 7);
      plant.fillStyle(outline).fillRect(px - 9, py - 16, 18, 15);
      plant.fillStyle(0xc0582b).fillRect(px - 7, py - 14, 14, 12);
      plant.fillStyle(0x2b8a3e).fillCircle(px, py - 24, 10).fillCircle(px - 8, py - 18, 7).fillCircle(px + 8, py - 18, 7);
      plant.fillStyle(0x51cf66).fillCircle(px - 3, py - 27, 4);
    }
  }

  update(_time: number, deltaMs: number): void {
    this.player.setDepth(this.player.y);
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
    const near = this.npcs.findIndex((s) => {
      // On parle au spécialiste depuis l'avant de son pupitre, ou sur les côtés ; au sage, devant lui.
      const cx = (s.x + 0.5) * TILE;
      const cy = (s.y + 0.9) * TILE;
      return Math.abs(this.player.x - cx) < 40 && Math.abs(this.player.y - cy) < (s === SAGE ? 40 : 64);
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
