import { k } from "../main";
import { SceneState } from "../classes/SceneState";

export const loadMainMenuScene = () => k.scene("main_menu", () => {
    const sceneState = new SceneState();

    // Background
    k.add([
        k.rect(k.width(), k.height()),
        k.color(k.Color.fromHex("#ee8fcb")),
    ]);

    // Logo
    k.add([
        k.sprite("logo"),
        k.pos(k.width() / 2, 200),
        k.anchor("center"),
    ]);

    // Info
    k.add([
        k.pos(k.center().x, k.height() - 10),
        k.anchor("bot"),
        k.text("JuicyBeat 1.1.0 - 12/11/2023 - dev by lajbel", { size: 18, align: "center" })
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
            k.text(option, { size: 36 }),
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

    // Input
    let menuKeys = ["up", "down", "w", "s", "enter", "space"];
    let selectedOption = 0;

    k.onKeyPress((key) => {
        if (!menuKeys.includes(key)) return;
        if (key === "up" || key === "w") selectedOption = (selectedOption - 1) % menu.children.length;
        else if (key === "down" || key === "s") selectedOption = (selectedOption + 1) % menu.children.length;
        else if (key === "enter" || key === "space") k.go(menuOptions[menu.children[selectedOption].option]);
    });
});