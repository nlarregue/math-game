# CLAUDE.md — Le Grimoire Sacré

Ce fichier sert de mémoire pour Claude Code lorsqu'il travaille sur ce projet. Il est lu automatiquement au démarrage et contient le contexte nécessaire pour continuer le développement sans avoir à tout réexpliquer.

## Vue d'ensemble

Jeu vidéo 2D éducatif en français, développé pour un enfant de 9 ans, destiné à pratiquer le calcul mental (addition, soustraction, multiplication) dans le cadre d'une aventure de sorcier.

**Stack** : Phaser 4 + React 19 + Vite (basé sur le template officiel `phaserjs/template-react`).

**Statut actuel** : version fonctionnelle avec toutes les mécaniques de base. Le build de production passe (`npm run build`). Déploiement automatique sur GitHub Pages configuré via `.github/workflows/deploy.yml` → `https://nlarregue.github.io/math-game/`

Les personnages et certains monstres utilisent de vrais sprites PNG animés. La carte du monde utilise un **vrai tilemap Tiled** (`world.json`, 2048×2048 px) avec collisions, caméra scrollante et portails. Le sorcier utilise le pack **Wizard_Asset_Pack** (sprites 93×77 px) dans Level et Boss, et l'ancien sprite `wizard-red` (32×32) uniquement dans l'Intro. Les sous-niveaux (donjon/montagne) utilisent des images PNG pixel-art. Les ennemis sans sprite et le dragon restent procéduraux via `Drawing.js`.

## Histoire

Le sorcier Eldrin part à la recherche du Grimoire Sacré d'Aetheria. Une intro narrative en 8 phases le mène directement sur la carte du monde (`Scene Overview.png`). De là, deux portails permettent d'accéder au Donjon (porte en bas de la carte) et à la Montagne (autel en haut). Une fois les deux terminés, un portail doré apparaît au centre pour le combat final contre le dragon.

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
- **Glace** (débloqué après 5 monstres tués sur la carte monde, 2 dégâts) : soustraction, résultat entre 0 et 100
- **Foudre** (débloqué après 5 monstres tués au château/donjon, 3 dégâts) : multiplication, tables de 1 à 10

> **Note** : le kill goal est à 5 pour faciliter les tests. Remettre à 10 pour la version finale (constante `killGoal` dans `LEVELS` de `Level.js`).

