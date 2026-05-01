import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { gameState } from '../utils/SaveManager';
import { drawWizard, drawDragon, Colors } from '../utils/Drawing';

export class Boss extends Scene {
    constructor() {
        super('Boss');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.W = W; this.H = H;
        this.t = 0;
        this.player = { x: 200, y: H * 0.7 };
        this.boss = {
            type: 'dragon', hp: 15, maxHp: 15,
            x: W * 0.75, y: H * 0.5,
            flash: 0, frozen: 0, flying: false, resistant: false
        };
        this.combat = null;
        this.particles = [];

        this.bgGraphics = this.add.graphics();
        this.dragonGraphics = this.add.graphics();
        this.wizardGraphics = this.add.graphics();
        this.particleGraphics = this.add.graphics();

        // HP boss
        this.bossHpGraphics = this.add.graphics();
        this.bossHpText = this.add.text(W / 2, H * 0.92, '', {
            fontFamily: 'serif', fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // HUD
        this.hpGraphics = this.add.graphics();
        this.hpText = this.add.text(110, 25, '', { fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.spellsGraphics = this.add.graphics();
        this.spellsLabel = this.add.text(20, 60, 'Sorts :', { fontFamily: 'sans-serif', fontSize: '12px', color: '#ffffff' });

        this.actionHint = this.add.text(W / 2, H * 0.22, 'Espace pour attaquer !', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#000000',
            backgroundColor: '#f4c430', padding: { x: 10, y: 5 }, fontStyle: 'bold'
        }).setOrigin(0.5);

        this.createCombatUI();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.escKey = this.input.keyboard.addKey('ESC');
        this.enterKey = this.input.keyboard.addKey('ENTER');
        this.backspaceKey = this.input.keyboard.addKey('BACKSPACE');
        this.numKeys = {};
        for (let i = 0; i <= 9; i++) {
            this.numKeys[i] = this.input.keyboard.addKey(48 + i);
        }
        this.spellHotkeys = {
            feu: this.input.keyboard.addKey('ONE'),
            glace: this.input.keyboard.addKey('TWO'),
            foudre: this.input.keyboard.addKey('THREE')
        };
    }

    createCombatUI() {
        const W = this.W, H = this.H;
        this.combatLayer = this.add.container(0, 0).setVisible(false);
        const overlay = this.add.graphics();
        overlay.fillStyle(Colors.black, 0.85);
        overlay.fillRect(0, 0, W, H);
        const box = this.add.graphics();
        box.fillStyle(0x1a1428);
        box.fillRect(80, 60, W - 160, H - 120);
        box.lineStyle(3, Colors.gold);
        box.strokeRect(80, 60, W - 160, H - 120);

        this.combatTitle = this.add.text(W / 2, 95, '⚔ Combat Final ⚔', {
            fontFamily: 'serif', fontSize: '22px', color: '#f4c430', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.combatBossGraphics = this.add.graphics();

        this.combatBossHpBar = this.add.graphics();
        this.combatBossHpText = this.add.text(W / 2, H * 0.42, '', {
            fontFamily: 'sans-serif', fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
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
            overlay, box, this.combatTitle, this.combatBossGraphics,
            this.combatBossHpBar, this.combatBossHpText,
            this.spellChoiceLabel,
            ...this.spellButtons.flatMap(b => [b.btnGraphics, b.nameText, b.dmgText]),
            this.opText, this.inputBox, this.inputText, this.feedbackText, this.combatHint
        ]);
    }

    startCombat() {
        this.combat = { spell: 'feu', op: null, input: '', feedback: '', feedbackTime: 0 };
        this.generateOp('feu');
        this.combatLayer.setVisible(true);
        this.actionHint.setVisible(false);
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
            const dmg = c.spell === 'feu' ? 1 : c.spell === 'glace' ? 2 : 3;
            this.boss.hp -= dmg;
            this.boss.flash = 10;
            this.addParticles(this.boss.x, this.boss.y,
                c.spell === 'feu' ? Colors.fire : c.spell === 'glace' ? Colors.ice : Colors.lightning, 20);
            c.feedback = `✓ Correct ! ${dmg} dégât${dmg > 1 ? 's' : ''} !`;
            c.feedbackTime = 40;

            if (this.boss.hp <= 0) {
                this.addParticles(this.boss.x, this.boss.y, Colors.gold, 50);
                gameState.data.bossDefeated = true;
                gameState.save();
                this.combat = null;
                this.combatLayer.setVisible(false);
                this.scene.start('Victory');
                return;
            }
            this.time.delayedCall(800, () => { if (this.combat) this.generateOp(this.combat.spell); });
        } else {
            gameState.data.player.hp--;
            c.feedback = `✗ Faux ! La réponse était ${c.op.result}`;
            c.feedbackTime = 60;
            this.addParticles(this.player.x, this.player.y, Colors.red, 15);
            gameState.save();
            if (gameState.data.player.hp <= 0) {
                this.combat = null;
                this.combatLayer.setVisible(false);
                this.scene.start('GameOver');
                return;
            }
            this.time.delayedCall(1200, () => { if (this.combat) this.generateOp(this.combat.spell); });
        }
        c.input = '';
    }

    addParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 30, color });
        }
    }

