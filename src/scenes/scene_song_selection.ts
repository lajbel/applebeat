import { AudioPlay } from "kaboom";
import { k, gameData } from "../main";
import { SceneState } from "../classes/SceneState";
import { songBox } from "../objects/ui/obj_song_box";
import { complexAdd } from "../util";

export const loadSongSelectionScene = () => k.scene("song_selection", () => {
    const sceneState = new SceneState();
    const songDatas = gameData.songs;
    let selectedSong = 0;
    let demoSongVolume = 0;
    let demoSong: AudioPlay | null = null;

    k.add([
        k.rect(k.width(), k.height()),
        k.color(k.Color.fromHex("#ee8fcb")),
    ]);

    k.add([
        k.pos(k.width() / 2, 10),
        k.anchor("top"),
        k.text("Select a song!", { size: 32 }),
    ]);

    // Song List
    // TODO: Make songBoxHeight global
    songDatas.forEach((songData, i) => {
        const songBoxObj = complexAdd(songBox(songData), null, [
            k.pos(0, 80 + (i * (100 + 20))),
        ]);

        songBoxObj.onSelect((songData) => {
            sceneState.setBackgroundMusic(songData.sound, { loop: true, volume: 0.5, seek: songData.demoStart });
        });
    });

    // Input
    let menuKeys = ["up", "down", "w", "s", "escape"];
    let menuKeysPressed = false;

    k.onKeyPress((key) => {
        if (!menuKeys.includes(key) && !menuKeysPressed) return;
        menuKeysPressed = true;

        k.get("song")[selectedSong].deselect();

        if (key === "down" || key === "s") selectedSong = (selectedSong + 1) % songDatas.length;
        if (key === "up" || key === "w") selectedSong = (selectedSong - 1 + songDatas.length) % songDatas.length;
        if (key === "escape") return sceneState.changeScene("main_menu");

        k.get("song")[selectedSong].select();
        menuKeysPressed = false;
    });

    k.onUpdate(() => {
        if (k.isKeyPressed("enter")) sceneState.changeScene("game", songDatas[selectedSong]);

        // TEMP
        if (k.isKeyPressed("m")) {
            gameData.setSetting("demoMusic", !gameData.settings.demoMusic);
        }
        // TEMP Skin setting
        if (k.isKeyPressed("1")) gameData.setPlayerSetting("skin", "bean");
        if (k.isKeyPressed("2")) gameData.setPlayerSetting("skin", "bag");
        if (k.isKeyPressed("3")) gameData.setPlayerSetting("skin", "bobo");
        if (k.isKeyPressed("4")) gameData.setPlayerSetting("skin", "egg");
        if (k.isKeyPressed("5")) gameData.setPlayerSetting("skin", "pineapple");

        demoSongVolume = gameData.settings.demoMusic ? 0.5 : 0;
        if (demoSong?.volume) demoSong.volume = demoSongVolume;
    });

    // Select the first song
    k.get("song")[selectedSong].select();
});