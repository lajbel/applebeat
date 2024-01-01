import { k } from "../../main";
import { padlZero } from "../../util";

export const playInfoObj = () => {
    const playInfo = k.make([
        k.pos(k.center().x, k.height() - 200),
        k.anchor("top"),
        k.layer("ui"),
        k.rect(k.width(), 200),
        k.color(k.Color.fromHex("#1f102a")),
        {
            setCombo(amount: number) {
                combo.text = "x" + padlZero(String(amount), 3);
            },
            setScore(amount: number) {
                score.text = padlZero(String(amount), 8);
            }
        }
    ]);

    const score = playInfo.add([
        k.pos(k.center().x - 10, 20 + 10),
        k.anchor("right"),
        k.text(padlZero(String(0), 8), { size: 40 }),
    ]);

    const combo = playInfo.add([
        k.pos(score.pos.add(k.vec2(0, 40))),
        k.anchor("right"),
        k.text("x" + padlZero(String(0), 3), { size: 28 }),
    ]);

    return playInfo;
}