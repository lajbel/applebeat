import kaboom from "kaboom";
import "kaboom/global";
import { gameScene } from "./scene_game";
import { sceneSongSelection } from "./scene_song_selection";

export const k = kaboom({
    width: 720,
    height: 720,
    stretch: true,
    letterbox: true,
    texFilter: "nearest",
    crisp: true,
    font: "happy",
});

k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("sword", "sprites/sword.png");
k.loadAseprite("apple", "sprites/apple.png", "sprites/apple.json");
k.loadSound("michelle", "sounds/music/michelle.mp3");
k.loadSound("Mus_ex", "sounds/music/death_of_glamour.ogg");
k.loadSound("koi_no_mahou", "sounds/music/koi_no_mahou.mp3");
k.loadSound("metronome", "sounds/effects/metronome.wav");
k.loadBitmapFont("happy", "sprites/happy_28x36.png", 28, 36);

gameScene();
sceneSongSelection();

go("song_selection");