import { Scene } from 'phaser';
import { gameState } from '../utils/SaveManager';
import { drawWizard, drawForest, Colors } from '../utils/Drawing';

const INTRO_TEXTS = [
    "Il était une fois, dans un royaume lointain,\nun jeune sorcier nommé Eldrin...",
    "Eldrin passait ses journées dans la grande bibliothèque,\nà étudier les sortilèges anciens.",
    "Un jour, en cherchant un vieux livre poussiéreux,\nil découvrit un manuscrit étrange...",
    "« Le Grimoire Sacré d'Aetheria...\ncelui qui le possède maîtrise tous les sortilèges ! »",
    "À l'intérieur du livre, une carte magique s'illumina...\nElle révélait trois lieux : la Forêt, le Château, la Montagne.",
    "Eldrin comprit alors qu'il devait partir à l'aventure.\nIl saisit son bâton, et le voyage commença !"
];

export class Intro extends Scene {
    constructor() {
        super('Intro');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.W = W; this.H = H;

        this.step = gameState.data.introStep || 0;
        this.t = 0;

        // Conteneur graphique principal qu'on va vider à chaque step
        this.bgGraphics = this.add.graphics();
        this.fgGraphics = this.add.graphics();
        this.wizardGraphics = this.add.graphics();
        this.haloGraphics = this.add.graphics();

        // Boîte texte
        this.textBox = this.add.graphics();
        this.textBox.fillStyle(0x000000, 0.85);
        this.textBox.fillRect(50, H - 100, W - 100, 70);
        this.textBox.lineStyle(2, Colors.gold);
        this.textBox.strokeRect(50, H - 100, W - 100, 70);

        this.introText = this.add.text(W / 2, H - 75, '', {
            fontFamily: 'serif',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.continueHint = this.add.text(W / 2, H - 15, '▼ Espace pour continuer ▼', {
            fontFamily: 'sans-serif',
            fontSize: '14px',
            color: '#f4c430'
        }).setOrigin(0.5);

        // Texte de la scène (titre, livre, etc.)
        this.titleText = this.add.text(W / 2, 0, '', {
            fontFamily: 'serif',
            fontSize: '48px',
            color: '#f4c430',
            fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);

        this.subtitleText = this.add.text(W / 2, 0, '', {
            fontFamily: 'serif',
            fontSize: '24px',
            color: '#9b6dd4'
        }).setOrigin(0.5).setVisible(false);

        // Texte décoratif (livre, carte)
        this.decorTexts = [];

        // Touche espace
        this.input.keyboard.on('keydown-SPACE', () => this.nextStep());

        this.renderStep();
    }

    nextStep() {
        this.step++;
        gameState.data.introStep = this.step;
        if (this.step >= INTRO_TEXTS.length) {
            gameState.data.introDone = true;
            gameState.save();
            this.scene.start('Hub');
            return;
        }
        gameState.save();
        this.renderStep();
    }

    clearDecorTexts() {
        this.decorTexts.forEach(t => t.destroy());
        this.decorTexts = [];
    }

    renderStep() {
        const W = this.W, H = this.H;
        this.bgGraphics.clear();
        this.fgGraphics.clear();
        this.wizardGraphics.clear();
        this.haloGraphics.clear();
        this.titleText.setVisible(false);
        this.subtitleText.setVisible(false);
        this.clearDecorTexts();

        const step = this.step;

        if (step === 0) {
            // Titre
            this.bgGraphics.fillStyle(0x0a0a1a);
            this.bgGraphics.fillRect(0, 0, W, H);
            this.titleText.setText('Le Grimoire Sacré').setPosition(W / 2, 150).setVisible(true);
            this.subtitleText.setText("L'aventure d'Eldrin le Sorcier").setPosition(W / 2, 200).setVisible(true);
            // Étoiles tirage initial
            for (let i = 0; i < 30; i++) {
                const x = (i * 73) % W;
                const y = ((i * 47) % 200) + 250;
                this.bgGraphics.fillStyle(Colors.white, 0.5);
                this.bgGraphics.fillRect(x, y, 2, 2);
            }
            drawWizard(this.wizardGraphics, W / 2, H * 0.75, 1.5);
        } else if (step === 1) {
            // Bibliothèque
            this.bgGraphics.fillStyle(0x3a2a1a);
            this.bgGraphics.fillRect(0, 0, W, H);
            this.bgGraphics.fillStyle(0x5a3a1a);
            for (let i = 0; i < 4; i++) {
                this.bgGraphics.fillRect(50 + i * (W / 4.5), 50, 150, 300);
                const colors = [0xa02020, 0x2050a0, 0x208020, 0xa08020, 0x802080];
                for (let j = 0; j < 5; j++) {
                    for (let row = 0; row < 4; row++) {
                        this.bgGraphics.fillStyle(colors[(i + j + row) % 5]);
                        this.bgGraphics.fillRect(60 + i * (W / 4.5) + j * 28, 60 + row * 60, 22, 55);
                    }
                }
            }
            this.bgGraphics.fillStyle(0x2a1a0a);
            this.bgGraphics.fillRect(0, H * 0.7, W, H * 0.3);
            drawWizard(this.wizardGraphics, W / 2, H * 0.72, 1.2);
        } else if (step === 2) {
            // Découverte du livre
            this.bgGraphics.fillStyle(0x2a1a3a);
            this.bgGraphics.fillRect(0, 0, W, H);
            this.fgGraphics.fillStyle(0x5a2a1a);
            this.fgGraphics.fillRect(W / 2 - 40, H * 0.45, 80, 60);
            this.fgGraphics.fillStyle(Colors.gold);
            this.fgGraphics.fillRect(W / 2 - 30, H * 0.47, 60, 40);
            const star = this.add.text(W / 2, H * 0.5, '★', {
                fontFamily: 'serif', fontSize: '20px', color: '#5a2a1a'
            }).setOrigin(0.5);
            this.decorTexts.push(star);
            drawWizard(this.wizardGraphics, W / 2, H * 0.78, 1.2);
        } else if (step === 3) {
            // Le grimoire ouvert
            this.bgGraphics.fillStyle(0x1a0a2a);
            this.bgGraphics.fillRect(0, 0, W, H);
            this.fgGraphics.fillStyle(0x5a2a1a);
            this.fgGraphics.fillRect(W * 0.2, H * 0.3, W * 0.6, H * 0.5);
            this.fgGraphics.fillStyle(0xf5e8c8);
            this.fgGraphics.fillRect(W * 0.22, H * 0.34, W * 0.56, H * 0.42);
            this.fgGraphics.fillStyle(0x3a2a1a);
            this.fgGraphics.fillRect(W * 0.495, H * 0.3, 10, H * 0.5);

            const lines = [
                '~ Le Grimoire Sacré ~', '', 'Celui qui maîtrise',
                'les trois sortilèges', 'feu, glace, foudre', 'recevra le pouvoir...'
            ];
            lines.forEach((l, i) => {
                const t = this.add.text(W * 0.25, H * 0.4 + i * 22, l, {
                    fontFamily: 'serif', fontSize: '14px', color: '#3a2a1a'
                });
                this.decorTexts.push(t);
            });
            const t1 = this.add.text(W * 0.55, H * 0.52, '★ ★ ★', { fontFamily: 'serif', fontSize: '20px', color: '#f4c430' });
            const t2 = this.add.text(W * 0.55, H * 0.6, 'Forêt → Château', { fontFamily: 'serif', fontSize: '14px', color: '#3a2a1a' });
            const t3 = this.add.text(W * 0.55, H * 0.65, '       → Montagne', { fontFamily: 'serif', fontSize: '14px', color: '#3a2a1a' });
            this.decorTexts.push(t1, t2, t3);
        } else if (step === 4) {
            // Carte
            this.bgGraphics.fillStyle(0x1a1a2a);
            this.bgGraphics.fillRect(0, 0, W, H);
            this.fgGraphics.fillStyle(0xd4b886);
            this.fgGraphics.fillRect(100, 80, W - 200, H - 160);
            this.fgGraphics.lineStyle(4, 0x8b5a2b);
            this.fgGraphics.strokeRect(100, 80, W - 200, H - 160);

            // Forêt
            this.fgGraphics.fillStyle(0x2a6a2a);
            for (let i = 0; i < 5; i++) {
                this.fgGraphics.fillCircle(W * 0.2 + i * 15, H * 0.4, 20);
            }
            // Château
            this.fgGraphics.fillStyle(0x5d5570);
            this.fgGraphics.fillRect(W * 0.46, H * 0.36, 60, 80);
            this.fgGraphics.fillRect(W * 0.45, H * 0.34, 15, 20);
            this.fgGraphics.fillRect(W * 0.48, H * 0.34, 15, 20);
            this.fgGraphics.fillRect(W * 0.51, H * 0.34, 15, 20);
            // Montagne
            this.fgGraphics.fillStyle(0x5a4030);
            this.fgGraphics.fillTriangle(W * 0.66, H * 0.5, W * 0.72, H * 0.3, W * 0.78, H * 0.5);
            this.fgGraphics.fillStyle(Colors.white);
            this.fgGraphics.fillTriangle(W * 0.7, H * 0.36, W * 0.72, H * 0.3, W * 0.74, H * 0.36);

            // Chemin pointillé (lignes)
            this.fgGraphics.lineStyle(3, 0x8b5a2b);
            const segs = 30;
            const path = [
                { x: W * 0.27, y: H * 0.52 },
                { x: W * 0.49, y: H * 0.58 },
                { x: W * 0.72, y: H * 0.58 }
            ];
            for (let i = 0; i < path.length - 1; i++) {
                for (let s = 0; s < segs; s += 2) {
                    const t1 = s / segs;
                    const t2 = (s + 1) / segs;
                    this.fgGraphics.lineBetween(
                        path[i].x + (path[i + 1].x - path[i].x) * t1,
                        path[i].y + (path[i + 1].y - path[i].y) * t1,
                        path[i].x + (path[i + 1].x - path[i].x) * t2,
                        path[i].y + (path[i + 1].y - path[i].y) * t2
                    );
                }
            }

            const txF = this.add.text(W * 0.27, H * 0.52, 'Forêt', { fontFamily: 'serif', fontSize: '16px', color: '#3a2a1a', fontStyle: 'bold' }).setOrigin(0.5);
            const txC = this.add.text(W * 0.51, H * 0.58, 'Château', { fontFamily: 'serif', fontSize: '16px', color: '#3a2a1a', fontStyle: 'bold' }).setOrigin(0.5);
            const txM = this.add.text(W * 0.75, H * 0.58, 'Montagne', { fontFamily: 'serif', fontSize: '16px', color: '#3a2a1a', fontStyle: 'bold' }).setOrigin(0.5);
            const star = this.add.text(W * 0.81, H * 0.4, '★', { fontFamily: 'serif', fontSize: '30px', color: '#f4c430', fontStyle: 'bold' }).setOrigin(0.5);
            this.decorTexts.push(txF, txC, txM, star);
        } else if (step === 5) {
            // Eldrin prêt
            drawForest(this.bgGraphics, this.t, W, H);
            drawWizard(this.wizardGraphics, W / 2, H * 0.76, 1.3);
        }

        this.introText.setText(INTRO_TEXTS[step]);
    }

    update(time, delta) {
        this.t += delta / 16.67;
        // Animation du halo (steps 2 et 5) et clignotement de la flèche
        if (this.step === 2) {
            this.haloGraphics.clear();
            const r = 80 + Math.sin(this.t * 0.05) * 10;
            this.haloGraphics.fillStyle(Colors.gold, 0.3);
            this.haloGraphics.fillCircle(this.W / 2, this.H * 0.5, r);
        } else if (this.step === 5) {
            this.haloGraphics.clear();
            const a = 0.3 + Math.sin(this.t * 0.1) * 0.2;
            this.haloGraphics.fillStyle(Colors.gold, a);
            this.haloGraphics.fillCircle(this.W / 2, this.H * 0.76, 50);
        } else if (this.step === 3) {
            this.haloGraphics.clear();
            const a = 0.2 + Math.sin(this.t * 0.1) * 0.2;
            this.haloGraphics.lineStyle(3, Colors.gold, a);
            this.haloGraphics.strokeRect(this.W * 0.2, this.H * 0.3, this.W * 0.6, this.H * 0.5);
        } else if (this.step === 4) {
            this.haloGraphics.clear();
            const a = 0.1 + Math.sin(this.t * 0.1) * 0.1;
            this.haloGraphics.fillStyle(Colors.gold, a);
            this.haloGraphics.fillRect(100, 80, this.W - 200, this.H - 160);
        }
        this.continueHint.setVisible(Math.floor(this.t / 30) % 2 === 0);
    }
}
