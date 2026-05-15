import { updateLayout } from "./my_functions.js";
import { changePianoColor } from "./color_functions.js";
import { state } from "./session_state.js";
import { ui } from "./ui.js";

/* oct==1 => first must be in {1, 2, 3, 4, 5}
 * oct==2 => first must be in {1, 2, 3, 4}
 * oct==3 => first must be in {1, 2, 3}
 * ...
 * oct==x => 6-x
 */

function applyOctavesChangerEvents(piano) {
    const container=ui.numberInputs.octaves.parentElement;
    const addBtn=container.querySelector(".add-btn");
    const subBtn=container.querySelector(".sub-btn");
    
    let value=null;
    
    ui.numberInputs.octaves.addEventListener("pointermove", (e) => {
        value=parseInt(ui.numberInputs.octaves.value);
        ui.numberInputs.firstOctave.max=6-value;
        state.octaves=value;
        updateLayout(piano);
    });
    
    subBtn.addEventListener("click", (e) => {
        value=parseInt(ui.numberInputs.octaves.value)
        ui.numberInputs.firstOctave.max+=value-1;
        state.octaves=value;
        updateLayout(piano);
        changePianoColor(piano, state.pianoColor);
    });
    
    addBtn.addEventListener("click", (e) => {
        value=parseInt(ui.numberInputs.octaves.value)
        ui.numberInputs.firstOctave.max-=value-1;
        state.octaves=value;
        updateLayout(piano);
        changePianoColor(piano, state.pianoColor);
    });
}

function applyFirstOctaveEvents(piano) {
    const container=ui.numberInputs.octaves.parentElement;
    const addBtn=container.querySelector(".add-btn");
    const subBtn=container.querySelector(".sub-btn");
    
    let value=null;
    
    ui.numberInputs.firstOctave.addEventListener("pointermove", (e) => {
        value=parseInt(ui.numberInputs.octaves.value);
        state.octaves=value;
        updateLayout(piano);
    });
    
    subBtn.addEventListener("click", (e) => {
        value=parseInt(ui.numberInputs.octaves.value)
        state.octaves=value;
        updateLayout(piano);
        changePianoColor(piano, state.pianoColor);
    });
    
    addBtn.addEventListener("click", (e) => {
        value=parseInt(ui.numberInputs.octaves.value)
        ui.numberInputs.firstOctave.max-=value-1;
        state.octaves=value;
        updateLayout(piano);
        changePianoColor(piano, state.pianoColor);
    });
}

export function loadNumberInputs(piano) {
    const numberInputs=document.querySelectorAll("input[type='number']");
    
    numberInputs.forEach(input => {
        const container=document.createElement("div");
        const addBtn=document.createElement("button");
        const subBtn=document.createElement("button");
        
        container.classList.add("number-input-container");
        addBtn.classList.add("add-btn");
        subBtn.classList.add("sub-btn");
        
        addBtn.textContent="+";
        subBtn.textContent="-";
        
        input.setAttribute("readonly", "");
        
        input.replaceWith(container);
        container.appendChild(subBtn);
        container.appendChild(input);
        container.appendChild(addBtn);
        
        input.dataset.lastX=null;
        
        input.addEventListener("pointerdown", (e) => {
            input.classList.add("dragging");
            input.dataset.lastX=e.clientX;
            input.setPointerCapture(e.pointerId);
        });
        
        input.addEventListener("pointerup", (e) => {
            input.classList.remove("dragging");
            input.dataset.lastX=e.null;
            
            input.releasePointerCapture(e.pointerId);
        });
        
        input.addEventListener("pointermove", (e) => {
            if (!input.classList.contains("dragging")) return;
            
            const delta=e.clientX-input.dataset.lastX;
            let value=parseInt(input.value);
            const max=parseInt(input.max);
            
            if ((delta>5)&&(value<max)) {
                value++
                input.dataset.lastX=e.clientX;
                input.value=value;
            } else if ((delta<-5)&&(value>1)) {
                value--;
                input.dataset.lastX=e.clientX;
                input.value=value;
            }
        });
        
        addBtn.addEventListener("click", () => {
            const currValue=parseInt(input.value);
            if (currValue<input.max) {
                input.value=String(currValue+1);
            }
        });
        
        subBtn.addEventListener("click", () => {
            const currValue=parseInt(input.value);
            if (currValue>input.min) {
                input.value=String(currValue-1);
            }
        });
    });
    
    applyOctavesChangerEvents(piano);
}