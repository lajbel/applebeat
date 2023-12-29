import { k } from "../main";

export const loadClickScene = () => k.scene("click", () => {
    k.add([
        k.rect(k.width(), k.height()),
        k.color(k.Color.fromHex("#000000")),
    ]);

    k.add([
        k.pos(k.width() / 2, k.height() / 2),
        k.text("Press ENTER for start", { size: 32 }),
        k.anchor("center"),
        k.color(k.Color.fromHex("#ffffff")),
    ]);

    k.onUpdate(() => {
        if (k.isMousePressed() || k.isKeyPressed("enter") || k.isKeyPressed("space")) {
            k.go("song_selection");
        }
    });
});