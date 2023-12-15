import { k, gameData } from "./main.js";
import { TJAParser } from 'tja';

export function loadAssets() {
    // Sprites
    k.loadSprite("bean", "sprites/bean.png");
    k.loadSprite("sword", "sprites/sword.png");
    k.loadSprite("sword_cut", "sprites/sword_cut.png");
    k.loadSprite("apple_break", "sprites/apple_break.png");
    k.loadAseprite("apple", "sprites/apple.png", "sprites/apple.json");

    // Sounds
    k.loadSound("slice", "sounds/effects/slice.mp3");
    k.loadSound("metronome", "sounds/effects/metronome.wav");

    // Songs
    k.loadSound("michelle", "sounds/music/michelle.mp3");
    k.loadSound("Mus_ex", "sounds/music/death_of_glamour.ogg");
    k.loadSound("snow_halation", "sounds/music/snow_halation.ogg");

    // TJA Charts
    k.load(new Promise ((resolve, reject) => {
        fetch("charts/koi_no_mahou.tja").then((response) => {
            return response.text();
        }).then(async (text) => {
            try {
                const song = TJAParser.parse(text);
                const commands = song.courses[0].singleCourse.getCommands();
                const chart = commands.toString().replace("#START,", "").replace(",#END", "");

                await k.loadSound(song.wave.slice(0, -3), `sounds/music/${song.wave}`);

                gameData.songs.push({
                    title: song.title,
                    subtitle: song.subtitle,
                    genre: song.genre,
                    bpm: song.bpm,
                    offset: song.offset,
                    demoStart: song.demoStart,
                    chart: chart,
                    sound: song.wave.slice(0, -3),
                });

                resolve(song);
            }
            catch (e) {
                reject("Error parsing TJA file");
            }
        });
    }));

    // Fonts
    k.loadBitmapFont("happy", "sprites/happy_28x36.png", 28, 36);

    k.onLoad(() => {  
        go("song_selection");
    });
}