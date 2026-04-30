// Fonctions de dessin procédural pour personnages et ennemis
// Tout est dessiné avec Phaser.GameObjects.Graphics — pas besoin de sprites externes

export const Colors = {
    gold: 0xf4c430,
    red: 0xe24b4a,
    blue: 0x5dade2,
    purple: 0x9b6dd4,
    green: 0x52c878,
    fire: 0xff6b35,
    ice: 0x7fdbff,
    lightning: 0xffe44d,
    white: 0xffffff,
    black: 0x000000
};

// ========== PERSONNAGES ==========

export function drawWizard(g, x, y, scale = 1, casting = false) {
    const s = scale;
    g.clear();
    // Robe
    g.fillStyle(0x4a3a8a);
    g.beginPath();
    g.moveTo(x - 15 * s, y + 25 * s);
    g.lineTo(x + 15 * s, y + 25 * s);
    g.lineTo(x + 10 * s, y + 5 * s);
    g.lineTo(x - 10 * s, y + 5 * s);
    g.closePath();
    g.fillPath();
    // Tête
    g.fillStyle(0xf4c8a0);
    g.fillCircle(x, y - 2 * s, 8 * s);
    // Barbe
    g.fillStyle(0xe0e0e0);
    g.beginPath();
    g.moveTo(x - 6 * s, y + 2 * s);
    g.lineTo(x + 6 * s, y + 2 * s);
    g.lineTo(x + 4 * s, y + 10 * s);
    g.lineTo(x - 4 * s, y + 10 * s);
    g.closePath();
    g.fillPath();
    // Chapeau
    g.fillStyle(0x3a2a6a);
    g.beginPath();
    g.moveTo(x - 12 * s, y - 8 * s);
    g.lineTo(x + 12 * s, y - 8 * s);
    g.lineTo(x + 2 * s, y - 25 * s);
    g.closePath();
    g.fillPath();
    // Étoile chapeau
    g.fillStyle(Colors.gold);
    g.fillCircle(x - 3 * s, y - 15 * s, 2 * s);
    // Bâton
    g.lineStyle(2 * s, 0x8b5a2b);
    if (casting) {
        g.lineBetween(x + 15 * s, y + 10 * s, x + 25 * s, y - 15 * s);
    } else {
        g.lineBetween(x + 12 * s, y + 15 * s, x + 18 * s, y - 15 * s);
    }
    // Cristal du bâton
    g.fillStyle(casting ? Colors.fire : Colors.blue);
    if (casting) {
        g.fillCircle(x + 25 * s, y - 15 * s, 4 * s);
    } else {
        g.fillCircle(x + 18 * s, y - 15 * s, 3 * s);
    }
}

export function drawSlime(g, x, y) {
    g.fillStyle(0x7fdb7f);
    g.beginPath();
    g.moveTo(x - 20, y + 15);
    // Approximation d'une courbe avec lignes
    const pts = 12;
    for (let i = 0; i <= pts; i++) {
        const t = i / pts;
        const angle = Math.PI + t * Math.PI;
        g.lineTo(x + Math.cos(angle) * 20, y + Math.sin(angle) * 18 - 3);
    }
    g.lineTo(x + 20, y + 15);
    g.closePath();
    g.fillPath();
    // Yeux
    g.fillStyle(Colors.black);
    g.fillCircle(x - 7, y - 3, 3);
    g.fillCircle(x + 7, y - 3, 3);
    g.fillStyle(Colors.white);
    g.fillCircle(x - 6, y - 4, 1);
    g.fillCircle(x + 8, y - 4, 1);
}

export function drawBird(g, x, y, t, frozen) {
    const wing = frozen ? 0 : Math.sin(t * 0.2) * 8;
    g.fillStyle(0x8b4513);
    g.fillEllipse(x, y, 30, 20);
    g.fillStyle(0xa0522d);
    g.fillEllipse(x - 8, y - wing, 20, 10);
    g.fillEllipse(x + 8, y - wing, 20, 10);
    g.fillStyle(0x8b4513);
    g.fillCircle(x + 12, y - 5, 7);
    g.fillStyle(Colors.gold);
    g.beginPath();
    g.moveTo(x + 18, y - 5);
    g.lineTo(x + 25, y - 3);
    g.lineTo(x + 18, y - 1);
    g.closePath();
    g.fillPath();
    g.fillStyle(Colors.black);
    g.fillCircle(x + 13, y - 7, 1.5);
}

