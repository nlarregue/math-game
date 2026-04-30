# Migration vers Phaser + React + Vite

Ces fichiers remplacent ceux du template `phaserjs/template-react` cloné depuis votre dépôt `math-game`.

## Installation

1. Dans votre projet `math-game`, **supprimez** ces fichiers du template d'origine :
   - `src/game/scenes/MainMenu.js`
   - `src/game/scenes/Game.js`

2. **Copiez tout le contenu** de l'archive `math-game-files.zip` dans votre dossier `math-game`. La structure est :
   ```
   src/
     App.jsx                            (remplacé)
     PhaserGame.jsx                     (simplifié)
     game/
       main.js                          (remplacé)
       scenes/
         Boot.js                        (remplacé, simplifié)
         Preloader.js                   (remplacé, simplifié)
         Intro.js                       (NOUVEAU)
         Hub.js                         (NOUVEAU)
         Level.js                       (NOUVEAU)
         Boss.js                        (NOUVEAU)
         GameOver.js                    (NOUVEAU - contient aussi Victory)
       utils/
         SaveManager.js                 (NOUVEAU)
         Drawing.js                     (NOUVEAU)
   public/
     style.css                          (remplacé)
   ```

3. **Lancez** :
   ```
   npm install
   npm run dev
   ```

   Le jeu sera disponible sur http://localhost:8080/

## Ce que fait le code

- **Tout est dessiné procéduralement** avec `Phaser.GameObjects.Graphics`. Aucun sprite externe n'est nécessaire pour faire tourner le jeu.
- **Sauvegarde** : automatique dans `localStorage` (clé `wizard_game_save_v2`). Persiste entre sessions.
- **Architecture des scènes** : Boot → Preloader → Intro (1ère fois) ou Hub (sauvegarde) → Level/Boss → GameOver/Victory → Hub.

## Améliorations possibles

Maintenant que vous avez une vraie base Phaser, voici des chantiers naturels :
- **Ajouter des sprites** : remplacer les fonctions `drawSlime`, `drawBird`, etc. dans `Drawing.js` par des `this.add.sprite()` chargés depuis `public/assets/`. Vous pouvez utiliser les sprites du domaine public (Kenney.nl en propose d'excellents et gratuits).
- **Ajouter du son** : Phaser supporte `this.load.audio()` dans Preloader puis `this.sound.play()` dans les scènes.
- **Animations** : utiliser `this.anims.create()` pour animer les sprites entre plusieurs frames.
- **Difficulté progressive** : adapter la plage des opérations selon le niveau.
