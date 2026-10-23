import Phaser from 'phaser';
import type { Level } from '../exercises/types';
import type { ChapterDef, ThemeId } from '../content/types';
import { buildMap, terrainOf } from './layouts';
import { BLOCKING, MAP_H, MAP_W, type RegionMap, TILE, Tile, seedFor } from './map';
import { paintTerrain } from './terrain';
import { play } from '../audio/sound';
import { FACINGS, type Facing, makeTextures } from './textures';
import { THEMES, type Theme } from './themes';

/** Ce que la scène demande à l'interface (combats, dialogues), qui vit en dehors de Phaser. */
export interface WorldHooks {
  isBusy: () => boolean;
  encounter: (level: Level) => Promise<void>;
  talkToGuide: () => Promise<void>;
  approachBoss: () => Promise<void>;
  bossDefeated: () => boolean;
  /** Index du panneau dans `RegionMap.signs` : son texte dépend de la région. */
  readSign: (index: number) => Promise<void>;
  /** On passe la porte de la Maison du savoir : ses PNJ expliquent les notions de la région. */
  enterHouse: () => Promise<void>;
  /** Réglage « réduire les animations » (par défaut celui du système). */
  isCalm: () => boolean;
}

const SPEED = 150;
const ENCOUNTER_CHANCE = 0.12;


export class WorldScene extends Phaser.Scene {
  private map!: RegionMap;
  private player!: Phaser.GameObjects.Sprite;
  private guide!: Phaser.GameObjects.Sprite;
  private bubble!: Phaser.GameObjects.Image;
  private boss!: Phaser.GameObjects.Sprite;
  private grassSprites = new Map<string, Phaser.GameObjects.Sprite>();
  private leaves?: Phaser.GameObjects.Particles.ParticleEmitter;
  private dust?: Phaser.GameObjects.Particles.ParticleEmitter;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private grassWalked = 0;
  private dustWalked = 0;
  private lastTile = '';
  private cooldownUntil = 0;
  private encountering = false;
  /** Saut d'une corniche en cours : le joueur ne contrôle plus le personnage. */
  private jumping = false;
  private nearGuide = false;
  private nearBoss = false;
  private nearSign = -1;
  private nearHouse = false;
  private facing: Facing = 'down';
  /** Animations réduites : on garde le jeu, sans particules ni mouvements décoratifs. */
  private calm = false;
  private lavaSprites: Phaser.GameObjects.Sprite[] = [];
  private ambience: (Phaser.GameObjects.Particles.ParticleEmitter | Phaser.Tweens.Tween)[] = [];

  constructor(private hooks: WorldHooks) {
    super('world');
  }

  /** Carte de la région en cours (pour les répliques qui parlent du chemin). */
  get regionMap(): RegionMap | undefined {
    return this.map;
  }

  private chapter!: ChapterDef;
  private theme!: Theme;
  /** Préfixe des textures et animations du thème (« volcan-grass-0 »). */
  private t: ThemeId = 'volcan';

  /** La scène redémarre à chaque changement de région, avec le chapitre en paramètre. */
  init(data: { chapter: ChapterDef }): void {
    this.chapter = data.chapter;
    this.theme = THEMES[data.chapter.theme];
    this.t = data.chapter.theme;
    this.grassSprites = new Map();
    this.lavaSprites = [];
    this.ambience = [];
    this.leaves = undefined;
    this.dust = undefined;
    this.grassWalked = 0;
    this.dustWalked = 0;
    this.lastTile = '';
    this.encountering = false;
    this.jumping = false;
    this.nearGuide = false;
    this.nearBoss = false;
    this.nearSign = -1;
    this.nearHouse = false;
    this.facing = 'down';
  }