export function drawSkeleton(g, x, y) {
    // Corps
    g.fillStyle(0xe8e8d8);
    g.fillRect(x - 10, y, 20, 18);
    // Côtes
    g.fillStyle(Colors.black);
    for (let i = 0; i < 3; i++) {
        g.fillRect(x - 8, y + 3 + i * 5, 16, 2);
    }
    // Tête
    g.fillStyle(0xe8e8d8);
    g.fillCircle(x, y - 8, 10);
    // Yeux noirs
    g.fillStyle(Colors.black);
    g.fillCircle(x - 4, y - 9, 2.5);
    g.fillCircle(x + 4, y - 9, 2.5);
    // Dents
    g.fillStyle(0xe8e8d8);
    g.fillRect(x - 5, y - 3, 10, 2);
    g.fillStyle(Colors.black);
    g.fillRect(x - 3, y - 3, 1, 2);
    g.fillRect(x, y - 3, 1, 2);
    g.fillRect(x + 3, y - 3, 1, 2);
    // Bras
    g.fillStyle(0xe8e8d8);
    g.fillRect(x - 15, y + 2, 4, 12);
    g.fillRect(x + 11, y + 2, 4, 12);
}

export function drawBat(g, x, y, t, frozen) {
    const wing = frozen ? 0 : Math.sin(t * 0.3) * 10;
    g.fillStyle(0x3a1a4a);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x - 25, y - wing);
    g.lineTo(x - 15, y + 5);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 25, y - wing);
    g.lineTo(x + 15, y + 5);
    g.closePath();
    g.fillPath();
    g.fillStyle(0x5a2a6a);
    g.fillCircle(x, y, 8);
    g.fillStyle(Colors.red);
    g.fillCircle(x - 3, y - 2, 2);
    g.fillCircle(x + 3, y - 2, 2);
    g.fillStyle(0x3a1a4a);
    g.beginPath();
    g.moveTo(x - 5, y - 6);
    g.lineTo(x - 3, y - 12);
    g.lineTo(x - 1, y - 6);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(x + 1, y - 6);
    g.lineTo(x + 3, y - 12);
    g.lineTo(x + 5, y - 6);
    g.closePath();
    g.fillPath();
}

export function drawVampire(g, x, y) {
    g.fillStyle(0x3a0a0a);
    g.beginPath();
    g.moveTo(x - 18, y + 25);
    g.lineTo(x + 18, y + 25);
    g.lineTo(x + 12, y);
    g.lineTo(x - 12, y);
    g.closePath();
    g.fillPath();
    g.fillStyle(0x1a1a2a);
    g.fillRect(x - 8, y, 16, 20);
    g.fillStyle(0xd8d8e8);
    g.fillCircle(x, y - 8, 9);
    g.fillStyle(Colors.black);
    // Cheveux : demi-cercle haut
    g.beginPath();
    g.arc(x, y - 12, 9, Math.PI, 0, false);
    g.closePath();
    g.fillPath();
    g.fillStyle(Colors.red);
    g.fillCircle(x - 3, y - 8, 1.5);
    g.fillCircle(x + 3, y - 8, 1.5);
    g.fillStyle(Colors.white);
    g.fillTriangle(x - 2, y - 3, x - 1, y, x, y - 3);
    g.fillTriangle(x, y - 3, x + 1, y, x + 2, y - 3);
}

export function drawOrc(g, x, y) {
    g.fillStyle(0x5a7a3a);
    g.fillRect(x - 12, y, 24, 22);
    g.fillStyle(0x6a8a4a);
    g.fillCircle(x, y - 8, 11);
    g.fillStyle(Colors.gold);
    g.fillCircle(x - 4, y - 9, 2);
    g.fillCircle(x + 4, y - 9, 2);
    g.fillStyle(Colors.black);
    g.fillCircle(x - 4, y - 9, 1);
    g.fillCircle(x + 4, y - 9, 1);
    g.fillStyle(Colors.white);
    g.fillTriangle(x - 3, y - 2, x - 4, y + 3, x - 1, y - 2);
    g.fillTriangle(x + 3, y - 2, x + 4, y + 3, x + 1, y - 2);
    g.fillStyle(0x5a7a3a);
    g.fillRect(x - 18, y + 2, 6, 15);
    g.fillRect(x + 12, y + 2, 6, 15);
    g.fillStyle(0x6b3410);
    g.fillRect(x + 15, y - 5, 4, 15);
    g.fillCircle(x + 17, y - 5, 5);
}

export function drawGoblin(g, x, y) {
    g.fillStyle(0x7aaa3a);
    g.fillRect(x - 8, y, 16, 15);
    g.fillStyle(0x8aba4a);
    g.fillCircle(x, y - 6, 10);
    g.fillTriangle(x - 9, y - 8, x - 15, y - 12, x - 7, y - 4);
    g.fillTriangle(x + 9, y - 8, x + 15, y - 12, x + 7, y - 4);
    g.fillStyle(Colors.red);
    g.fillCircle(x - 3, y - 7, 1.5);
    g.fillCircle(x + 3, y - 7, 1.5);
    g.fillStyle(0x999999);
    g.fillTriangle(x + 10, y + 5, x + 18, y, x + 10, y + 8);
}

