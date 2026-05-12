export function updateLayout(piano, octaves=1) {
    piano.rescaleTo(octaves, document.getElementsByTagName("main")[0]);
}


export function makeChord(piano, type="major") {
    const chord=[randNote(piano)];
    const notesNames=Object.keys(piano.notes);
    const notesQuantity=notesNames.length;
    const i=notesNames.indexOf(chord[0]);
    
    let arrangedNotesNames=[...notesNames.slice(i), ...notesNames.slice(0, i)];
    chord.push(arrangedNotesNames[4]);
    
    arrangedNotesNames=[...arrangedNotesNames.slice(4), ...arrangedNotesNames.slice(0, 4)];
    chord.push(arrangedNotesNames[3]);
    
    return chord;
}


export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export function randNote(piano, tonicNote="C", scale="chr") {
    let notesNames=Object.keys(piano.notes);
    let tonicIndex=notesNames.indexOf(tonicNote);
    if (tonicIndex===-1) tonicIndex=notesNames.indexOf(tonicNote+1);
    console.log(tonicIndex);
    const newNotesNames=[];
    notesNames=[...notesNames.slice(tonicIndex),
                ...notesNames.slice(0, tonicIndex)]
    
    switch (scale) {
        case "M":
            const majorNotes=[0, 2, 4, 5, 7, 9, 11, 12];
            for (let i=0;i<notesNames.length;i++) {
                if (majorNotes.includes(i)) newNotesNames.push(notesNames[i]);
            }
            notesNames=newNotesNames.slice();
            break;
    }
    
    console.log(`notesNames: ${notesNames}`);
    return notesNames[getRandomInt(0, notesNames.length-1)];
}