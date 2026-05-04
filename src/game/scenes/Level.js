import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { gameState } from '../utils/SaveManager';
import { drawEnemy, Colors } from '../utils/Drawing';
import { EventBus } from '../EventBus';
import { virtualInput } from '../utils/VirtualInput';

// Types d'ennemis qui ont un vrai sprite (transparent bg)
const SPRITE_ANIMS = {
    slime:          { key: 'slime',         anim: 'slime-idle',         scale: 2.0,  combatScale: 3.0 },
    bird:           { key: 'bee',           anim: 'bee-fly',            scale: 1.0,  combatScale: 1.75 },
    goblin:         { key: 'goblin',        anim: 'goblin-idle',        scale: 0.25, combatScale: 0.55 },
    bat:            { key: 'bat',           anim: 'bat-fly',            scale: 1.25, combatScale: 2.0  },
    ghost:          { key: 'ghost',         anim: 'ghost-fly',          scale: 1.25, combatScale: 2.0  },
    orc:            { key: 'orc',           anim: 'orc-idle',           scale: 0.25, combatScale: 0.55 },
    vampire:        { key: 'vampire',       anim: 'vampire-idle',       scale: 0.35, combatScale: 1.0  },
    skeleton:       { key: 'skeleton',      anim: 'skeleton-idle',      scale: 1.25, combatScale: 2.0 },
    'skeleton-dark':{ key: 'skeleton-dark', anim: 'skeleton-dark-idle', scale: 1.25, combatScale: 2.0 },
};

const ENEMY_DEFS = {
    slime:          { flying: false, resistant: false },
    bird:           { flying: true,  resistant: false },
    skeleton:       { flying: false, resistant: false },
    'skeleton-dark':{ flying: false, resistant: false },
    bat:            { flying: true,  resistant: false },
    ghost:          { flying: true,  resistant: false },
    vampire:        { flying: false, resistant: false },
    orc:            { flying: false, resistant: true  },
    goblin:         { flying: false, resistant: true  }
};

const LEVEL_BG = { chateau: 'bg-chateau', montagne: 'bg-montagne' };

// Coordonnées monde issues des zones Tiled (map 2048×2048)
const MONDE_MAP_W = 2048, MONDE_MAP_H = 2048;
const MONDE_SPAWN = { x: 1360, y: 1613 };  // objet "Point de départ" dans zones Tiled

// Positions des ennemis en coordonnées monde, autour du point de spawn
const MONDE_ENEMY_POSITIONS = [
    { x: 1150, y: 1530, preferFlying: false },
    { x: 1570, y: 1530, preferFlying: false },
    { x: 1100, y: 1660, preferFlying: true  },
    { x: 1620, y: 1660, preferFlying: true  },
    { x: 1200, y: 1750, preferFlying: false },
    { x: 1520, y: 1750, preferFlying: false },
    { x: 1280, y: 1430, preferFlying: false },
    { x: 1450, y: 1430, preferFlying: false },
];

// Portails en coordonnées monde — donjon géré par calque "Porte donjon", pas par cercle
const MONDE_PORTALS = [
    { id: 'montagne', label: 'Montagne', levelKey: 'montagne', x: 1263, y: 1008, color: 0xdd7700, progress: 'montagne' },
];

const LEVELS = {
    monde:    { hpRange: [1, 2], killGoal: 5,
        getTypes: () => gameState.data.spells.includes('glace') ? ['slime', 'bird', 'slime'] : ['slime'] },
    chateau:  { hpRange: [3, 4], killGoal: 5,
        getTypes: () => gameState.data.spells.includes('glace') ? ['skeleton', 'skeleton-dark', 'bat', 'ghost', 'vampire'] : ['skeleton', 'skeleton-dark', 'vampire'] },
    montagne: { hpRange: [5, 6], killGoal: 5,
        getTypes: () => ['orc', 'goblin'] }
};

export class Level extends Scene {
    constructor() {
        super('Level');
    }