export function drawDragon(g, x, y, t) {
    const wing = Math.sin(t * 0.1) * 15;
    g.fillStyle(0x3a0a0a);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x - 80, y - 40 - wing);
    g.lineTo(x - 60, y);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 80, y - 40 - wing);
    g.lineTo(x + 60, y);
    g.closePath();
    g.fillPath();
    g.fillStyle(0x8a1a1a);
    g.fillEllipse(x, y, 80, 50);
    g.fillStyle(0xa02a2a);
    g.fillEllipse(x - 40, y - 10, 40, 30);
    g.fillStyle(Colors.gold);
    g.fillCircle(x - 48, y - 13, 3);
    g.fillStyle(Colors.black);
    g.fillCircle(x - 48, y - 13, 1.5);
    g.fillStyle(0x444444);
    g.fillTriangle(x - 45, y - 22, x - 40, y - 35, x - 38, y - 22);
    g.fillTriangle(x - 38, y - 22, x - 32, y - 32, x - 30, y - 22);
    g.fillStyle(Colors.white);
    g.fillTriangle(x - 55, y - 5, x - 53, y, x - 50, y - 5);
    g.fillStyle(0x8a1a1a);
    g.fillEllipse(x + 60, y - 5, 60, 15);
}

// ========== ENNEMI WRAPPER ==========
// Dessine un ennemi avec ses effets (gel, flash, barre HP)
export function drawEnemy(g, e, t, options = {}) {
    g.clear();
    const showHpBar = options.showHpBar !== false;
    const showLockIcon = options.showLockIcon !== false;

    // Aura de glace
    if (e.frozen > 0) {
        g.fillStyle(Colors.ice, 0.4);
        g.fillCircle(e.x, e.y, 28);
    }

    // Flash (clignotement quand touché)
    const alpha = e.flash > 0 ? 0.5 : 1;

    if (e.type === 'slime') drawSlimeAlpha(g, e.x, e.y, alpha);
    else if (e.type === 'bird') drawBirdAlpha(g, e.x, e.y, t, e.frozen > 0, alpha);
    else if (e.type === 'skeleton') drawSkeletonAlpha(g, e.x, e.y, alpha);
    else if (e.type === 'bat') drawBatAlpha(g, e.x, e.y, t, e.frozen > 0, alpha);
    else if (e.type === 'vampire') drawVampireAlpha(g, e.x, e.y, alpha);
    else if (e.type === 'orc') drawOrcAlpha(g, e.x, e.y, alpha);
    else if (e.type === 'goblin') drawGoblinAlpha(g, e.x, e.y, alpha);

    // Cristaux de glace en orbite
    if (e.frozen > 0) {
        g.lineStyle(2, Colors.ice);
        for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3;
            g.lineBetween(
                e.x + Math.cos(a) * 15, e.y + Math.sin(a) * 15,
                e.x + Math.cos(a) * 22, e.y + Math.sin(a) * 22
            );
        }
    }

    // Ombre flottante pour volants
    if (e.flying && e.frozen <= 0) {
        g.fillStyle(Colors.white, 0.3);
        g.fillEllipse(e.x, e.y + 22, 36, 8);
    }

    // Barre HP
    if (showHpBar) {
        const w = 30;
        g.fillStyle(0x440000);
        g.fillRect(e.x - w / 2, e.y - 25, w, 4);
        g.fillStyle(Colors.red);
        g.fillRect(e.x - w / 2, e.y - 25, w * (e.hp / e.maxHp), 4);
    }
}

// Versions alpha (réutilisent les fonctions de base — alpha appliqué au graphics avant appel)
function drawSlimeAlpha(g, x, y, a) { setAlpha(g, a); drawSlime(g, x, y); }
function drawBirdAlpha(g, x, y, t, f, a) { setAlpha(g, a); drawBird(g, x, y, t, f); }
function drawSkeletonAlpha(g, x, y, a) { setAlpha(g, a); drawSkeleton(g, x, y); }
function drawBatAlpha(g, x, y, t, f, a) { setAlpha(g, a); drawBat(g, x, y, t, f); }
function drawVampireAlpha(g, x, y, a) { setAlpha(g, a); drawVampire(g, x, y); }
function drawOrcAlpha(g, x, y, a) { setAlpha(g, a); drawOrc(g, x, y); }
function drawGoblinAlpha(g, x, y, a) { setAlpha(g, a); drawGoblin(g, x, y); }
function setAlpha(g, a) { g.alpha = a; }

