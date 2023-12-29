import type { Song, UserSettings } from "../types";
import { k } from "../main";

type PlayerSettings = {
    skin: string,
    sword: string,
}

export class GameData {
    debug: boolean;
    songs: Song[];
    player: PlayerSettings;
    settings: UserSettings;

    constructor() {
        this.debug = true;
        this.songs = [];
        this.settings = k.getData("settings") || {
            demoMusic: true,
            volume: 1,
        };
        this.player = k.getData("player") || {
            skin: "bean",
            sword: "sword",
        };
    }

    setSetting<T extends keyof UserSettings>(key: T, value: UserSettings[T]) {
        this.settings[key] = value;
        k.setData("settings", this.settings);
    }

    setPlayerSetting<T extends keyof PlayerSettings>(key: T, value: PlayerSettings[T]) {
        this.player[key] = value;
        k.debug.log(`player ${key} set to ${value}`);
        k.setData("player", this.player);
    }
}
