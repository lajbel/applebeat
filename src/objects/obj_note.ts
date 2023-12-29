import { Anchor, AreaComp, GameObj, Vec2 } from "kaboom";
import { k } from "../main";
import { Rail } from "../types";

const directionByRail = (rail: Rail) => {
    return {
        "0": k.RIGHT,
        "1": k.DOWN,
        "2": k.LEFT,
    }[rail];
}

const valuesByRail = (rail: Rail) => {
    return {
        "0": {
            anchor: "right",
            dir: k.vec2(-50, 0),
        },
        "1": {
            anchor: "bot",
            dir: k.vec2(0, -50),
        },
        "2": {
            anchor: "left",
            dir: k.vec2(50, 0),
        },
    }[rail];
}

const noteStates = [
    "active",
    "hit",
    "miss",
    "destroy",
]

// Single note
export function noteSingle(rail: Rail, vel: number, pos: Vec2) {
    const note = k.make([
        k.pos(pos),
        k.layer("note"),
        k.anchor(k.vec2(0, 0.28)),
        k.sprite("apple"),
        k.area(),
        k.move(directionByRail(rail), vel),
        k.opacity(1),
        k.state("active", noteStates),
        "note",
        {
            type: "single",
            rail,
        }
    ]);

    note.onStateEnter("hit", () => {
        k.play("slice", { loop: false, volume: 0.5 });
        note.play("cut", { loop: false });
        note.enterState("miss");
    });

    note.onStateEnter("miss", () => {
        note.enterState("destroy");
    });

    note.onStateEnter("destroy", () => {
        note.unuse("move");
        note.use(k.lifespan(0.1, { fade: 0.1 }));
    });

    return note;
}

export function noteSlider(rail: Rail, vel: number, pos: Vec2) {
    let notes: GameObj<AreaComp | any>[] = [];
    let destroyedIndex = 0;
    let removingNote = false;

    const slider = k.make([
        k.pos(pos),
        k.layer("note"),
        k.move(directionByRail(rail), vel),
        k.opacity(1),
        k.anchor(valuesByRail(rail).anchor as Anchor),
        k.area({ shape: new k.Rect(k.vec2(0), 0, 0) }),
        k.state("active", noteStates),
        "note",
        {
            type: "slider",
            notes: [],
            notesIndex: 0,
            active: true,
            endedCreation: false,
            addNote() {
                const subnote = k.add([
                    k.pos(this.pos.add(valuesByRail(rail).dir.scale(this.notesIndex))),
                    k.layer("note"),
                    k.anchor(k.vec2(0, 0.28)),
                    k.sprite("green_apple"),
                    k.area(),
                    k.move(directionByRail(rail), vel),
                    k.opacity(1),
                    k.state("active", noteStates),
                    "subnote",
                    {
                        rail,
                    }
                ]);

                subnote.onStateEnter("hit", () => {
                    k.play("slice", { loop: false, volume: 0.5 });
                    subnote.unuse("move");
                    subnote.play("cut", { loop: false });
                    subnote.enterState("destroy");
                });

                subnote.onStateEnter("miss", () => {
                    subnote.use(k.move(k.DOWN, 100));
                    subnote.enterState("destroy");
                });

                subnote.onStateEnter("destroy", () => {
                    subnote.use(k.lifespan(0.1, { fade: 0.1 }));
                });

                subnote.onStateUpdate("destroy", () => {
                    if (rail === 0) {
                        if (notes?.[destroyedIndex]?.pos?.x >= this?.pos?.x) {
                            removingNote = false;
                        }
                    }
                    if (rail === 1) {
                        if (notes?.[destroyedIndex]?.pos?.y >= this?.pos?.y) {
                            removingNote = false;
                        }
                    }
                    if (rail === 2) {
                        if (notes?.[destroyedIndex]?.pos?.x <= this?.pos?.x) {
                            removingNote = false;
                        }
                    }
                });

                this.updateArea();
                this.notesIndex++;
                notes.push(subnote);
            },
            updateArea() {
                if (rail === 0) {
                    this.use(k.area({ shape: new k.Rect(k.vec2(30, 0), 50 * (this.notesIndex + 1), 63) }))
                }
                if (rail === 1) {
                    this.use(k.area({ shape: new k.Rect(k.vec2(0, 30), 63, 50 * (this.notesIndex + 1)) }))
                }
                if (rail === 2) {
                    this.use(k.area({ shape: new k.Rect(k.vec2(-30, 0), 50 * (this.notesIndex + 1), 63) }))
                }
            },
            end() {
                this.endedCreation = true;
            }
        }
    ]);

    slider.onStateEnter("active", () => {
        const addLoop = k.loop(50 / vel, () => {
            if (slider.endedCreation) addLoop.cancel();
            slider.addNote();
        });
    });

    slider.onStateEnter("hit", () => {
        slider.unuse("move");
    });

    slider.onStateUpdate("hit", () => {
        if (removingNote) return;
        notes[destroyedIndex]?.enterState("hit");
        removingNote = true;
        destroyedIndex++;
    });

    slider.onStateEnter("destroy", () => {
        slider.destroy();
        k.get("subnote").forEach((subnote) => {
            subnote.enterState("destroy");
        });
    });

    slider.onStateEnter("miss", () => {
        slider.destroy();
        k.get("subnote").forEach((subnote) => {
            subnote.enterState("miss");
        });
    });

    return slider;
}