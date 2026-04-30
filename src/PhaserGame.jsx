import { forwardRef, useLayoutEffect, useRef } from 'react';
import StartGame from './game/main';

export const PhaserGame = forwardRef(function PhaserGame(props, ref) {
    const game = useRef();

    useLayoutEffect(() => {
        if (game.current === undefined) {
            game.current = StartGame('game-container');
            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }
        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        };
    }, [ref]);

    return <div id="game-container"></div>;
});
