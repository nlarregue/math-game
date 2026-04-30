// Gestion de la sauvegarde via localStorage
const SAVE_KEY = 'wizard_game_save_v2';

export const DEFAULT_STATE = () => ({
    introStep: 0,
    player: { hp: 10, maxHp: 10 },
    killsByLevel: { foret: 0, chateau: 0, montagne: 0 },
    spells: ['feu'],
    levelProgress: { foret: false, chateau: false, montagne: false },
    bossDefeated: false,
    introDone: false
});

export const SaveManager = {
    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return DEFAULT_STATE();
            const data = JSON.parse(raw);
            // Fusion avec valeurs par défaut au cas où la structure évolue
            return { ...DEFAULT_STATE(), ...data };
        } catch (e) {
            console.warn('Erreur de chargement, nouvelle partie', e);
            return DEFAULT_STATE();
        }
    },

    save(state) {
        try {
            const data = {
                introStep: state.introStep,
                introDone: state.introDone,
                player: { hp: state.player.hp, maxHp: state.player.maxHp },
                killsByLevel: state.killsByLevel,
                spells: state.spells,
                levelProgress: state.levelProgress,
                bossDefeated: state.bossDefeated
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Erreur de sauvegarde', e);
            return false;
        }
    },

    reset() {
        try {
            localStorage.removeItem(SAVE_KEY);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// Singleton de l'état partagé entre toutes les scènes
class GameState {
    constructor() {
        this.data = SaveManager.load();
    }

    save() {
        SaveManager.save(this.data);
    }

    reset() {
        SaveManager.reset();
        this.data = DEFAULT_STATE();
    }

    healPlayer() {
        this.data.player.hp = this.data.player.maxHp;
    }
}

export const gameState = new GameState();
