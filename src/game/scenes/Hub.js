import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { gameState } from '../utils/SaveManager';
import { drawForest, Colors } from '../utils/Drawing';

export class Hub extends Scene {
    constructor() {
        super('Hub');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.W = W; this.H = H;
        this.t = 0;

        this.player = { x: W / 2, y: H * 0.75 };

        this.bgGraphics = this.add.graphics();
        this.signGraphics = this.add.graphics();
        this.portalGraphics = this.add.graphics();
        this.uiGraphics = this.add.graphics();

        this.playerFacingRight = true;
        this.wizardSprite = this.add.sprite(this.player.x, this.player.y, 'wizard-idle')
            .setScale(0.32)
            .setDepth(30);
        this.wizardSprite.play('wizard-idle');

        // Titre
        this.titleBg = this.add.graphics();
        this.titleBg.fillStyle(Colors.black, 0.7);
        this.titleBg.fillRect(0, 0, W, 80);
        this.add.text(W / 2, 30, 'Choisis ta destination', {
            fontFamily: 'serif', fontSize: '28px', color: '#f4c430', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(W / 2, 60, 'Marche sur un panneau pour entrer dans un niveau', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff'
        }).setOrigin(0.5);

        // Texte messages contextuels
        this.signLabels = [];
        this.signs = [
            { x: W * 0.18, y: H * 0.6, name: 'Forêt', key: 'foret', color: 0x2a6a2a, requires: null },
            { x: W * 0.5, y: H * 0.6, name: 'Château', key: 'chateau', color: 0x5d5570, requires: 'foret' },
            { x: W * 0.82, y: H * 0.6, name: 'Montagne', key: 'montagne', color: 0x5a4030, requires: 'chateau' }
        ];

        this.signs.forEach(s => {
            const label = this.add.text(s.x, s.y - 13, s.name, {
                fontFamily: 'serif', fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
            this.signLabels.push(label);
        });

        this.actionHint = this.add.text(0, 0, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#000000',
            backgroundColor: '#f4c430', padding: { x: 8, y: 4 }, fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);

        this.bossText = this.add.text(W / 2, H * 0.32, '', {
            fontFamily: 'serif', fontSize: '20px', color: '#f4c430', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5);

        this.bossSubtext = this.add.text(W / 2, H * 0.37, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        // Message
        this.messageBox = this.add.graphics().setVisible(false);
        this.messageText = this.add.text(W / 2, H * 0.21, '', {
            fontFamily: 'serif', fontSize: '18px', color: '#f4c430', fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);
        this.messageTime = 0;

        // Contrôles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey('SPACE');

        // HUD
        this.createHUD();

        // Message d'intro
        if (gameState.data.spells.length === 1) {
            this.showMessage('Marche vers la Forêt pour commencer !', 180);
        }
    }

    createHUD() {
        // HP bar
        this.hpGraphics = this.add.graphics();
        this.hpText = this.add.text(110, 25, '', {
            fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        // Sorts
        this.spellsGraphics = this.add.graphics();
        this.spellsLabel = this.add.text(20, 60, 'Sorts :', {
            fontFamily: 'sans-serif', fontSize: '12px', color: '#ffffff'
        });
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

    drawSigns() {
        this.signGraphics.clear();
        const s = gameState.data;
        this.signs.forEach((sign, i) => {
            const unlocked = !sign.requires || s.levelProgress[sign.requires];
            // Pied
            this.signGraphics.fillStyle(0x5a3a1a);
            this.signGraphics.fillRect(sign.x - 3, sign.y, 6, 40);
            // Panneau
            this.signGraphics.fillStyle(unlocked ? sign.color : 0x444444);
            this.signGraphics.fillRect(sign.x - 50, sign.y - 30, 100, 40);
            this.signGraphics.lineStyle(3, unlocked ? Colors.gold : 0x888888);
            this.signGraphics.strokeRect(sign.x - 50, sign.y - 30, 100, 40);
            this.signLabels[i].setColor(unlocked ? '#ffffff' : '#aaaaaa');
            // Étoile si terminé
            if (s.levelProgress[sign.key]) {
                if (!sign.starText) {
                    sign.starText = this.add.text(sign.x, sign.y + 35, '★', {
                        fontFamily: 'serif', fontSize: '20px', color: '#f4c430'
                    }).setOrigin(0.5);
                }
            }
            // Verrou
            if (!unlocked) {
                if (!sign.lockText) {
                    sign.lockText = this.add.text(sign.x, sign.y + 30, 'Verrouillé', {
                        fontFamily: 'sans-serif', fontSize: '12px', color: '#e24b4a'
                    }).setOrigin(0.5);
                }
            } else if (sign.lockText) {
                sign.lockText.destroy();
                sign.lockText = null;
            }
        });
    }

    showMessage(msg, frames = 120) {
        this.messageText.setText(msg).setVisible(true);
        const W = this.W;
        this.messageBox.clear();
        this.messageBox.fillStyle(Colors.black, 0.85);
        this.messageBox.fillRect(W / 2 - 250, this.H * 0.18, 500, 40);
        this.messageBox.setVisible(true);
        this.messageTime = frames;
    }

    update(time, delta) {
        this.t += delta / 16.67;
        const s = gameState.data;
        const W = this.W, H = this.H;

        // Mouvement
        const sp = 3;
        let moved = false;
        if (this.cursors.left.isDown)  { this.player.x -= sp; this.playerFacingRight = false; moved = true; }
        if (this.cursors.right.isDown) { this.player.x += sp; this.playerFacingRight = true;  moved = true; }
        if (this.cursors.up.isDown)    { this.player.y -= sp; moved = true; }
        if (this.cursors.down.isDown)  { this.player.y += sp; moved = true; }
        this.player.x = Math.max(20, Math.min(W - 20, this.player.x));
        this.player.y = Math.max(H * 0.3, Math.min(H * 0.95, this.player.y));

        // Décor
        drawForest(this.bgGraphics, this.t, W, H);
        this.drawSigns();

        // Wizard sprite
        this.wizardSprite.setPosition(this.player.x, this.player.y);
        this.wizardSprite.setFlipX(!this.playerFacingRight);
        const animKey = moved ? 'wizard-run' : 'wizard-idle';
        if (this.wizardSprite.anims.currentAnim?.key !== animKey) {
            this.wizardSprite.play(animKey);
        }

        // Boss disponible
        const allDone = s.levelProgress.foret && s.levelProgress.chateau && s.levelProgress.montagne;
        this.portalGraphics.clear();
        this.nearAction = null;

        if (allDone && !s.bossDefeated) {
            this.bossText.setText('★ Le Grimoire Sacré t\'attend ! ★');
            this.bossSubtext.setText('Va vers le centre pour l\'affronter !');
            const portalY = H * 0.42;
            const a = 0.5 + Math.sin(this.t * 0.1) * 0.3;
            this.portalGraphics.fillStyle(Colors.purple, a);
            this.portalGraphics.fillCircle(W / 2, portalY, 30);
            if (Math.abs(this.player.x - W / 2) < 40 && Math.abs(this.player.y - portalY) < 40) {
                this.nearAction = 'boss';
                this.actionHint.setText('Espace pour le combat final').setPosition(W / 2, portalY - 50).setVisible(true);
            }
        } else if (s.bossDefeated) {
            this.bossText.setText('★ Tu as obtenu le Grimoire Sacré ! ★');
            this.bossSubtext.setText('Tu peux continuer à explorer !');
        } else {
            this.bossText.setText('');
            this.bossSubtext.setText('');
        }

        // Détection panneau proche
        if (!this.nearAction) {
            for (const sign of this.signs) {
                const unlocked = !sign.requires || s.levelProgress[sign.requires];
                if (unlocked && Math.abs(this.player.x - sign.x) < 40 && Math.abs(this.player.y - sign.y) < 40) {
                    this.nearAction = sign.key;
                    this.actionHint.setText('Espace pour entrer').setPosition(sign.x, sign.y - 55).setVisible(true);
                    break;
                }
            }
        }

        if (!this.nearAction) {
            this.actionHint.setVisible(false);
        }

        // Action
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.nearAction) {
            if (this.nearAction === 'boss') {
                this.scene.start('Boss');
            } else {
                this.scene.start('Level', { level: this.nearAction });
            }
        }

        // HUD
        this.drawHUD();

        // Message
        if (this.messageTime > 0) {
            this.messageTime--;
            if (this.messageTime === 0) {
                this.messageBox.setVisible(false);
                this.messageText.setVisible(false);
            }
        }
    }
}
