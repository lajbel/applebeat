import { k } from "../main";

export const loadMainMenuScene = () => k.scene("main_menu", () => {
    // Background
    k.add([
        k.rect(k.width(), k.height()),
        k.color(k.Color.fromHex("#ee8fcb")),
    ]);

    // Menu
    const menuOptions = {
        "play": "song_selection",
        "settings": "settings",
    }

    const menu = k.add([
        k.pos(k.center()),
    ]);

    Object.keys(menuOptions).forEach((option, i) => {
        menu.add([
            k.pos(0, i * 50),
            k.anchor("center"),
            k.text(option, { size: 32 }),
            k.color(k.Color.fromHex("#ffffff")),
            k.anchor("center"),
            k.area(),
            k.state("active"),
            {
                option,
                i,
            }
        ]);
    });
});