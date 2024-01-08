import { GameObj } from "kaboom";
import { startHealth } from "../config";

export class PlayState {
    score = 0;
    combo = 0;
    highScore = 0;
    noteIndex = 0;
    oldestNote: GameObj | null = null;
    health = startHealth;
}