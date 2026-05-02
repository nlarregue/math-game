// État du clavier virtuel — partagé entre React (VirtualControls) et les scènes Phaser.
// Les flags one-shot (space, enter, escape, h, digit, spell) sont mis à true par React
// et remis à null/false par la scène dès qu'elle les lit.
export const virtualInput = {
    // Continu (maintenu pendant que le bouton est pressé)
    left:   false,
    right:  false,
    up:     false,
    down:   false,

    // One-shot (consommé à la première lecture par la scène)
    space:  false,
    enter:  false,
    escape: false,
    h:      false,
    digit:  null,   // '0'–'9' ou null
    spell:  null,   // 'feu' | 'glace' | 'foudre' | null
    backspace: false,
};
