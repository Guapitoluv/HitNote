import {
    MonochromePalette,
    RainbowPalette
} from "./palettes.js";


const palettes=new Map([
    ["black_and_white", new MonochromePalette()],
    ["rainbow", new RainbowPalette()]
]);


function colorSpectrum(start, end, frames) {
    const spectrum=[];

    const growth=[
        (end[0]-start[0])/(frames-1),
        (end[1]-start[1])/(frames-1),
        (end[2]-start[2])/(frames-1)
    ];

    for (let i=0;i<frames;i++) {
        const current=[
            Math.round(start[0] + growth[0]*i),
            Math.round(start[1] + growth[1]*i),
            Math.round(start[2] + growth[2]*i)
        ];

        const hex=current
            .map(v => v.toString(16).padStart(2, "0"))
            .join("");

        spectrum.push(`#${hex}`);
    }

    return spectrum;
}


function hsvToRgb(h, s, v) {
    const c=v*s;
    const x=c*(1-Math.abs((h/60)%2-1));
    const m=v-c;

    let r=0, g=0, b=0;

    if (h < 60) {
        r=c; g=x; b=0;
    }
    else if (h < 120) {
        r=x; g=c; b=0;
    }
    else if (h < 180) {
        r=0; g=c; b=x;
    }
    else if (h < 240) {
        r=0; g=x; b=c;
    }
    else if (h < 300) {
        r=x; g=0; b=c;
    }
    else {
        r=c; g=0; b=x;
    }

    return [
        Math.round((r+m)*255),
        Math.round((g+m)*255),
        Math.round((b+m)*255)
    ];
}


function rgbToHex(r, g, b) {
    return `#${[r, g, b]
        .map(v => v.toString(16).padStart(2, "0"))
        .join("")}`;
}


export function rainbowSpectrum(frames) {
    const spectrum=[];

    for (let i=0;i<frames;i++) {
        const hue=(i/frames)*360;

        const [r, g, b]=hsvToRgb(hue, 1, 1);

        spectrum.push(rgbToHex(r, g, b));
    }

    return spectrum;
}


export function changePianoColor(piano, paletteName) {
    const palette=palettes.get(paletteName);
    if (!palette)
        throw new Error(`Palette not found: ${paletteName}`);
    palette.applyTo(piano);
}