  create(): void {
    this.calm = this.hooks.isCalm();
    makeTextures(this, this.t, this.theme);
    this.makeAnimations();
    this.map = buildMap(seedFor(this.chapter.id), terrainOf(this.chapter));
    const { guide, arena, house } = this.map;
    this.drawTiles();

    const houseBottom = (house.y + 1) * TILE;
    this.add.image((house.x + 0.5) * TILE, houseBottom + 2, 'house').setOrigin(0.5, 1).setDepth(houseBottom);

    this.guide = this.add.sprite((guide.x + 0.5) * TILE, (guide.y + 0.75) * TILE, 'guide-0').setOrigin(0.5, 0.94);
    this.guide.play('guide-idle');
    this.guide.setDepth(this.guide.y);
    this.bubble = this.add.image(this.guide.x, this.guide.y - 30, 'bubble').setDepth(10_000);

    this.boss = this.add.sprite((arena.x + 0.5) * TILE, (arena.y + 0.75) * TILE, `${this.t}-boss-0`).setOrigin(0.5, 0.94);
    this.boss.play(`${this.t}-boss-idle`);
    this.boss.setDepth(this.boss.y);
    this.boss.setVisible(!this.hooks.bossDefeated());

    // En développement seulement : ?depart=40,20 place le personnage ailleurs, pour tester une zone.
    const debugStart = import.meta.env.DEV ? new URLSearchParams(location.search).get('depart')?.split(',').map(Number) : undefined;
    const start = debugStart?.length === 2 ? { x: debugStart[0], y: debugStart[1] } : this.map.start;
    this.player = this.add.sprite((start.x + 0.5) * TILE, (start.y + 0.5) * TILE, 'hero-down-idle-0').setOrigin(0.5, 0.92);
    this.player.play('hero-down-idle');

    if (!this.calm) this.addAmbience();

    const cam = this.cameras.main;
    cam.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    cam.startFollow(this.player, true, 0.15, 0.15);
    const fitZoom = () => cam.setZoom(Math.min(window.innerWidth, window.innerHeight) < 640 ? 1 : 1.5);
    fitZoom();
    this.scale.on('resize', fitZoom);
    this.events.once('shutdown', () => this.scale.off('resize', fitZoom));
    if (!this.calm) cam.fadeIn(600);

    // Sans capture : les touches restent utilisables dans les champs de réponse.
    this.keys = this.input.keyboard!.addKeys('UP,DOWN,LEFT,RIGHT,Z,Q,S,D,W,A,E,SPACE', false) as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;
  }

  private makeAnimations(): void {
    const frames = (prefix: string, n: number) =>
      Array.from({ length: n }, (_, i) => ({ key: `${prefix}-${i}` }));
    // Les animations sont globales : on ne crée que celles qui manquent (nouveau thème).
    const anim = (key: string, list: { key: string }[], frameRate: number) => {
      if (!this.anims.exists(key)) this.anims.create({ key, frames: list, frameRate, repeat: -1 });
    };
    for (const f of FACINGS) {
      anim(`hero-${f}-idle`, frames(`hero-${f}-idle`, 2), 2);
      anim(`hero-${f}-walk`, frames(`hero-${f}-walk`, 4), 9);
    }
    anim('guide-idle', frames('guide', 2), 1.5);
    anim(`${this.t}-boss-idle`, frames(`${this.t}-boss`, 2), 2);
    anim(`${this.t}-grass-sway`, [0, 1, 0, 2].map((i) => ({ key: `${this.t}-grass-${i}` })), 2);
    anim(`${this.t}-lava-bubble`, frames(`${this.t}-lava`, 3), 3);
  }