    handleCombatInput() {
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.combat = null;
            this.combatLayer.setVisible(false);
            this.actionHint.setVisible(true);
            return;
        }
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
        if (Phaser.Input.Keyboard.JustDown(this.spellHotkeys.feu) && gameState.data.spells.includes('feu')) {
            this.combat.spell = 'feu'; this.generateOp('feu');
        } else if (Phaser.Input.Keyboard.JustDown(this.spellHotkeys.glace) && gameState.data.spells.includes('glace')) {
            this.combat.spell = 'glace'; this.generateOp('glace');
        } else if (Phaser.Input.Keyboard.JustDown(this.spellHotkeys.foudre) && gameState.data.spells.includes('foudre')) {
            this.combat.spell = 'foudre'; this.generateOp('foudre');
        }
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
    }

    drawCombat() {
        const c = this.combat;
        const W = this.W, H = this.H;

        this.combatBossGraphics.clear();
        this.combatBossGraphics.x = W / 2;
        this.combatBossGraphics.y = H * 0.3;
        this.combatBossGraphics.setScale(0.9);
        drawDragon(this.combatBossGraphics, 0, 0, this.t);

        // Barre de vie du dragon en combat
        const barW = 200;
        const barH = 14;
        const barX = W / 2 - barW / 2;
        const barY = H * 0.4;
        this.combatBossHpBar.clear();
        this.combatBossHpBar.fillStyle(0x330000, 0.9);
        this.combatBossHpBar.fillRect(barX, barY, barW, barH);
        this.combatBossHpBar.fillStyle(0xe24b4a);
        this.combatBossHpBar.fillRect(barX, barY, barW * (this.boss.hp / this.boss.maxHp), barH);
        this.combatBossHpBar.lineStyle(1, 0xffffff, 0.6);
        this.combatBossHpBar.strokeRect(barX, barY, barW, barH);
        this.combatBossHpText.setText(`Dragon : ${this.boss.hp} / ${this.boss.maxHp}`).setY(barY + barH + 6);

        this.spellButtons.forEach(b => {
            const unlocked = gameState.data.spells.includes(b.spell);
            const active = c.spell === b.spell;
            b.btnGraphics.clear();
            b.btnGraphics.fillStyle(unlocked ? (active ? b.color : 0x222222) : 0x333333);
            b.btnGraphics.fillRect(b.x - 65, H * 0.5, 130, 50);
            b.btnGraphics.lineStyle(2, active ? Colors.white : (unlocked ? b.color : 0x555555));
            b.btnGraphics.strokeRect(b.x - 65, H * 0.5, 130, 50);
            b.nameText.setColor(unlocked ? (active ? '#000000' : '#ffffff') : '#777777');
            b.dmgText.setColor(unlocked ? (active ? '#000000' : '#ffffff') : '#777777');
        });

        if (c.op) {
            const color = c.spell === 'feu' ? '#ff6b35' : c.spell === 'glace' ? '#7fdbff' : '#ffe44d';
            this.opText.setText(`${c.op.a} ${c.op.sym} ${c.op.b} = ?`).setColor(color);
        }

        this.inputBox.clear();
        this.inputBox.fillStyle(Colors.white);
        this.inputBox.fillRect(W / 2 - 60, H * 0.74, 120, 30);
        this.inputText.setText(c.input || '_');

        if (c.feedback) {
            this.feedbackText.setText(c.feedback)
                .setColor(c.feedback.indexOf('✓') >= 0 ? '#52c878' : '#e24b4a');
        } else {
            this.feedbackText.setText('');
        }
    }

    update(time, delta) {
        this.t += delta / 16.67;
        const W = this.W, H = this.H;

        // Fond
        this.bgGraphics.clear();
        this.bgGraphics.fillStyle(0x1a0a1a);
        this.bgGraphics.fillRect(0, 0, W, H * 0.5);
        this.bgGraphics.fillStyle(0x3a0a1a);
        this.bgGraphics.fillRect(0, H * 0.5, W, H * 0.5);

        // Dragon
        this.dragonGraphics.clear();
        if (this.boss.flash > 0) {
            this.dragonGraphics.alpha = 0.5;
            this.boss.flash--;
        } else {
            this.dragonGraphics.alpha = 1;
        }
        drawDragon(this.dragonGraphics, this.boss.x, this.boss.y, this.t);

        // HP boss
        this.bossHpGraphics.clear();
        this.bossHpGraphics.fillStyle(Colors.black, 0.7);
        this.bossHpGraphics.fillRect(W * 0.25, H * 0.88, W * 0.5, 40);
        this.bossHpGraphics.fillStyle(Colors.red);
        this.bossHpGraphics.fillRect(W * 0.255, H * 0.89, W * 0.49 * (this.boss.hp / this.boss.maxHp), 30);
        this.bossHpText.setText(`Dragon Gardien : ${this.boss.hp}/${this.boss.maxHp}`);

        // Particules
        this.particles = this.particles.filter(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life--;
            return p.life > 0;
        });
        this.particleGraphics.clear();
        this.particles.forEach(p => {
            this.particleGraphics.fillStyle(p.color, p.life / 30);
            this.particleGraphics.fillCircle(p.x, p.y, 3);
        });

        if (this.combat) {
            this.handleCombatInput();
            this.drawCombat();
            drawWizard(this.wizardGraphics, this.player.x, this.player.y, 1, true);
            if (this.combat && this.combat.feedbackTime > 0) {
                this.combat.feedbackTime--;
                if (this.combat.feedbackTime === 0) this.combat.feedback = '';
            }
        } else {
            drawWizard(this.wizardGraphics, this.player.x, this.player.y, 1, false);
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.startCombat();
            }
        }

        this.drawHUD();
    }
}
