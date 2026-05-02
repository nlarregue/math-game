import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { gameState } from '../utils/SaveManager';
import { drawForest, drawHouseExterior, drawLibraryAisle, Colors } from '../utils/Drawing';

const PHASES = [
    { id: 'title',          duration: null,  text: '' },
    { id: 'house_walk',     duration: 6000,  text: "Eldrin habitait une vieille chaumière au bord du village.\nCe matin-là, il décida de se rendre à la bibliothèque." },
    { id: 'library_enter',  duration: 4500,  text: "Il entra dans la grande bibliothèque.\nDes rangées de livres s'étiraient à perte de vue..." },
    { id: 'library_walk',   duration: 4500,  text: "Il cherchait un sortilège puissant pour se défendre.\nMais aucun livre ne semblait lui convenir." },
    { id: 'book_found',     duration: 5000,  text: "Au détour d'une allée, une lueur dorée attira son regard.\nUn livre étrange pulsait d'une magie ancienne..." },
    { id: 'grimoire_open',  duration: 4000,  text: "« Le Grimoire Sacré d'Aetheria...\nCelui qui le possède maîtrise tous les sortilèges ! »" },
    { id: 'map_reveal',     duration: 4500,  text: "À l'intérieur, une carte magique s'illumina...\nElle révélait trois lieux : la Forêt, le Château, la Montagne." },
    { id: 'depart',         duration: 3500,  text: "Eldrin comprit qu'il devait partir à l'aventure.\nIl saisit son bâton, et le voyage commença !" }
];

export class Intro extends Scene {
    constructor() {
        super('Intro');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.W = W; this.H = H;

        this.phase = 0;
        this.phaseTimer = 0;
        this.phaseTransitionCooldown = 0;
        this.t = 0;
        this.ending = false;

        // Couches graphiques par ordre de profondeur
        this.bgGraphics   = this.add.graphics().setDepth(0);
        this.fgGraphics   = this.add.graphics().setDepth(1);
        this.haloGraphics = this.add.graphics().setDepth(2);
        this.textBox      = this.add.graphics().setDepth(8);

        this.wizardSprite = this.add.sprite(-999, -999, 'wizard-idle')
            .setScale(0.32)
            .setDepth(7)
            .setVisible(false);
        this.wizardSprite.play('wizard-idle');

        // Texte narratif (boîte en bas)
        this.introText = this.add.text(W / 2, H - 73, '', {
            fontFamily: 'serif',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: W - 130 }
        }).setOrigin(0.5).setDepth(10);

        // Écran titre
        this.titleText = this.add.text(W / 2, H * 0.27, 'Le Grimoire Sacré', {
            fontFamily: 'serif',
            fontSize: '52px',
            color: '#f4c430',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        this.subtitleText = this.add.text(W / 2, H * 0.41, "L'aventure d'Eldrin le Sorcier", {
            fontFamily: 'serif',
            fontSize: '24px',
            color: '#9b6dd4'
        }).setOrigin(0.5).setDepth(10);

        this.startHint = this.add.text(W / 2, H * 0.73, '▼ Appuie sur Espace pour commencer ▼', {
            fontFamily: 'sans-serif',
            fontSize: '15px',
            color: '#f4c430'
        }).setOrigin(0.5).setDepth(10);

        this.skipHint = this.add.text(W / 2, H - 10, '[ Espace : passer ]', {
            fontFamily: 'sans-serif',
            fontSize: '12px',
            color: '#777777'
        }).setOrigin(0.5).setDepth(10).setVisible(false);

        // Textes décoratifs (grimoire ouvert, carte)
        this.decorTexts = [];

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.renderPhase();
    }

    clearDecorTexts() {
        this.decorTexts.forEach(t => t.destroy());
        this.decorTexts = [];
    }

    nextPhase() {
        this.phaseTransitionCooldown = 450;
        this.phase++;
        this.phaseTimer = 0;

        if (this.phase >= PHASES.length) {
            this.endCinematic();
            return;
        }

        this.cameras.main.fadeIn(350, 0, 0, 0);
        this.clearDecorTexts();
        this.renderPhase();
    }

    endCinematic() {
        this.ending = true;
        gameState.data.introDone = true;
        gameState.save();
        this.cameras.main.fadeOut(700, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Hub');
        });
    }

