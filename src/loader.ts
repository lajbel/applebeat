import { k } from "./main";
import { loadTJA } from "./util";

export function loadAssets() {
    // Sprites
    k.loadSprite("bean", "sprites/bean.png");
    k.loadSprite("sword", "sprites/sword.png");
    k.loadSprite("sword_cut", "sprites/sword_cut.png");
    k.loadSprite("apple_break", "sprites/apple_break.png");
    k.loadAseprite("apple", "sprites/apple.png", "sprites/apple.json");
    k.loadAseprite("green_apple", "sprites/green_apple.png", "sprites/green_apple.json");

    // Player skins
    k.loadSprite("bag", "sprites/players_skin/bag.png");
    k.loadSprite("bobo", "sprites/players_skin/bobo.png");
    k.loadSprite("egg", "sprites/players_skin/egg.png");
    k.loadSprite("pineapple", "sprites/players_skin/pineapple.png");

    // Sounds
    k.loadSound("slice", "sounds/effects/slice.mp3");
    k.loadSound("metronome", "sounds/effects/metronome.wav");

    // Songs
    k.loadSound("michelle", "sounds/music/michelle.mp3");
    k.loadSound("Mus_ex", "sounds/music/death_of_glamour.ogg");
    k.loadSound("snow_halation", "sounds/music/snow_halation.ogg");

    // TJA Charts
    loadTJA("charts/koi_no_mahou.tja");
    loadTJA("charts/Gurenge.tja")
    loadTJA("charts/Heartache.tja");
    loadTJA("charts/Snow halation.tja");

    // Fonts
    k.loadBitmapFont("happy", "sprites/happy_28x36.png", 28, 36);

    k.onLoad(() => {
        k.go("click");
    });
}