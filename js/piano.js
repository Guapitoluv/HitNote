import {
    Note
} from "../js/note.js";

import {
    EventEmitter
} from "./event_emitter.js";


export class Piano extends EventEmitter {
    constructor(octaves=1, soundMaker) {
        super();
        this.piano=null;
        this.octavesQuantity=octaves;
        this.octaves=[];
        this.notes={};
        this.naturalNotes={};
        this.sharpNotes={};
        this.hightlightedNotes=[]
        this.soundMaker=soundMaker;
        this.globalWhiteIndex=0;
        
        this.notesNames = [
            "C", "C#", "D",
            "D#", "E", "F",
            "F#", "G", "G#",
            "A", "A#", "B"
        ];
        
        this.buildNotes();
    }
    
    
    setNotesColors(noteColors, type="all") {
        const types=new Map([
            ["all", this.notes],
            ["sharp", this.sharpNotes],
            ["natural", this.naturalNotes]
        ]);
        const notes=types.get(type);
        Object.entries(noteColors).forEach(([name, color]) => {
            notes[name].setColor(color);
        });
    }
    
    
    highlightNotes(notesNames) {
        Object.entries(this.notes).forEach(([noteName, note]) => {
            note.setHighlight(notesNames.includes(noteName));
        });
        this.hightlightedNotes=
            this.hightlightedNotes.filter(n => notesNames.includes(n))
    }


    buildNotes() {
        // Role: Build the semantic notes (class)
        this.notes={};
        this.sharpNotes={};
        this.naturalNotes={};
        
        for (let octave=1;octave<=this.octavesQuantity;octave++) {
            this.notesNames.forEach(noteName => {
                if (this.octavesQuantity!==1)
                    noteName=`${noteName}${octave}`;
                
                let note;
                
                if (noteName.includes("#")) {
                    note=new Note(noteName, "black");
                    this.sharpNotes[noteName]=note;
                } else {
                    note=new Note(noteName, "white");
                    this.naturalNotes[noteName]=note;
                }
                this.notes[noteName]=note
            });
        }
    }


    rescaleTo(octaves, reference=null) {
        if (this.octavesQuantity!==octaves)
            this.octavesQuantity=octaves;
        
        this.render(reference);
    }


    render(reference=null) {
        if (this.piano) this.piano.remove();
        
        this.piano=document.createElement("ul");
        this.piano.classList.add("piano");
        this.octaves=[]
        this.globalWhiteIndex=0;
        
        this.buildNotes();
        this.createOctaves();
        this.setEvents();

        if (reference===null) document.body.append(this.piano);
        else reference.append(this.piano);
    }


    createNotes(octaveElement, octaveIndex) {
        // Role: Build the DOM elements related to notes
        this.globalWhiteIndex=0;
        Object.values(this.notes).forEach(note => {
            if ((note.name.includes(String(octaveIndex)))||(this.octavesQuantity===1)) {
                if (note.name.includes("#")) {
                    const spacement=
                        `${(this.globalWhiteIndex*50)-20}px`;
                    note.render(spacement);
                } else {
                    note.render();
                    this.globalWhiteIndex++;
                }
                
                note.appendToParent(octaveElement);
            }
        });
    }
    
    createOctaves() {
        for (let i=0;i<this.octavesQuantity;i++) {
            const octaveContainer=document.createElement("li");
            const octave=document.createElement("ul");
            octaveContainer.classList.add("octaves-container");
            octave.classList.add("octave");
            this.createNotes(octave, i+1);
            octaveContainer.append(octave);
            this.octaves.push(octave);
            this.piano.append(octaveContainer);
        }
    }
    
    
    stopNote(noteName) {
        this.soundMaker.stopNote(noteName);
    }
    
    playDuring(noteName, duration) {
        this.soundMaker.playDuring(noteName, duration);
    }
    
    
    playNote(noteName) {
        this.soundMaker.playNote(noteName);
    }
    
    
    setEvents() {
        const activePointers={};
        
        const activateNote=(note) => {
            if (!note) return;
            
            note.classList.add("active");
            const noteName=note.dataset.name;
            
            if (!noteName)
                throw new Error("Invalid noteName");
            
            this.playNote(noteName);
            this.emit("noteon", note);
        };
        
        const deactivatePointer=(pointerId) => {
            const note=
                activePointers[pointerId];
            
            if (!note) return;
            
            note.classList.remove("active");
            
            const noteName=note.dataset.name;
            if (!noteName)
                throw new Error("Invalid noteName");
            
            this.stopNote(noteName);
            this.emit("noteoff", note);
            
            delete activePointers[pointerId];
        };
        
        this.piano.addEventListener("pointerdown", (e) => {
            //if (e.target.hasPointerCapture?.(e.pointerId))
                //e.target.releasePointerCapture(e.pointerId);
            
            const note=
                e.target.closest(".note");
            
            if (!note) return;
            
            activePointers[e.pointerId]=note;
            activateNote(note);
        });
        
        this.piano.addEventListener("pointermove", (e) => {
            const previousNote=
                activePointers[e.pointerId];
            
            if (!previousNote) return;
            
            const element=
                e.target.ownerDocument.elementFromPoint(
                    e.clientX,
                    e.clientY
                );
            
            const note=
                element?.closest(".note");
            
            if (!note) {
                deactivatePointer(e.pointerId);
                return;
            }
            
            if (note===previousNote) return;
            
            previousNote.classList.remove("active");
            
            const previousName=previousNote.dataset.name;
            this.stopNote(previousName);
            this.emit("noteoff", previousNote);
            
            activePointers[e.pointerId]=note;
            activateNote(note);
        });
        
        
        window.addEventListener("pointerup", (e) => {
            deactivatePointer(e.pointerId);
        });
        
        window.addEventListener("pointercancel", (e) => {
            deactivatePointer(e.pointerId);
        });
    }
    
    
    deactivateAllNotes() {
        Object.values(this.notes).forEach(note => {
            if (note) note.deactivate();
        });
    }
}