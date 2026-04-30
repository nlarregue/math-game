# CLAUDE.md — Le Grimoire Sacré

Ce fichier sert de mémoire pour Claude Code lorsqu'il travaille sur ce projet. Il est lu automatiquement au démarrage et contient le contexte nécessaire pour continuer le développement sans avoir à tout réexpliquer.

## Vue d'ensemble

Jeu vidéo 2D éducatif en français, développé pour un enfant de 9 ans, destiné à pratiquer le calcul mental (addition, soustraction, multiplication) dans le cadre d'une aventure de sorcier.

**Stack** : Phaser 4 + React 19 + Vite (basé sur le template officiel `phaserjs/template-react`).

**Statut actuel** : version fonctionnelle avec toutes les mécaniques de base. Tout est dessiné procéduralement avec `Phaser.GameObjects.Graphics` — aucun sprite externe n'est chargé. Le build de production passe (`npm run build-nolog`).

## Histoire

Le sorcier Eldrin part à la recherche du Grimoire Sacré d'Aetheria. Une intro narrative en 6 étapes (titre, bibliothèque, découverte du livre, lecture du grimoire, révélation de la carte, départ) le mène à un hub central d'où il peut explorer trois niveaux : Forêt, Château, Montagne. Une fois les trois terminés, un dragon gardien apparaît dans le hub pour le combat final.

## Mécaniques de jeu

### Sorts et opérations
- **Feu** (de départ, 1 dégât) : addition, résultat entre 0 et 100
- **Glace** (débloqué après 10 monstres tués en forêt, 2 dégâts) : soustraction, résultat entre 0 et 100
- **Foudre** (débloqué après 10 monstres tués au château, 3 dégâts) : multiplication, tables de 1 à 10

### Combat
- Le joueur engage un combat avec Espace quand il est près d'un ennemi.
- Une opération s'affiche, il tape la réponse au clavier puis Entrée.
- Bonne réponse → l'ennemi prend les dégâts du sort.
- Mauvaise réponse → le joueur perd 1 PV (sur 10).
- Touches 1/2/3 pour changer de sort en cours de combat.
- Échap pour fuir.

### Ennemis par niveau
- **Forêt** (1-2 PV) : slimes, et oiseaux **uniquement après déblocage du sort de glace**
- **Château** (3-4 PV) : squelettes, vampires, et chauves-souris **uniquement après déblocage du sort de glace**
- **Montagne** (5-6 PV) : orcs et gobelins, **résistants** (feu et glace font moitié dégâts arrondis, foudre fait dégâts complets)

### Mécanique des volants
Les ennemis volants (oiseaux, chauves-souris) doivent être **gelés avec le sort de glace** avant qu'on puisse leur lancer un autre sort. Quand le combat démarre contre un volant non gelé, le sort de glace est forcé pour le premier tir. Une fois gelé (effet visuel : aura bleue + cristaux), le joueur peut choisir n'importe quel sort. Le gel dure 300 frames (~5 secondes).

### Boss final
Dragon de 15 PV, débloqué quand les 3 niveaux sont terminés. Pas résistant, pas volant — combat classique mais long.

## Architecture des fichiers

```
src/
  App.jsx                   # Wrapper React, panneau latéral avec bouton reset
  PhaserGame.jsx            # Composant qui héberge le canvas Phaser
  main.jsx                  # Entry point React
  game/
    main.js                 # Config Phaser, liste des scènes
    EventBus.js             # (présent mais non utilisé actuellement)
    scenes/
      Boot.js               # Démarre Preloader
      Preloader.js          # Route vers Intro ou Hub selon la sauvegarde
      Intro.js              # Séquence narrative en 6 étapes
      Hub.js                # Carte centrale avec 3 panneaux + portail boss
      Level.js              # Niveau de jeu (forêt/château/montagne) — la pièce maîtresse
      Boss.js               # Combat de boss final
      GameOver.js           # Contient les classes GameOver ET Victory
    utils/
      SaveManager.js        # localStorage + singleton gameState
      Drawing.js             # Toutes les fonctions de dessin Graphics
public/
  style.css                 # Style de l'interface React
```

## État partagé entre scènes

Le module `SaveManager.js` exporte un singleton `gameState` accessible partout :

```js
import { gameState } from '../utils/SaveManager';

gameState.data.player.hp           // PV courants
gameState.data.player.maxHp        // PV max (10)
gameState.data.spells              // Array : ['feu'], ['feu','glace'], ['feu','glace','foudre']
gameState.data.killsByLevel        // { foret: N, chateau: N, montagne: N }
gameState.data.levelProgress       // { foret: bool, chateau: bool, montagne: bool }
gameState.data.bossDefeated        // bool
gameState.data.introStep           // étape actuelle de l'intro
gameState.data.introDone           // bool

gameState.save();                  // Sauvegarde dans localStorage
gameState.healPlayer();            // Restaure les PV à maxHp
gameState.reset();                 // Réinitialise tout
```

