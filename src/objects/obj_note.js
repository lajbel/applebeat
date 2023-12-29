import { k } from "../main";

// Single note
export function noteSingle(rail, vel, pos) {
    const directionByRail = {
        "0": k.RIGHT,
        "1": k.DOWN,
        "2": k.LEFT,
    };

    const note = k.make([
        k.pos(pos),
        k.layer("note"),
        k.anchor(k.vec2(0, 0.28)),
        k.sprite("apple"),
        k.area(),
        k.move(directionByRail[rail], vel),
        k.opacity(1),
        "note",
        {
            rail,
            type: "single",
            active: true,

            removeNote() {
                k.play("slice", { loop: false, volume: 0.5 });
                k.add([
                    k.pos(this.worldPos()),
                    k.anchor("center"),
                    k.sprite("apple_break"),
                    k.opacity(),
                    k.move(k.vec2(directionByRail[rail].x * -1, rail.toString() == "1" ? -1 : 1), 1000),
                    k.lifespan(0.05, { fade: 0.05 }),
                ]);
                this.active = false;
                this.play("cut", { loop: false });
                this.unuse("move");
                this.use(lifespan(0.1, { fade: 0.1 }));
            }
        }
    ]);

    return note;
}

export function noteSlider(rail, vel, pos) {
    const directionByRail = {
        "0": k.RIGHT,
        "1": k.DOWN,
        "2": k.LEFT,
    };

    let notes = [];
    let destroyedIndex = 0;
    let removingNote = false;

    const slider = k.make([
        k.pos(pos),
        k.layer("note"),
        k.move(directionByRail[rail], vel),
        k.opacity(1),
        k.anchor("right"),
        k.area({ shape: new k.Rect(k.vec2(0), 0, 0 )}),
        "note",
        {
            type: "slider",
            notes: [],
            notesIndex: 0,
            activeSlider: false,
            endedCreation: false,
            
            add() {
                const addLoop = loop(50 / vel, () => {
                    if(this.endedCreation) addLoop.cancel();
                    // green apple
                    const note = k.add([
                        k.pos(this.pos.add(k.vec2(-50 * this.notesIndex, 0))),
                        k.anchor(k.vec2(0, 0.28)),
                        k.sprite("green_apple"),
                        k.opacity(1),
                        k.move(directionByRail[rail], vel),
                        {
                            removeNote() {
                                k.add([
                                    k.pos(this.worldPos()),
                                    k.anchor("center"),
                                    k.sprite("apple_break"),
                                    k.opacity(1),
                                    k.move(k.vec2(directionByRail[rail].x * -1, rail.toString() == "1" ? -1 : 1), 1000),
                                    k.lifespan(0.05, { fade: 0.05 }),
                                ]);
                                this.play("cut", { loop: false });
                                this.unuse("move");
                                this.use(lifespan(0.1, { fade: 0.1 }));

                                const x = k.onUpdate(() => {
                                    if (notes?.[destroyedIndex]?.pos?.x >= this?.pos?.x) {
                                        removingNote = false;
                                    }
                                });
                            }
                        }
                    ]);

                    this.notesIndex++;
                    this.use(k.area({ shape: new k.Rect(k.vec2(30, 0), 50 * this.notesIndex, 63 )}))
                    notes.push(note);
                });

            },

            removeOldestNote() {
                if(removingNote) return;
                notes[destroyedIndex]?.removeNote();
                destroyedIndex++;
                removingNote = true;
            },

            end() {
                this.endedCreation = true;
            }
        }
    ]);

    return slider;
}