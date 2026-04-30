import { useRef, useState } from 'react';
import { PhaserGame } from './PhaserGame';
import { gameState, SaveManager } from './game/utils/SaveManager';

function App() {
    const phaserRef = useRef();
    const [resetMsg, setResetMsg] = useState('');

    const handleReset = () => {
        if (!window.confirm('Vraiment recommencer depuis le début ? La sauvegarde sera effacée.')) return;
        gameState.reset();
        SaveManager.reset();
        // Recharger la page pour repartir proprement
        window.location.reload();
    };

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} />
            <div className="side-panel">
                <h2>Le Grimoire Sacré</h2>
                <p className="info">L'aventure d'Eldrin le Sorcier</p>
                <button className="button" onClick={handleReset}>
                    Recommencer la partie
                </button>
                {resetMsg && <p className="info">{resetMsg}</p>}
                <div className="controls">
                    <h3>Contrôles</h3>
                    <ul>
                        <li><b>Flèches</b> : se déplacer</li>
                        <li><b>Espace</b> : action / combat</li>
                        <li><b>1, 2, 3</b> : changer de sort</li>
                        <li><b>0–9</b> : taper la réponse</li>
                        <li><b>Entrée</b> : valider</li>
                        <li><b>Échap</b> : fuir le combat</li>
                        <li><b>H</b> : retour au hub</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default App;