  /**
   * Le décor fixe est peint une fois dans une texture ; par-dessus, les objets en volume
   * (buissons, arbres, rochers, panneaux) sont triés par profondeur avec les personnages,
   * pour que l'on passe derrière eux.
   */
  private drawTiles(): void {
    paintTerrain(this, this.map.tiles, this.theme, this.map.raised).setDepth(-1);
    // Sur les grandes étendues (mer, archipel), une case de liquide sur deux suffit pour les remous.
    const liquid = this.map.tiles.flat().filter((t) => t === Tile.Lava).length;
    const sparse = liquid > 900;
    for (let y = 0; y < MAP_H; y++)
      for (let x = 0; x < MAP_W; x++) {
        const t = this.map.tiles[y][x];
        const px = x * TILE;
        const py = y * TILE;
        const bottom = py + TILE;
        if (t === Tile.Grass) {
          // Origine en bas pour que le buisson se plie depuis sa base quand on le traverse.
          const s = this.add.sprite(px + TILE / 2, bottom + 2, `${this.t}-grass-0`).setOrigin(0.5, 0.95).setDepth(bottom);
          if (!this.calm) s.play({ key: `${this.t}-grass-sway`, startFrame: (x + y) % 4 });
          this.grassSprites.set(`${x},${y}`, s);
        } else if (t === Tile.Lava && (!sparse || (x + y) % 2 === 0)) {
          const s = this.add.sprite(px, py, `${this.t}-lava-0`).setOrigin(0).setDepth(0);
          if (!this.calm) s.play({ key: `${this.t}-lava-bubble`, startFrame: (x * 7 + y * 3) % 3 });
          this.lavaSprites.push(s);
        } else if (t === Tile.Tree) {
          // En forêt dense, de grands arbres dont les feuillages se chevauchent.
          let around = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && this.map.tiles[y + dy]?.[x + dx] === Tile.Tree) around++;
          const big = around >= 3;
          const shift = big ? (((x * 7 + y * 13) % 5) - 2) * 1.5 : 0;
          this.add
            .image(px + TILE / 2 + shift, bottom - 2, (x * 3 + y * 5) % 4 === 0 ? `${this.t}-tree-1` : `${this.t}-tree-0`)
            .setOrigin(0.5, 0.92)
            .setScale(big ? 1.45 + ((x + y * 3) % 3) * 0.08 : 1)
            .setDepth(bottom);
        } else if (t === Tile.Boulder) {
          this.add.image(px + TILE / 2, py + TILE / 2, 'boulder').setDepth(bottom - 4);
        } else if (t === Tile.Sign) {
          this.add.image(px + TILE / 2, py + TILE / 2, 'sign').setDepth(bottom - 2);
        }
      }
  }

  /** Particules du thème (braises, bulles, flocons…), fumée de l'arène, bulle de la gardienne, souffle du gardien. */
  private addAmbience(): void {
    const tex = `${this.t}-particle`;
    const kind = this.theme.ambience;
    const random = (pick: (p: Phaser.Types.Math.Vector2Like) => void) =>
      ({
        type: 'random',
        source: {
          getRandomPoint: (point: Phaser.Types.Math.Vector2Like) => {
            pick(point);
            return point;
          },
        },
      }) as Phaser.Types.GameObjects.Particles.EmitZoneData;
    let particles: Phaser.GameObjects.Particles.ParticleEmitter;
    if (kind === 'embers' || kind === 'bubbles' || kind === 'sparkles' || kind === 'spray') {
      // Elles montent du liquide.
      const liquid: [number, number][] = [];
      this.map.tiles.forEach((row, y) => row.forEach((t, x) => t === Tile.Lava && liquid.push([x, y])));
      const slow = kind === 'bubbles';
      particles = this.add.particles(0, 0, tex, {
        emitZone: random((p) => {
          const [x, y] = liquid[Math.floor(Math.random() * liquid.length)];
          p.x = (x + Math.random()) * TILE;
          p.y = (y + Math.random()) * TILE;
        }),
        lifespan: slow ? { min: 600, max: 1200 } : { min: 900, max: 1900 },
        speedY: slow ? { min: -12, max: -4 } : kind === 'spray' ? { min: -60, max: -30 } : { min: -45, max: -15 },
        speedX: { min: -10, max: 10 },
        scale: slow ? { start: 0.4, end: 1.1 } : { start: 0.9, end: 0 },
        alpha: { start: 1, end: 0 },
        frequency: slow ? 60 : 25,
        blendMode: kind === 'bubbles' ? Phaser.BlendModes.NORMAL : Phaser.BlendModes.ADD,
      });
    } else {
      // Elles flottent dans tout le champ de vision : neige, feuilles, poussière, lucioles, papillons.
      const view = this.cameras.main.worldView;
      const falling = kind === 'snow' || kind === 'leaves';
      particles = this.add.particles(0, 0, kind === 'leaves' ? `${this.t}-leaf` : tex, {
        emitZone: random((p) => {
          p.x = view.x + Math.random() * view.width;
          p.y = view.y + Math.random() * view.height * (falling ? 0.6 : 1);
        }),
        lifespan: { min: 2500, max: 4500 },
        speedY: falling ? { min: 18, max: 45 } : { min: -8, max: 8 },
        speedX: kind === 'dust' ? { min: 25, max: 60 } : { min: -14, max: 14 },
        rotate: kind === 'leaves' ? { min: 0, max: 360 } : 0,
        scale: kind === 'snow' ? { min: 0.4, max: 1 } : kind === 'dust' ? { start: 1.2, end: 0.2 } : { min: 0.5, max: 0.9 },
        alpha: kind === 'fireflies' ? { values: [0, 1, 0.2, 1, 0] } : { start: 0.9, end: 0 },
        frequency: kind === 'snow' ? 40 : kind === 'dust' ? 90 : 160,
        blendMode: kind === 'fireflies' ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL,
      });
    }
    particles.setDepth(9_000);
    this.ambience = [particles];

    if (this.theme.smoke)
      this.ambience.push(
        this.add
          .particles((this.map.arena.x + 0.5) * TILE, (this.map.arena.y - 1) * TILE, 'smoke', {
            x: { min: -40, max: 40 },
            lifespan: 3000,
            speedY: { min: -30, max: -12 },
            speedX: { min: -6, max: 6 },
            scale: { start: 0.6, end: 2.2 },
            alpha: { start: 0.45, end: 0 },
            frequency: 260,
          })
          .setDepth(9_001),
      );

    this.leaves = this.add
      .particles(0, 0, `${this.t}-leaf`, {
        speed: { min: 30, max: 70 },
        angle: { min: 220, max: 320 },
        gravityY: 160,
        lifespan: 450,
        scale: { start: 1, end: 0.4 },
        emitting: false,
      })
      .setDepth(9_002);

    this.dust = this.add
      .particles(0, 0, 'dust', {
        speed: { min: 8, max: 22 },
        angle: { min: 180, max: 360 },
        lifespan: 380,
        scale: { start: 0.9, end: 0.2 },
        alpha: { start: 0.7, end: 0 },
        emitting: false,
      })
      .setDepth(5);

    this.ambience.push(
      this.tweens.add({ targets: this.bubble, y: this.bubble.y - 5, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' }),
      this.tweens.add({ targets: this.boss, scaleX: 1.04, scaleY: 0.97, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' }),
    );
  }

  /** Change le réglage en cours de partie : le décor s'arrête ou reprend vie sans recharger. */
  setCalm(calm: boolean): void {
    if (!this.player || calm === this.calm) return;
    this.calm = calm;
    this.grassSprites.forEach((s, key) => {
      const [x, y] = key.split(',').map(Number);
      if (calm) s.stop().setTexture(`${this.t}-grass-0`);
      else s.play({ key: `${this.t}-grass-sway`, startFrame: (x + y) % 4 });
    });
    this.lavaSprites.forEach((s) => (calm ? s.stop().setTexture(`${this.t}-lava-0`) : s.play(`${this.t}-lava-bubble`)));
    if (!calm && this.ambience.length === 0) return this.addAmbience();
    for (const a of this.ambience) {
      if (a instanceof Phaser.Tweens.Tween) {
        if (calm) a.pause();
        else a.resume();
      } else {
        a.setVisible(!calm);
        if (calm) a.stop();
        else a.start();
      }
    }
  }

  update(_time: number, deltaMs: number): void {
    this.player.setDepth(this.player.y);
    if (this.jumping) return;
    if (this.hooks.isBusy() || this.encountering) {
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
      if (Math.hypot(vx, vy) > 8) {
        dx = vx;
        dy = vy;
      }
    }

    let moved = 0;
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      // On monte et descend les escaliers moins vite.
      const onStairs = this.map.tiles[Math.floor(this.player.y / TILE)]?.[Math.floor(this.player.x / TILE)] === Tile.Stairs;
      const step = (SPEED * (onStairs ? 0.65 : 1) * deltaMs) / 1000;
      const before = { x: this.player.x, y: this.player.y };
      this.tryMove((dx / len) * step, 0);
      this.tryMove(0, (dy / len) * step);
      this.facing = Math.abs(dx) > Math.abs(dy) ? 'side' : dy < 0 ? 'up' : 'down';
      if (this.facing === 'down' && this.player.y === before.y && this.tryJump()) return;
      // Le profil est dessiné tourné vers la droite.
      this.player.setFlipX(this.facing === 'side' && dx < 0);
      moved = Math.hypot(this.player.x - before.x, this.player.y - before.y);
    }
    this.player.play(`hero-${this.facing}-${moved > 0 ? 'walk' : 'idle'}`, true);
    if (moved > 0) this.afterStep(moved);

    this.checkNpcs(Phaser.Input.Keyboard.JustDown(k.E) || Phaser.Input.Keyboard.JustDown(k.SPACE));
  }

  private tryMove(mx: number, my: number): void {
    const nx = this.player.x + mx;
    const ny = this.player.y + my;
    if (!this.blockedAt(nx, ny)) this.player.setPosition(nx, ny);
  }

  /** Les quatre coins de la boîte de collision, aux pieds du personnage. */
  private blockedAt(nx: number, ny: number): boolean {
    return [
      [nx - 8, ny - 6],
      [nx + 8, ny - 6],
      [nx - 8, ny + 2],
      [nx + 8, ny + 2],
    ].some(([cx, cy]) => {
      const t = this.map.tiles[Math.floor(cy / TILE)]?.[Math.floor(cx / TILE)];
      return t === undefined || BLOCKING.has(t);
    });
  }

  /**
   * Bloqué en marchant vers le sud devant une corniche : on saute par-dessus et l'on atterrit
   * sur la case d'en dessous. On ne peut pas la franchir dans l'autre sens.
   */
  private tryJump(): boolean {
    const ledgeY = Math.floor((this.player.y + 6) / TILE);
    const col = Math.floor(this.player.x / TILE);
    if (this.map.tiles[ledgeY]?.[col] !== Tile.Ledge) return false;
    const landY = (ledgeY + 1) * TILE + 16;
    let landX = this.player.x;
    if (this.blockedAt(landX, landY)) landX = (col + 0.5) * TILE;
    if (this.blockedAt(landX, landY)) return false;

    this.jumping = true;
    play('jump');
    const from = { x: this.player.x, y: this.player.y };
    const shadow = this.add.ellipse(from.x, from.y, 20, 7, 0x000000, 0.3).setDepth(from.y - 1);
    this.player.play('hero-down-walk', true);
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 380,
      onUpdate: (tw) => {
        const t = tw.getValue() ?? 0;
        const x = from.x + (landX - from.x) * t;
        const y = from.y + (landY - from.y) * t;
        shadow.setPosition(x, y);
        this.player.setPosition(x, y - Math.sin(Math.PI * t) * 18);
        this.player.setDepth(y + TILE);
      },
      onComplete: () => {
        shadow.destroy();
        this.player.setPosition(landX, landY);
        this.player.play('hero-down-idle', true);
        if (!this.calm) this.dust?.explode(6, landX, landY);
        this.lastTile = '';
        this.jumping = false;
      },
    });
    return true;
  }

  private afterStep(moved: number): void {
    const tx = Math.floor(this.player.x / TILE);
    const ty = Math.floor(this.player.y / TILE);
    const key = `${tx},${ty}`;
    const zone = this.map.zoneAt(tx, ty);

    if (key !== this.lastTile) {
      this.lastTile = key;
      if (zone) {
        play('rustle');
        this.rustle(key);
      }
    }
    if (!zone) {
      this.dustWalked += moved;
      if (this.dustWalked > 22) {
        this.dustWalked = 0;
        if (!this.calm) this.dust?.explode(2, this.player.x, this.player.y);
      }
    }

    if (!zone || this.time.now < this.cooldownUntil) return;
    this.grassWalked += moved;
    if (this.grassWalked < TILE) return;
    this.grassWalked -= TILE;
    if (Math.random() < ENCOUNTER_CHANCE) {
      this.grassWalked = 0;
      void this.startEncounter(zone.level);
    }
  }

  /** L'herbe se plie et lâche quelques brins quand on la traverse. */
  private rustle(key: string): void {
    const s = this.grassSprites.get(key);
    if (!s || this.calm) return;
    this.tweens.add({ targets: s, scaleY: 0.75, angle: Phaser.Math.Between(-12, 12), duration: 90, yoyo: true, ease: 'Quad.out' });
    this.leaves?.explode(4, s.x, s.y - TILE / 2);
  }

  /** Transition avant le combat : l'écran tremble, flashe et zoome brièvement. */
  private async startEncounter(level: Level): Promise<void> {
    this.encountering = true;
    play('encounter');
    const cam = this.cameras.main;
    if (!this.calm) {
      const zoom = cam.zoom;
      cam.shake(300, 0.006);
      cam.flash(300, 255, 255, 255);
      cam.zoomTo(zoom * 1.25, 300, 'Quad.easeIn');
      await new Promise((r) => this.time.delayedCall(320, r));
      cam.zoomTo(zoom, 200);
    }
    await this.hooks.encounter(level);
    this.encountering = false;
    this.cooldownUntil = this.time.now + 1500;
  }

  private checkNpcs(interact: boolean): void {
    const guideDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.guide.x, this.guide.y);
    const near = guideDist < 44;
    if ((near && !this.nearGuide) || (near && interact)) {
      this.bubble.setVisible(false);
      void this.hooks.talkToGuide();
    }
    this.nearGuide = near;

    const sign = this.map.signs.findIndex(
      (sp) => Phaser.Math.Distance.Between(this.player.x, this.player.y, (sp.x + 0.5) * TILE, (sp.y + 0.5) * TILE) < 40,
    );
    if (sign >= 0 && (sign !== this.nearSign || interact)) void this.hooks.readSign(sign);
    this.nearSign = sign;

    // Devant la porte de la maison : on entre.
    const door = this.map.house;
    const nearHouse = Phaser.Math.Distance.Between(this.player.x, this.player.y, (door.x + 0.5) * TILE, (door.y + 1) * TILE) < 26;
    if ((nearHouse && !this.nearHouse) || (nearHouse && interact)) void this.hooks.enterHouse();
    this.nearHouse = nearHouse;

    if (!this.boss.visible || !this.boss.active) return;
    const bossNear = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y) < 40;
    if ((bossNear && !this.nearBoss) || (bossNear && interact)) {
      if (!this.calm) this.cameras.main.shake(250, 0.004);
      void this.hooks.approachBoss().then(() => {
        if (this.hooks.bossDefeated()) this.defeatBoss();
      });
    }
    this.nearBoss = bossNear;
  }

  /** Le gardien vaincu tourne sur lui-même et disparaît dans un nuage d'étincelles. */
  private defeatBoss(): void {
    this.boss.active = false;
    if (this.calm) {
      this.boss.setVisible(false);
      return;
    }
    this.add
      .particles(this.boss.x, this.boss.y - 20, 'spark', {
        speed: { min: 60, max: 160 },
        lifespan: 700,
        scale: { start: 1, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      })
      .setDepth(10_001)
      .explode(30);
    this.tweens.killTweensOf(this.boss);
    this.tweens.add({
      targets: this.boss,
      angle: 360,
      scale: 0,
      alpha: 0,
      duration: 900,
      ease: 'Back.in',
      onComplete: () => this.boss.setVisible(false),
    });
  }
}
