import { k } from "../main";

export const settingsMenu = () => {
    const settingsMenu = k.make([
        k.anchor("center"),
        k.pos(),
    ]);

    // Background
    settingsMenu.add([
        k.anchor("center"),
        k.rect(300, 600),
    ]);

    // Title
    settingsMenu.add([
        k.anchor("center"),
        k.pos(0, 0),
        k.text("Settings", { size: 32 }),
        k.color(k.BLACK),
    ]);

    return settingsMenu;
}