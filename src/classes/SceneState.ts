import type { AudioPlay, AudioPlayOpt } from "kaboom";
import { k } from "../main";

export class SceneState {
    backgroundMusic: AudioPlay | null = null;

    setBackgroundMusic(music: string, options: AudioPlayOpt) {
        if (this.backgroundMusic) this.backgroundMusic.stop();

        this.backgroundMusic = k.play(music, options);
    }

    changeScene(scene: string, ...args: any[]) {
        this.backgroundMusic?.stop();
        k.go(scene, ...args);
    }
}