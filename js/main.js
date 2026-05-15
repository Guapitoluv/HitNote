import { state } from "./session_state.js";
import { Piano } from "./piano.js";
import { SoundMaker } from "./sound_maker.js";
import { changeTheme } from "./appearance.js";
import { ui, initializeUI } from "./ui.js";
import { changePianoColor } from "./color_functions.js";
import { loadNumberInputs } from "./load_number_inputs.js";
import {
    randNote,
    makeChord,
    updateLayout
} from "./my_functions.js";
import {
    Session,
    setScale,
    setTonicNote,
    setPianoColor,
    getScaleNotes,
    setTheme
} from "./session_aux.js";

// the gray color don't active when note is on when you change piano color
// resolve tge !important in css after

const soundMaker=
    new SoundMaker();

let warningTimeout=null;

function playErrorSound() {
    soundMaker.playNotes(["C", "F#"], 75);
}

function activeWarningBox(text, color) {
    clearTimeout(warningTimeout);
    playErrorSound();
    
    ui.displays.results.textContent=text;
    ui.displays.results.style.backgroundColor=color;
    ui.displays.results.style.display="flex";
    
    warningTimeout=setTimeout(() => {
        ui.displays.results.animate([
            { opacity: 1},
            { opacity: 0}
        ], {
            duration: 1000,
        });
            
        setTimeout(() => {
            ui.displays.results.textContent="";
            ui.displays.results.style.backgroundColor="transparent";
        }, 1000);
    }, 5000);
}


function setDefaultFreeMode() {
    ui.buttons.freeMode.textContent="Deactive Free Mode";
    state.mode="free";
    
    document.querySelectorAll(".game-mode").forEach(e => {
        e.style.display="none";
    });
}


initializeUI();

setScale();
setTonicNote();
setPianoColor();
setTheme();

//Classes
const piano=
    new Piano(1, soundMaker);
const session=
    new Session(piano);

session.randNote();

function generateRound() {
    if (state.mode==="chord")
        session.randChord();
    else session.randNote();
}

ui.selections.scale.addEventListener("change", (event) => {
    const oldValue=event.target.dataset.prev;
    const newValue=event.target.value;
    
    if (state.mode!=="game") {
        activeWarningBox("You can't change the scale to chromatic while chord mode is active", "red");
        event.target.value=oldValue||newValue;
        return;
    }
    setScale();
    const scale=getScaleNotes(piano,
                              state.scale,
                              state.tonicNote);
    piano.highlightNotes(scale);
    generateRound();
});

ui.selections.tonicNote.addEventListener("change", (event) => {
    setTonicNote();
    const scale=getScaleNotes(piano,
                              state.scale,
                              state.tonicNote);
    
    if (state.scale==="chr") {
        const noteSpectrum=[];
        for (let i=0;i<((Object.keys(piano.notes).length)/12);i++)
            noteSpectrum.push(state.tonicNote+(i+1));
        piano.highlightNotes(noteSpectrum);
    } else piano.highlightNotes(scale);
    generateRound();
});


ui.selections.pianoColors.addEventListener("change", (event) => {
    setPianoColor();
    changePianoColor(piano, state.pianoColor);
});

ui.selections.theme.addEventListener("change", (event) => {
    setTheme();
    changeTheme(state.theme);
});

ui.buttons.freeMode.addEventListener("click", () => {
    if (state.mode!=="free") setDefaultFreeMode();
    else {
        ui.buttons.freeMode.textContent="Active Free Mode";
        state.mode="game";
        document.querySelectorAll(".game-mode").forEach(e => {
            e.style.display="block";
        });
    }
});

ui.buttons.restart.addEventListener("click", () => {
    ui.displays.playedNote.textContent="None";
    ui.displays.rounds.textContent="1";
    ui.displays.score.textContent="0";
    ui.displays.percentage.textContent="0.00";
    ui.displays.results.textContent="";
    ui.displays.results.style.backgroundColor="transparent";
    generateRound();
});

ui.buttons.repeat.addEventListener("click", () => {
    if (state.mode==="chord")
        soundMaker.playDuring(state.chosenChord, 75);
    else soundMaker.playDuring(state.chosenNote, 75);
})

ui.buttons.newNote.addEventListener("click", () => generateRound());

ui.buttons.deactivateNotes.addEventListener("click", () => {
    piano.deactivateAllNotes();
    Object.keys(piano.notes).forEach(note => piano.stopNote(note));
})

ui.buttons.chordMode.addEventListener("click", () => {
    if (!["chromatic", "chr"].includes(state.scale)) {
        if (state.mode!=="chord") {
            state.mode="chord";
            session.randChord();
            ui.buttons.chordMode.textContent="Deactive Chord Mode";
        } else {
            ui.buttons.chordMode.textContent="Active Chord Mode";
            state.mode="game";
        }
    } else
        activeWarningBox("You can't enable chord mode in chromatic scale", "red");
});

const activeNotes=new Set();

function noteonEvent(note) {
    const noteName=note.dataset.name;
    if (!noteName)
        throw new Error("Invalid noteName");
    
    const playingNotes=ui.displays.playedNote.textContent;
    const isAllOff=playingNotes.includes("None");
    
    ui.displays.playedNote.textContent=
        (isAllOff)?noteName:playingNotes+" "+noteName;
    
    if (state.mode!=="free") {
        const intRounds=parseInt(ui.displays.rounds.textContent);
        let intScore=parseInt(ui.displays.score.textContent)
        
        if (state.mode==="chord") {
            activeNotes.add(noteName);
            
            if (activeNotes.size===3) {
                ui.displays.rounds.textContent=`${++intRounds}`;
                if ([...activeNotes].every(name => state.chosenChord.includes(name))) {
                    ui.displays.results.textContent="Correct";
                    ui.displays.results.style.backgroundColor="green";
                    ui.displays.score.textContent=`${++intScore}`;
                } else {
                    ui.displays.results.textContent="Incorrect "+state.chosenChord.join(" ");
                    ui.displays.results.style.backgroundColor="red";
                }
                state.chosenChord=[];
            }
        } else {
            ui.displays.rounds.textContent=`${++intRounds}`;
            
            if (state.chosenNote===noteName) {
                ui.displays.results.textContent="Correct";
                ui.displays.results.style.backgroundColor="green";
                ui.displays.score.textContent=`${++intScore}`;
            } else {
                ui.displays.results.textContent="Incorrect "+state.chosenNote;
                ui.displays.results.style.backgroundColor="red";
            }
        }
        
        ui.displays.percentage.textContent=
            `${(intScore*100/intRounds).toFixed(2)}`;
        setTimeout(generateRound, 1000);
    }
}

piano.on("noteon", noteonEvent);


function noteoffEvent(note) {
    const noteName=note.dataset.name;
    if (!noteName)
        throw new Error("Invalid noteName");
    
    const notes=ui.displays.playedNote.textContent.split(" ").filter(n => n!==noteName);
    activeNotes.delete(noteName);
    
    ui.displays.playedNote.textContent=
        (notes.length>0)?notes.join(" "):"None";
} 

piano.on("noteoff", noteoffEvent);

updateLayout(piano, 2);
loadNumberInputs(piano);