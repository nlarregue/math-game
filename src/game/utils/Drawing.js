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

export function drawWizard(g, x, y, scale = 1, casting = false, walkPhase = 0) {
    const s = scale;
    g.clear();

    // Vertical bob when walking
    const bobY = walkPhase > 0 ? Math.sin(walkPhase * 0.35) * 2 * s : 0;
    const dy = y + bobY;

    // Feet (only visible when walking)
    if (walkPhase > 0) {
        const step = Math.sin(walkPhase * 0.35);
        g.fillStyle(0x3a2a6a);
        g.fillEllipse(x - 5 * s + step * 5 * s, dy + 27 * s, 9 * s, 5 * s);
        g.fillEllipse(x + 5 * s - step * 5 * s, dy + 27 * s, 9 * s, 5 * s);
    }

    // Robe
    g.fillStyle(0x4a3a8a);
    g.beginPath();
    g.moveTo(x - 15 * s, dy + 25 * s);
    g.lineTo(x + 15 * s, dy + 25 * s);
    g.lineTo(x + 10 * s, dy + 5 * s);
    g.lineTo(x - 10 * s, dy + 5 * s);
    g.closePath();
    g.fillPath();
    // Tête
    g.fillStyle(0xf4c8a0);
    g.fillCircle(x, dy - 2 * s, 8 * s);
    // Barbe
    g.fillStyle(0xe0e0e0);
    g.beginPath();
    g.moveTo(x - 6 * s, dy + 2 * s);
    g.lineTo(x + 6 * s, dy + 2 * s);
    g.lineTo(x + 4 * s, dy + 10 * s);
    g.lineTo(x - 4 * s, dy + 10 * s);
    g.closePath();
    g.fillPath();
    // Chapeau
    g.fillStyle(0x3a2a6a);
    g.beginPath();
    g.moveTo(x - 12 * s, dy - 8 * s);
    g.lineTo(x + 12 * s, dy - 8 * s);
    g.lineTo(x + 2 * s, dy - 25 * s);
    g.closePath();
    g.fillPath();
    // Étoile chapeau
    g.fillStyle(Colors.gold);
    g.fillCircle(x - 3 * s, dy - 15 * s, 2 * s);
    // Bâton
    g.lineStyle(2 * s, 0x8b5a2b);
    if (casting) {
        g.lineBetween(x + 15 * s, dy + 10 * s, x + 25 * s, dy - 15 * s);
    } else {
        g.lineBetween(x + 12 * s, dy + 15 * s, x + 18 * s, dy - 15 * s);
    }
    // Cristal du bâton
    g.fillStyle(casting ? Colors.fire : Colors.blue);
    if (casting) {
        g.fillCircle(x + 25 * s, dy - 15 * s, 4 * s);
    } else {
        g.fillCircle(x + 18 * s, dy - 15 * s, 3 * s);
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

export function drawHouseExterior(g, t, w, h) {
    g.clear();

    // Ciel (aube)
    g.fillStyle(0x150a2a);
    g.fillRect(0, 0, w, h * 0.38);
    g.fillStyle(0x2a1540);
    g.fillRect(0, h * 0.28, w, h * 0.12);
    // Lueur orange à l'horizon
    g.fillStyle(0xcc4410, 0.35);
    g.fillRect(0, h * 0.36, w, h * 0.1);
    g.fillStyle(0xff7722, 0.18);
    g.fillRect(0, h * 0.41, w, h * 0.07);

    // Étoiles qui s'estompent
    for (let i = 0; i < 30; i++) {
        const sx = (i * 137 + 11) % w;
        const sy = (i * 71 + 7) % (h * 0.3);
        const a = 0.2 + Math.sin(t * 0.04 + i * 0.7) * 0.18;
        g.fillStyle(0xffffff, a);
        g.fillRect(sx, sy, 2, 2);
    }

    // Sol
    g.fillStyle(0x253a18);
    g.fillRect(0, h * 0.48, w, h * 0.52);
    g.fillStyle(0x304a22);
    g.fillRect(0, h * 0.48, w, h * 0.07);

    // Chemin en terre (trapèze qui s'élargit vers le bas)
    g.fillStyle(0x9a7a50);
    g.beginPath();
    g.moveTo(w * 0.26, h * 0.48);
    g.lineTo(w * 0.83, h * 0.48);
    g.lineTo(w * 0.96, h);
    g.lineTo(w * 0.07, h);
    g.closePath();
    g.fillPath();
    // Texture chemin
    g.fillStyle(0x8a6a40);
    for (let i = 0; i < 6; i++) {
        g.fillRect(w * 0.32 + i * w * 0.1, h * 0.62 + i * h * 0.04, 18, 5);
    }

    // ---- MAISON (gauche) ----
    // Murs
    g.fillStyle(0x8a7a68);
    g.fillRect(18, h * 0.27, w * 0.27, h * 0.26);
    // Motif pierre
    g.lineStyle(1, 0x6a5a48);
    for (let row = 0; row < 5; row++) {
        const ry = h * 0.27 + row * h * 0.052;
        g.lineBetween(18, ry, 18 + w * 0.27, ry);
        for (let col = 0; col < 5; col++) {
            const rx = 18 + col * w * 0.054 + (row % 2 === 0 ? 0 : w * 0.027);
            g.lineBetween(rx, ry, rx, ry + h * 0.052);
        }
    }
    // Toit
    g.fillStyle(0x5a3820);
    g.beginPath();
    g.moveTo(8, h * 0.27);
    g.lineTo(18 + w * 0.27 + 10, h * 0.27);
    g.lineTo(18 + w * 0.135, h * 0.11);
    g.closePath();
    g.fillPath();
    // Cheminée
    g.fillStyle(0x7a6858);
    g.fillRect(18 + w * 0.165, h * 0.12, 18, h * 0.16);
    // Fumée
    for (let i = 0; i < 4; i++) {
        const sx = 27 + w * 0.165 + Math.sin(t * 0.04 + i * 1.4) * 8;
        const sy = h * 0.11 - i * 16;
        const a = 0.55 - i * 0.12;
        g.fillStyle(0xbbbbbb, a);
        g.fillCircle(sx, sy, 7 + i * 4);
    }
    // Porte
    g.fillStyle(0x4a2a0a);
    g.fillRect(18 + w * 0.1, h * 0.42, 22, h * 0.12);
    g.fillCircle(18 + w * 0.1 + 11, h * 0.42, 11);
    // Fenêtre gauche
    g.fillStyle(0xffffcc, 0.85);
    g.fillRect(26, h * 0.32, 22, 18);
    g.lineStyle(2, 0x4a2a0a);
    g.strokeRect(26, h * 0.32, 22, 18);
    g.lineBetween(37, h * 0.32, 37, h * 0.32 + 18);
    // Fenêtre droite
    g.fillStyle(0xffffcc, 0.85);
    g.fillRect(18 + w * 0.155, h * 0.32, 22, 18);
    g.lineStyle(2, 0x4a2a0a);
    g.strokeRect(18 + w * 0.155, h * 0.32, 22, 18);
    g.lineBetween(18 + w * 0.155 + 11, h * 0.32, 18 + w * 0.155 + 11, h * 0.32 + 18);

    // ---- BIBLIOTHÈQUE (droite) ----
    const lx = w * 0.68;
    const lw = w * 0.31;
    g.fillStyle(0x8a7a68);
    g.fillRect(lx, h * 0.18, lw, h * 0.35);
    // Fronton triangulaire
    g.fillStyle(0x7a6a58);
    g.fillRect(lx - 8, h * 0.15, lw + 16, h * 0.04);
    g.beginPath();
    g.moveTo(lx - 12, h * 0.15);
    g.lineTo(lx + lw + 12, h * 0.15);
    g.lineTo(lx + lw / 2, h * 0.07);
    g.closePath();
    g.fillPath();
    // Colonnes
    g.fillStyle(0xb0a090);
    for (let i = 0; i < 4; i++) {
        const cx = lx + 12 + i * (lw / 4 - 1);
        g.fillRect(cx, h * 0.19, 11, h * 0.34);
        g.fillStyle(0xc0b0a0);
        g.fillRect(cx - 3, h * 0.19, 17, 7);
        g.fillRect(cx - 3, h * 0.19 + h * 0.34 - 7, 17, 7);
        g.fillStyle(0xb0a090);
    }
    // Porte arche
    g.fillStyle(0x3a2a18);
    g.fillRect(lx + lw * 0.37, h * 0.37, 26, h * 0.17);
    g.fillCircle(lx + lw * 0.37 + 13, h * 0.37, 13);
    // Fenêtres biblio
    g.fillStyle(0xffffaa, 0.65);
    g.fillRect(lx + 14, h * 0.24, 18, 20);
    g.fillRect(lx + lw * 0.65, h * 0.24, 18, 20);
    g.lineStyle(2, 0x5a4a38);
    g.strokeRect(lx + 14, h * 0.24, 18, 20);
    g.strokeRect(lx + lw * 0.65, h * 0.24, 18, 20);

    // ---- ARBRES le long du chemin ----
    const treeXs = [w * 0.39, w * 0.51, w * 0.63];
    treeXs.forEach(tx => {
        const ty = h * 0.47;
        g.fillStyle(0x4a3828);
        g.fillRect(tx - 4, ty, 8, 28);
        g.fillStyle(0x1a4a1a);
        g.fillCircle(tx, ty - 8, 20);
        g.fillStyle(0x286028);
        g.fillCircle(tx - 10, ty - 13, 13);
        g.fillStyle(0x387038);
        g.fillCircle(tx + 8, ty - 11, 11);
    });
}

export function drawLibraryAisle(g, t, w, h, glowX = -1, glowY = -1) {
    g.clear();

    // Fond général (bois sombre)
    g.fillStyle(0x2a1a0a);
    g.fillRect(0, 0, w, h);

    // Lueur au fond du couloir (point de fuite)
    const vpX = w * 0.5, vpY = h * 0.42;
    g.fillStyle(0xffeecc, 0.06 + Math.sin(t * 0.04) * 0.025);
    g.fillCircle(vpX, vpY, 95);

    // Plafond (trapèze sombre)
    g.fillStyle(0x120900);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(w, 0);
    g.lineTo(w * 0.72, h * 0.2);
    g.lineTo(w * 0.28, h * 0.2);
    g.closePath();
    g.fillPath();

    // Sol (trapèze)
    g.fillStyle(0x3a2008);
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(w, h);
    g.lineTo(w * 0.72, h * 0.65);
    g.lineTo(w * 0.28, h * 0.65);
    g.closePath();
    g.fillPath();
    // Lattes de parquet (lignes convergentes)
    g.lineStyle(1, 0x2a1506);
    for (let i = 1; i < 6; i++) {
        const p = i / 6;
        const fy = h * 0.65 + (h - h * 0.65) * p;
        const margin = w * 0.28 * (1 - p);
        g.lineBetween(margin, fy, w - margin, fy);
    }

    // ---- ÉTAGÈRE GAUCHE ----
    const shelfW = w * 0.28;
    g.fillStyle(0x3a2008);
    g.fillRect(0, 0, shelfW, h);
    // Planches horizontales
    g.fillStyle(0x6a4828);
    const shelfCount = 5;
    for (let i = 0; i <= shelfCount; i++) {
        g.fillRect(0, i * h / shelfCount, shelfW, 5);
    }
    // Livres (gauche)
    const bcolL = [0xaa2222, 0x224488, 0x228833, 0xaa8822, 0x882288, 0xaa5522, 0x226688];
    for (let shelf = 0; shelf < shelfCount; shelf++) {
        const sy = shelf * h / shelfCount + 6;
        const rowH = h / shelfCount - 14;
        let bx = 2;
        let bi = shelf * 3;
        while (bx < shelfW - 4) {
            const bw = 10 + (bi % 4) * 4;
            g.fillStyle(bcolL[bi % bcolL.length]);
            g.fillRect(bx, sy, bw - 1, rowH);
            bx += bw;
            bi++;
        }
    }

    // ---- ÉTAGÈRE DROITE ----
    const shelfRx = w * 0.72;
    g.fillStyle(0x3a2008);
    g.fillRect(shelfRx, 0, w - shelfRx, h);
    g.fillStyle(0x6a4828);
    for (let i = 0; i <= shelfCount; i++) {
        g.fillRect(shelfRx, i * h / shelfCount, w - shelfRx, 5);
    }
    const bcolR = [0x882222, 0x115577, 0x226622, 0x887722, 0x662277, 0x884422, 0x226677];
    for (let shelf = 0; shelf < shelfCount; shelf++) {
        const sy = shelf * h / shelfCount + 6;
        const rowH = h / shelfCount - 14;
        let bx = shelfRx + 2;
        let bi = shelf * 4 + 2;
        while (bx < w - 4) {
            const bw = 10 + (bi % 4) * 4;
            g.fillStyle(bcolR[bi % bcolR.length]);
            g.fillRect(bx, sy, bw - 1, rowH);
            bx += bw;
            bi++;
        }
    }

    // Lignes de perspective sur les murs
    g.lineStyle(1, 0x7a5830, 0.4);
    g.lineBetween(shelfW, 0, vpX, vpY);
    g.lineBetween(shelfW, h, vpX, vpY);
    g.lineBetween(shelfRx, 0, vpX, vpY);
    g.lineBetween(shelfRx, h, vpX, vpY);

    // ---- TORCHES ----
    for (let i = 0; i < 2; i++) {
        const tx = i === 0 ? shelfW + 16 : shelfRx - 16;
        const ty = h * 0.3;
        const flame = Math.sin(t * 0.22 + i * 2) * 3;
        g.fillStyle(0x7a5530);
        g.fillRect(tx - 4, ty, 8, 14);
        g.fillStyle(0xff5500, 0.85);
        g.fillCircle(tx, ty - 4 + flame, 9);
        g.fillStyle(0xffaa00);
        g.fillCircle(tx, ty - 2 + flame, 5);
        g.fillStyle(0xffff88);
        g.fillCircle(tx, ty + flame, 2);
        // Halo de lumière
        g.fillStyle(0xffaa44, 0.09);
        g.fillCircle(tx, ty, 60);
    }

    // ---- LIVRE QUI BRILLE (phase book_found) ----
    if (glowX >= 0) {
        const ga = 0.4 + Math.sin(t * 0.12) * 0.25;
        g.fillStyle(Colors.gold, ga * 0.35);
        g.fillCircle(glowX, glowY, 34 + Math.sin(t * 0.1) * 6);
        g.fillStyle(Colors.gold, ga * 0.65);
        g.fillCircle(glowX, glowY, 17);
        // Corps du livre
        g.fillStyle(0x5a2a1a);
        g.fillRect(glowX - 11, glowY - 19, 22, 32);
        g.fillStyle(0x3a1a0a);
        g.fillRect(glowX - 11, glowY - 19, 4, 32);
        // Dorures
        g.fillStyle(Colors.gold, 0.85);
        g.fillRect(glowX - 6, glowY - 13, 14, 2);
        g.fillRect(glowX - 6, glowY - 6, 14, 2);
        g.fillRect(glowX - 6, glowY + 1, 9, 2);
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