    renderPhase() {
        const W = this.W, H = this.H;
        const phase = PHASES[this.phase];

        this.textBox.clear();

        if (phase.id === 'title') {
            this.titleText.setVisible(true);
            this.subtitleText.setVisible(true);
            this.startHint.setVisible(true);
            this.skipHint.setVisible(false);
            this.introText.setVisible(false);
        } else {
            this.titleText.setVisible(false);
            this.subtitleText.setVisible(false);
            this.startHint.setVisible(false);
            this.skipHint.setVisible(true);
            this.introText.setText(phase.text).setVisible(true);
            // Boîte texte en bas
            this.textBox.fillStyle(0x000000, 0.82);
            this.textBox.fillRect(40, H - 118, W - 80, 92);
            this.textBox.lineStyle(2, Colors.gold);
            this.textBox.strokeRect(40, H - 118, W - 80, 92);
        }

        if (phase.id === 'grimoire_open') this.setupGrimoire();
        else if (phase.id === 'map_reveal') this.setupMap();
    }

    setupGrimoire() {
        const W = this.W, H = this.H;
        const lines = [
            '~ Le Grimoire Sacré ~', '', 'Celui qui maîtrise',
            'les trois sortilèges', 'feu, glace, foudre', 'recevra le pouvoir...'
        ];
        lines.forEach((l, i) => {
            const t = this.add.text(W * 0.25, H * 0.25 + i * 24, l, {
                fontFamily: 'serif', fontSize: '15px', color: '#3a2a1a'
            }).setDepth(6);
            this.decorTexts.push(t);
        });
        const t1 = this.add.text(W * 0.56, H * 0.42, '★ ★ ★', { fontFamily: 'serif', fontSize: '20px', color: '#f4c430' }).setDepth(6);
        const t2 = this.add.text(W * 0.56, H * 0.5, 'Forêt → Château', { fontFamily: 'serif', fontSize: '14px', color: '#3a2a1a' }).setDepth(6);
        const t3 = this.add.text(W * 0.56, H * 0.57, '       → Montagne', { fontFamily: 'serif', fontSize: '14px', color: '#3a2a1a' }).setDepth(6);
        this.decorTexts.push(t1, t2, t3);
    }

    setupMap() {
        const W = this.W, H = this.H;
        const txF = this.add.text(W * 0.23, H * 0.5, 'Forêt',    { fontFamily: 'serif', fontSize: '15px', color: '#3a2a1a', fontStyle: 'bold' }).setOrigin(0.5).setDepth(6);
        const txC = this.add.text(W * 0.5,  H * 0.56, 'Château',  { fontFamily: 'serif', fontSize: '15px', color: '#3a2a1a', fontStyle: 'bold' }).setOrigin(0.5).setDepth(6);
        const txM = this.add.text(W * 0.76, H * 0.56, 'Montagne', { fontFamily: 'serif', fontSize: '15px', color: '#3a2a1a', fontStyle: 'bold' }).setOrigin(0.5).setDepth(6);
        const star = this.add.text(W * 0.82, H * 0.37, '★', { fontFamily: 'serif', fontSize: '30px', color: '#f4c430', fontStyle: 'bold' }).setOrigin(0.5).setDepth(6);
        this.decorTexts.push(txF, txC, txM, star);
    }

    update(time, delta) {
        if (this.ending) return;

        this.t += delta / 16.67;
        this.phaseTransitionCooldown -= delta;

        const phase = PHASES[this.phase];

        // Touche Espace
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.phaseTransitionCooldown <= 0) {
            this.nextPhase();
            return;
        }

        // Auto-avancement
        if (phase.duration !== null) {
            this.phaseTimer += delta;
            if (this.phaseTimer >= phase.duration && this.phaseTransitionCooldown <= 0) {
                this.nextPhase();
                return;
            }
        }

        const progress = phase.duration ? Math.min(this.phaseTimer / phase.duration, 1) : 0;

        // Effacement des couches animées
        this.bgGraphics.clear();
        this.fgGraphics.clear();
        this.haloGraphics.clear();
        this.wizardSprite.setVisible(false); // chaque méthode de dessin le réactive si besoin

