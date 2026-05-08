export class Piano {
    constructor(octaves=1, soundMaker) {
        this.piano=null;
        this.octaves=octaves;
        this.notes={};
        this.activeNoteEvents=[];
        this.deactiveNoteEvents=[];
        this.hightlightedNotes=[]
        this.soundMaker=soundMaker;
        
        this.notesNames = [
            "C", "C#", "D",
            "D#", "E", "F",
            "F#", "G", "G#",
            "A", "A#", "B"
        ];
        
        this.buildNotes();
    }
    
    
    highlightNotes(notesNames) {
        console.log(notesNames);
        Object.entries(this.notes).forEach(([noteName, note]) => {
            console.log(noteName);
            this.notes[noteName].querySelector(".symbol").style
                .textDecoration=(notesNames.includes(noteName))
                    ?"underline"
                    :"none";
        });
        this.hightlightedNotes=
            this.hightlightedNotes.filter(n => notesNames.includes(n))
    }


    buildNotes() {
        this.notes={};
        
        for (let octave=1;octave<=this.octaves;octave++) {
            this.notesNames.forEach(noteName => {
                
                const fullName=
                    (this.octaves===1)
                        ? noteName
                        : `${noteName}${octave}`;
                
                this.notes[fullName]=null;
            });
        }
    }


    rescaleTo(octaves, reference=null) {
        if (this.octaves!==octaves) {
            this.octaves=octaves;
            this.buildNotes();
        }
        
        this.render(reference);
    }


    render(reference=null) {
        if (this.piano) this.piano.remove();
        
        this.piano=document.createElement("ul");
        
        this.piano.classList.add("piano");
        
        this.createNotes();
        this.setEvents();

        if (reference===null) document.body.append(this.piano);
        else reference.append(this.piano);
    }


    createNotes() {
        let whiteIndex=0;

        Object.keys(this.notes).forEach(noteName => {
            
            const note=
                document.createElement("li");
            
            const symbol=
                document.createElement("span");
            
            note.classList.add("note", noteName);
            
            symbol.classList.add("symbol");
            
            symbol.textContent=noteName;
            
            note.append(symbol);
            
            const isSharp=
                noteName.includes("#");
            
            
            if (isSharp) {
                
                note.classList.add("sharp");
                
                note.style.left=
                    `${(whiteIndex*50)-20}px`;
                    
            } else {
                
                note.classList.add("natural");
                
                whiteIndex++;
            }

            this.piano.append(note);
            
            this.notes[noteName]=note;
        });
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
            
            const noteName=
                note.querySelector(".symbol")
                    .textContent;
            
            
            this.playNote(noteName);
            
            
            this.activeNoteEvents.forEach(event => {
                event(note);
            });
        };
        
        
        this.piano.addEventListener("pointerdown", (e) => {
            
            if (
                e.target.hasPointerCapture?.(
                    e.pointerId
                )
            ) {
                
                e.target.releasePointerCapture(
                    e.pointerId
                );
            }
            
            
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
                document.elementFromPoint(
                    e.clientX,
                    e.clientY
                );
            
            if (!element) return;
            
            
            const note=
                element.closest(".note");
            
            if (!note) return;
            
            if (note===previousNote) return;
            
            this.deactiveNoteEvents.forEach(event => event(previousNote));
            previousNote.classList.remove("active");
            
            
            const previousName=
                previousNote.querySelector(".symbol")
                    .textContent;
            
            
            this.stopNote(previousName);
            
            
            activePointers[e.pointerId]=note;
            
            activateNote(note);
        });
        
        
        window.addEventListener("pointerup", (e) => {
            const note=
                activePointers[e.pointerId];
            
            if (!note) return;
            
            note.classList.remove("active");
            
            const noteName=
                note.querySelector(".symbol").textContent;
            
            this.deactiveNoteEvents.forEach(event => event(note));
            
            this.stopNote(noteName);
            delete activePointers[e.pointerId];
        });
    }
    
    
    deactivateAllNotes() {
        Object.values(this.notes).forEach(note => {
            if (note) note.classList.remove("active");
        });
    }
    
    
    addActiveNoteEvent(event) {
        this.activeNoteEvents.push(event);
    }
    
    addDeactiveNoteEvent(event) {
        this.deactiveNoteEvents.push(event);
    }
}