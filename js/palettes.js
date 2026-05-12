import { rainbowSpectrum } from "./color_functions.js";


class NotesPalette {
    applyTo(piano) {
        throw new Error("Method 'applyTo' must be implemented.");
    }
}


export class MonochromePalette extends NotesPalette {
    applyTo(piano) {
        const naturalNotes=Object.keys(piano.naturalNotes);
        const sharpNotes=Object.keys(piano.sharpNotes);
        
        const naturalColors={};
        const sharpColors={};
        
        naturalNotes.forEach(note => naturalColors[note]="white");
        sharpNotes.forEach(note => sharpColors[note]="black");
        
        piano.setNotesColors({...naturalColors, ...sharpColors});
    }
}


export class RainbowPalette extends NotesPalette {
    applyTo(piano) {
        const notes=Object.keys(piano.naturalNotes);
        const colors={},spc=rainbowSpectrum(notes.length);
        let i=0;
        
        notes.forEach(name => colors[name]=spc[i++])
        piano.setNotesColors(colors);
    }
}