import { frequencies } from "../js/frequencies.js";

const audioContext=
    new AudioContext();

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
        active.oscillator.stop(now+release);
        
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
    
        const gain=
            audioContext.createGain();
    
    
        //TIMBRE
        oscillator.type="triangle";
        oscillator.frequency.value=
            frequency;
        
        //ADSR
        const now=
            audioContext.currentTime;
        
        const attack=0.03;
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
    
    
        oscillator.connect(gain);
    
        gain.connect(
            audioContext.destination
        );
    
    
        oscillator.start();
    
    
        this.activeOscillators[noteName]={
            oscillator,
            gain
        };
    }
    
    
    playDuring(noteName, timeInMiliSec) {
        let currMiliSec=0;
        this.playNote(noteName);
        const interval=setInterval(() => {
            if (timeInMiliSec===currMiliSec) {
                clearInterval(interval);
                this.stopNote(noteName);
            }
            else currMiliSec++;
        }, 1);
    }
}