const selectors={
    restart: ".restart",
    repeat: ".repeat",
    newNote: ".new-note",
    freeMode: ".free-mode",
    deactivateNotes: ".deactivate-notes",
    chordMode: ".chord-mode",
    playedNote: ".played-note",
    score: ".score",
    results: ".results",
    rounds: ".rounds",
    percentage: ".percentage",
    tonicNote: ".tonic-note",
    scale: ".scale",
    theme: ".theme",
    pianoColors: ".piano-colors"
}

export const ui={};

function required(selector) {
    const element=document.querySelector(selector);
    
    if (!element)
        throw new Error(`Element not found: ${selector}`);
    
    return element;
}

export function initializeUI() {
    ui.buttons={
        restart: required(selectors.restart),
        repeat: required(selectors.repeat),
        newNote: required(selectors.newNote),
        freeMode: required(selectors.freeMode),
        deactivateNotes: required(selectors.deactivateNotes),
        chordMode: required(selectors.chordMode)
    }
    
    ui.displays={
        playedNote: required(selectors.playedNote),
        score: required(selectors.score),
        results: required(selectors.results),
        rounds: required(selectors.rounds),
        percentage: required(selectors.percentage)
    };
    
    ui.selections={
        tonicNote: required(selectors.tonicNote),
        scale: required(selectors.scale),
        theme: required(selectors.theme),
        pianoColors: required(selectors.pianoColors)
    }
}