import * as Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { Intro } from './scenes/Intro';
import { Hub } from './scenes/Hub';
import { Level } from './scenes/Level';
import { Boss } from './scenes/Boss';
import { GameOver, Victory } from './scenes/GameOver';

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#0a0a0f',
    scene: [
        Boot,
        Preloader,
        Intro,
        Hub,
        Level,
        Boss,
        GameOver,
        Victory
    ]
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;
