/**
 * generate-map.js
 * Génère public/assets/world.json — carte Tiled compatible Phaser
 * Usage : node generate-map.js
 */

const fs   = require('fs');
const path = require('path');

// ── Dimensions ──────────────────────────────────────────────────────────────
const W         = 64;   // tuiles en largeur
const H         = 64;   // tuiles en hauteur
const TILESIZE  = 32;   // px par tuile

// ── IDs globaux Tiled (firstgid + local_id) ─────────────────────────────────
//   Tileset 1 : TX Tileset Grass   256×256 à 32px = 8×8  = 64  tuiles — firstgid = 1
//   Tileset 2 : TX Tileset Stone   256×256 à 32px = 8×8  = 64  tuiles — firstgid = 65
//   Tileset 3 : TX Tileset Wall    512×512 à 32px = 16×16 = 256 tuiles — firstgid = 129
//   Tileset 4 : TX Struct          512×512 à 32px = 16×16 = 256 tuiles — firstgid = 385
//   Tileset 5 : TX Plant           512×512 à 32px = 16×16 = 256 tuiles — firstgid = 641

const EMPTY   = 0;

// Herbe (toutes les tuiles TX Grass sont vertes — on varie pour l'aspect naturel)
const GRASS   = 1;    // tuile herbe standard
const GRASS2  = 2;    // variante
const GRASS3  = 9;    // variante
const GRASS4  = 16;   // variante

// Pierre (TX Stone Ground — toutes LS = pierre claire)
const STONE   = 65;   // pierre standard
const STONE2  = 66;   // variante
const STONE3  = 70;   // variante
const STONE4  = 73;   // variante

// Plantes/arbres (TX Plant — tuiles avec centre vert confirmé)
const TREE    = 674;  // TX Plant local 33 (row2 col1, centre vert)
const TREE2   = 679;  // TX Plant local 38 (row2 col6, centre vert)

// ── Helpers ─────────────────────────────────────────────────────────────────
function idx(x, y) { return y * W + x; }

function fillRect(grid, x1, y1, x2, y2, tile) {
    for (let y = Math.max(0, y1); y <= Math.min(H - 1, y2); y++)
        for (let x = Math.max(0, x1); x <= Math.min(W - 1, x2); x++)
            grid[idx(x, y)] = tile;
}

function setTile(grid, x, y, tile) {
    if (x >= 0 && x < W && y >= 0 && y < H)
        grid[idx(x, y)] = tile;
}

// Herbe variée sur une zone (aspect naturel)
function fillGrassVaried(grid, x1, y1, x2, y2) {
    const variants = [GRASS, GRASS, GRASS, GRASS2, GRASS, GRASS, GRASS3, GRASS, GRASS4, GRASS];
    for (let y = Math.max(0, y1); y <= Math.min(H - 1, y2); y++)
        for (let x = Math.max(0, x1); x <= Math.min(W - 1, x2); x++)
            grid[idx(x, y)] = variants[(x * 3 + y * 7) % variants.length];
}

// Pierre variée
function fillStoneVaried(grid, x1, y1, x2, y2) {
    const variants = [STONE, STONE, STONE2, STONE, STONE3, STONE, STONE4, STONE];
    for (let y = Math.max(0, y1); y <= Math.min(H - 1, y2); y++)
        for (let x = Math.max(0, x1); x <= Math.min(W - 1, x2); x++)
            grid[idx(x, y)] = variants[(x * 5 + y * 3) % variants.length];
}

// ── Couches ─────────────────────────────────────────────────────────────────
const ground    = new Array(W * H).fill(GRASS);
const elevation = new Array(W * H).fill(EMPTY);
const decor     = new Array(W * H).fill(EMPTY);
const walls     = new Array(W * H).fill(EMPTY);

// ═══════════════════════════════════════════════════════════════════════════
//  GROUND — sol de base, tout en herbe variée
// ═══════════════════════════════════════════════════════════════════════════
fillGrassVaried(ground, 0, 0, W - 1, H - 1);

// ═══════════════════════════════════════════════════════════════════════════
//  ELEVATION — plateformes en pierre
// ═══════════════════════════════════════════════════════════════════════════

// Plateforme haute : autel (portail Montagne) — centré en haut
//   cols 24-39, rows 3-10  (16 tuiles large × 8 tuiles haut)
fillStoneVaried(elevation, 24, 3, 39, 10);

