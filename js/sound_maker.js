import { frequencies } from "../js/frequencies.js";

const audioContext=
    new AudioContext();

const delay=ms => new Promise(res => setTimeout(res, ms));

async function playNotes(sm, notes, duration) {
    for (const note of notes) {
        sm.playDuring(note, duration);
        await delay(duration);
    }
}

export class SoundMaker {
    constructor() {
    this.activeOscillators={};
    }
    
    stopNote(noteName) {  
        const active=  
            this.activeOscillators[noteName];  
      
        if (!active) return;  
          
        const now=  
            audioContext.currentTime;  
          
        //RELEASE  
        const release=0.2;  
          
        active.gain.gain.cancelScheduledValues(now);  
        active.gain.gain.setValueAtTime(active.gain.gain.value, now);  
        active.gain.gain.exponentialRampToValueAtTime(0.0001, (now+release));  
        active.oscillators.forEach(osc => {  
            osc.stop(now+release);  
            osc.onended=() => {  
                osc.disconnect();  
                active.gain.disconnect();  
            };  
        });  
        delete this.activeOscillators[noteName];  
    }  
    
    
    playNote(noteName) {
        const frequency=  
            frequencies[noteName];  
        
        if (  
            (!frequency)  
            ||(this.activeOscillators[noteName])  
        ) return;  
        
        const oscillator=  
            audioContext.createOscillator();  
        
        const oscillator2=
            audioContext.createOscillator();  
        
        oscillator2.type="sine";
        oscillator2.frequency.value=
            frequency*2;
        
        oscillator2.detune.value=-3;
        
        const gain=
            audioContext.createGain();
        
        const filter=
            audioContext.createBiquadFilter();  
        
        filter.type="lowpass";
        filter.frequency.value=2500;
        filter.Q.value=1;
        
        //TIMBRE  
        oscillator.type="triangle";
        oscillator.frequency.value=
            frequency;
        
        //ADSR
        const now=
            audioContext.currentTime;
        
        const attack=0.005;
        const decay=0.12;
        const sustain=0.18;
        
        //começa mudo
        gain.gain.setValueAtTime(0.0001, now);  
        
        /*
        ATTACK
        sobe até volume máximo
        */
        
        gain.gain.exponentialRampToValueAtTime(  
            0.28,
            now+attack
        );
        
        /*
        DECAY
        cai até sustain
        */
        
        gain.gain.exponentialRampToValueAtTime(  
            sustain,
            now+attack+decay
        );
        
        const harmonicGain=
            audioContext.createGain();
        
        harmonicGain.gain.value=0.08;
        
        oscillator.connect(gain);
        oscillator2.connect(harmonicGain);
        harmonicGain.connect(gain)
        oscillator.detune.value=2;
        
        gain.connect(filter);
        
        filter.connect(
            audioContext.destination
        );
        
        oscillator.start();
        oscillator2.start();
        
        this.activeOscillators[noteName]={
            oscillators: [
                oscillator,
                oscillator2
            ],
            gain
        };
    }
    
    
    playDuring(noteName, duration) {  
        if (typeof noteName==="string")
            noteName=[noteName];
        noteName.forEach(note => this.playNote(note));
        setTimeout(() => noteName.forEach(
            note => this.stopNote(note)
        ), duration);  
    }
    
    
    playSequencially(notes, duration=null, type="arr") {
        if (type==="arr") {
            console.log("arr")
            if (duration===null)
                throw new Error("No duration was given");
            
            playNotes(this, notes, duration);
            return;
        }
        
        console.log("obj");
        
        Object.keys(notes).forEach(note => {
            let currDuration=notes[note];
            if (notes[note]===null) {
                if (duration===null)
                    throw new Error(`There's no duration to apply to ${note}`);
                else currDuration=duration;
            }
            this.playDuring(note, currDuration);
        });
    } 
}