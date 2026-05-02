# CLAUDE.md — Le Grimoire Sacré

Ce fichier sert de mémoire pour Claude Code lorsqu'il travaille sur ce projet. Il est lu automatiquement au démarrage et contient le contexte nécessaire pour continuer le développement sans avoir à tout réexpliquer.

## Vue d'ensemble

Jeu vidéo 2D éducatif en français, développé pour un enfant de 9 ans, destiné à pratiquer le calcul mental (addition, soustraction, multiplication) dans le cadre d'une aventure de sorcier.

**Stack** : Phaser 4 + React 19 + Vite (basé sur le template officiel `phaserjs/template-react`).

**Statut actuel** : version fonctionnelle avec toutes les mécaniques de base. Le build de production passe (`npm run build`). Déploiement automatique sur GitHub Pages configuré via `.github/workflows/deploy.yml` → `https://nlarregue.github.io/math-game/`

Les personnages et certains monstres utilisent de vrais sprites PNG animés. Les décors de toutes les scènes de jeu (Hub, Level, Boss) utilisent désormais des images PNG pixel-art. Les ennemis sans sprite et le dragon restent procéduraux via `Drawing.js`.

## Histoire

Le sorcier Eldrin part à la recherche du Grimoire Sacré d'Aetheria. Une intro narrative en 8 phases le mène à un hub central d'où il peut explorer trois niveaux : Forêt, Château, Montagne. Une fois les trois terminés, un dragon gardien apparaît dans le hub pour le combat final.

Phases de l'intro :
1. `title` — écran titre animé
2. `house_walk` — Eldrin quitte sa tour (image PNG `wizard-tower`)
3. `library_enter` — il s'approche de la bibliothèque (image PNG `fantasy-library`)
4. `library_walk` — il cherche à l'intérieur (rendu procédural `drawLibraryAisle`)
5. `book_found` — il découvre le grimoire (rendu procédural avec halo doré)
6. `grimoire_open` — les pages du grimoire (rendu procédural)
7. `map_reveal` — la carte magique (rendu procédural)
8. `depart` — il part vers la forêt (rendu procédural `drawForest`)

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
.github/
  workflows/
    deploy.yml            # Build + déploiement automatique sur GitHub Pages (push sur main)
src/
  App.jsx                   # Wrapper React, panneau latéral avec bouton reset
  PhaserGame.jsx            # Composant qui héberge le canvas Phaser
  main.jsx                  # Entry point React
  game/
    main.js                 # Config Phaser, liste des scènes (canvas 1024×768)
    EventBus.js             # (présent mais non utilisé actuellement)
    scenes/
      Boot.js               # Démarre Preloader
      Preloader.js          # Charge les sprites (preload) + crée les animations, puis route vers Intro ou Hub
      Intro.js              # Séquence narrative en 8 phases
      Hub.js                # Carte centrale avec 3 panneaux + portail boss
      Level.js              # Niveau de jeu (forêt/château/montagne) — la pièce maîtresse
      Boss.js               # Combat de boss final
      GameOver.js           # Contient les classes GameOver ET Victory
    utils/
      SaveManager.js        # localStorage + singleton gameState
      Drawing.js            # Fonctions de dessin procédural (décors, dragon, ennemis sans sprite)
public/
  style.css                 # Style de l'interface React
  assets/
    wizard-tower.png        # Tour du sorcier (280×600, fond transparent) — phase house_walk de l'intro
    mystical-house.png      # Bâtiment bibliothèque (520×540, fond transparent) — phase library_enter de l'intro
    fantasy-library2.png    # Ancienne version (peut être supprimée)
    Fantasy-library.png     # Source originale avec les 3 modèles (ne pas charger dans le jeu)
    sprites/
      Wizard/               # Idle.png Run.png Attack1.png Attack2.png Hit.png Death.png Jump.png Fall.png
      Monsters/             # slime waterB sheet.png  goblin sheet.png  Bat_0000_dark.png
                            # kobold_0000_red.png (utilisé comme "orc")
                            # skelleton sheet.png  troll_0000_green.png  gnoll sheet.png
                            # wolf_0001_brown.png  Rat_0004_dark.png (fonds noirs, inutilisés)
                            # Werewolf_0004_brown.png  Zombies/  German shepard bundle/
      vampire-pixel-art-sprite/Converted_Vampire/  # Idle.png (5 frames) + Run.png (8 frames), 128×128
      skeleton enemy/       # Skeleton enemy.png (832×320, 64×64 par frame, 13×5)
      Free Pixel Art Forest/  # 12 couches PNG transparentes + preview composite (clé : bg-forest)
      Plants/               # Plant1.png Plant2.png Plant3.png (non intégrés)
      Pixel-Art-Battlegrounds/ # 4 battlegrounds en versions Bright et Pale, avec couches séparées
                            # Battleground2/Bright/Battleground2.png → bg-chateau
                            # Battleground1/Bright/Battleground1.png → bg-montagne
                            # Battleground4/Bright/Battleground4.png → bg-boss
                            # Battleground3/Bright/Battleground3.png → bg-hub
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