// Chemin descendant de l'autel vers la cour centrale
//   cols 30-33, rows 11-21  (4 tuiles large)
fillStoneVaried(elevation, 30, 11, 33, 21);

// Cour centrale
//   cols 14-49, rows 22-41  (36 large × 20 haut)
fillStoneVaried(elevation, 14, 22, 49, 41);

// Chemin montant vers le donjon
//   cols 30-33, rows 42-52
fillStoneVaried(elevation, 30, 42, 33, 52);

// Plateforme basse : donjon (portail Château)
//   cols 24-39, rows 53-60
fillStoneVaried(elevation, 24, 53, 39, 60);

// ═══════════════════════════════════════════════════════════════════════════
//  WALLS — murs bloquants (tous les tiles non-vides = collision dans Phaser)
// ═══════════════════════════════════════════════════════════════════════════

// Bordure extérieure (2 tuiles d'épaisseur)
fillRect(walls, 0, 0, W - 1, 1, STONE);       // haut
fillRect(walls, 0, H - 2, W - 1, H - 1, STONE); // bas
fillRect(walls, 0, 0, 1, H - 1, STONE);        // gauche
fillRect(walls, W - 2, 0, W - 1, H - 1, STONE); // droite

// Murs latéraux intérieurs (encadrement des couloirs)
//   Flancs gauche/droite de la plateforme haute
fillRect(walls, 22, 3, 23, 10, STONE);
fillRect(walls, 40, 3, 41, 10, STONE);
//   Bords du chemin autel→cour
fillRect(walls, 28, 11, 29, 21, STONE);
fillRect(walls, 34, 11, 35, 21, STONE);
//   Bords de la cour centrale
fillRect(walls, 12, 22, 13, 41, STONE);
fillRect(walls, 50, 22, 51, 41, STONE);
//   Bords du chemin cour→donjon
fillRect(walls, 28, 42, 29, 52, STONE);
fillRect(walls, 34, 42, 35, 52, STONE);
//   Flancs de la plateforme basse
fillRect(walls, 22, 53, 23, 60, STONE);
fillRect(walls, 40, 53, 41, 60, STONE);

// ═══════════════════════════════════════════════════════════════════════════
//  DECOR — arbres et végétation (décoratifs, pas de collision)
// ═══════════════════════════════════════════════════════════════════════════
const treeSpots = [
    // Coin haut-gauche
    [5,4],[7,4],[5,6],[9,5],[4,9],[6,11],[10,7],[3,12],
    // Coin haut-droit
    [54,4],[56,5],[58,4],[53,7],[59,6],[55,10],[61,9],[57,12],
    // Zone milieu-gauche
    [4,25],[6,28],[4,32],[7,36],[5,40],[3,44],
    // Zone milieu-droite
    [58,25],[60,28],[58,32],[61,36],[59,40],[57,44],
    // Coin bas-gauche
    [5,52],[7,55],[4,57],[9,54],[6,60],[3,56],
    // Coin bas-droit
    [55,52],[57,55],[59,57],[54,60],[61,54],[58,60],
    // Quelques arbres dans la zone ouverte haut
    [15,5],[20,7],[44,6],[48,8],
    // Quelques arbres dans la zone ouverte bas
    [15,55],[19,57],[45,54],[50,57],
];

treeSpots.forEach(([x, y]) => {
    // Tronc/corps : alterner TREE et TREE2
    const variant = ((x + y) % 2 === 0) ? TREE : TREE2;
    setTile(decor, x, y, variant);
});

// ═══════════════════════════════════════════════════════════════════════════
//  ZONES OBJET — portails et point de départ
// ═══════════════════════════════════════════════════════════════════════════
const objects = [
    {
        id: 1, name: 'portal-montagne', type: '',
        visible: true, rotation: 0,
        x: 29 * TILESIZE, y: 3 * TILESIZE,
        width: 6 * TILESIZE, height: 5 * TILESIZE,
        properties: [
            { name: 'type',   type: 'string', value: 'portal'    },
            { name: 'target', type: 'string', value: 'montagne'  }
        ]
    },
    {
        id: 2, name: 'portal-chateau', type: '',
        visible: true, rotation: 0,
        x: 29 * TILESIZE, y: 54 * TILESIZE,
        width: 6 * TILESIZE, height: 5 * TILESIZE,
        properties: [
            { name: 'type',   type: 'string', value: 'portal'   },
            { name: 'target', type: 'string', value: 'chateau'  }
        ]
    },
    {
        id: 3, name: 'spawn', type: 'spawn',
        visible: true, rotation: 0,
        x: 31 * TILESIZE, y: 31 * TILESIZE,
        width: TILESIZE, height: TILESIZE,
        properties: []
    }
];

