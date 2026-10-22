import Phaser from 'phaser';
import type { Level } from '../exercises/types';
import { BLOCKING, CRATER, GUIDE, MAP_H, MAP_W, type RegionMap, START, TILE, Tile, buildMap } from './map';

/** Ce que la scène demande à l'interface (combats, dialogues), qui vit en dehors de Phaser. */
export interface WorldHooks {
  isBusy: () => boolean;
  encounter: (zoneCreatures: string[], level: Level) => Promise<void>;
  talkToGuide: () => Promise<void>;
  approachBoss: () => Promise<void>;
  bossDefeated: () => boolean;
}

const SPEED = 150;
const ENCOUNTER_CHANCE = 0.12;
const TILE_TEXTURES: Record<Tile, string> = {
  [Tile.Ground]: 'ground',
  [Tile.Grass]: 'grass',
  [Tile.Rock]: 'rock',
  [Tile.Lava]: 'lava',
  [Tile.Path]: 'path',
  [Tile.Crater]: 'crater',
  [Tile.Bridge]: 'bridge',
};

export class WorldScene extends Phaser.Scene {
  private map!: RegionMap;
  private player!: Phaser.GameObjects.Image;
  private boss!: Phaser.GameObjects.Image;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private grassWalked = 0;
  private cooldownUntil = 0;
  private nearGuide = false;
  private nearBoss = false;

  constructor(private hooks: WorldHooks) {
    super('world');
  }

  create(): void {
    this.makeTextures();
    this.map = buildMap();
    for (let y = 0; y < MAP_H; y++)
      for (let x = 0; x < MAP_W; x++)
        this.add.image(x * TILE, y * TILE, TILE_TEXTURES[this.map.tiles[y][x]]).setOrigin(0);

    this.add.image((GUIDE.x + 0.5) * TILE, (GUIDE.y + 0.5) * TILE, 'guide').setOrigin(0.5, 0.75);
    this.boss = this.add.image((CRATER.x + 0.5) * TILE, (CRATER.y + 0.5) * TILE, 'boss').setOrigin(0.5, 0.75);
    this.refreshBoss();
    this.player = this.add.image((START.x + 0.5) * TILE, (START.y + 0.5) * TILE, 'hero').setOrigin(0.5, 0.85);
    this.player.setDepth(10);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    cam.startFollow(this.player, true, 0.15, 0.15);
    const fitZoom = () => cam.setZoom(Math.min(window.innerWidth, window.innerHeight) < 640 ? 1 : 1.5);
    fitZoom();
    this.scale.on('resize', fitZoom);

    // Sans capture : les touches restent utilisables dans les champs de réponse.
    this.keys = this.input.keyboard!.addKeys('UP,DOWN,LEFT,RIGHT,Z,Q,S,D,W,A,E,SPACE', false) as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;
  }

  /** Cache le gardien une fois battu. */
  refreshBoss(): void {
    this.boss.setVisible(!this.hooks.bossDefeated());
  }

  update(_time: number, deltaMs: number): void {
    if (this.hooks.isBusy()) {
      this.input.keyboard!.resetKeys();
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
      if (Math.hypot(vx, vy) > 8) {
        dx = vx;
        dy = vy;
      }
    }

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      const step = (SPEED * deltaMs) / 1000;
      const before = { x: this.player.x, y: this.player.y };
      this.tryMove((dx / len) * step, 0);
      this.tryMove(0, (dy / len) * step);
      if (dx < 0) this.player.setFlipX(true);
      else if (dx > 0) this.player.setFlipX(false);
      this.afterStep(Math.hypot(this.player.x - before.x, this.player.y - before.y));
    }

