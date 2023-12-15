import kaboom from "kaboom";
import "kaboom/global";
import { loadAssets } from "./loader";
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

export const gameData = {
    "songs": [],
}

loadAssets();
gameScene();
sceneSongSelection();