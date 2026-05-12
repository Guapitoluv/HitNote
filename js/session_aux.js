import { randNote } from "./my_functions.js";
import { state } from "./session_state.js";
import { ui } from "./ui.js";


export function setTheme() {
    state.theme=
        ui.selections.theme.value
        .toLowerCase().replaceAll(" ", "_");
}
export function setScale() {
    state.scale=
        abbreviateScale(ui.selections.scale.value);
}
export function setTonicNote() {
    state.tonicNote=
        ui.selections.tonicNote.value;
}
export function setPianoColor() {
    state.pianoColor=
        ui.selections.pianoColors.value
        .toLowerCase().replaceAll(" ", "_");
}


function abbreviateScale(scaleName) {
    const scalesAbbreviations=new Map([
        ["chromatic", "chr"],
        ["major", "M"]
    ]);
    
    if ([...scalesAbbreviations.values()].includes(scaleName))
        return scaleName;
    
    const scaleAbbr=scalesAbbreviations.get(scaleName.toLowerCase());
    if (scaleAbbr===undefined)
        throw new Error(`Invalid scale name: ${scaleName}`);
    return scaleAbbr;
}


export function getScaleNotes(piano, scaleName, tonicNote) {
    const majorScale=[0, 2, 4, 5, 7, 9, 11]
    const notes=Object.keys(piano.notes);
    let j=0;
    
    let scale=[];
    
    if (!notes.includes(tonicNote)) {
        for (let i=0;i<(notes.length/12);i++) {
            const tonicNoteIndex=notes.indexOf(tonicNote+(i+1));
            let scale1=[...notes.slice(tonicNoteIndex, i*12+12),
                         ...notes.slice(i*12, tonicNoteIndex)];
            j=0;
            switch (scaleName) {
                case "chr": return scale1.slice();
                case "M": scale=[...scale, ...scale1.filter(note => majorScale.includes(j++))];
            }
        }
        return scale;
    }
    
    const tonicNoteIndex=notes.indexOf(tonicNote);
    scale=[...notes.slice(tonicNoteIndex),
           ...notes.slice(0, tonicNoteIndex)];
    
    switch (scaleName) {
        case "M": return scale.filter(note => majorScale.includes(j++));
    }
}

export class Session {
    constructor(piano) {
        this.piano=piano;
    }
    
    randNote() {
        const chosenNote=randNote(this.piano,
                                  state.tonicNote,
                                  state.scale);
        this.piano.playDuring(chosenNote, 75);
        state.chosenNote=chosenNote;
    }
    
    randChord() {
        const note1=randNote(this.piano, state.tonicNote, abbreviateScale(state.scale));
        console.log(state.tonicNote);
        const scale=getScaleNotes(this.piano, abbreviateScale(state.scale), state.tonicNote);
        console.log(scale);
        const note1Index=scale.indexOf(note1);
        const scaleFromNote1=[...scale.slice(note1Index), ...scale.slice(0, note1Index)];
        const chosenChord=[note1, scaleFromNote1[2], scaleFromNote1[4]];
        console.log(chosenChord);
        chosenChord.forEach(note => this.piano.playDuring(note, 75));
        state.chosenChord=chosenChord;
    }
}