    this.checkNpcs(Phaser.Input.Keyboard.JustDown(k.E) || Phaser.Input.Keyboard.JustDown(k.SPACE));
  }

  private tryMove(mx: number, my: number): void {
    const nx = this.player.x + mx;
    const ny = this.player.y + my;
    // Boîte de collision aux pieds du personnage.
    const corners = [
      [nx - 8, ny - 6],
      [nx + 8, ny - 6],
      [nx - 8, ny + 2],
      [nx + 8, ny + 2],
    ];
    const blocked = corners.some(([cx, cy]) => {
      const t = this.map.tiles[Math.floor(cy / TILE)]?.[Math.floor(cx / TILE)];
      return t === undefined || BLOCKING.has(t);
    });
    if (!blocked) this.player.setPosition(nx, ny);
  }

  private afterStep(moved: number): void {
    const tx = Math.floor(this.player.x / TILE);
    const ty = Math.floor(this.player.y / TILE);
    const zone = this.map.zoneAt(tx, ty);
    if (!zone || this.time.now < this.cooldownUntil) return;
    this.grassWalked += moved;
    if (this.grassWalked < TILE) return;
    this.grassWalked -= TILE;
    if (Math.random() < ENCOUNTER_CHANCE) {
      this.grassWalked = 0;
      this.cameras.main.flash(250, 255, 255, 255);
      void this.hooks.encounter(zone.creatures, zone.level).then(() => {
        this.cooldownUntil = this.time.now + 1500;
      });
    }
  }

  private checkNpcs(interact: boolean): void {
    const guideDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, (GUIDE.x + 0.5) * TILE, (GUIDE.y + 0.5) * TILE);
    const near = guideDist < 44;
    if ((near && !this.nearGuide) || (near && interact)) void this.hooks.talkToGuide();
    this.nearGuide = near;

    if (!this.boss.visible) return;
    const bossNear = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y) < 40;
    if ((bossNear && !this.nearBoss) || (bossNear && interact))
      void this.hooks.approachBoss().then(() => this.refreshBoss());
    this.nearBoss = bossNear;
  }

  /** Dessine toutes les textures du jeu : aucun fichier d'image n'est nécessaire. */
  private makeTextures(): void {
    const g = this.add.graphics();
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
    const tile = (key: string, draw: () => void) => {
      g.clear();
      draw();
      g.generateTexture(key, TILE, TILE);
    };

    tile('ground', () => {
      g.fillStyle(0x5b4a43).fillRect(0, 0, TILE, TILE);
      speckle(1, 0x6d5a52, 10, 2);
      speckle(2, 0x4a3c36, 6, 2);
    });
    tile('grass', () => {
      g.fillStyle(0x5c7f2e).fillRect(0, 0, TILE, TILE);
      g.lineStyle(2, 0x86a83f);
      for (let i = 0; i < 6; i++) {
        const x = 3 + i * 5;
        g.lineBetween(x, 28, x + 2, 14 + (i % 3) * 3);
      }
      speckle(3, 0x3f5b1f, 6, 2);
    });
    tile('rock', () => {
      g.fillStyle(0x5b4a43).fillRect(0, 0, TILE, TILE);
      g.fillStyle(0x2f2826).fillRoundedRect(2, 4, 28, 26, 8);
      g.fillStyle(0x4a403c).fillRoundedRect(6, 6, 16, 10, 5);
    });
    tile('lava', () => {
      g.fillStyle(0xd9480f).fillRect(0, 0, TILE, TILE);
      g.fillStyle(0xff922b).fillCircle(9, 10, 5).fillCircle(24, 22, 6);
      g.fillStyle(0xffd43b).fillCircle(9, 10, 2).fillCircle(24, 22, 2);
    });
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

    g.clear();
    g.fillStyle(0x000000, 0.25).fillEllipse(12, 27, 18, 6);
    g.fillStyle(0x1c7ed6).fillRoundedRect(5, 12, 14, 13, 4);
    g.fillStyle(0xffd8a8).fillCircle(12, 8, 6);
    g.fillStyle(0x5c3a1a).fillRect(6, 1, 12, 4);
    g.fillStyle(0x212529).fillRect(13, 7, 2, 2);
    g.fillStyle(0xfab005).fillRect(4, 14, 3, 8);
    g.generateTexture('hero', 24, 30);

    g.clear();
    g.fillStyle(0x000000, 0.25).fillEllipse(12, 27, 18, 6);
    g.fillStyle(0x2b8a3e).fillTriangle(12, 8, 3, 27, 21, 27);
    g.fillStyle(0xffd8a8).fillCircle(12, 8, 6);
    g.fillStyle(0xf8f9fa).fillRect(6, 1, 12, 4);
    g.generateTexture('guide', 24, 30);

    g.clear();
    g.fillStyle(0x000000, 0.3).fillEllipse(24, 54, 40, 10);
    g.fillStyle(0x495057).fillRoundedRect(8, 14, 32, 38, 8);
    g.fillStyle(0x343a40).fillRoundedRect(13, 2, 22, 16, 5);
    g.fillStyle(0xff6b6b).fillCircle(19, 10, 2.5).fillCircle(29, 10, 2.5);
    g.lineStyle(3, 0xff922b);
    g.beginPath();
    g.arc(24, 22, 10, 0.2, Math.PI - 0.2);
    g.strokePath();
    g.generateTexture('boss', 48, 58);
    g.destroy();
  }
}
