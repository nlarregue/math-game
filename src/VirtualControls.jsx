import { useEffect, useState } from 'react';
import { EventBus } from './game/EventBus';
import { virtualInput } from './game/utils/VirtualInput';

// Détection tactile — on affiche les contrôles virtuels uniquement sur écrans touch
const isTouchDevice = () =>
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// ─── Helpers d'événements ─────────────────────────────────────────────────────

// Bouton directionnel — maintenu tant que pressé
function dpad(dir) {
    return {
        onPointerDown: (e) => { e.preventDefault(); virtualInput[dir] = true; },
        onPointerUp:   (e) => { e.preventDefault(); virtualInput[dir] = false; },
        onPointerLeave:(e) => { virtualInput[dir] = false; },
        onPointerCancel:(e)=> { virtualInput[dir] = false; },
    };
}

// Bouton one-shot — flag mis à true une seule fois
function oneShot(key, value = true) {
    return {
        onPointerDown: (e) => { e.preventDefault(); virtualInput[key] = value; },
    };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
    overlay: {
        position: 'absolute', inset: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        zIndex: 100,
    },
    btn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'auto',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.18)',
        border: '2px solid rgba(255,255,255,0.4)',
        color: '#fff',
        fontFamily: 'serif',
        fontWeight: 'bold',
        fontSize: 22,
        cursor: 'pointer',
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
    },
    // Bouton principal (Espace / Entrée)
    btnPrimary: {
        background: 'rgba(244,196,48,0.55)',
        border: '2px solid rgba(244,196,48,0.9)',
        fontSize: 18,
        borderRadius: 14,
    },
    btnDanger: {
        background: 'rgba(220,60,60,0.55)',
        border: '2px solid rgba(220,80,80,0.9)',
        fontSize: 16,
    },
    btnSpell: {
        fontSize: 20,
        borderRadius: 12,
    },
};

// ─── Sous-composants ──────────────────────────────────────────────────────────

function Btn({ style, children, ...handlers }) {
    return (
        <div style={{ ...S.btn, ...style }} {...handlers}>
            {children}
        </div>
    );
}

// D-pad 4 directions en croix
function DPad() {
    const sz = 56;
    return (
        <div style={{ display: 'grid', gridTemplateColumns: `${sz}px ${sz}px ${sz}px`, gridTemplateRows: `${sz}px ${sz}px ${sz}px`, gap: 4 }}>
            <div />
            <Btn {...dpad('up')}>▲</Btn>
            <div />
            <Btn {...dpad('left')}>◀</Btn>
            <div style={{ ...S.btn, background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.15)' }} />
            <Btn {...dpad('right')}>▶</Btn>
            <div />
            <Btn {...dpad('down')}>▼</Btn>
            <div />
        </div>
    );
}

// Pavé numérique 0–9 + effacer + entrée
function NumPad() {
    const sz = 58;
    const rows = [[7,8,9],[4,5,6],[1,2,3]];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {rows.map(row => (
                <div key={row[0]} style={{ display: 'flex', gap: 5 }}>
                    {row.map(d => (
                        <Btn key={d} style={{ width: sz, height: sz }} {...oneShot('digit', String(d))}>
                            {d}
                        </Btn>
                    ))}
                </div>
            ))}
            <div style={{ display: 'flex', gap: 5 }}>
                <Btn style={{ width: sz, height: sz, fontSize: 16 }} {...oneShot('backspace')}>⌫</Btn>
                <Btn style={{ width: sz, height: sz }} {...oneShot('digit', '0')}>0</Btn>
                <Btn style={{ width: sz, height: sz, ...S.btnPrimary, fontSize: 22 }} {...oneShot('enter')}>↵</Btn>
            </div>
        </div>
    );
}

// Boutons de sorts
function SpellButtons({ spells }) {
    const defs = [
        { key: 'feu',    label: '🔥 Feu',     color: 'rgba(220,80,30,0.65)' },
        { key: 'glace',  label: '❄️ Glace',   color: 'rgba(40,140,220,0.65)' },
        { key: 'foudre', label: '⚡ Foudre',  color: 'rgba(200,200,40,0.65)' },
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {defs.map((d, i) => spells.includes(d.key) && (
                <Btn
                    key={d.key}
                    style={{ width: 110, height: 46, fontSize: 15, background: d.color, borderRadius: 10, border: '2px solid rgba(255,255,255,0.5)' }}
                    {...oneShot('spell', d.key)}
                >
                    {d.label} <span style={{ fontSize: 11, opacity: 0.8, marginLeft: 4 }}>[{i+1}]</span>
                </Btn>
            ))}
        </div>
    );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function VirtualControls({ spells = ['feu'] }) {
    const [mode, setMode] = useState('hub');
    const [touch] = useState(isTouchDevice);

    useEffect(() => {
        EventBus.on('ui-mode', setMode);
        return () => EventBus.off('ui-mode', setMode);
    }, []);

    if (!touch) return null;

    const inCombat    = mode === 'combat';
    const inIntro     = mode === 'intro';
    const showDpad    = !inCombat && !inIntro;
    const showHButton = mode === 'level';

    return (
        <div style={S.overlay}>

            {/* ── EXPLORATION : D-pad + H ──────────────────────── */}
            {showDpad && (
                <div style={{ position: 'absolute', bottom: 24, left: 20, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                    <DPad />
                    {showHButton && (
                        <Btn style={{ width: 90, height: 44, fontSize: 14, marginTop: 4, ...S.btnDanger }} {...oneShot('h')}>
                            ← Hub
                        </Btn>
                    )}
                </div>
            )}

            {/* ── BOUTON ESPACE (exploration + boss hors combat) ── */}
            {!inCombat && (
                <div style={{ position: 'absolute', bottom: 24, right: 20 }}>
                    <Btn style={{ width: 110, height: 110, fontSize: 16, ...S.btnPrimary, borderRadius: 55 }} {...oneShot('space')}>
                        ACTION
                    </Btn>
                </div>
            )}

            {/* ── COMBAT : sorts + pavé numérique + fuite ────────── */}
            {inCombat && (
                <>
                    {/* Sorts — bas gauche */}
                    <div style={{ position: 'absolute', bottom: 24, left: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <SpellButtons spells={spells} />
                        <Btn style={{ width: 110, height: 44, fontSize: 14, marginTop: 6, ...S.btnDanger }} {...oneShot('escape')}>
                            Fuir ✕
                        </Btn>
                    </div>

                    {/* Pavé numérique — bas droit */}
                    <div style={{ position: 'absolute', bottom: 24, right: 20 }}>
                        <NumPad />
                    </div>
                </>
            )}

            {/* ── INTRO : uniquement bouton avancer ───────────────── */}
            {inIntro && (
                <div style={{ position: 'absolute', bottom: 30, right: 30 }}>
                    <Btn style={{ width: 130, height: 60, fontSize: 16, ...S.btnPrimary, borderRadius: 12 }} {...oneShot('space')}>
                        Suivant ▶
                    </Btn>
                </div>
            )}
        </div>
    );
}