### Sprites animés

Les sprites sont chargés dans `Preloader.preload()` et les animations créées dans `Preloader.createAnimations()` (une seule fois, globalement). Ils sont ensuite disponibles dans toutes les scènes.

**Sorcier** — clé texture `wizard-red`, source `public/assets/wizard-red.png` (ligne 5 de `Sprite-0002.png`), frameWidth 32 × frameHeight 32, 12 frames en une seule ligne :
| Frames | Direction | Animation Phaser |
|---|---|---|
| 0–2 | dos | `wizard-death` (repeat 0, frameRate 6) |
| 3–5 | gauche + bâton | `wizard-run` / `wizard-attack` (repeat -1) |
| 6–8 | face (barbe blanche) | `wizard-idle` (repeat -1, frameRate 4) |
| 9–11 | droite | `wizard-hit` (repeat 0, frameRate 10) |

Scale utilisé : **2.5** dans toutes les scènes (Hub, Level, Boss, Intro). Dans Intro.js les scales sont exprimés sous forme `2.5 * multiplicateur` pour conserver les proportions relatives entre les phases.

**Monstres avec fond transparent** (intégrés) :
| Type jeu | Clé texture | Frame size | Anim idle |
|---|---|---|---|
| `slime` | `slime` | 300×270 | `slime-idle` (frames 0–8) |
| `goblin` | `goblin` | 300×180 | `goblin-idle` (frames 0–8) |
| `bat` | `bat` | 270×150 | `bat-fly` (frames 0–4) |
| `orc` | `orc` | 300×180 | `orc-idle` (frames 0–8) |
| `vampire`  | `vampire` / `vampire-run` | 128×128 | `vampire-idle` (frames 0–4) / `vampire-run` (frames 0–7) |
| `skeleton` | `skeleton` | 64×64 (13 cols × 5 rows) | `skeleton-idle` (frames 0–12, rangée 0) |

Le kobold (`kobold_0000_red.png`) est utilisé comme visuel pour le type `orc`.

**Monstres restés procéduraux** (leur sheet PNG a un fond noir opaque, pas de transparence) :
`bird` → dessiné via `drawEnemy()` de `Drawing.js`.

**`SPRITE_ANIMS`** (dans `Level.js`) — map type→config :
```js
const SPRITE_ANIMS = {
    slime:    { key: 'slime',    anim: 'slime-idle',    scale: 0.40 },
    goblin:   { key: 'goblin',   anim: 'goblin-idle',   scale: 0.22 },
    bat:      { key: 'bat',      anim: 'bat-fly',       scale: 0.26 },
    orc:      { key: 'orc',      anim: 'orc-idle',      scale: 0.22 },
    vampire:  { key: 'vampire',  anim: 'vampire-idle',  scale: 2.52, combatScale: 1.2 },
    skeleton: { key: 'skeleton', anim: 'skeleton-idle', scale: 1.0,  combatScale: 2.0 },
};
```

`combatScale` (optionnel) : scale du sprite dans l'UI de combat. Si absent, `startCombat()` utilise `cfg.scale * 2.6`.

Pour les ennemis procéduraux avec scale spécifique (ex: bird ×2), le rendu dans `update()` utilise un transform sur le Graphics :
```js
const ds = e.type === 'bird' ? 2 : 1;
g.setPosition(e.x, e.y).setScale(ds);
drawEnemy(g, { ...e, x: 0, y: 0 }, this.t);
```

Si un type est absent de cette map, `drawEnemy()` Graphics est utilisé en fallback.

### Rendu mixte sprite + Graphics

Pour les ennemis avec sprite :
- Le **sprite** gère le visuel du personnage (`setPosition`, `setAlpha`, `setTint`)
- Un objet **Graphics** dédié (dans `enemyGraphicsList`) gère les overlays : aura de gel, HP bar, ombre des volants

