import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { gameState } from '../utils/SaveManager';
import { drawEnemy, Colors } from '../utils/Drawing';

// Types d'ennemis qui ont un vrai sprite (transparent bg)
const SPRITE_ANIMS = {
    slime:   { key: 'slime',   anim: 'slime-idle',   scale: 0.40 },
    goblin:  { key: 'goblin',  anim: 'goblin-idle',  scale: 0.22 },
    bat:     { key: 'bat',     anim: 'bat-fly',      scale: 0.26 },
    orc:     { key: 'orc',     anim: 'orc-idle',     scale: 0.22 },
    vampire:  { key: 'vampire',  anim: 'vampire-idle',  scale: 2.52, combatScale: 1.2 },
    skeleton: { key: 'skeleton', anim: 'skeleton-idle', scale: 1.0,  combatScale: 2.0 },
};

const ENEMY_DEFS = {
    slime: { flying: false, resistant: false },
    bird: { flying: true, resistant: false },
    skeleton: { flying: false, resistant: false },
    bat: { flying: true, resistant: false },
    vampire: { flying: false, resistant: false },
    orc: { flying: false, resistant: true },
    goblin: { flying: false, resistant: true }
};

const LEVEL_BG = { foret: 'bg-forest', chateau: 'bg-chateau', montagne: 'bg-montagne' };

