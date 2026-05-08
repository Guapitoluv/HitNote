import { Piano } from "../js/piano.js";
import { SoundMaker } from "../js/sound_maker.js";
import {
    randNote,
    makeChord,
    updateLayout
} from "../js/my_functions.js"


function abbreviateScale(scaleName) {
    const scalesAbbreviations=new Map([
        ["chromatic", "chr"],
        ["major", "M"]
    ]);
    const scaleAbbr=scalesAbbreviations.get(scaleName.toLowerCase());
    if (scaleAbbr===undefined)
        throw new Error(`Invalid scale name: ${scaleName}`);
    return scaleAbbr;
}


function setScale(scaleName) {
    const scaleAbbr=abbreviateScale(scaleName);
    sessionStorage.setItem("scale", scaleAbbr);
    return scaleAbbr;
}


function setTonicNote(tonicNoteName) {
    sessionStorage.setItem("tonic_note", tonicNoteName);
    return tonicNoteName;
}


function getScaleNotes(piano, scaleName, tonicNote) {
    const majorScale=[0, 2, 4, 5, 7, 9, 11]
    const notes=Object.keys(piano.notes);
    const tonicNoteIndex=notes.indexOf(tonicNote);
    let scale=[...notes.slice(tonicNoteIndex),
                 ...notes.slice(0, tonicNoteIndex)];
    let i=0;
    
    switch (scaleName) {
        case "M": return scale.filter(note => majorScale.includes(i++));
    }
}

class Session {
    constructor() {}
    
    randNote(piano) {
        const tonicNote=sessionStorage.getItem("tonic_note");
        const scale=sessionStorage.getItem("scale");
        const chosenNote=randNote(piano, tonicNote, scale);
        piano.playDuring(chosenNote, 75);
        sessionStorage.setItem("chosen_note", chosenNote)
        return chosenNote;
    }
}


const scaleSelect=
    document.querySelector(".scale");
let scale=setScale(scaleSelect.value);

const tonicNoteSelect=
    document.querySelector(".tonic-note");
let tonicNote=setTonicNote(tonicNoteSelect.value);

const session=
    new Session();
const soundMaker=
    new SoundMaker();
const piano=
    new Piano(1, soundMaker);

let rNote=
    session.randNote(piano);

scaleSelect.addEventListener("change", (event) => {
    const scale=getScaleNotes(piano,
                              setScale(event.target.value),
                              sessionStorage.getItem("tonic_note"));
    piano.highlightNotes(scale);
    session.randNote(piano);
});

tonicNoteSelect.addEventListener("change", (event) => {
    const scale=getScaleNotes(piano,
                              sessionStorage.getItem("scale"),
                              setTonicNote(event.target.value));
    piano.highlightNotes(scale);
    session.randNote(piano);
});

/* let chord=makeChord(piano);
 * console.log(chord);
 * chord.forEach(n => soundMaker.playDuring(n, 75));
 */

const playedNote=
    document.querySelector(".played-note");
const restart=
    document.querySelector(".restart");
const repeat=
    document.querySelector(".repeat");
const results=
    document.querySelector(".results");
const newNote=
    document.querySelector(".new-note");
const score=
    document.querySelector(".score");
const rounds=
    document.querySelector(".rounds");
const percentage=
    document.querySelector(".percentage");
const freeMode=
    document.querySelector(".free-mode");
const deactivateNotes=
    document.querySelector(".deactivate-notes");
const chordMode=
    document.querySelector(".chord-mode");

let currMode="game";

freeMode.addEventListener("click", () => {
    if (currMode!=="free") {
        freeMode.textContent="Deactive Free Mode"
        currMode="free";
        
        document.querySelectorAll(".game-mode").forEach(e => {
            e.style.display="none";
        });
    } else {
        freeMode.textContent="Active Free Mode"
        currMode="game";
        document.querySelectorAll(".game-mode").forEach(e => {
            e.style.display="block";
        });
    }
});

restart.addEventListener("click", () => {
    playedNote.textContent="None";
    rounds.textContent="1";
    score.textContent="0";
    percentage.textContent="0.00";
    results.textContent="";
    results.style.backgroundColor="transparent";
    session.randNote(piano);
});

repeat.addEventListener("click", () => {
    soundMaker.playDuring(sessionStorage.getItem("chosen_note"), 75);
})

newNote.addEventListener("click", () => {
    session.randNote(piano);
})

deactivateNotes.addEventListener("click", () => {
    piano.deactivateAllNotes();
    Object.keys(piano.notes).forEach(note => {
        piano.stopNote(note);
    });
})

piano.addActiveNoteEvent(note => {
    const noteName=note.querySelector(".symbol").textContent;
    
    if (playedNote.textContent.includes("None"))
        playedNote.textContent=noteName;
    else playedNote.textContent+=" "+noteName;
    
    if (currMode!=="free") {
        const intRounds=parseInt(rounds.textContent)+1;
        rounds.textContent=`${intRounds}`;
        
        let intScore=parseInt(score.textContent)
        
        const rNote=sessionStorage.getItem("chosen_note");
        
        if (rNote===noteName) {
            results.textContent="Correct";
            results.style.backgroundColor="green";
            score.textContent=`${++intScore}`;
        } else {
            results.textContent="Incorrect "+rNote;
            results.style.backgroundColor="red";
        }
        
        percentage.textContent=`${(intScore*100/intRounds).toFixed(2)}`;
        
        setTimeout(() => {
            session.randNote(piano);
        }, 1000);
    }
});

piano.addDeactiveNoteEvent(note => {
    const noteName=note.querySelector(".symbol").textContent
    const notes=playedNote.textContent.split(" ").filter(n => n!==noteName);
    
    if (notes.length>0) playedNote.textContent=notes.join(" ");
    else playedNote.textContent="None";
})

updateLayout(piano);
window.addEventListener(
    "resize",
    () => updateLayout(piano)
);