Pour l'écran de combat (`combatLayer`) :
- `this.combatEnemySprite` : sprite du monstre — **hors du container**, depth 150, géré explicitement avec `setVisible()`. Ne pas le remettre dans `combatLayer.add()` : Phaser 4 ne retire pas les sprites de la display list de scène quand on les ajoute à un container, ce qui cause un double rendu.
- `this.combatEnemyGraphics` : rendu procédural (fallback pour skeleton/vampire/bird), dans le container
- `this.combatLayer` : depth 100, couvre tous les sprites du monde (depth 10–30)
- `startCombat()` bascule entre les deux avec `setVisible()`
- Toujours appeler `this.combatEnemySprite.setVisible(false)` en même temps que `this.combatLayer.setVisible(false)`

### Décors PNG

Les fonds sont des images statiques chargées en Preloader avec `this.load.image()` et créées une fois dans `create()` :

```js
this.add.image(W / 2, H / 2, 'bg-forest').setDisplaySize(W, H).setDepth(0);
```

| Clé Phaser | Scène | Fichier source |
|---|---|---|
| `bg-hub` | Hub | Battleground3/Bright/Battleground3.png |
| `bg-forest` | Level foret | Free Pixel Art Forest/Preview/Background.png |
| `bg-chateau` | Level chateau | Battleground2/Bright/Battleground2.png |
| `bg-montagne` | Level montagne | Battleground1/Bright/Battleground1.png |
| `bg-boss` | Boss | Battleground4/Bright/Battleground4.png |

Le `setDisplaySize(W, H)` étire l'image pour couvrir exactement le canvas 1024×768 (déformation légère acceptable en pixel art). Pour éviter toute déformation, utiliser à la place :
```js
const img = this.add.image(W/2, H/2, key);
img.setScale(Math.max(W / img.width, H / img.height));
```

Les battlegrounds ont des couches séparées (sky, bg, ruins, floor…) non utilisées pour l'instant — uniquement les composites Battleground*.png sont chargés. La `Free Pixel Art Forest` a 12 couches transparentes (Layer_0000_9 à Layer_0011_0) qui permettraient un effet parallaxe.

### Dessin procédural (ennemis sans sprite + dragon + décors Intro)
Les fonctions de `Drawing.js` prennent un objet `Graphics` en premier paramètre :

```js
drawEnemy(graphics, enemy, t, options)              // bird — encore utilisé (skeleton/vampire ont des sprites)
drawDragon(graphics, x, y, t)                       // encore utilisé dans Boss.js
drawForest(graphics, t, w, h)                       // Intro.js phase depart
drawLibraryAisle(graphics, t, w, h, glowX, glowY)  // Intro.js phases library_walk et book_found
drawCastle(graphics, t, w, h)                       // défini dans Drawing.js mais non utilisé actuellement
drawMountain(graphics, t, w, h)                     // défini dans Drawing.js mais non utilisé actuellement
drawHouseExterior(graphics, t, w, h)                // défini dans Drawing.js mais non utilisé actuellement
```

Les couleurs sont exportées dans `Colors` (format hex Phaser : `0xff6b35` etc.).