    init(data) {
        this.levelKey = data.level;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.W = W; this.H = H;
        this.t = 0;
        this.combat = null;
        this.player = this.levelKey === 'monde'
            ? { x: MONDE_SPAWN.x, y: MONDE_SPAWN.y }
            : { x: 100, y: H * 0.8 };
        this.particles = [];
        EventBus.emit('ui-mode', 'level');

        if (this.levelKey === 'monde') {
            const map = this.make.tilemap({ key: 'world-map' });
            const tsWall      = map.addTilesetImage('TX Tileset Wall',        'tx-wall');
            const tsGrass     = map.addTilesetImage('TX Tileset Grass',       'tx-grass');
            const tsProps     = map.addTilesetImage('TX Props',               'tx-props');
            const tsPropsShad = map.addTilesetImage('TX Props with Shadow',   'tx-props-shad');
            const tsStruct    = map.addTilesetImage('TX Struct',              'tx-struct');
            const tsStone     = map.addTilesetImage('TX Tileset Stone Ground','tx-stone');
            const tsPlantShad = map.addTilesetImage('TX Plant with Shadow',   'tx-plant-shad');
            const allTs = [tsWall, tsGrass, tsProps, tsPropsShad, tsStruct, tsStone, tsPlantShad];
            this.groundLayer    = map.createLayer('ground',    allTs, 0, 0).setDepth(1);
            this.elevationLayer = map.createLayer('elevation', allTs, 0, 0).setDepth(2);
            this.wallsLayer     = map.createLayer('walls',     allTs, 0, 0).setDepth(3);
            const groundLayer    = this.groundLayer;
            const elevationLayer = this.elevationLayer;
            map.createLayer('decor1',       allTs, 0, 0).setDepth(4);
            this.porteDonjonLayer = map.createLayer('Porte donjon', allTs, 0, 0).setDepth(5);

            // Collecte les centres de tuiles valides pour le spawn des ennemis
            this.mondeSpawnTiles = [];
            const collectTiles = (layer) => layer.forEachTile(t => {
                if (t.index !== -1) {
                    const x = t.pixelX + 16, y = t.pixelY + 16;
                    if (Math.hypot(x - MONDE_SPAWN.x, y - MONDE_SPAWN.y) > 150)
                        this.mondeSpawnTiles.push({ x, y });
                }
            });
            collectTiles(groundLayer);
            collectTiles(elevationLayer);
        } else {
            this.add.image(W / 2, H / 2, LEVEL_BG[this.levelKey]).setDisplaySize(W, H).setDepth(0);
        }
        this.enemies = [];
        this.enemyGraphicsList = [];

        // Portails et labels (carte du monde uniquement)
        this.portalGraphics = null;
        this.portalLabels = [];
        this.bossPortalLabel = null;
        if (this.levelKey === 'monde') {
            this.portalGraphics = this.add.graphics().setDepth(3);
            this.portalLabels = MONDE_PORTALS.map(p =>
                this.add.text(p.x, p.y - 48, p.label, {
                    fontFamily: 'serif', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
                    stroke: '#000000', strokeThickness: 3
                }).setOrigin(0.5).setDepth(61)
            );
            this.bossPortalLabel = this.add.text(MONDE_SPAWN.x, MONDE_SPAWN.y - 50, '⚔ Dragon ⚔', {
                fontFamily: 'serif', fontSize: '18px', color: '#f4c430', fontStyle: 'bold',
                stroke: '#000000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(61).setVisible(false);
        }

        this.particleGraphics = this.add.graphics().setDepth(20);
        this.uiGraphics = this.add.graphics();

        this.playerFacingRight = true;
        this.wizardSprite = this.add.sprite(this.player.x, this.player.y, 'wiz-idle')
            .setScale(0.6)
            .setDepth(30);
        this.wizardSprite.play('wiz-idle');

        if (this.levelKey === 'monde') {
            this.cameras.main.setBounds(0, 0, MONDE_MAP_W, MONDE_MAP_H);
            this.cameras.main.startFollow(this.wizardSprite, true, 0.1, 0.1);
        }

        this.spawnEnemies();

        // HUD
        this.hpGraphics = this.add.graphics().setDepth(60);
        this.hpText = this.add.text(110, 25, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(60);
        this.spellsGraphics = this.add.graphics().setDepth(60);
        this.spellsLabel = this.add.text(20, 60, 'Sorts :', { fontFamily: 'sans-serif', fontSize: '12px', color: '#ffffff' }).setDepth(60);

        this.killCounter = this.add.text(W - 20, 25, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#f4c430', fontStyle: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 10, y: 6 }
        }).setOrigin(1, 0.5).setDepth(60);

        this.actionHint = this.add.text(0, 0, '', {
            fontFamily: 'sans-serif', fontSize: '12px', color: '#000000',
            backgroundColor: '#f4c430', padding: { x: 6, y: 3 }, fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false).setDepth(60);

        this.exitHint = this.add.text(W / 2, 95, '', {
            fontFamily: 'sans-serif', fontSize: '12px', color: '#000000',
            backgroundColor: '#52c878', padding: { x: 8, y: 4 }, fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false).setDepth(60);

        this.messageBox = this.add.graphics().setVisible(false).setDepth(60);
        this.messageText = this.add.text(W / 2, 115, '', {
            fontFamily: 'serif', fontSize: '18px', color: '#f4c430', fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false).setDepth(60);
        this.messageTime = 0;

        // Fixer le HUD à l'écran (indispensable quand la caméra scrolle sur le monde)
        [this.hpGraphics, this.hpText, this.spellsGraphics, this.spellsLabel,
         this.killCounter, this.exitHint, this.messageBox, this.messageText]
            .forEach(o => o.setScrollFactor(0));

        this.createCombatUI();

        // Contrôles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.hKey = this.input.keyboard.addKey('H');
        this.escKey = this.input.keyboard.addKey('ESC');
        this.enterKey = this.input.keyboard.addKey('ENTER');
        this.backspaceKey = this.input.keyboard.addKey('BACKSPACE');
        this.numKeys = {};
        for (let i = 0; i <= 9; i++) {
            this.numKeys[i] = this.input.keyboard.addKey(48 + i); // 0-9
        }
        this.spellHotkeys = {
            feu: this.input.keyboard.addKey('ONE'),
            glace: this.input.keyboard.addKey('TWO'),
            foudre: this.input.keyboard.addKey('THREE')
        };
        this.tabKey = this.input.keyboard.addKey('TAB');
    }

    createCombatUI() {
        const W = this.W, H = this.H;
        this.combatLayer = this.add.container(0, 0).setVisible(false).setDepth(100);

        const overlay = this.add.graphics();
        overlay.fillStyle(Colors.black, 0.85);
        overlay.fillRect(0, 0, W, H);
        const box = this.add.graphics();
        box.fillStyle(0x1a1428);
        box.fillRect(80, 60, W - 160, H - 120);
        box.lineStyle(3, Colors.gold);
        box.strokeRect(80, 60, W - 160, H - 120);

        this.combatTitle = this.add.text(W / 2, 95, '⚔ Combat ⚔', {
            fontFamily: 'serif', fontSize: '22px', color: '#f4c430', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.combatEnemyGraphics = this.add.graphics();

        // Sprite affiché en combat pour les ennemis qui ont un vrai sprite
        // Géré hors du container pour éviter le double rendu (Phaser 4)
        this.combatEnemySprite = this.add.sprite(W / 2, H * 0.27, 'slime')
            .setScale(0.55)
            .setVisible(false)
            .setDepth(150);

        this.combatEnemyHpBar = this.add.graphics();
        this.combatEnemyHpText = this.add.text(W / 2, H * 0.37, '', {
            fontFamily: 'sans-serif', fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.warningText = this.add.text(W / 2, H * 0.4, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#7fdbff', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5);

        this.resistText = this.add.text(W / 2, H * 0.43, '', {
            fontFamily: 'sans-serif', fontSize: '12px', color: '#ffe44d', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5);

        this.spellChoiceLabel = this.add.text(W / 2, H * 0.47, 'Sort : appuie sur 1, 2 ou 3', {
            fontFamily: 'sans-serif', fontSize: '13px', color: '#ffffff'
        }).setOrigin(0.5);

        this.spellButtons = [];
        const spells = [
            { key: '1', name: 'Feu', spell: 'feu', color: Colors.fire, dmg: 1, opName: 'Addition' },
            { key: '2', name: 'Glace', spell: 'glace', color: Colors.ice, dmg: 2, opName: 'Soustraction' },
            { key: '3', name: 'Foudre', spell: 'foudre', color: Colors.lightning, dmg: 3, opName: 'Multiplication' }
        ];
        spells.forEach((s, i) => {
            const x = W * 0.25 + i * (W * 0.25);
            const btnGraphics = this.add.graphics();
            const nameText = this.add.text(x, H * 0.52, `[${s.key}] ${s.name}`, {
                fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
            const dmgText = this.add.text(x, H * 0.545, `${s.dmg} dégât${s.dmg > 1 ? 's' : ''} · ${s.opName}`, {
                fontFamily: 'sans-serif', fontSize: '11px', color: '#ffffff'
            }).setOrigin(0.5);
            this.spellButtons.push({ ...s, x, btnGraphics, nameText, dmgText });
        });

        this.opText = this.add.text(W / 2, H * 0.66, '', {
            fontFamily: 'serif', fontSize: '48px', color: '#f4c430', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.inputBox = this.add.graphics();
        this.inputText = this.add.text(W / 2, H * 0.77, '_', {
            fontFamily: 'sans-serif', fontSize: '22px', color: '#000000', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.feedbackText = this.add.text(W / 2, 75, '', {
            fontFamily: 'sans-serif', fontSize: '18px', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.combatHint = this.add.text(W / 2, H * 0.83, 'Tape ta réponse puis Entrée · Tab pour changer de sort · Échap pour fuir', {
            fontFamily: 'sans-serif', fontSize: '11px', color: '#aaaaaa'
        }).setOrigin(0.5);

        this.combatLayer.setScrollFactor(0);
        this.combatEnemySprite.setScrollFactor(0);

        this.combatLayer.add([
            overlay, box, this.combatTitle,
            this.combatEnemyGraphics,
            this.combatEnemyHpBar, this.combatEnemyHpText,
            this.warningText, this.resistText, this.spellChoiceLabel,
            ...this.spellButtons.flatMap(b => [b.btnGraphics, b.nameText, b.dmgText]),
            this.opText, this.inputBox, this.inputText, this.feedbackText, this.combatHint
        ]);
    }

    spawnEnemies() {
        this.enemies.forEach(e => { if (e.sprite) e.sprite.destroy(); });
        this.enemyGraphicsList.forEach(g => g.destroy());
        this.enemyGraphicsList = [];
        this.enemies = [];

        const lvl = LEVELS[this.levelKey];

        if (this.levelKey === 'monde') {
            const hasGlace = gameState.data.spells.includes('glace');
            const pool = Phaser.Utils.Array.Shuffle([...(this.mondeSpawnTiles || MONDE_ENEMY_POSITIONS)]);
            const total = 8, flyingSlots = 2;
            for (let i = 0; i < Math.min(total, pool.length); i++) {
                const preferFlying = i < flyingSlots;
                const type = (preferFlying && hasGlace) ? 'bird' : 'slime';
                this._spawnOneEnemy(type, pool[i].x, pool[i].y, lvl);
            }
        } else {
            const types = lvl.getTypes();
            const count = 4;
            for (let i = 0; i < count; i++) {
                const type = types[Math.floor(Math.random() * types.length)];
                const def = ENEMY_DEFS[type];
                const flying = def.flying;
                const baseY = flying
                    ? (this.H * 0.36 + Math.random() * this.H * 0.12)
                    : (this.H * 0.65 + Math.random() * this.H * 0.16);
                const ex = this.W * 0.4 + i * (this.W * 0.13) + Math.random() * 30;
                this._spawnOneEnemy(type, ex, baseY, lvl);
            }
        }

        this.enemyLockTexts = this.enemies.map((e) => {
            return this.add.text(e.x, e.y - 50, '', {
                fontFamily: 'sans-serif', fontSize: '16px', color: '#7fdbff', fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(20);
        });
    }

    _spawnOneEnemy(type, ex, baseY, lvl) {
        const def = ENEMY_DEFS[type];
        const hp = lvl.hpRange[0] + Math.floor(Math.random() * (lvl.hpRange[1] - lvl.hpRange[0] + 1));
        const flying = def.flying;
        const enemy = {
            type, hp, maxHp: hp,
            x: ex, y: baseY, baseY,
            flash: 0, frozen: 0,
            flying, resistant: def.resistant,
            floatPhase: Math.random() * Math.PI * 2,
            sprite: null
        };
        const cfg = SPRITE_ANIMS[type];
        if (cfg) {
            try {
                const sp = this.add.sprite(ex, baseY, cfg.key).setScale(cfg.scale).setDepth(10);
                try { sp.play(cfg.anim); } catch (_) { /* animation indisponible, sprite statique */ }
                enemy.sprite = sp;
            } catch (err) {
                console.error(`[spawnEnemies] Échec sprite "${type}" (key:${cfg.key}):`, err);
            }
        }
        const g = this.add.graphics().setDepth(15);
        this.enemyGraphicsList.push(g);
        this.enemies.push(enemy);
    }

    findNearestPortal() {
        if (this.levelKey !== 'monde') return null;
        const s = gameState.data;
        // Boss portal
        const allDone = s.levelProgress.monde && s.levelProgress.chateau && s.levelProgress.montagne;
        if (allDone && !s.bossDefeated) {
            const bx = MONDE_SPAWN.x, by = MONDE_SPAWN.y;
            if (Math.hypot(this.player.x - bx, this.player.y - by) < 70) {
                return { id: 'boss', label: 'Dragon', x: bx, y: by };
            }
        }
        // Level portals
        for (const p of MONDE_PORTALS) {
            if (Math.hypot(this.player.x - p.x, this.player.y - p.y) < 70) return p;
        }
        return null;
    }

    canWalkAt(wx, wy) {
        if (!this.groundLayer) return true;
        const onWalkable = this.groundLayer.getTileAtWorldXY(wx, wy) !== null ||
                           this.elevationLayer.getTileAtWorldXY(wx, wy) !== null;
        const onWall     = this.wallsLayer.getTileAtWorldXY(wx, wy) !== null;
        return onWalkable && !onWall;
    }

    findNearestDoor() {
        if (this.levelKey !== 'monde' || !this.porteDonjonLayer) return null;
        const tile = this.porteDonjonLayer.getTileAtWorldXY(this.player.x, this.player.y);
        return tile ? { id: 'donjon', levelKey: 'chateau', label: 'Donjon' } : null;
    }

    drawPortals() {
        if (!this.portalGraphics) return;
        const s = gameState.data;
        this.portalGraphics.clear();
        const allDone = s.levelProgress.monde && s.levelProgress.chateau && s.levelProgress.montagne;

        MONDE_PORTALS.forEach((p, i) => {
            const pulse = 0.55 + Math.sin(this.t * 0.07 + i) * 0.25;
            this.portalGraphics.fillStyle(p.color, 0.35 + pulse * 0.25);
            this.portalGraphics.fillCircle(p.x, p.y, 32);
            this.portalGraphics.lineStyle(3, p.color, pulse);
            this.portalGraphics.strokeCircle(p.x, p.y, 38);
            const done = s.levelProgress[p.progress];
            this.portalLabels[i].setText((done ? '★ ' : '') + p.label);
        });

        // Boss portal
        if (allDone && !s.bossDefeated) {
            const pulse = 0.5 + Math.sin(this.t * 0.1) * 0.35;
            this.portalGraphics.fillStyle(Colors.gold, pulse * 0.6);
            this.portalGraphics.fillCircle(MONDE_SPAWN.x, MONDE_SPAWN.y, 34);
            this.portalGraphics.lineStyle(3, Colors.gold, pulse);
            this.portalGraphics.strokeCircle(MONDE_SPAWN.x, MONDE_SPAWN.y, 40);
            this.bossPortalLabel.setVisible(true);
        } else {
            this.bossPortalLabel?.setVisible(false);
        }
    }

    findNearestEnemy() {
        let near = null, minD = Infinity;
        this.enemies.forEach(e => {
            const d = Math.hypot(e.x - this.player.x, e.y - this.player.y);
            const range = e.flying && e.frozen <= 0 ? 60 : 80;
            if (d < range && d < minD) {
                minD = d;
                near = e;
            }
        });
        return near;
    }

    startCombat(enemy) {
        let spell = 'feu';
        let locked = false;
        if (enemy.flying && enemy.frozen <= 0 && gameState.data.spells.includes('glace')) {
            spell = 'glace';
            locked = 'must_freeze';
        }
        this.combat = { enemy, spell, op: null, input: '', feedback: '', feedbackTime: 0, locked };
        this.generateOp(spell);
        EventBus.emit('ui-mode', 'combat');

        // Affichage de l'ennemi en combat
        const cfg = SPRITE_ANIMS[enemy.type];
        if (cfg) {
            this.combatEnemySprite
                .setTexture(cfg.key)
                .setScale(cfg.combatScale ?? cfg.scale * 2.6)
                .setPosition(this.W / 2, this.H * 0.27)
                .play(cfg.anim)
                .setVisible(true);
            this.combatEnemyGraphics.setVisible(false);
        } else {
            this.combatEnemySprite.setVisible(false);
            this.combatEnemyGraphics.setVisible(true);
        }

        this.combatLayer.setVisible(true);
    }

    generateOp(spell) {
        let a, b, result, sym;
        if (spell === 'feu') {
            a = Math.floor(Math.random() * 51);
            b = Math.floor(Math.random() * (101 - a));
            result = a + b; sym = '+';
        } else if (spell === 'glace') {
            a = Math.floor(Math.random() * 101);
            b = Math.floor(Math.random() * (a + 1));
            result = a - b; sym = '−';
        } else {
            a = 1 + Math.floor(Math.random() * 10);
            b = 1 + Math.floor(Math.random() * 10);
            result = a * b; sym = '×';
        }
        this.combat.op = { a, b, result, sym };
        this.combat.input = '';
    }

    submitAnswer() {
        const c = this.combat;
        if (!c || !c.op || c.input === '') return;
        const ans = parseInt(c.input, 10);
        if (ans === c.op.result) {
            let dmg = c.spell === 'feu' ? 1 : c.spell === 'glace' ? 2 : 3;
            if (c.enemy.resistant && c.spell !== 'foudre') {
                dmg = Math.max(1, Math.floor(dmg / 2));
            }
            if (c.spell === 'glace' && c.enemy.flying) {
                c.enemy.frozen = 300;
            }
            c.enemy.hp -= dmg;
            c.enemy.flash = 10;
            this.addParticles(c.enemy.x, c.enemy.y,
                c.spell === 'feu' ? Colors.fire : c.spell === 'glace' ? Colors.ice : Colors.lightning, 20);

            let msg = `✓ Correct ! ${dmg} dégât${dmg > 1 ? 's' : ''} !`;
            if (c.enemy.resistant && c.spell !== 'foudre' && gameState.data.spells.includes('foudre')) msg += ' (résistance)';
            if (c.spell === 'glace' && c.enemy.flying) msg += ' Gelé ❄';
            c.feedback = msg;
            c.feedbackTime = 40;

            if (c.locked === 'must_freeze' && c.spell === 'glace') {
                c.locked = false;
            }

            if (c.enemy.hp <= 0) {
                this.addParticles(c.enemy.x, c.enemy.y, Colors.gold, 30);
                const idx = this.enemies.indexOf(c.enemy);
                if (idx >= 0) {
                    if (c.enemy.sprite) { c.enemy.sprite.destroy(); c.enemy.sprite = null; }
                    this.enemyGraphicsList[idx].destroy();
                    this.enemyGraphicsList.splice(idx, 1);
                    this.enemyLockTexts[idx].destroy();
                    this.enemyLockTexts.splice(idx, 1);
                    this.enemies.splice(idx, 1);
                }
                gameState.data.killsByLevel[this.levelKey]++;

                const lvl = LEVELS[this.levelKey];
                const reachedGoal = gameState.data.killsByLevel[this.levelKey] >= lvl.killGoal;
                if (reachedGoal && !gameState.data.levelProgress[this.levelKey]) {
                    gameState.data.levelProgress[this.levelKey] = true;
                    if (this.levelKey === 'monde' && !gameState.data.spells.includes('glace')) {
                        gameState.data.spells.push('glace');
                        this.showMessage('★ Sort de Glace débloqué ! ★', 180);
                    } else if (this.levelKey === 'chateau' && !gameState.data.spells.includes('foudre')) {
                        gameState.data.spells.push('foudre');
                        this.showMessage('★ Sort de Foudre débloqué ! ★', 180);
                    } else {
                        this.showMessage('★ Niveau terminé ! ★', 180);
                    }
                }

                this.combat = null;
                this.combatLayer.setVisible(false);
                this.combatEnemySprite.setVisible(false);
                gameState.save();

                if (this.enemies.length === 0) {
                    this.spawnEnemies();
                }
            } else {
                c.op = null;
                this.time.delayedCall(800, () => { if (this.combat) this.generateOp(this.combat.spell); });
            }
        } else {
            gameState.data.player.hp--;
            c.feedback = `✗ Faux ! La réponse était ${c.op.result}`;
            c.feedbackTime = 60;
            this.addParticles(this.player.x, this.player.y, Colors.red, 15);
            gameState.save();
            if (gameState.data.player.hp <= 0) {
                this.combat = null;
                this.combatLayer.setVisible(false);
                this.combatEnemySprite.setVisible(false);
                this.scene.start('GameOver');
                return;
            }
            this.time.delayedCall(1200, () => { if (this.combat) this.generateOp(this.combat.spell); });
        }
        c.input = '';
    }

    addParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30, color
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
            p.life--;
            return p.life > 0;
        });
    }

    drawParticles() {
        this.particleGraphics.clear();
        this.particles.forEach(p => {
            this.particleGraphics.fillStyle(p.color, p.life / 30);
            this.particleGraphics.fillCircle(p.x, p.y, 3);
        });
    }

    showMessage(msg, frames = 120) {
        this.messageText.setText(msg).setVisible(true);
        const W = this.W;
        this.messageBox.clear();
        this.messageBox.fillStyle(Colors.black, 0.85);
        this.messageBox.fillRect(W / 2 - 250, 95, 500, 40);
        this.messageBox.setVisible(true);
        this.messageTime = frames;
    }

    drawHUD() {
        const s = gameState.data;
        this.hpGraphics.clear();
        this.hpGraphics.fillStyle(Colors.black, 0.7);
        this.hpGraphics.fillRect(10, 10, 200, 30);
        this.hpGraphics.fillStyle(Colors.red);
        this.hpGraphics.fillRect(15, 15, 190 * (s.player.hp / s.player.maxHp), 20);
        this.hpGraphics.lineStyle(2, Colors.white);
        this.hpGraphics.strokeRect(15, 15, 190, 20);
        this.hpText.setText(`HP : ${s.player.hp}/${s.player.maxHp}`);

        this.spellsGraphics.clear();
        this.spellsGraphics.fillStyle(Colors.black, 0.7);
        this.spellsGraphics.fillRect(10, 45, 200, 30);
        const spellList = [
            { c: Colors.fire, k: 'feu' },
            { c: Colors.ice, k: 'glace' },
            { c: Colors.lightning, k: 'foudre' }
        ];
        spellList.forEach((sp, i) => {
            const has = s.spells.includes(sp.k);
            this.spellsGraphics.fillStyle(has ? sp.c : 0x444444);
            this.spellsGraphics.fillCircle(80 + i * 40, 60, 10);
        });

        const lvl = LEVELS[this.levelKey];
        this.killCounter.setText(`Monstres : ${s.killsByLevel[this.levelKey]}/${lvl.killGoal}`);
    }

    drawCombat() {
        if (!this.combat) return;
        const c = this.combat;
        const W = this.W, H = this.H;

        // Ennemi en gros (sprite ou procédural)
        if (this.combatEnemySprite.visible) {
            this.combatEnemyGraphics.clear();
            // Teinte glace + flash
            if (c.enemy.frozen > 0) this.combatEnemySprite.setTint(0x7fdbff);
            else this.combatEnemySprite.clearTint();
            this.combatEnemySprite.setAlpha(c.enemy.flash > 0 ? 0.4 : 1);
        } else {
            this.combatEnemyGraphics.clear();
            this.combatEnemyGraphics.x = W / 2;
            this.combatEnemyGraphics.y = H * 0.28;
            this.combatEnemyGraphics.setScale(1.25);
            drawEnemy(this.combatEnemyGraphics, { ...c.enemy, x: 0, y: 0 }, this.t, { showHpBar: false });
        }

        // Barre de vie du monstre
        const enemy = c.enemy;
        const barW = 160;
        const barH = 14;
        const barX = W / 2 - barW / 2;
        const barY = H * 0.355;
        this.combatEnemyHpBar.clear();
        this.combatEnemyHpBar.fillStyle(0x330000, 0.9);
        this.combatEnemyHpBar.fillRect(barX, barY, barW, barH);
        this.combatEnemyHpBar.fillStyle(0xe24b4a);
        this.combatEnemyHpBar.fillRect(barX, barY, barW * (enemy.hp / enemy.maxHp), barH);
        this.combatEnemyHpBar.lineStyle(1, 0xffffff, 0.6);
        this.combatEnemyHpBar.strokeRect(barX, barY, barW, barH);
        this.combatEnemyHpText.setText(`PV : ${enemy.hp} / ${enemy.maxHp}`).setY(barY + barH + 6);

        // Avertissement volant
        if (c.locked === 'must_freeze') {
            this.warningText.setText('Cet ennemi vole ! Gèle-le d\'abord avec la Glace ❄');
        } else {
            this.warningText.setText('');
        }

        if (c.enemy.resistant && c.spell !== 'foudre' && gameState.data.spells.includes('foudre')) {
            this.resistText.setText('⚡ Cet ennemi résiste : la Foudre fait plus de dégâts !');
        } else {
            this.resistText.setText('');
        }

        // Boutons des sorts
        this.spellButtons.forEach(b => {
            const unlocked = gameState.data.spells.includes(b.spell);
            const active = c.spell === b.spell;
            const disabled = c.locked === 'must_freeze' && b.spell !== 'glace';
            b.btnGraphics.clear();
            const fillColor = disabled ? 0x222222 : (unlocked ? (active ? b.color : 0x222222) : 0x333333);
            b.btnGraphics.fillStyle(fillColor);
            b.btnGraphics.fillRect(b.x - 65, H * 0.5, 130, 50);
            b.btnGraphics.lineStyle(2, active ? Colors.white : (unlocked ? b.color : 0x555555));
            b.btnGraphics.strokeRect(b.x - 65, H * 0.5, 130, 50);
            b.nameText.setColor(disabled ? '#555555' : (unlocked ? (active ? '#000000' : '#ffffff') : '#777777'));
            b.dmgText.setColor(disabled ? '#555555' : (unlocked ? (active ? '#000000' : '#ffffff') : '#777777'));
        });

        // Opération
        if (c.op) {
            const color = c.spell === 'feu' ? '#ff6b35' : c.spell === 'glace' ? '#7fdbff' : '#ffe44d';
            this.opText.setText(`${c.op.a} ${c.op.sym} ${c.op.b} = ?`).setColor(color);
        } else {
            this.opText.setText('· · ·').setColor('#666666');
        }

        // Champ de saisie
        this.inputBox.clear();
        this.inputBox.fillStyle(Colors.white);
        this.inputBox.fillRect(W / 2 - 60, H * 0.74, 120, 30);
        this.inputText.setText(c.input || '_');

        // Feedback
        if (c.feedback) {
            this.feedbackText.setText(c.feedback)
                .setColor(c.feedback.indexOf('✓') >= 0 ? '#52c878' : '#e24b4a');
        } else {
            this.feedbackText.setText('');
        }
    }

    handleCombatInput() {
        if (Phaser.Input.Keyboard.JustDown(this.escKey) || virtualInput.escape) {
            virtualInput.escape = false;
            this.combat = null;
            this.combatLayer.setVisible(false);
            this.combatEnemySprite.setVisible(false);
            EventBus.emit('ui-mode', 'level');
            return;
        }
        if (!this.combat.op) return;
        if (Phaser.Input.Keyboard.JustDown(this.enterKey) || virtualInput.enter) {
            virtualInput.enter = false;
            this.submitAnswer();
            return;
        }
        if (Phaser.Input.Keyboard.JustDown(this.backspaceKey) || virtualInput.backspace) {
            virtualInput.backspace = false;
            this.combat.input = this.combat.input.slice(0, -1);
            return;
        }
        if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
            const available = gameState.data.spells.filter(s =>
                this.combat.locked !== 'must_freeze' || s === 'glace'
            );
            if (available.length > 1) {
                const idx = available.indexOf(this.combat.spell);
                this.combat.spell = available[(idx + 1) % available.length];
                this.generateOp(this.combat.spell);
                this.combat.feedback = '';
            }
            return;
        }
        for (let i = 0; i <= 9; i++) {
            if (Phaser.Input.Keyboard.JustDown(this.numKeys[i]) || virtualInput.digit === String(i)) {
                if (virtualInput.digit === String(i)) virtualInput.digit = null;
                if (this.combat.input.length < 3) {
                    this.combat.input += i.toString();
                }
                return;
            }
        }
        // Changement de sort
        if (this.combat.locked !== 'must_freeze') {
            if ((Phaser.Input.Keyboard.JustDown(this.spellHotkeys.feu) || virtualInput.spell === 'feu') && gameState.data.spells.includes('feu')) {
                if (virtualInput.spell === 'feu') virtualInput.spell = null;
                this.combat.spell = 'feu'; this.generateOp('feu');
            } else if ((Phaser.Input.Keyboard.JustDown(this.spellHotkeys.foudre) || virtualInput.spell === 'foudre') && gameState.data.spells.includes('foudre')) {
                if (virtualInput.spell === 'foudre') virtualInput.spell = null;
                this.combat.spell = 'foudre'; this.generateOp('foudre');
            }
        }
        if ((Phaser.Input.Keyboard.JustDown(this.spellHotkeys.glace) || virtualInput.spell === 'glace') && gameState.data.spells.includes('glace')) {
            if (virtualInput.spell === 'glace') virtualInput.spell = null;
            this.combat.spell = 'glace'; this.generateOp('glace');
        }
    }

    update(time, delta) {
        this.t += delta / 16.67;
        const W = this.W, H = this.H;
        const lvl = LEVELS[this.levelKey];

        // Animation ennemis
        this.enemies.forEach((e, i) => {
            if (e.flying && e.frozen <= 0) {
                e.y = e.baseY + Math.sin(this.t * 0.05 + e.floatPhase) * 15;
            }
            if (e.frozen > 0) e.frozen--;
            if (e.flash > 0) e.flash--;

            const g = this.enemyGraphicsList[i];
            if (e.sprite) {
                // Positionnement + effets visuels sur le sprite
                e.sprite.setPosition(e.x, e.y);
                e.sprite.setAlpha(e.flash > 0 ? 0.5 : 1);
                if (e.frozen > 0) e.sprite.setTint(0x7fdbff);
                else e.sprite.clearTint();

                // Effets overlayés sur le graphics (gel, ombre, barre HP)
                g.clear();
                if (e.frozen > 0) {
                    g.fillStyle(Colors.ice, 0.3);
                    g.fillCircle(e.x, e.y, 32);
                    g.lineStyle(2, Colors.ice);
                    for (let ci = 0; ci < 6; ci++) {
                        const a = ci * Math.PI / 3;
                        g.lineBetween(e.x + Math.cos(a) * 18, e.y + Math.sin(a) * 18,
                                      e.x + Math.cos(a) * 26, e.y + Math.sin(a) * 26);
                    }
                }
                if (e.flying && e.frozen <= 0) {
                    g.fillStyle(Colors.white, 0.25);
                    g.fillEllipse(e.x, e.y + 30, 44, 10);
                }
                const hw = 34;
                g.fillStyle(0x440000);
                g.fillRect(e.x - hw / 2, e.y - 42, hw, 5);
                g.fillStyle(Colors.red);
                g.fillRect(e.x - hw / 2, e.y - 42, hw * (e.hp / e.maxHp), 5);
            } else {
                g.setPosition(e.x, e.y).setScale(1);
                drawEnemy(g, { ...e, x: 0, y: 0 }, this.t);
            }

            // Texte verrou volants
            if (this.enemyLockTexts[i]) {
                if (e.flying && e.frozen <= 0) {
                    this.enemyLockTexts[i].setText('❄').setPosition(e.x, e.y - 50);
                } else {
                    this.enemyLockTexts[i].setText('');
                }
            }
        });

        this.updateParticles();
        this.drawParticles();

        // Wizard sprite — position et animation
        this.wizardSprite.setPosition(this.player.x, this.player.y);
        this.wizardSprite.setFlipX(!this.playerFacingRight);

        if (this.combat) {
            this.handleCombatInput();
            this.drawCombat();
            if (this.wizardSprite.anims.currentAnim?.key !== 'wiz-attack') {
                this.wizardSprite.play('wiz-attack');
            }
        } else {
            // Mouvement
            const sp = 3;
            let dx = 0, dy = 0;
            if (this.cursors.left.isDown  || virtualInput.left)  { dx = -sp; this.playerFacingRight = false; }
            if (this.cursors.right.isDown || virtualInput.right) { dx =  sp; this.playerFacingRight = true;  }
            if (this.cursors.up.isDown    || virtualInput.up)    { dy = -sp; }
            if (this.cursors.down.isDown  || virtualInput.down)  { dy =  sp; }
            const moved = dx !== 0 || dy !== 0;

            if (this.levelKey === 'monde') {
                if (dx && this.canWalkAt(this.player.x + dx, this.player.y)) this.player.x += dx;
                if (dy && this.canWalkAt(this.player.x, this.player.y + dy)) this.player.y += dy;
            } else {
                this.player.x += dx;
                this.player.y += dy;
                this.player.x = Math.max(20, Math.min(W - 20, this.player.x));
                this.player.y = Math.max(H * 0.3, Math.min(H * 0.95, this.player.y));
            }

            const animKey = moved ? 'wiz-run' : 'wiz-idle';
            if (this.wizardSprite.anims.currentAnim?.key !== animKey) {
                this.wizardSprite.play(animKey);
            }

            if (this.levelKey === 'monde') {
                // Carte du monde : ennemis + portails
                const near = this.findNearestEnemy();
                const nearPortal = near ? null : this.findNearestPortal();
                const nearDoor   = !near && !nearPortal ? this.findNearestDoor() : null;

                if (near) {
                    this.actionHint.setText('Espace pour combattre').setPosition(near.x, near.y - 50).setVisible(true);
                    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || virtualInput.space) {
                        virtualInput.space = false;
                        this.startCombat(near);
                    }
                } else if (nearPortal) {
                    const hint = nearPortal.id === 'boss'
                        ? '⚔ Espace pour le combat final !'
                        : `Espace pour entrer au ${nearPortal.label}`;
                    this.actionHint.setText(hint).setPosition(nearPortal.x, nearPortal.y - 55).setVisible(true);
                    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || virtualInput.space) {
                        virtualInput.space = false;
                        if (nearPortal.id === 'boss') {
                            this.scene.start('Boss');
                        } else {
                            this.scene.start('Level', { level: nearPortal.levelKey });
                        }
                        return;
                    }
                } else if (nearDoor) {
                    this.actionHint.setText(`Espace pour entrer au ${nearDoor.label}`).setPosition(this.player.x, this.player.y - 50).setVisible(true);
                    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || virtualInput.space) {
                        virtualInput.space = false;
                        this.scene.start('Level', { level: nearDoor.levelKey });
                        return;
                    }
                } else {
                    this.actionHint.setVisible(false);
                }
                this.drawPortals();
                this.exitHint.setVisible(false);

            } else {
                // Sous-niveaux (donjon, montagne)
                const near = this.findNearestEnemy();
                if (near) {
                    this.actionHint.setText('Espace pour combattre').setPosition(near.x, near.y - 50).setVisible(true);
                    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || virtualInput.space) {
                        virtualInput.space = false;
                        this.startCombat(near);
                    }
                } else {
                    this.actionHint.setVisible(false);
                }

                // Retour à la carte du monde
                if (Phaser.Input.Keyboard.JustDown(this.hKey) || virtualInput.h) {
                    virtualInput.h = false;
                    this.scene.start('Level', { level: 'monde' });
                    return;
                }

                // Indication retour quand niveau terminé
                if (gameState.data.killsByLevel[this.levelKey] >= lvl.killGoal) {
                    this.exitHint.setText('Niveau terminé ! Appuie sur H pour revenir').setVisible(true);
                } else {
                    this.exitHint.setVisible(false);
                }
            }
        }

        this.drawHUD();

        // Message
        if (this.messageTime > 0) {
            this.messageTime--;
            if (this.messageTime === 0) {
                this.messageBox.setVisible(false);
                this.messageText.setVisible(false);
            }
        }

        // Feedback time
        if (this.combat && this.combat.feedbackTime > 0) {
            this.combat.feedbackTime--;
            if (this.combat.feedbackTime === 0) this.combat.feedback = '';
        }
    }
}
