import { Scene } from 'phaser';
import { gameState } from '../utils/SaveManager';
import { Colors } from '../utils/Drawing';

export class GameOver extends Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        const bg = this.add.graphics();
        bg.fillStyle(0x1a0a0a);
        bg.fillRect(0, 0, W, H);

        this.add.text(W / 2, H * 0.4, 'Game Over', {
            fontFamily: 'serif', fontSize: '64px', color: '#e24b4a', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.55, 'Eldrin est tombé...', {
            fontFamily: 'serif', fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.62, 'Mais ta progression est sauvegardée !', {
            fontFamily: 'sans-serif', fontSize: '16px', color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.75, 'Espace pour retourner au hub', {
            fontFamily: 'sans-serif', fontSize: '16px', color: '#f4c430'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-SPACE', () => {
            gameState.healPlayer();
            gameState.save();
            this.scene.start('Hub');
        });
    }
}

export class Victory extends Scene {
    constructor() {
        super('Victory');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.W = W; this.H = H;
        this.t = 0;

        this.bg = this.add.graphics();
        this.bg.fillStyle(0x0a0a2a);
        this.bg.fillRect(0, 0, W, H);

        // Étoiles
        this.starGraphics = this.add.graphics();
        this.stars = [];
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: (i * 73) % W,
                y: (i * 47) % H,
                phase: i
            });
        }

        this.haloGraphics = this.add.graphics();
        this.bookGraphics = this.add.graphics();

        this.add.text(W / 2, H * 0.65, 'VICTOIRE !', {
            fontFamily: 'serif', fontSize: '48px', color: '#f4c430', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.74, 'Eldrin a obtenu le Grimoire Sacré !', {
            fontFamily: 'serif', fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.85, 'Espace pour retourner au hub', {
            fontFamily: 'sans-serif', fontSize: '16px', color: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-SPACE', () => {
            gameState.healPlayer();
            gameState.save();
            this.scene.start('Hub');
        });
    }

    update(time, delta) {
        this.t += delta / 16.67;
        const W = this.W, H = this.H;

        // Étoiles scintillantes
        this.starGraphics.clear();
        this.stars.forEach(s => {
            const a = 0.3 + Math.sin(this.t * 0.05 + s.phase) * 0.5;
            this.starGraphics.fillStyle(Colors.white, a);
            this.starGraphics.fillRect(s.x, s.y, 2, 2);
        });

        // Halo sur le livre
        this.haloGraphics.clear();
        const a = 0.3 + Math.sin(this.t * 0.1) * 0.2;
        this.haloGraphics.fillStyle(Colors.gold, a);
        this.haloGraphics.fillCircle(W / 2, H * 0.4, 80);

        // Livre
        this.bookGraphics.clear();
        this.bookGraphics.fillStyle(0x5a2a1a);
        this.bookGraphics.fillRect(W / 2 - 40, H * 0.34, 80, 60);
        this.bookGraphics.fillStyle(Colors.gold);
        this.bookGraphics.fillRect(W / 2 - 30, H * 0.36, 60, 40);
    }
}
