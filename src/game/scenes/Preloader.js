import { Scene } from 'phaser';
import { gameState } from '../utils/SaveManager';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    create() {
        // Pas d'assets externes : tout est dessiné en Graphics
        // On enchaîne selon l'état de la sauvegarde
        if (gameState.data.introDone) {
            this.scene.start('Hub');
        } else {
            this.scene.start('Intro');
        }
    }
}