### Pattern d'une scène avec animation
```js
create() {
    this.t = 0;
    // Fond PNG statique (depth 0, créé en premier) :
    this.add.image(W / 2, H / 2, 'bg-forest').setDisplaySize(W, H).setDepth(0);
    // Sprite chargé en Preloader — disponible directement :
    this.wizardSprite = this.add.sprite(x, y, 'wizard-red').setScale(5.0).setDepth(30);
    this.wizardSprite.play('wizard-idle');
}

update(time, delta) {
    this.t += delta / 16.67;  // Compteur de frames à 60fps
    // Le fond est statique, pas besoin de le redessiner chaque frame
    // Mise à jour sprite :
    this.wizardSprite.setPosition(this.player.x, this.player.y);
    if (this.wizardSprite.anims.currentAnim?.key !== 'wizard-idle') {
        this.wizardSprite.play('wizard-idle');
    }
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

1. **Parallaxe sur la forêt** : la `Free Pixel Art Forest` fournit 12 couches PNG transparentes (Layer_0000_9 à Layer_0011_0). Charger les couches dans Preloader, les empiler dans create(), et dans update() décaler chaque couche légèrement selon `this.player.x`. Nécessite `setDisplaySize(W + 40, H)` + `setX(W/2 + offset * facteur)` par couche.

2. **Couches séparées pour les battlegrounds** : chaque Battleground a des layers (sky, ruins, floor…). Les charger séparément permettrait un parallaxe ou d'animer certains éléments (lumières, flammes).

3. **Sprite pour bird** : le seul ennemi encore procédural. Trouver une sheet avec fond transparent ou traiter une sheet existante (supprimer le noir en alpha via PIL, comme fait pour wizard-tower.png).

4. **Sons et musique** : `this.load.audio()` dans Preloader, `this.sound.play()` dans les scènes. Sons libres sur freesound.org ou kenney.nl.

5. **Difficulté progressive** : adapter la plage des opérations selon le niveau. Par exemple, en forêt les additions résultat ≤ 30, au château résultat ≤ 60, en montagne résultat ≤ 100.

6. **Statistiques pour les parents** : compteur de bonnes/mauvaises réponses par type d'opération, sauvegardé dans `localStorage`. Pourrait s'afficher dans le panneau React latéral.

7. **Système d'inventaire** : potions de soin gagnées en battant les monstres (par exemple 1 potion tous les 5 monstres tués), utilisables avec une touche pour récupérer 3 PV.

8. **Mode "entraînement"** : un mode séparé sans combat, juste des opérations en série pour s'échauffer.

## Préférences de l'utilisateur

- Communication en français.
- Demande qu'on lui dise franchement quand il a tort ou qu'il existe une meilleure solution. Pas de complaisance.
- Toujours proposer la meilleure solution en priorité, vérifier sur le web s'il existe une approche plus efficace ou récente.

## Notes diverses

- Le projet est sur GitHub : `https://github.com/nlarregue/math-game`
- L'utilisateur a un fond technique IT (admin Microsoft 365 / Exchange Online) — il comprend les concepts de développement mais n'est pas développeur full-time. Adapter le niveau d'explication en conséquence : technique mais pas jargonneux.
- Le jeu a été développé pour le fils de l'utilisateur, qui apprécie déjà la version actuelle.
- Les sprites avec **fond transparent** (utilisables) : `wizard-red.png` (extrait de `Sprite-0002.png` ligne 5, 32×32), goblin sheet, kobold_0000_red, vampire-pixel-art-sprite/Converted_Vampire/* (128×128 px/frame).
- Les sprites avec **fond noir opaque** (inutilisables sans traitement) : skelleton sheet, troll_0000_green, gnoll sheet, wolf_0001_brown, Rat_0004_dark. On peut supprimer le fond noir avec PIL : pixels (R<25, G<25, B<25) → alpha=0 (voir traitement de wizard-tower.png).
- **Images statiques Intro** : `wizard-tower.png` et `mystical-house.png` sont dans `public/assets/` (pas dans `sprites/`). Traitement PIL appliqué (suppression fond, rognage, redimensionnement). Pour ajouter d'autres images de décor : même pattern — charger dans Preloader avec `this.load.image()`, créer dans `Intro.create()` avec `.setVisible(false)`, cacher dans `update()` avant les méthodes de dessin, activer uniquement dans la méthode qui en a besoin.
- Si les scales des sprites semblent trop grands ou trop petits visuellement, ajuster les valeurs dans `SPRITE_ANIMS` (Level.js) et les appels `.setScale()` dans Hub.js / Intro.js / Boss.js. La valeur de base est **2.5** pour le sorcier (sprite 32×32 de `wizard-red.png`).
- **Bugs connus corrigés** (ne pas réintroduire) :
  - `this.enemies = []` doit être initialisé dans `create()` de Level.js avant l'appel à `spawnEnemies()`, sinon crash au chargement du niveau.
  - `drawCombat()` doit commencer par `if (!this.combat) return` — `handleCombatInput()` peut mettre `this.combat = null` avant que `drawCombat()` soit appelé dans la même frame.
  - `combatEnemySprite` ne doit pas être dans `combatLayer.add([...])` (double rendu Phaser 4).
  - Dans `spawnEnemies()`, la création du sprite et l'appel `.play()` doivent être dans deux try-catch imbriqués séparés : si l'animation échoue, le sprite reste visible (frame statique) au lieu de tomber en fallback procédural.
  - L'animation `skeleton-idle` doit être créée conditionnellement : vérifier `this.textures.get('skeleton').frameTotal > 12` avant `anims.create()`. Si le check échoue, un `console.warn` l'indique (la texture n'a pas chargé comme spritesheet).
  - Le chemin du spritesheet skeleton dans Preloader doit avoir un S majuscule : `'assets/sprites/Skeleton enemy/Skeleton enemy.png'` (correspond exactement au nom du dossier sur le filesystem).
