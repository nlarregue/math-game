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

        // ── Sorcier (ancien, conservé pour l'intro) ──────────────
        this.load.spritesheet('wizard-red', 'assets/wizard-red.png', { frameWidth: 32, frameHeight: 32 });

        // ── Sorcier (Wizard_Asset_Pack — utilisé dans Level et Boss) ──
        const wizBase = 'assets/sprites/Wizard_Asset_Pack/SPRITE_SHEET/';
        this.load.spritesheet('wiz-idle',   wizBase + 'IDLE/Wizard_Idle.png',              { frameWidth: 93, frameHeight: 77 });
        this.load.spritesheet('wiz-walk',   wizBase + 'SIDE_WALK/Wizard_Side_Walk.png',    { frameWidth: 93, frameHeight: 77 });
        this.load.spritesheet('wiz-attack', wizBase + 'ATTACK_1/Wizard_1Attack.png',       { frameWidth: 93, frameHeight: 77 });
        this.load.spritesheet('wiz-hurt',   wizBase + 'HURT/Wizard_Hurt.png',              { frameWidth: 93, frameHeight: 77 });
        this.load.spritesheet('wiz-death',  wizBase + 'DEATH/Wizard_Death.png',            { frameWidth: 93, frameHeight: 77 });

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
        this.load.image('bg-monde',    'assets/sprites/Pixel Art Top Down/Scene Overview.png');
        this.load.image('bg-chateau',  'assets/sprites/Pixel-Art-Battlegrounds/PNG/Battleground2/Bright/Battleground2.png');
        this.load.image('bg-montagne', 'assets/sprites/Pixel-Art-Battlegrounds/PNG/Battleground1/Bright/Battleground1.png');
        this.load.image('bg-boss',     'assets/sprites/Pixel-Art-Battlegrounds/PNG/Battleground4/Bright/Battleground4.png');
        this.load.image('bg-hub',      'assets/sprites/Pixel-Art-Battlegrounds/PNG/Battleground3/Bright/Battleground3.png');

        // Tilemap carte monde
        this.load.tilemapTiledJSON('world-map', 'assets/world.json');
        this.load.image('tx-wall',       'assets/sprites/Pixel Art Top Down/Texture/TX Tileset Wall.png');
        this.load.image('tx-grass',      'assets/sprites/Pixel Art Top Down/Texture/TX Tileset Grass.png');
        this.load.image('tx-props',      'assets/sprites/Pixel Art Top Down/Texture/TX Props.png');
        this.load.image('tx-props-shad', 'assets/sprites/Pixel Art Top Down/Texture/Extra/TX Props with Shadow.png');
        this.load.image('tx-struct',     'assets/sprites/Pixel Art Top Down/Texture/TX Struct.png');
        this.load.image('tx-stone',      'assets/sprites/Pixel Art Top Down/Texture/TX Tileset Stone Ground.png');
        this.load.image('tx-plant-shad', 'assets/sprites/Pixel Art Top Down/Texture/Extra/TX Plant with Shadow.png');

        // Décors forêt top-down
        this.load.image('forest-tree-1', 'assets/forest_tree_1.png');
        this.load.image('forest-tree-2', 'assets/forest_tree_2.png');
        this.load.image('forest-tree-3', 'assets/forest_tree_3.png');
        this.load.image('forest-bush-3', 'assets/forest_bush_3.png');
        this.load.image('forest-bush-4', 'assets/forest_bush_4.png');
        this.load.image('forest-bush-5', 'assets/forest_bush_5.png');
        this.load.image('forest-rock-1', 'assets/forest_rock_1.png');
    }

    create() {
        this.createAnimations();
        if (gameState.data.introDone) {
            this.scene.start('Level', { level: 'monde' });
        } else {
            this.scene.start('Intro');
        }
    }

    createAnimations() {
        // Ancien sorcier (conservé pour l'intro)
        this.anims.create({ key: 'wizard-idle',   frames: this.anims.generateFrameNumbers('wizard-red', { start: 6, end: 8  }), frameRate: 4,  repeat: -1 });
        this.anims.create({ key: 'wizard-run',    frames: this.anims.generateFrameNumbers('wizard-red', { start: 3, end: 5  }), frameRate: 8,  repeat: -1 });
        this.anims.create({ key: 'wizard-attack', frames: this.anims.generateFrameNumbers('wizard-red', { start: 3, end: 5  }), frameRate: 12, repeat: -1 });
        this.anims.create({ key: 'wizard-hit',    frames: this.anims.generateFrameNumbers('wizard-red', { start: 9, end: 11 }), frameRate: 10, repeat: 0  });
        this.anims.create({ key: 'wizard-death',  frames: this.anims.generateFrameNumbers('wizard-red', { start: 0, end: 2  }), frameRate: 6,  repeat: 0  });

        // Nouveau sorcier (Wizard_Asset_Pack) — Level et Boss
        this.anims.create({ key: 'wiz-idle',   frames: this.anims.generateFrameNumbers('wiz-idle',   { start: 0, end: 6  }), frameRate: 7,  repeat: -1 });
        this.anims.create({ key: 'wiz-run',    frames: this.anims.generateFrameNumbers('wiz-walk',   { start: 0, end: 7  }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'wiz-attack', frames: this.anims.generateFrameNumbers('wiz-attack', { start: 0, end: 10 }), frameRate: 12, repeat: -1 });
        this.anims.create({ key: 'wiz-hurt',   frames: this.anims.generateFrameNumbers('wiz-hurt',   { start: 0, end: 3  }), frameRate: 10, repeat: 0  });
        this.anims.create({ key: 'wiz-death',  frames: this.anims.generateFrameNumbers('wiz-death',  { start: 0, end: 10 }), frameRate: 6,  repeat: 0  });

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
