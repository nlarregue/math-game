import { Scene } from 'phaser';
import { gameState } from '../utils/SaveManager';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        const W = this.scale.width, H = this.scale.height;

        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a0f);
        bg.fillRect(0, 0, W, H);

        this.add.text(W / 2, H / 2 - 40, 'Chargement...', {
            fontFamily: 'serif', fontSize: '22px', color: '#f4c430'
        }).setOrigin(0.5);

        const barBg = this.add.graphics();
        barBg.fillStyle(0x333333);
        barBg.fillRect(W / 2 - 160, H / 2, 320, 16);

        const barFill = this.add.graphics();
        this.load.on('progress', (p) => {
            barFill.clear();
            barFill.fillStyle(0xf4c430);
            barFill.fillRect(W / 2 - 160, H / 2, 320 * p, 16);
        });

        // ── Sorcier ──────────────────────────────────────────────
        const FW = 231, FH = 190;
        this.load.spritesheet('wizard-idle',   'assets/sprites/Wizard/Idle.png',    { frameWidth: FW, frameHeight: FH });
        this.load.spritesheet('wizard-run',    'assets/sprites/Wizard/Run.png',     { frameWidth: FW, frameHeight: FH });
        this.load.spritesheet('wizard-attack', 'assets/sprites/Wizard/Attack1.png', { frameWidth: FW, frameHeight: FH });
        this.load.spritesheet('wizard-hit',    'assets/sprites/Wizard/Hit.png',     { frameWidth: FW, frameHeight: FH });
        this.load.spritesheet('wizard-death',  'assets/sprites/Wizard/Death.png',   { frameWidth: FW, frameHeight: FH });

        // ── Monstres ─────────────────────────────────────────────
        this.load.spritesheet('slime',   'assets/sprites/Monsters/slime waterB sheet.png', { frameWidth: 300, frameHeight: 270 });
        this.load.spritesheet('goblin',  'assets/sprites/Monsters/goblin sheet.png',       { frameWidth: 300, frameHeight: 180 });
        this.load.spritesheet('bat',     'assets/sprites/Monsters/Bat_0000_dark.png',      { frameWidth: 270, frameHeight: 150 });
        this.load.spritesheet('orc',     'assets/sprites/Monsters/kobold_0000_red.png',    { frameWidth: 300, frameHeight: 180 });
        this.load.spritesheet('vampire',  'assets/sprites/vampire-pixel-art-sprite/Converted_Vampire/Idle.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('vampire-run', 'assets/sprites/vampire-pixel-art-sprite/Converted_Vampire/Run.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('skeleton', 'assets/sprites/Skeleton enemy/Skeleton enemy.png', { frameWidth: 64, frameHeight: 64 });

        // ── Décors ───────────────────────────────────────────────
        this.load.image('wizard-tower',     'assets/wizard-tower.png');
        this.load.image('fantasy-library', 'assets/mystical-house.png');
        this.load.image('bg-forest',   'assets/sprites/Free Pixel Art Forest/Preview/Background.png');
        this.load.image('bg-chateau',  'assets/sprites/Pixel-Art-Battlegrounds/PNG/Battleground2/Bright/Battleground2.png');
        this.load.image('bg-montagne', 'assets/sprites/Pixel-Art-Battlegrounds/PNG/Battleground1/Bright/Battleground1.png');
        this.load.image('bg-boss',     'assets/sprites/Pixel-Art-Battlegrounds/PNG/Battleground4/Bright/Battleground4.png');
        this.load.image('bg-hub',      'assets/sprites/Pixel-Art-Battlegrounds/PNG/Battleground3/Bright/Battleground3.png');
    }

    create() {
        this.createAnimations();
        if (gameState.data.introDone) {
            this.scene.start('Hub');
        } else {
            this.scene.start('Intro');
        }
    }

    createAnimations() {
        // Sorcier
        this.anims.create({ key: 'wizard-idle',   frames: this.anims.generateFrameNumbers('wizard-idle',   { start: 0, end: 5 }), frameRate: 8,  repeat: -1 });
        this.anims.create({ key: 'wizard-run',    frames: this.anims.generateFrameNumbers('wizard-run',    { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'wizard-attack', frames: this.anims.generateFrameNumbers('wizard-attack', { start: 0, end: 7 }), frameRate: 12, repeat: -1 });
        this.anims.create({ key: 'wizard-hit',    frames: this.anims.generateFrameNumbers('wizard-hit',    { start: 0, end: 3 }), frameRate: 10, repeat: 0  });
        this.anims.create({ key: 'wizard-death',  frames: this.anims.generateFrameNumbers('wizard-death',  { start: 0, end: 6 }), frameRate: 8,  repeat: 0  });

        // Slime : 9 frames/ligne × 3 lignes → ligne 0 = idle
        this.anims.create({ key: 'slime-idle', frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 8 }), frameRate: 8, repeat: -1 });

        // Goblin : 9 frames/ligne × 5 lignes → ligne 0 = idle, ligne 1 = walk
        this.anims.create({ key: 'goblin-idle', frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 8 }), frameRate: 8, repeat: -1 });

        // Chauve-souris : 5 frames/ligne × 6 lignes → ligne 0 = vol
        this.anims.create({ key: 'bat-fly', frames: this.anims.generateFrameNumbers('bat', { start: 0, end: 4 }), frameRate: 10, repeat: -1 });

        // Orc (kobold) : 9 frames/ligne × 6 lignes → ligne 0 = idle
        this.anims.create({ key: 'orc-idle', frames: this.anims.generateFrameNumbers('orc', { start: 0, end: 8 }), frameRate: 8, repeat: -1 });

        // Vampire : 128×128 px/frame — Idle 5 frames, Run 8 frames
        this.anims.create({ key: 'vampire-idle', frames: this.anims.generateFrameNumbers('vampire',     { start: 0, end: 4 }), frameRate: 8,  repeat: -1 });
        this.anims.create({ key: 'vampire-run',  frames: this.anims.generateFrameNumbers('vampire-run', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });

        // Skeleton : 64×64 px/frame, 13 cols × 5 rows — rangée 0 (frames 0-12)
        const skeletonTex = this.textures.get('skeleton');
        const skeletonFrames = skeletonTex ? skeletonTex.frameTotal : 0;
        if (skeletonFrames > 12) {
            this.anims.create({ key: 'skeleton-idle', frames: this.anims.generateFrameNumbers('skeleton', { start: 0, end: 12 }), frameRate: 8, repeat: -1 });
        } else {
            console.warn('[Preloader] skeleton texture frames insuffisants:', skeletonFrames, '(attendu > 12)');
        }
    }
}