        switch (phase.id) {
            case 'title':          this.drawTitle(); break;
            case 'house_walk':     this.drawHouseWalk(progress); break;
            case 'library_enter':  this.drawLibraryEnter(progress); break;
            case 'library_walk':   this.drawLibraryWalk(progress); break;
            case 'book_found':     this.drawBookFound(progress); break;
            case 'grimoire_open':  this.drawGrimoire(); break;
            case 'map_reveal':     this.drawMap(); break;
            case 'depart':         this.drawDepart(); break;
        }

        if (phase.id === 'title') {
            this.startHint.setVisible(Math.floor(this.t / 30) % 2 === 0);
        }
    }

    // ===== MÉTHODES DE DESSIN =====

    drawTitle() {
        const W = this.W, H = this.H;
        this.bgGraphics.fillStyle(0x080818);
        this.bgGraphics.fillRect(0, 0, W, H);
        for (let i = 0; i < 55; i++) {
            const sx = (i * 137 + 11) % W;
            const sy = (i * 71 + 7) % (H * 0.88);
            const a = 0.2 + Math.sin(this.t * 0.035 + i * 0.7) * 0.22;
            this.bgGraphics.fillStyle(0xffffff, a);
            this.bgGraphics.fillRect(sx, sy, i % 6 === 0 ? 3 : 2, i % 6 === 0 ? 3 : 2);
        }
        this.wizardSprite.setVisible(true).setPosition(W / 2, H * 0.72).setScale(0.32 * 1.5);
        if (this.wizardSprite.anims.currentAnim?.key !== 'wizard-idle') this.wizardSprite.play('wizard-idle');
    }

    drawHouseWalk(progress) {
        const W = this.W, H = this.H;
        drawHouseExterior(this.bgGraphics, this.t, W, H);

        // Smoothstep pour un démarrage et une arrivée naturels
        const ease = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const wizX = W * 0.17 + (W * 0.79 - W * 0.17) * ease;
        const wizY = H * 0.69;
        this.wizardSprite.setVisible(true).setPosition(wizX, wizY).setScale(0.32 * 1.1);
        if (this.wizardSprite.anims.currentAnim?.key !== 'wizard-run') this.wizardSprite.play('wizard-run');
    }

    drawLibraryEnter(progress) {
        const W = this.W, H = this.H;
        drawLibraryAisle(this.bgGraphics, this.t, W, H);

        // Ease out : le sorcier décélère en entrant
        const ease = 1 - Math.pow(1 - progress, 2);
        const wizX = W * 0.08 + (W * 0.43 - W * 0.08) * ease;
        const wizY = H * 0.7;
        const scale = 0.85 + ease * 0.3;
        this.wizardSprite.setVisible(true).setPosition(wizX, wizY).setScale(0.32 * scale);
        if (this.wizardSprite.anims.currentAnim?.key !== 'wizard-run') this.wizardSprite.play('wizard-run');
    }

    drawLibraryWalk(progress) {
        const W = this.W, H = this.H;
        drawLibraryAisle(this.bgGraphics, this.t, W, H);

        const wizX = W * 0.36 + (W * 0.52 - W * 0.36) * progress;
        const scale = 1.1 + progress * 0.1;
        this.wizardSprite.setVisible(true).setPosition(wizX, H * 0.7).setScale(0.32 * scale);
        if (this.wizardSprite.anims.currentAnim?.key !== 'wizard-run') this.wizardSprite.play('wizard-run');
    }

    drawBookFound(progress) {
        const W = this.W, H = this.H;
        const bookX = W * 0.75;
        const bookY = H * 0.34;

        drawLibraryAisle(this.bgGraphics, this.t, W, H, bookX, bookY);

        // Le sorcier s'arrête, puis pointe son bâton vers le livre
        const casting = progress > 0.45;
        const wAnim = casting ? 'wizard-attack' : 'wizard-idle';
        this.wizardSprite.setVisible(true).setPosition(W * 0.44, H * 0.7).setScale(0.32 * 1.2);
        if (this.wizardSprite.anims.currentAnim?.key !== wAnim) this.wizardSprite.play(wAnim);

        // Halo extérieur supplémentaire qui grandit progressivement
        const intensity = Math.min(progress * 2.5, 1);
        const a = (0.15 + Math.sin(this.t * 0.1) * 0.12) * intensity;
        this.haloGraphics.fillStyle(Colors.gold, a);
        this.haloGraphics.fillCircle(bookX, bookY, 58 + Math.sin(this.t * 0.08) * 8);
    }

    drawGrimoire() {
        const W = this.W, H = this.H;
        // Fond
        this.bgGraphics.fillStyle(0x150a25);
        this.bgGraphics.fillRect(0, 0, W, H);
        // Livre ouvert
        this.fgGraphics.fillStyle(0x5a2a1a);
        this.fgGraphics.fillRect(W * 0.18, H * 0.14, W * 0.64, H * 0.56);
        // Pages
        this.fgGraphics.fillStyle(0xf5e8c8);
        this.fgGraphics.fillRect(W * 0.20, H * 0.17, W * 0.6, H * 0.5);
        // Reliure centrale
        this.fgGraphics.fillStyle(0x3a1a0a);
        this.fgGraphics.fillRect(W * 0.494, H * 0.14, 12, H * 0.56);
        // Bordure animée
        const a = 0.25 + Math.sin(this.t * 0.1) * 0.2;
        this.haloGraphics.lineStyle(3, Colors.gold, a);
        this.haloGraphics.strokeRect(W * 0.18, H * 0.14, W * 0.64, H * 0.56);
    }

    drawMap() {
        const W = this.W, H = this.H;
        this.bgGraphics.fillStyle(0x14142a);
        this.bgGraphics.fillRect(0, 0, W, H);
        // Parchemin
        this.fgGraphics.fillStyle(0xd4b886);
        this.fgGraphics.fillRect(90, 65, W - 180, H - 195);
        this.fgGraphics.lineStyle(4, 0x8b5a2b);
        this.fgGraphics.strokeRect(90, 65, W - 180, H - 195);
        // Forêt
        this.fgGraphics.fillStyle(0x2a6a2a);
        for (let i = 0; i < 5; i++) this.fgGraphics.fillCircle(W * 0.2 + i * 14, H * 0.37, 18);
        // Château
        this.fgGraphics.fillStyle(0x5d5570);
        this.fgGraphics.fillRect(W * 0.46, H * 0.32, 58, 74);
        this.fgGraphics.fillRect(W * 0.45, H * 0.3, 14, 18);
        this.fgGraphics.fillRect(W * 0.475, H * 0.3, 14, 18);
        this.fgGraphics.fillRect(W * 0.50, H * 0.3, 14, 18);
        // Montagne
        this.fgGraphics.fillStyle(0x5a4030);
        this.fgGraphics.fillTriangle(W * 0.65, H * 0.47, W * 0.72, H * 0.27, W * 0.79, H * 0.47);
        this.fgGraphics.fillStyle(Colors.white);
        this.fgGraphics.fillTriangle(W * 0.70, H * 0.33, W * 0.72, H * 0.27, W * 0.74, H * 0.33);
        // Chemin pointillé
        this.fgGraphics.lineStyle(3, 0x8b5a2b);
        const path = [{ x: W * 0.26, y: H * 0.49 }, { x: W * 0.49, y: H * 0.55 }, { x: W * 0.72, y: H * 0.55 }];
        for (let i = 0; i < path.length - 1; i++) {
            for (let s = 0; s < 30; s += 2) {
                const t1 = s / 30, t2 = (s + 1) / 30;
                this.fgGraphics.lineBetween(
                    path[i].x + (path[i + 1].x - path[i].x) * t1, path[i].y + (path[i + 1].y - path[i].y) * t1,
                    path[i].x + (path[i + 1].x - path[i].x) * t2, path[i].y + (path[i + 1].y - path[i].y) * t2
                );
            }
        }
        // Lueur dorée sur le parchemin
        const a = 0.06 + Math.sin(this.t * 0.08) * 0.04;
        this.haloGraphics.fillStyle(Colors.gold, a);
        this.haloGraphics.fillRect(90, 65, W - 180, H - 195);
    }

    drawDepart() {
        const W = this.W, H = this.H;
        drawForest(this.bgGraphics, this.t, W, H);
        const a = 0.3 + Math.sin(this.t * 0.1) * 0.2;
        this.haloGraphics.fillStyle(Colors.gold, a);
        this.haloGraphics.fillCircle(W / 2, H * 0.76, 52);
        this.wizardSprite.setVisible(true).setPosition(W / 2, H * 0.76).setScale(0.32 * 1.3);
        if (this.wizardSprite.anims.currentAnim?.key !== 'wizard-idle') this.wizardSprite.play('wizard-idle');
    }
}
