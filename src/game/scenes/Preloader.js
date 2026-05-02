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
        // Ligne 5 de Sprite-0002.png : 12 frames 32×32 (dos, gauche×3, face×3, droite×3)
        this.load.spritesheet('wizard-red', 'assets/wizard-red.png', { frameWidth: 32, frameHeight: 32 });

        // ── Monstres ─────────────────────────────────────────────
        this.load.spritesheet('slime',   'assets/sprites/Mystic Rpg FREE/ART/Enemies/Enemies_Green_Slime.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('goblin',  'assets/sprites/Monsters/goblin sheet.png',       { frameWidth: 300, frameHeight: 180 });
        this.load.spritesheet('bat',   'assets/sprites/RPG-Character/Enemy/Fantome-noir.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('ghost', 'assets/sprites/RPG-Character/Enemy/Fantome-bleu.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('orc',     'assets/sprites/Monsters/kobold_0000_red.png',    { frameWidth: 300, frameHeight: 180 });
        this.load.spritesheet('bee',      'assets/sprites/Level-Monsters/PNG/Transperent/Icon42.png',           { frameWidth: 32,  frameHeight: 32  });
        this.load.spritesheet('vampire',  'assets/sprites/vampire-pixel-art-sprite/Converted_Vampire/Idle.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('vampire-run', 'assets/sprites/vampire-pixel-art-sprite/Converted_Vampire/Run.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('skeleton',      'assets/sprites/RPG-Character/Enemy/Squelette.png',      { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('skeleton-dark', 'assets/sprites/RPG-Character/Enemy/Squelette-noir.png', { frameWidth: 32, frameHeight: 32 });

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
        // Sorcier (wizard-red.png : 12 frames — 0-2 dos, 3-5 gauche+bâton, 6-8 face, 9-11 droite)
        this.anims.create({ key: 'wizard-idle',   frames: this.anims.generateFrameNumbers('wizard-red', { start: 6, end: 8 }), frameRate: 4,  repeat: -1 });
        this.anims.create({ key: 'wizard-run',    frames: this.anims.generateFrameNumbers('wizard-red', { start: 3, end: 5 }), frameRate: 8,  repeat: -1 });
        this.anims.create({ key: 'wizard-attack', frames: this.anims.generateFrameNumbers('wizard-red', { start: 3, end: 5 }), frameRate: 12, repeat: -1 });
        this.anims.create({ key: 'wizard-hit',    frames: this.anims.generateFrameNumbers('wizard-red', { start: 9, end: 11 }), frameRate: 10, repeat: 0  });
        this.anims.create({ key: 'wizard-death',  frames: this.anims.generateFrameNumbers('wizard-red', { start: 0, end: 2  }), frameRate: 6,  repeat: 0  });

        // Slime : 16×16 px/frame, 5 cols × 4 rows — rangée 0 (frames 0-4) = idle
        this.anims.create({ key: 'slime-idle', frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 4 }), frameRate: 6, repeat: -1 });

        // Abeille : 1 frame statique
        this.anims.create({ key: 'bee-fly', frames: this.anims.generateFrameNumbers('bee', { start: 0, end: 0 }), frameRate: 1, repeat: -1 });

        // Goblin : 9 frames/ligne × 5 lignes → ligne 0 = idle, ligne 1 = walk
        this.anims.create({ key: 'goblin-idle', frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 8 }), frameRate: 8, repeat: -1 });

        // Fantômes (remplacent les chauves-souris) : 32×32, rangée 1 (frames 3-5, face gauche)
        this.anims.create({ key: 'bat-fly',   frames: this.anims.generateFrameNumbers('bat',   { start: 3, end: 5 }), frameRate: 5, repeat: -1 });
        this.anims.create({ key: 'ghost-fly', frames: this.anims.generateFrameNumbers('ghost', { start: 3, end: 5 }), frameRate: 5, repeat: -1 });

        // Orc (kobold) : 9 frames/ligne × 6 lignes → ligne 0 = idle
        this.anims.create({ key: 'orc-idle', frames: this.anims.generateFrameNumbers('orc', { start: 0, end: 8 }), frameRate: 8, repeat: -1 });

        // Vampire : 128×128 px/frame — Idle 5 frames, Run 8 frames
        this.anims.create({ key: 'vampire-idle', frames: this.anims.generateFrameNumbers('vampire',     { start: 0, end: 4 }), frameRate: 8,  repeat: -1 });
        this.anims.create({ key: 'vampire-run',  frames: this.anims.generateFrameNumbers('vampire-run', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });

        // Squelettes : 32×32, 3 cols × 4 rows — rangée 1 (frames 3-5, face gauche)
        this.anims.create({ key: 'skeleton-idle',      frames: this.anims.generateFrameNumbers('skeleton',      { start: 3, end: 5 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'skeleton-dark-idle', frames: this.anims.generateFrameNumbers('skeleton-dark', { start: 3, end: 5 }), frameRate: 6, repeat: -1 });
    }
}