### Combat
- Le joueur engage un combat avec Espace quand il est près d'un ennemi.
- Une opération s'affiche, il tape la réponse au clavier puis Entrée.
- Bonne réponse → l'ennemi prend les dégâts du sort.
- Mauvaise réponse → le joueur perd 1 PV (sur 10).
- **Tab** pour changer de sort en cours de combat (cycle parmi les sorts débloqués, renouvelle l'opération).
- Échap pour fuir.

### Ennemis par niveau
- **Monde / carte principale** (`levelKey: 'monde'`, 1-2 PV) : slimes, et oiseaux **uniquement après déblocage du sort de glace**
- **Château / Donjon** (`levelKey: 'chateau'`, 3-4 PV) : squelettes, vampires, et chauves-souris **uniquement après déblocage du sort de glace**
- **Montagne** (`levelKey: 'montagne'`, 5-6 PV) : orcs et gobelins, **résistants** (feu et glace font moitié dégâts arrondis, foudre fait dégâts complets)

La clé interne `'monde'` remplace l'ancienne clé `'foret'` dans tout le code.

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
  App.jsx                   # Wrapper React : intègre PhaserGame + VirtualControls, panneau latéral reset
  PhaserGame.jsx            # Composant qui héberge le canvas Phaser
  VirtualControls.jsx       # Overlay tactile (D-pad, sorts, pavé numérique) — affiché sur écrans touch
  main.jsx                  # Entry point React
  game/
    main.js                 # Config Phaser, liste des scènes (canvas 1024×768)
    EventBus.js             # Bus d'événements Phaser ↔ React (EventBus.emit / EventBus.on)
    scenes/
      Boot.js               # Démarre Preloader
      Preloader.js          # Charge les sprites (preload) + crée les animations, puis route vers Level('monde')
      Intro.js              # Séquence narrative en 8 phases
      Hub.js                # REDIRECT UNIQUEMENT : create() fait scene.start('Level', { level: 'monde' })
      Level.js              # Gère TOUS les niveaux : monde, chateau, montagne — la pièce maîtresse
      Boss.js               # Combat de boss final
      GameOver.js           # Contient les classes GameOver ET Victory
    utils/
      SaveManager.js        # localStorage + singleton gameState (clé: wizard_game_save_v3)
      Drawing.js            # Fonctions de dessin procédural (décors, dragon, ennemis sans sprite)
      VirtualInput.js       # Singleton d'état clavier virtuel partagé Phaser ↔ React
public/
  style.css                 # Style de l'interface React
  assets/
    wizard-red.png          # Sprite sorcier (384×32, 12 frames 32×32) — extrait ligne 5 de Sprite-0002.png
    wizard-tower.png        # Tour du sorcier (280×600, fond transparent) — phase house_walk de l'intro
    mystical-house.png      # Bâtiment bibliothèque (520×540, fond transparent) — phase library_enter de l'intro
    Fantasy-library.png     # Source originale avec les 3 modèles (ne pas charger dans le jeu)
    forest_tree_1/2/3.png   # Arbres top-down (fond transparent) — décor carte monde
    forest_bush_3/4/5.png   # Buissons top-down (fond transparent) — décor carte monde
    forest_rock_1.png       # Rocher top-down (fond transparent) — décor carte monde
    world.json              # Tilemap Tiled exportée (64×64 tuiles × 32×32px = 2048×2048px)
    sprites/
      Wizard_Asset_Pack/SPRITE_SHEET/   # Nouveau sorcier utilisé dans Level et Boss
        IDLE/Wizard_Idle.png            # 7 frames, 93×77px — clé 'wiz-idle', anim 'wiz-idle'
        SIDE_WALK/Wizard_Side_Walk.png  # 8 frames — clé 'wiz-walk', anim 'wiz-run'
        ATTACK_1/Wizard_1Attack.png     # 11 frames — clé 'wiz-attack', anim 'wiz-attack'
        HURT/Wizard_Hurt.png            # 4 frames — clé 'wiz-hurt', anim 'wiz-hurt'
        DEATH/Wizard_Death.png          # 11 frames — clé 'wiz-death', anim 'wiz-death'
      Wizard/               # Ancien pack — inutilisé (remplacé par Wizard_Asset_Pack)
      Monsters/             # slime waterB sheet.png  goblin sheet.png  Bat_0000_dark.png
                            # kobold_0000_red.png (utilisé comme "orc")
                            # skelleton sheet.png  troll_0000_green.png  gnoll sheet.png
                            # wolf_0001_brown.png  Rat_0004_dark.png (fonds noirs, inutilisés)
                            # Werewolf_0004_brown.png  Zombies/  German shepard bundle/
      vampire-pixel-art-sprite/Converted_Vampire/  # Idle.png (5 frames) + Run.png (8 frames), 128×128
      skeleton enemy/       # Skeleton enemy.png (832×320, 64×64 par frame, 13×5)
      Free Pixel Art Forest/  # 12 couches PNG transparentes + preview composite (non utilisées)
      Plants/               # Plant1.png Plant2.png Plant3.png (non intégrés)
      Pixel Art Top Down/   # Scene Overview.png (non utilisé — remplacé par tilemap)
                            # Texture/ : TX Tileset Grass.png, TX Tileset Stone Ground.png,
                            #   TX Tileset Wall.png, TX Props.png, TX Struct.png
                            # Texture/Extra/ : TX Props with Shadow.png, TX Plant with Shadow.png
      Pixel-Art-Battlegrounds/ # 4 battlegrounds en versions Bright et Pale, avec couches séparées
                            # Battleground2/Bright/Battleground2.png → bg-chateau
                            # Battleground1/Bright/Battleground1.png → bg-montagne
                            # Battleground4/Bright/Battleground4.png → bg-boss
                            # Battleground3/Bright/Battleground3.png → bg-hub (non utilisé)
```

## État partagé entre scènes

Le module `SaveManager.js` exporte un singleton `gameState` accessible partout :

```js
import { gameState } from '../utils/SaveManager';

gameState.data.player.hp           // PV courants
gameState.data.player.maxHp        // PV max (10)
gameState.data.spells              // Array : ['feu'], ['feu','glace'], ['feu','glace','foudre']
gameState.data.killsByLevel        // { monde: N, chateau: N, montagne: N }
gameState.data.levelProgress       // { monde: bool, chateau: bool, montagne: bool }
gameState.data.bossDefeated        // bool
gameState.data.introStep           // étape actuelle de l'intro
gameState.data.introDone           // bool

gameState.save();                  // Sauvegarde dans localStorage
gameState.healPlayer();            // Restaure les PV à maxHp
gameState.reset();                 // Réinitialise tout
```

La sauvegarde utilise `localStorage` avec la clé `wizard_game_save_v3`. Elle est appelée automatiquement après chaque action importante (kill, déblocage, dégât subi, changement de scène).

> **Important** : la clé a changé de `v2` → `v3` lors du renommage `foret` → `monde`. Si une ancienne sauvegarde v2 existe, elle sera ignorée et une nouvelle partie démarrera automatiquement.

## Conventions

### Imports Phaser
Phaser 4 nécessite `import * as Phaser from 'phaser';` (et non `import Phaser from 'phaser'`). Les scènes utilisant `Phaser.Input.Keyboard.JustDown` ont les deux imports :

```js
import * as Phaser from 'phaser';
import { Scene } from 'phaser';
```

### Sprites animés

Les sprites sont chargés dans `Preloader.preload()` et les animations créées dans `Preloader.createAnimations()` (une seule fois, globalement). Ils sont ensuite disponibles dans toutes les scènes.

**Deux systèmes de sorcier coexistent** — ne pas les mélanger :

**Ancien sorcier** (`wizard-red`) — utilisé **uniquement dans Intro.js** :
- Source : `public/assets/wizard-red.png` (ligne 5 de `Sprite-0002.png`), frameWidth 32 × frameHeight 32, 12 frames en une seule ligne
- Scale : **2.5** (dans Intro, exprimé sous forme `2.5 * multiplicateur`)
- Clés d'animations : `wizard-idle`, `wizard-run`, `wizard-attack`, `wizard-hit`, `wizard-death`

| Frames | Direction | Animation Phaser |
|---|---|---|
| 0–2 | dos | `wizard-death` (repeat 0, frameRate 6) |
| 3–5 | gauche + bâton | `wizard-run` / `wizard-attack` (repeat -1) |
| 6–8 | face (barbe blanche) | `wizard-idle` (repeat -1, frameRate 4) |
| 9–11 | droite | `wizard-hit` (repeat 0, frameRate 10) |

**Nouveau sorcier** (`Wizard_Asset_Pack`) — utilisé dans **Level.js et Boss.js** :
- Source : `assets/sprites/Wizard_Asset_Pack/SPRITE_SHEET/` — 5 fichiers PNG séparés (un par animation)
- frameWidth 93 × frameHeight 77, chaque PNG dans son propre sous-dossier
- Scale : **0.6**
- Clés d'animations : `wiz-idle`, `wiz-run`, `wiz-attack`, `wiz-hurt`, `wiz-death`

| Clé texture | Fichier | Frames | Animation Phaser |
|---|---|---|---|
| `wiz-idle` | `IDLE/Wizard_Idle.png` | 0–6 | `wiz-idle` (frameRate 7, repeat -1) |
| `wiz-walk` | `SIDE_WALK/Wizard_Side_Walk.png` | 0–7 | `wiz-run` (frameRate 10, repeat -1) |
| `wiz-attack` | `ATTACK_1/Wizard_1Attack.png` | 0–10 | `wiz-attack` (frameRate 12, repeat -1) |
| `wiz-hurt` | `HURT/Wizard_Hurt.png` | 0–3 | `wiz-hurt` (frameRate 10, repeat 0) |
| `wiz-death` | `DEATH/Wizard_Death.png` | 0–10 | `wiz-death` (frameRate 6, repeat 0) |

**Monstres avec fond transparent** (intégrés) :
| Type jeu | Clé texture | Frame size | Anim |
|---|---|---|---|
| `slime` | `slime` | 16×16 (5 cols × 4 rows) | `slime-idle` (frames 0–4, rangée 0) |
| `bird` | `bee` | 32×32 | `bee-fly` (frame 0 statique) |
| `goblin` | `goblin` | 300×180 | `goblin-idle` (frames 0–8) |
| `bat` | `bat` | 32×32 (3 cols × 4 rows) | `bat-fly` (frames 3–5, rangée 1 = gauche) |
| `ghost` | `ghost` | 32×32 (3 cols × 4 rows) | `ghost-fly` (frames 3–5, rangée 1 = gauche) |
| `orc` | `orc` | 300×180 | `orc-idle` (frames 0–8) |
| `vampire` | `vampire` / `vampire-run` | 128×128 | `vampire-idle` (0–4) / `vampire-run` (0–7) |
| `skeleton` | `skeleton` | 32×32 (3 cols × 4 rows) | `skeleton-idle` (frames 3–5, rangée 1 = gauche) |
| `skeleton-dark` | `skeleton-dark` | 32×32 | `skeleton-dark-idle` (frames 3–5) |

Le kobold (`kobold_0000_red.png`) est utilisé comme visuel pour le type `orc`.
`bat` et `ghost` sont les fantômes (`Fantome-noir.png` / `Fantome-bleu.png`) qui remplacent les chauves-souris.

**`SPRITE_ANIMS`** (dans `Level.js`) — map type→config :
```js
const SPRITE_ANIMS = {
    slime:          { key: 'slime',         anim: 'slime-idle',         scale: 2.0,  combatScale: 3.0  },
    bird:           { key: 'bee',           anim: 'bee-fly',            scale: 1.0,  combatScale: 1.75 },
    goblin:         { key: 'goblin',        anim: 'goblin-idle',        scale: 0.25, combatScale: 0.55 },
    bat:            { key: 'bat',           anim: 'bat-fly',            scale: 1.25, combatScale: 2.0  },
    ghost:          { key: 'ghost',         anim: 'ghost-fly',          scale: 1.25, combatScale: 2.0  },
    orc:            { key: 'orc',           anim: 'orc-idle',           scale: 0.25, combatScale: 0.55 },
    vampire:        { key: 'vampire',       anim: 'vampire-idle',       scale: 0.35, combatScale: 1.0  },
    skeleton:       { key: 'skeleton',      anim: 'skeleton-idle',      scale: 1.25, combatScale: 2.0  },
    'skeleton-dark':{ key: 'skeleton-dark', anim: 'skeleton-dark-idle', scale: 1.25, combatScale: 2.0  },
};
```

> Tous les scales ont été divisés par deux par rapport aux valeurs initiales pour s'adapter à la caméra scrollante et au tilemap 2048×2048.

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
this.add.image(W / 2, H / 2, 'bg-chateau').setDisplaySize(W, H).setDepth(0);
```

| Clé Phaser | Scène | Fichier source |
|---|---|---|
| `bg-monde` | **non utilisé** — remplacé par tilemap | Pixel Art Top Down/Scene Overview.png |
| `bg-chateau` | Level chateau | Battleground2/Bright/Battleground2.png |
| `bg-montagne` | Level montagne | Battleground1/Bright/Battleground1.png |
| `bg-boss` | Boss | Battleground4/Bright/Battleground4.png |
| `bg-hub` | (non utilisé — Hub est un redirect) | Battleground3/Bright/Battleground3.png |

Le `setDisplaySize(W, H)` étire l'image pour couvrir exactement le canvas 1024×768. La `Free Pixel Art Forest` a 12 couches transparentes (Layer_0000_9 à Layer_0011_0) qui permettraient un effet parallaxe.

### Tilemap monde (implémenté)

La carte du monde utilise un vrai tilemap Tiled (`public/assets/world.json`), **2048×2048 px** (64×64 tuiles de 32×32 px chacune). La caméra scrolle sur ce monde en suivant le joueur.

**Structure du tilemap** :
| Nom du layer | Type | Depth | Usage |
|---|---|---|---|
| `ground` | Tile | 1 | Sol principal (herbe, chemins, eau) |
| `elevation` | Tile | 2 | Zones surélevées (plateaux) |
| `walls` | Tile | 3 | Murs et falaises — bloquent le déplacement |
| `decor1` | Tile | 4 | Arbres, rochers, objets décoratifs |
| `Porte donjon` | Tile | 5 | Zone de déclenchement pour entrer dans le donjon |
| `overhead1` | Tile | 49 | Première couche overhead (juste sous overhead) |
| `overhead` | Tile | 50 | Toits de tunnels, voûtes — s'affiche au-dessus du sorcier (depth 30) |
| `zones` | Object | — | Points d'intérêt (spawn joueur, portail montagne) |

Les calques `overhead` et `overhead1` sont **optionnels** : le code vérifie leur existence avant de les créer. Ne pas les créer dans Tiled si pas de tunnel.

**Tilesets chargés** (7 au total, tous embedded dans le JSON) :
```js
this.load.tilemapTiledJSON('world-map', 'assets/world.json');
this.load.image('tx-wall',       'assets/sprites/Pixel Art Top Down/Texture/TX Tileset Wall.png');
this.load.image('tx-grass',      'assets/sprites/Pixel Art Top Down/Texture/TX Tileset Grass.png');
this.load.image('tx-props',      'assets/sprites/Pixel Art Top Down/Texture/TX Props.png');
this.load.image('tx-props-shad', 'assets/sprites/Pixel Art Top Down/Texture/Extra/TX Props with Shadow.png');
this.load.image('tx-struct',     'assets/sprites/Pixel Art Top Down/Texture/TX Struct.png');
this.load.image('tx-stone',      'assets/sprites/Pixel Art Top Down/Texture/TX Tileset Stone Ground.png');
this.load.image('tx-plant-shad', 'assets/sprites/Pixel Art Top Down/Texture/Extra/TX Plant with Shadow.png');
```

**Points de référence dans le JSON** :
- Spawn joueur : `MONDE_SPAWN = { x: 1360, y: 1613 }` (objet zone "Point de départ")
- Portail montagne : zone objet classe `portal`, `target=montagne`, position ~(1263, 1008)
- Donjon : layer tile `Porte donjon` — détection par `porteDonjonLayer.getTileAtWorldXY()`

**Caméra scrollante** :
```js
this.cameras.main.setBounds(0, 0, MONDE_MAP_W, MONDE_MAP_H);  // 2048×2048
this.cameras.main.startFollow(this.wizardSprite, true, 0.1, 0.1);
// HUD : tous les éléments d'interface fixés à l'écran
hpText.setScrollFactor(0);
// UI de combat et sprite ennemi en combat :
this.combatLayer.setScrollFactor(0);
this.combatEnemySprite.setScrollFactor(0);
```

**Collisions — méthode `canWalkAt(wx, wy)`** :
```js
canWalkAt(wx, wy) {
    if (!this.groundLayer) return true;
    const onWalkable = this.groundLayer.getTileAtWorldXY(wx, wy) !== null ||
                       this.elevationLayer.getTileAtWorldXY(wx, wy) !== null;
    const onWall = this.wallsLayer.getTileAtWorldXY(wx, wy) !== null;
    return onWalkable && !onWall;
}
// Mouvement avec wall sliding — axes X et Y vérifiés séparément :
if (dx && this.canWalkAt(this.player.x + dx, this.player.y)) this.player.x += dx;
if (dy && this.canWalkAt(this.player.x, this.player.y + dy)) this.player.y += dy;
```

**Spawn des monstres** : collection de tuiles walkables faite à l'init (`mondeSpawnTiles`), puis tirage aléatoire via `Phaser.Utils.Array.Shuffle`. Les monstres n'apparaissent que sur `ground` et `elevation`, à plus de 150px du spawn joueur.

**Donjon** — détection par layer tile :
```js
findNearestDoor() {
    if (this.levelKey !== 'monde' || !this.porteDonjonLayer) return null;
    const tile = this.porteDonjonLayer.getTileAtWorldXY(this.player.x, this.player.y);
    return tile ? { id: 'donjon', levelKey: 'chateau', label: 'Donjon' } : null;
}
```

> **Important tilesets Tiled** : les tilesets doivent être **embedded** (pas de références .tsx externes) pour que Phaser puisse lire le JSON. Dans Tiled : clic droit sur chaque tileset → "Embed Tileset" avant d'exporter.

**Règles de construction des calques dans Tiled** :
- Les propriétés de collision des tuiles (les pointillés dans l'éditeur de tileset) sont **ignorées** par le code — seul le calque sur lequel est posée la tuile compte.
- On peut superposer plusieurs tuiles au même endroit en les posant sur des **calques différents** (ex: herbe sur `ground` + rebord décoratif sur `decor1` à la même case).
- Les tuiles visuelles d'une arche/voûte que le joueur passe dessous vont sur `overhead`, pas sur `walls`.
- Les bords visuels d'une falaise (le "flanc") vont sur `decor1`, pas sur `walls` — sinon le joueur est bloqué à distance de la rampe.
- Une tuile "demi-case" visuellement occupe quand même une **case entière 32×32 px** dans la grille : si posée sur `walls`, elle bloque toute la case.

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
// Sous-niveau (chateau, montagne) — fond PNG statique :
create() {
    this.t = 0;
    this.add.image(W / 2, H / 2, 'bg-chateau').setDisplaySize(W, H).setDepth(0);
    // Nouveau sorcier (Level/Boss) :
    this.wizardSprite = this.add.sprite(x, y, 'wiz-idle').setScale(0.6).setDepth(30);
    this.wizardSprite.play('wiz-idle');
    // Ancien sorcier (Intro seulement) :
    // this.wizardSprite = this.add.sprite(x, y, 'wizard-red').setScale(2.5).setDepth(30);
    // this.wizardSprite.play('wizard-idle');
}

update(time, delta) {
    this.t += delta / 16.67;  // Compteur de frames à 60fps
    this.wizardSprite.setPosition(this.player.x, this.player.y);
    if (this.wizardSprite.anims.currentAnim?.key !== 'wiz-idle') {
        this.wizardSprite.play('wiz-idle');
    }
}
```

### EventBus (communication Phaser ↔ React)

`EventBus` est un `Phaser.Events.EventEmitter` partagé. Il sert actuellement à signaler le mode d'interface à `VirtualControls` :

```js
import { EventBus } from '../EventBus';

// Dans chaque scène (create / startCombat / handleCombatInput) :
EventBus.emit('ui-mode', 'hub');      // Hub.create()
EventBus.emit('ui-mode', 'level');    // Level.create() + fin combat Level
EventBus.emit('ui-mode', 'combat');   // Level.startCombat() + Boss.startCombat()
EventBus.emit('ui-mode', 'boss');     // Boss.create() + fin combat Boss
EventBus.emit('ui-mode', 'intro');    // Intro.create()

// Dans VirtualControls.jsx :
useEffect(() => {
    EventBus.on('ui-mode', setMode);
    return () => EventBus.off('ui-mode', setMode);
}, []);
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

### Clavier (desktop)
- **Flèches** : déplacement
- **Espace** : action contextuelle (entrer dans un portail, démarrer un combat, passer une scène d'intro)
- **Tab** : changer de sort en combat (cycle parmi les sorts débloqués, change aussi l'opération)
- **0–9** : taper la réponse
- **Entrée** : valider la réponse
- **Échap** : fuir le combat
- **H** : retour à la carte monde (`Level('monde')`) depuis un sous-niveau

> **Bug corrigé** : les touches 1/2/3 (ancienne méthode) mappaient sur les mêmes keycodes que les chiffres du pavé, donc le changement de sort était inaccessible. Tab résout le problème.

### Tactile / tablette (overlay React)

Les contrôles virtuels sont affichés automatiquement si `navigator.maxTouchPoints > 0`. Ils s'adaptent au contexte via `EventBus.emit('ui-mode', mode)` émis par chaque scène :

| Mode émis | Scène | Contrôles affichés |
|---|---|---|
| `'intro'` | Intro | Bouton **Suivant ▶** |
| `'level'` | Level monde/chateau/montagne (exploration) | D-pad + **ACTION** + **← Monde** |
| `'boss'` | Boss (hors combat) | D-pad + **ACTION** |
| `'combat'` | Level/Boss (combat actif) | Sorts 🔥❄️⚡ + **Fuir ✕** · Pavé 0–9 + ⌫ + ↵ |

> Le mode `'hub'` n'est plus émis — Hub.js est un simple redirect et n'a plus de scène propre.

**Architecture virtualInput** (`src/game/utils/VirtualInput.js`) :
```js
import { virtualInput } from '../utils/VirtualInput';

// Directions — maintenues tant que le bouton est pressé
if (this.cursors.left.isDown || virtualInput.left) { ... }

// Actions one-shot — consommées à la première lecture
if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || virtualInput.space) {
    virtualInput.space = false;
    ...
}

// Chiffres
if (Phaser.Input.Keyboard.JustDown(this.numKeys[i]) || virtualInput.digit === String(i)) {
    if (virtualInput.digit === String(i)) virtualInput.digit = null;
    ...
}

// Sorts
if (...spellHotkeys.feu... || virtualInput.spell === 'feu') {
    if (virtualInput.spell === 'feu') virtualInput.spell = null;
    ...
}
```

## Lancer le projet

```bash
npm install
npm run dev          # http://localhost:8080/
npm run build        # build de production dans dist/
```

## Pistes d'évolution

Voici ce qui ferait sens comme prochains chantiers, par ordre de priorité décroissante :

1. **Sprite pour bird** : le seul ennemi encore procédural. Trouver une sheet avec fond transparent ou traiter une sheet existante (supprimer le noir en alpha via PIL, comme fait pour wizard-tower.png).

2. **Sons et musique** : `this.load.audio()` dans Preloader, `this.sound.play()` dans les scènes. Sons libres sur freesound.org ou kenney.nl.

3. **Difficulté progressive** : adapter la plage des opérations selon le niveau. Par exemple, sur la carte monde les additions résultat ≤ 30, au donjon résultat ≤ 60, en montagne résultat ≤ 100.

4. **Kill goal à 10 en production** : actuellement à 5 pour les tests. Changer `killGoal: 5` → `killGoal: 10` dans la constante `LEVELS` de `Level.js`.

5. **Statistiques pour les parents** : compteur de bonnes/mauvaises réponses par type d'opération, sauvegardé dans `localStorage`. Pourrait s'afficher dans le panneau React latéral.

6. **Système d'inventaire** : potions de soin gagnées en battant les monstres (par exemple 1 potion tous les 5 monstres tués), utilisables avec une touche pour récupérer 3 PV.

7. **Mode "entraînement"** : un mode séparé sans combat, juste des opérations en série pour s'échauffer.

8. **Escaliers dans le tilemap** : les zones surélevées sont visuellement présentes mais sans changement de depth du joueur. Implémenter une zone trigger (overlap) qui ajuste `this.wizardSprite.setDepth()` selon l'élévation.

---

## Préférences de l'utilisateur

- Communication en français.
- Demande qu'on lui dise franchement quand il a tort ou qu'il existe une meilleure solution. Pas de complaisance.
- Toujours proposer la meilleure solution en priorité, vérifier sur le web s'il existe une approche plus efficace ou récente.

## Notes diverses

- Le projet est sur GitHub : `https://github.com/nlarregue/math-game`
- L'utilisateur a un fond technique IT (admin Microsoft 365 / Exchange Online) — il comprend les concepts de développement mais n'est pas développeur full-time. Adapter le niveau d'explication en conséquence : technique mais pas jargonneux.
- Le jeu a été développé pour le fils de l'utilisateur, qui apprécie déjà la version actuelle.
- Les sprites avec **fond transparent** (utilisables) : `wizard-red.png` (extrait de `Sprite-0002.png` ligne 5, 32×32), goblin sheet, kobold_0000_red, vampire-pixel-art-sprite/Converted_Vampire/* (128×128 px/frame).
- Les sprites avec **fond noir opaque** (inutilisables sans traitement) : skelleton sheet, troll_0000_green, gnoll sheet, wolf_0001_brown, Rat_0004_dark. On peut supprimer le fond noir avec PIL : pixels (R<25, G<25, B<25) → alpha=0.
- **Images statiques Intro** : `wizard-tower.png` et `mystical-house.png` sont dans `public/assets/` (pas dans `sprites/`). Traitement PIL appliqué (suppression fond, rognage, redimensionnement). Pour ajouter d'autres images de décor : même pattern — charger dans Preloader avec `this.load.image()`, créer dans `Intro.create()` avec `.setVisible(false)`, cacher dans `update()` avant les méthodes de dessin, activer uniquement dans la méthode qui en a besoin.
- Si les scales des sprites semblent trop grands ou trop petits visuellement, ajuster les valeurs dans `SPRITE_ANIMS` (Level.js) et les appels `.setScale()` dans Intro.js / Boss.js. Le sorcier Level/Boss utilise **0.6** (Wizard_Asset_Pack, 93×77px) ; l'ancien sorcier Intro utilise **2.5** (wizard-red, 32×32). Hub.js n'affiche plus de sprite (redirect pur).
- **Bugs connus corrigés** (ne pas réintroduire) :
  - `this.enemies = []` doit être initialisé dans `create()` de Level.js avant l'appel à `spawnEnemies()`, sinon crash au chargement du niveau.
  - `drawCombat()` doit commencer par `if (!this.combat) return` — `handleCombatInput()` peut mettre `this.combat = null` avant que `drawCombat()` soit appelé dans la même frame.
  - `combatEnemySprite` ne doit pas être dans `combatLayer.add([...])` (double rendu Phaser 4).
  - Dans `spawnEnemies()`, la création du sprite et l'appel `.play()` doivent être dans deux try-catch imbriqués séparés : si l'animation échoue, le sprite reste visible (frame statique) au lieu de tomber en fallback procédural.
  - L'animation `skeleton-idle` doit être créée conditionnellement : vérifier `this.textures.get('skeleton').frameTotal > 12` avant `anims.create()`. Si le check échoue, un `console.warn` l'indique (la texture n'a pas chargé comme spritesheet).
  - Le chemin du spritesheet skeleton dans Preloader doit avoir un S majuscule : `'assets/sprites/Skeleton enemy/Skeleton enemy.png'` (correspond exactement au nom du dossier sur le filesystem).
  - `EventBus.js` utilise `import * as Phaser from 'phaser'` (pas `import Phaser from 'phaser'` — Phaser 4 n'a pas d'export default).
  - `VirtualControls` doit être rendu dans un `<div style={{ position: 'relative' }}>` qui enveloppe aussi `<PhaserGame />`, sinon `position: absolute; inset: 0` ne s'ancre pas au canvas.
  - Dans Level.js (monde), tous les éléments HUD (textes HP, sorts, instructions) doivent appeler `.setScrollFactor(0)` après création — sinon ils scrollent avec la caméra et disparaissent hors de l'écran.
  - `this.combatLayer.setScrollFactor(0)` et `this.combatEnemySprite.setScrollFactor(0)` sont indispensables pour que l'UI de combat reste à l'écran quand la caméra scrolle.
  - Les tilesets Tiled doivent être **embedded** dans le JSON (pas de fichiers .tsx externes) — sinon Phaser ne peut pas lire la carte et les layers sont `null`. Dans Tiled : clic droit sur chaque tileset → "Embed Tileset" avant d'exporter en JSON.
  - `canWalkAt()` doit vérifier le centre du joueur (un seul point), pas 4 coins. Avec 4 points décalés de ±N px, le joueur bloque avant d'atteindre le mur ou ne peut plus longer les bordures de la carte.