// ========== DÉCORS ==========
// Les décors sont dessinés directement dans la scène via cette fonction utilitaire

export function drawForest(g, t, w, h) {
    g.clear();
    // Fond
    g.fillStyle(0x1a3a2a);
    g.fillRect(0, 0, w, h);
    // Sol dégradé approximé (deux bandes)
    g.fillStyle(0x2d5a2d);
    g.fillRect(0, h * 0.6, w, h * 0.2);
    g.fillStyle(0x1a3a1a);
    g.fillRect(0, h * 0.8, w, h * 0.2);
    // Arbres
    const treeY = h * 0.56;
    for (let i = 0; i < 8; i++) {
        const x = i * (w / 7) + 30;
        g.fillStyle(0x3a2a1a);
        g.fillRect(x - 5, treeY, 10, 40);
        g.fillStyle(0x1a4a1a);
        g.fillCircle(x, treeY - 10, 25);
        g.fillStyle(0x2a5a2a);
        g.fillCircle(x - 8, treeY - 15, 15);
    }
    // Buissons
    for (let i = 0; i < 5; i++) {
        const x = i * (w / 4) + 60;
        g.fillStyle(0x2a6a2a);
        g.fillCircle(x, h * 0.92, 20);
    }
    // Champignon
    g.fillStyle(0xc0392b);
    g.fillEllipse(150, h * 0.88, 16, 12);
    g.fillStyle(0xf1c40f);
    g.fillRect(147, h * 0.88, 6, 8);
}

export function drawCastle(g, t, w, h) {
    g.clear();
    g.fillStyle(0x1a1428);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x3d3550);
    g.fillRect(0, h * 0.5, w, h * 0.5);
    // Lignes de pierre
    g.lineStyle(2, 0x2a2438);
    for (let y = h * 0.54; y < h; y += 30) {
        g.lineBetween(0, y, w, y);
        for (let x = (Math.floor(y) % 60 === 0 ? 0 : 30); x < w; x += 60) {
            g.lineBetween(x, y, x, y + 30);
        }
    }
    // Colonnes
    for (let i = 0; i < 4; i++) {
        const x = i * (w / 3.5) + 80;
        g.fillStyle(0x5d5570);
        g.fillRect(x - 15, 100, 30, 200);
        g.fillStyle(0x7d7590);
        g.fillRect(x - 20, 100, 40, 15);
        g.fillRect(x - 20, 285, 40, 15);
    }
    // Torches
    for (let i = 0; i < 4; i++) {
        const x = i * (w / 3.5) + 80;
        const flame = Math.sin(t * 0.2 + i) * 3;
        g.fillStyle(Colors.fire);
        g.fillCircle(x, 150 + flame, 8);
        g.fillStyle(Colors.gold);
        g.fillCircle(x, 150 + flame, 4);
    }
}

export function drawMountain(g, t, w, h) {
    g.clear();
    // Ciel
    g.fillStyle(0x2a1a3a);
    g.fillRect(0, 0, w, h * 0.3);
    g.fillStyle(0x3a2540);
    g.fillRect(0, h * 0.3, w, h * 0.3);
    // Montagnes
    g.fillStyle(0x3a2a2a);
    g.beginPath();
    g.moveTo(0, h * 0.6);
    g.lineTo(w * 0.18, h * 0.2);
    g.lineTo(w * 0.37, h * 0.4);
    g.lineTo(w * 0.56, h * 0.16);
    g.lineTo(w * 0.75, h * 0.36);
    g.lineTo(w, h * 0.24);
    g.lineTo(w, h * 0.6);
    g.closePath();
    g.fillPath();
    // Neige
    g.fillStyle(Colors.white);
    g.fillTriangle(w * 0.16, h * 0.26, w * 0.18, h * 0.2, w * 0.21, h * 0.26);
    g.fillTriangle(w * 0.54, h * 0.22, w * 0.56, h * 0.16, w * 0.59, h * 0.22);
    // Sol
    g.fillStyle(0x5a4030);
    g.fillRect(0, h * 0.6, w, h * 0.2);
    g.fillStyle(0x3a2a1a);
    g.fillRect(0, h * 0.8, w, h * 0.2);
    // Rochers
    for (let i = 0; i < 6; i++) {
        const x = i * (w / 5.5) + 50;
        const y = h * 0.84 + Math.sin(i) * 20;
        g.fillStyle(0x6a5a4a);
        g.fillCircle(x, y, 18);
        g.fillStyle(0x4a3a2a);
        g.fillCircle(x - 5, y - 5, 8);
    }
}