La sauvegarde utilise `localStorage` avec la clé `wizard_game_save_v2`. Elle est appelée automatiquement après chaque action importante (kill, déblocage, dégât subi, changement de scène).

## Conventions

### Imports Phaser
Phaser 4 nécessite `import * as Phaser from 'phaser';` (et non `import Phaser from 'phaser'`). Les scènes utilisant `Phaser.Input.Keyboard.JustDown` ont les deux imports :

```js
import * as Phaser from 'phaser';
import { Scene } from 'phaser';
```

### Dessin procédural
Tout le rendu visuel passe par `Phaser.GameObjects.Graphics`. Les fonctions de dessin se trouvent dans `Drawing.js` et prennent un objet `Graphics` en premier paramètre :

```js
drawWizard(graphics, x, y, scale, casting)
drawSlime(graphics, x, y)
drawDragon(graphics, x, y, t)
drawForest(graphics, t, w, h)
drawEnemy(graphics, enemy, t, options)
```

Les couleurs sont exportées dans `Colors` (format hex Phaser : `0xff6b35` etc.).

### Pattern d'une scène avec animation
```js
create() {
    this.t = 0;
    this.bgGraphics = this.add.graphics();
    // ...
}

update(time, delta) {
    this.t += delta / 16.67;  // Compteur de frames à 60fps
    this.bgGraphics.clear();
    drawForest(this.bgGraphics, this.t, this.W, this.H);
    // ...
}
```

### Combat dans Level.js et Boss.js
Le combat utilise un objet `this.combat` quand actif, `null` sinon :

```js
this.combat = {
    enemy,                  // référence à l'ennemi
    spell: 'feu',          // sort actif
    op: { a, b, result, sym },  // opération courante
    input: '',             // chiffres tapés par le joueur
    feedback: '',          // message après réponse
    feedbackTime: 0,       // frames restantes d'affichage du feedback
    locked: false          // 'must_freeze' si volant non gelé
};
```

L'UI de combat est un `Phaser.GameObjects.Container` (`this.combatLayer`) qu'on cache/affiche avec `setVisible()`.

## Contrôles

- **Flèches** : déplacement
- **Espace** : action contextuelle (entrer dans un panneau, démarrer un combat, passer une scène d'intro)
- **1, 2, 3** : changer de sort en combat
- **0–9** : taper la réponse
- **Entrée** : valider la réponse
- **Échap** : fuir le combat
- **H** : retour au hub depuis un niveau

## Lancer le projet

```bash
npm install
npm run dev          # http://localhost:8080/
npm run build        # build de production dans dist/
```

## Pistes d'évolution

Voici ce qui ferait sens comme prochains chantiers, par ordre de priorité décroissante :

1. **Vrais sprites animés** : remplacer les fonctions de `Drawing.js` par des `this.add.sprite()`. Kenney.nl (CC0, gratuit) propose d'excellents packs adaptés : "Tiny Dungeon", "Platformer Pack Redux", "Fantasy Town". Charger dans `Preloader.js` avec `this.load.spritesheet()`, animations avec `this.anims.create()`.

2. **Sons et musique** : `this.load.audio()` dans Preloader, `this.sound.play()` dans les scènes. Sons libres sur freesound.org ou kenney.nl.

3. **Difficulté progressive** : adapter la plage des opérations selon le niveau. Par exemple, en forêt les additions résultat ≤ 30, au château résultat ≤ 60, en montagne résultat ≤ 100.

4. **Statistiques pour les parents** : compteur de bonnes/mauvaises réponses par type d'opération, sauvegardé dans `localStorage`. Pourrait s'afficher dans le panneau React latéral.

5. **Système d'inventaire** : potions de soin gagnées en battant les monstres (par exemple 1 potion tous les 5 monstres tués), utilisables avec une touche pour récupérer 3 PV.

6. **Mode "entraînement"** : un mode séparé sans combat, juste des opérations en série pour s'échauffer.

## Préférences de l'utilisateur

- Communication en français.
- Demande qu'on lui dise franchement quand il a tort ou qu'il existe une meilleure solution. Pas de complaisance.
- Toujours proposer la meilleure solution en priorité, vérifier sur le web s'il existe une approche plus efficace ou récente.

## Notes diverses

- Le projet est sur GitHub : `https://github.com/nlarregue/math-game`
- L'utilisateur a un fond technique IT (admin Microsoft 365 / Exchange Online) — il comprend les concepts de développement mais n'est pas développeur full-time. Adapter le niveau d'explication en conséquence : technique mais pas jargonneux.
- Le jeu a été développé pour le fils de l'utilisateur, qui apprécie déjà la version actuelle.
