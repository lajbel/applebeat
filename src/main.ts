import kaboom from "kaboom";
import { layerPlugin } from "kaboom-extra";
import { GameData } from "./classes/gameData";
import { loadAssets } from "./loader";
import { loadGameScene } from "./scenes/scene_game";
import { loadSongSelectionScene } from "./scenes/scene_song_selection";
import { loadMainMenuScene } from "./scenes/scene_main_menu";
import { loadClickScene } from "./scenes/scene_click";

export const k = kaboom({
    width: 720,
    height: 720,
    stretch: true,
    letterbox: true,
    texFilter: "nearest",
    crisp: true,
    font: "happy",
    background: [0, 0, 0],
    plugins: [layerPlugin],
});

export const gameData = new GameData();

loadAssets();
loadClickScene();
loadGameScene();
loadMainMenuScene();
loadSongSelectionScene();