import { k, gameData } from "../../main";

export const playerObj = () => {
    const player = k.make([
        k.pos(k.center()),
        k.layer("player"),
        k.anchor("center"),
        k.sprite(gameData.player.skin),
    ]);

    return player;
}