const LEVELS = {
    foret:    { hpRange: [1, 2], killGoal: 10,
        getTypes: () => gameState.data.spells.includes('glace') ? ['slime', 'bird', 'slime'] : ['slime'] },
    chateau:  { hpRange: [3, 4], killGoal: 10,
        getTypes: () => gameState.data.spells.includes('glace') ? ['skeleton', 'bat', 'vampire'] : ['skeleton', 'vampire'] },
    montagne: { hpRange: [5, 6], killGoal: 10,
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
        this.player = { x: 100, y: H * 0.8 };
        this.particles = [];

        this.add.image(W / 2, H / 2, LEVEL_BG[this.levelKey]).setDisplaySize(W, H).setDepth(0);
        this.enemies = [];
        this.enemyGraphicsList = [];
        this.particleGraphics = this.add.graphics().setDepth(20);
        this.uiGraphics = this.add.graphics();

        this.playerFacingRight = true;
        this.wizardSprite = this.add.sprite(this.player.x, this.player.y, 'wizard-idle')
            .setScale(1.70)
            .setDepth(30);
        this.wizardSprite.play('wizard-idle');

        this.spawnEnemies();

        // HUD
        this.hpGraphics = this.add.graphics();
        this.hpText = this.add.text(110, 25, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.spellsGraphics = this.add.graphics();
        this.spellsLabel = this.add.text(20, 60, 'Sorts :', { fontFamily: 'sans-serif', fontSize: '12px', color: '#ffffff' });

        this.killCounter = this.add.text(W - 20, 25, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#f4c430', fontStyle: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 10, y: 6 }
        }).setOrigin(1, 0.5);

        this.actionHint = this.add.text(0, 0, '', {
            fontFamily: 'sans-serif', fontSize: '12px', color: '#000000',
            backgroundColor: '#f4c430', padding: { x: 6, y: 3 }, fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);

        this.exitHint = this.add.text(W / 2, 95, '', {
            fontFamily: 'sans-serif', fontSize: '12px', color: '#000000',
            backgroundColor: '#52c878', padding: { x: 8, y: 4 }, fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);

        this.messageBox = this.add.graphics().setVisible(false);
        this.messageText = this.add.text(W / 2, 115, '', {
            fontFamily: 'serif', fontSize: '18px', color: '#f4c430', fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);
        this.messageTime = 0;

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

        this.combatHint = this.add.text(W / 2, H * 0.83, 'Tape ta réponse puis Entrée · Échap pour fuir', {
            fontFamily: 'sans-serif', fontSize: '11px', color: '#aaaaaa'
        }).setOrigin(0.5);

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
        // Détruit les anciens sprites/graphics
        this.enemies.forEach(e => { if (e.sprite) e.sprite.destroy(); });
        this.enemyGraphicsList.forEach(g => g.destroy());
        this.enemyGraphicsList = [];
        this.enemies = [];

        const lvl = LEVELS[this.levelKey];
        const types = lvl.getTypes();
        const count = 4;
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const def = ENEMY_DEFS[type];
            const hp = lvl.hpRange[0] + Math.floor(Math.random() * (lvl.hpRange[1] - lvl.hpRange[0] + 1));
            const flying = def.flying;
            const baseY = flying ? (this.H * 0.36 + Math.random() * this.H * 0.12) : (this.H * 0.65 + Math.random() * this.H * 0.16);
            const ex = this.W * 0.4 + i * (this.W * 0.13) + Math.random() * 30;
            const enemy = {
                type, hp, maxHp: hp,
                x: ex, y: baseY, baseY,
                flash: 0, frozen: 0,
                flying, resistant: def.resistant,
                floatPhase: Math.random() * Math.PI * 2,
                sprite: null
            };

            // Sprite (si disponible) ou graphics procédural
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
            // Graphics pour les effets (gel, HP bar) et les ennemis sans sprite
            const g = this.add.graphics().setDepth(15);
            this.enemyGraphicsList.push(g);
            this.enemies.push(enemy);
        }

        // Texte verrou pour volants
        this.enemyLockTexts = this.enemies.map((e) => {
            return this.add.text(e.x, e.y - 50, '', {
                fontFamily: 'sans-serif', fontSize: '16px', color: '#7fdbff', fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(20);
        });
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
                    if (this.levelKey === 'foret' && !gameState.data.spells.includes('glace')) {
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
            this.combatEnemyGraphics.setScale(2.5);
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
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.combat = null;
            this.combatLayer.setVisible(false);
            this.combatEnemySprite.setVisible(false);
            return;
        }
        if (!this.combat.op) return;
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.submitAnswer();
            return;
        }
        if (Phaser.Input.Keyboard.JustDown(this.backspaceKey)) {
            this.combat.input = this.combat.input.slice(0, -1);
            return;
        }
        for (let i = 0; i <= 9; i++) {
            if (Phaser.Input.Keyboard.JustDown(this.numKeys[i])) {
                if (this.combat.input.length < 3) {
                    this.combat.input += i.toString();
                }
                return;
            }
        }
        // Changement de sort
        if (this.combat.locked !== 'must_freeze') {
            if (Phaser.Input.Keyboard.JustDown(this.spellHotkeys.feu) && gameState.data.spells.includes('feu')) {
                this.combat.spell = 'feu'; this.generateOp('feu');
            } else if (Phaser.Input.Keyboard.JustDown(this.spellHotkeys.foudre) && gameState.data.spells.includes('foudre')) {
                this.combat.spell = 'foudre'; this.generateOp('foudre');
            }
        }
        if (Phaser.Input.Keyboard.JustDown(this.spellHotkeys.glace) && gameState.data.spells.includes('glace')) {
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
                const ds = e.type === 'bird' ? 2 : 1;
                g.setPosition(e.x, e.y).setScale(ds);
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
            if (this.wizardSprite.anims.currentAnim?.key !== 'wizard-attack') {
                this.wizardSprite.play('wizard-attack');
            }
        } else {
            // Mouvement
            const sp = 3;
            let moved = false;
            if (this.cursors.left.isDown)  { this.player.x -= sp; this.playerFacingRight = false; moved = true; }
            if (this.cursors.right.isDown) { this.player.x += sp; this.playerFacingRight = true;  moved = true; }
            if (this.cursors.up.isDown)    { this.player.y -= sp; moved = true; }
            if (this.cursors.down.isDown)  { this.player.y += sp; moved = true; }
            this.player.x = Math.max(20, Math.min(W - 20, this.player.x));
            this.player.y = Math.max(H * 0.3, Math.min(H * 0.95, this.player.y));

            const animKey = moved ? 'wizard-run' : 'wizard-idle';
            if (this.wizardSprite.anims.currentAnim?.key !== animKey) {
                this.wizardSprite.play(animKey);
            }

            // Détection ennemi proche
            const near = this.findNearestEnemy();
            if (near) {
                this.actionHint.setText('Espace pour combattre').setPosition(near.x, near.y - 50).setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                    this.startCombat(near);
                }
            } else {
                this.actionHint.setVisible(false);
            }

            // Retour au hub
            if (Phaser.Input.Keyboard.JustDown(this.hKey)) {
                this.scene.start('Hub');
                return;
            }
        }

        this.drawHUD();

        // Indication retour hub si niveau terminé
        if (gameState.data.killsByLevel[this.levelKey] >= lvl.killGoal) {
            this.exitHint.setText('Niveau terminé ! Appuie sur H pour revenir').setVisible(true);
        } else {
            this.exitHint.setVisible(false);
        }

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
