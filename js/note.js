export class Note {
    constructor(name, color) {
        this.note=null;
        this.name=name;
        this.color=color;
    }
    
    
    render(spacement=0) {
        this.note=document.createElement("li");
        const symbol=document.createElement("span");
        
        this.note.dataset.name=this.name;
        this.note.classList.add("note");
        symbol.classList.add("symbol");
        symbol.textContent=this.name;
        
        this.note.append(symbol);
        
        const isSharp=
            this.name.includes("#");
        
        if (isSharp) {
            this.note.classList.add("sharp");
            this.note.style.left=
                spacement;
        } else {
            this.note.classList.add("natural");
        }
    }
    
    
    appendToParent(parent) {
        parent.append(this.note);
    }
    
    
    setColor(color) {
        console.log("here");
        this.note.style.backgroundColor=color;
    }
    
    
    setHighlight(value) {
        this.note.querySelector(".symbol").style
                .textDecoration=(value)?"underline":"none";
    }
    
    
    deactivate() {
        this.note.classList.remove("active");
    }
    
    
    activate() {
        this.note.classList.add("active");
    }
}