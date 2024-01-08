import type { Song } from "../../types";
import { k } from "../../main";

const songBoxHeight = 100;

export const songBox = (songData: Song) => {
    const songBox = k.make([
        k.pos(),
        k.anchor("center"),
        "song",
        {
            songData,
            justSelected: false,
            justDeselected: false,
            select() {
                k.tween(this.pos.x, 40, 0.2, (v) => {
                    this.pos.x = v;
                }, k.easings.easeInOutQuad);
                this.justSelected = true;
            },
            deselect() {
                k.tween(this.pos.x, 0, 0.2, (v) => {
                    this.pos.x = v;
                }, k.easings.easeInOutQuad);
                this.justDeselected = true;
            },
            onSelect(action: (songData: Song) => void) {
                return k.onUpdate(() => {
                    if (this.justSelected) {
                        action(this.songData);
                        this.justSelected = false;
                    };
                });
            },
            onDeselect(action: (songData: Song) => void) {
                return k.onUpdate(() => {
                    if (this.justDeselected) {
                        action(this.songData);
                        this.justDeselected = false;
                    };
                });
            }
        }
    ]);

    // Song's background
    songBox.add([
        k.pos(),
        k.rect(400, songBoxHeight),
        k.color(k.Color.fromHex("#873e84")),
        k.opacity(0.5),
    ]);

    // Song's title
    songBox.add([
        k.pos(10, 10),
        k.text(songData.title, { size: 20 }),
    ]);

    // Song's subtitle
    songBox.add([
        k.pos(10, 30),
        k.text(songData.subtitle, { size: 15 }),
    ]);

    // Song's stars
    songBox.add([
        k.pos(10, 70),
        k.text("*".repeat(songData.courses[0].difficulty), { size: 20 }),
    ]);

    return songBox;
};