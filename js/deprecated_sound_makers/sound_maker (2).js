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
        const release=0.6;
        
        active.gain.gain.cancelScheduledValues(now);
        active.gain.gain.setValueAtTime(active.gain.gain.value, now);
        active.gain.gain.exponentialRampToValueAtTime(0.0001, (now+release));
        let ended=0;
        
        active.oscillators.forEach(osc => {
            osc.stop(now+release);
        
            osc.onended=() => {
                osc.disconnect();
                ended++;
                if (ended===active.oscillators.length)
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
        
        oscillator2.type="sawtooth";
        oscillator2.frequency.value=
            frequency*2;
        
        oscillator2.detune.value=-3;
        
        const gain=
            audioContext.createGain();
        
        const filter=
            audioContext.createBiquadFilter();
        
        const now=
            audioContext.currentTime;
        
        filter.type="lowpass";
        filter.frequency.setValueAtTime(
            7000,
            now
        );
        
        filter.frequency.exponentialRampToValueAtTime(
            1200,
            now+0.15
        );
        filter.Q.value=1;
        
        //TIMBRE
        oscillator.type="sawtooth";
        oscillator.frequency.value=
            frequency;
        
        //ADSR
        
        const attack=0.005;
        const decay=0.07;
        const sustain=0.03;
        
        //começa mudo
        gain.gain.setValueAtTime(0.0001, now);
    
    
        /*
        ATTACK
        sobe até volume máximo
        */
    
        gain.gain.exponentialRampToValueAtTime(
            0.45,
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
        
        const oscillator3=
            audioContext.createOscillator();
        
        oscillator3.type="triangle";
        oscillator3.detune.value=4;
        
        oscillator3.frequency.value=
            frequency*3;
        
        const harmonicGain2=
            audioContext.createGain();
        
        oscillator3.connect(harmonicGain2);
        harmonicGain2.connect(gain);
        
        harmonicGain2.gain.value=0.015;
        
        harmonicGain2.connect(gain);
        gain.connect(filter);
        
        filter.connect(
            audioContext.destination
        );
        
        oscillator.start();
        oscillator2.start();
        oscillator3.start();
    
        let ended=0;

        this.activeOscillators[noteName]={
            oscillators: [
                oscillator,
                oscillator2,
                oscillator3
            ],
            gain
        };
    }
    
    
    playDuring(noteName, timeInMiliSec) {
        this.playNote(noteName);
        setTimeout(() => {
            this.stopNote(noteName);
        }, timeInMiliSec);
    }
}