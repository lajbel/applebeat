import { GameObj } from "kaboom";

export class PlayData {
    score = 0;
    combo = 0;
    highScore = 0;
    noteIndex = 0;
    oldestNote: GameObj | null = null;
}