// ═══════════════════════════════════════════════════════════════════════════
//  ASSEMBLAGE JSON TILED
// ═══════════════════════════════════════════════════════════════════════════
const TILESET_BASE = 'sprites/Pixel Art Top Down/Texture';

const map = {
    compressionlevel: -1,
    height: H,
    infinite: false,
    nextlayerid: 6,
    nextobjectid: objects.length + 1,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tiledversion: '1.10.2',
    tileheight: TILESIZE,
    tilewidth: TILESIZE,
    type: 'map',
    version: '1.10',
    width: W,

    tilesets: [
        {
            firstgid: 1,
            image: `${TILESET_BASE}/TX Tileset Grass.png`,
            imageheight: 256, imagewidth: 256,
            margin: 0, spacing: 0,
            name: 'TX Tileset Grass',
            tilecount: 64, tileheight: TILESIZE, tilewidth: TILESIZE
        },
        {
            firstgid: 65,
            image: `${TILESET_BASE}/TX Tileset Stone Ground.png`,
            imageheight: 256, imagewidth: 256,
            margin: 0, spacing: 0,
            name: 'TX Tileset Stone Ground',
            tilecount: 64, tileheight: TILESIZE, tilewidth: TILESIZE
        },
        {
            firstgid: 129,
            image: `${TILESET_BASE}/TX Tileset Wall.png`,
            imageheight: 512, imagewidth: 512,
            margin: 0, spacing: 0,
            name: 'TX Tileset Wall',
            tilecount: 256, tileheight: TILESIZE, tilewidth: TILESIZE
        },
        {
            firstgid: 385,
            image: `${TILESET_BASE}/TX Struct.png`,
            imageheight: 512, imagewidth: 512,
            margin: 0, spacing: 0,
            name: 'TX Struct',
            tilecount: 256, tileheight: TILESIZE, tilewidth: TILESIZE
        },
        {
            firstgid: 641,
            image: `${TILESET_BASE}/TX Plant.png`,
            imageheight: 512, imagewidth: 512,
            margin: 0, spacing: 0,
            name: 'TX Plant',
            tilecount: 256, tileheight: TILESIZE, tilewidth: TILESIZE
        }
    ],

    layers: [
        {
            id: 1, name: 'ground', type: 'tilelayer',
            x: 0, y: 0, width: W, height: H,
            opacity: 1, visible: true,
            data: ground
        },
        {
            id: 2, name: 'elevation', type: 'tilelayer',
            x: 0, y: 0, width: W, height: H,
            opacity: 1, visible: true,
            data: elevation
        },
        {
            id: 3, name: 'decor', type: 'tilelayer',
            x: 0, y: 0, width: W, height: H,
            opacity: 1, visible: true,
            data: decor
        },
        {
            id: 4, name: 'walls', type: 'tilelayer',
            x: 0, y: 0, width: W, height: H,
            opacity: 1, visible: true,
            data: walls
        },
        {
            id: 5, name: 'zones', type: 'objectgroup',
            draworder: 'topdown',
            x: 0, y: 0,
            opacity: 1, visible: true,
            objects
        }
    ]
};

// ── Écriture ─────────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, 'public', 'assets', 'world.json');
fs.writeFileSync(outPath, JSON.stringify(map, null, 2), 'utf8');

const kb = Math.round(fs.statSync(outPath).size / 1024);
console.log(`✓ world.json généré : ${outPath} (${kb} Ko)`);
console.log(`  Carte : ${W}×${H} tuiles = ${W * TILESIZE}×${H * TILESIZE} px`);
console.log(`  Layers : ground / elevation / decor / walls / zones`);
console.log(`  Portails : portal-montagne (row 3-8) | portal-chateau (row 54-59)`);
console.log(`  Spawn : centre de la carte (tile 31,31)`);
