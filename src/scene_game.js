import { k } from "./main";
import { waitMs, loopMs } from "./util";

const noteVel = 400;

export const gameScene = () => k.scene("game", (songData) => {
    const notes = [];
    let playingAudio;
    let playData = {
        score: 0,
        combo: 0,
        noteIndex: 0,
        oldestNote: null,
    }

    // Backround
    k.add([
        k.pos(0),
        k.rect(k.width(), k.height()),
        k.color("ee8fcb"),
    ]);

    // Player
    const player = k.add([
        k.pos(k.center()),
        k.z(100),
        k.anchor("center"),
        k.sprite("bean"),
    ]);

    // Swords
    const sep = 60;
    const swordAnimationPoints = {
        "0": {
            "first": {
                "start": {
                    pos: k.vec2(-50, 0),
                    angle: -20,
                },
                "end": {
                    pos: k.vec2(-30, 20),
                    angle: -94,
                }
            },
            "second": {
                "start": {
                    pos: k.vec2(-70, 0),
                    angle: 0,
                },
                "end": {
                    pos: k.vec2(5, 20),
                    angle: -120,
                }
            },

        },
        "1": {
            "first": {
                "start": {
                    pos: k.vec2(-10, 0),
                    angle: -43,
                },
                "end": {
                    pos: k.vec2(10, -60),
                    angle: 43,
                },
            },
            "second": {
                "start": {
                    pos: k.vec2(-10, 0),
                    angle: 43,
                },
                "end": {
                    pos: k.vec2(10, -60),
                    angle: -43,
                },
            }

        },
        "2": {
            "first": {
                "start": {
                    pos: k.vec2(50, 0),
                    angle: 20,
                },
                "end": {
                    pos: k.vec2(30, 20),
                    angle: 94,
                }
            },
            "second": {
                "start": {
                    pos: k.vec2(70, 0),
                    angle: 0,
                },
                "end": {
                    pos: k.vec2(-5, 20),
                    angle: 120,
                }
            },
        },
    }

    const sword = player.add([
        k.pos(-20, 20),
        k.z(100),
        k.rotate(90),
        k.anchor(k.vec2(0, 0.8)),
        k.sprite("sword"),
        "sword",
        {
            lastPoint: null,
            variantUsed: true,
            pointStatus: "start",

            hit(point) {
                if(this.lastPoint !== point) this.variantUsed = true;
                const swordAnimationPoint = swordAnimationPoints[point][this.variantUsed ? "first" : "second"];

                k.tween(swordAnimationPoint.start.angle, swordAnimationPoint.end.angle, 0.1, (v) => {
                    sword.angle = v;
                }, k.easings.easeInOutCubic);
            
                k.tween(swordAnimationPoint.start.pos, swordAnimationPoint.end.pos, 0.1, (v) => {
                    sword.pos = v;
                }, k.easings.easeInOutCubic);

                this.lastPoint = point;
                this.variantUsed = !this.variantUsed;
            }
        }
    ]);

    // Action Points
    const actionPointSize = 80;

    const noteHitPoints = k.add([
        k.pos(k.center()),
        k.anchor("center"),
    ]);

    function addNoteHitPoint(pos) {
        const noteHitPoint = noteHitPoints.add([
            k.pos(pos),
            k.z(50),
            k.anchor("center"),
            k.circle(20),
            k.color(k.BLACK),
            k.opacity(0.1),
            k.area({ shape: new Rect(vec2(0), actionPointSize, actionPointSize) }),
        ]);

        noteHitPoint.add([
            k.pos(),
            {
                cradius: 20,
                copacity: 0,
                playNiceAnim() {
                    this.copacity = 0.2;
                    k.tween(this.cradius, 30, 0.1, (v) => {
                        this.cradius = v;
                    }).onEnd(() => {
                        this.copacity = 0;
                        k.tween(this.cradius, 20, 0.1, (v) => {
                            this.cradius = v;
                        });
                    });
                },
                draw() {
                    k.drawCircle({
                        radius: this.cradius,
                        opacity: this.copacity,
                        outline: {
                            color: k.BLACK,
                            width: 4,
                        },
                        fill: false,
                    });
                }
            },
            "corner"
        ]);
    }

    addNoteHitPoint(k.vec2(-100, 0), 0);
    addNoteHitPoint(k.vec2(0, -100), 1);
    addNoteHitPoint(k.vec2(100, 0), 2);

    // Notes spawn points
    const spawnPoints = k.add([
        k.pos(k.center()),
        k.anchor("center"),
    ]);

    spawnPoints.add([
        k.pos(-k.width() / 2, 0),
        k.anchor("center"),
    ]);

    spawnPoints.add([
        k.pos(0, -k.height() / 2),
        k.anchor("center"),
    ]);

    spawnPoints.add([
        k.pos(k.width() / 2, 0),
        k.anchor("center"),
    ]);

    // Score
    const score = k.add([
        k.pos(k.center().x, 20),
        k.anchor("top"),
        k.text("0", { size: 40 }),
    ]);

    function addScore(amount, message = "") {
        let comboBonus = 0;
        if(combo.comboBonus >= 10) comboBonus = 10;
    
        playData.score += amount + comboBonus;
        score.text = playData.score;

        k.add([
            k.pos(k.center().x, 90),
            k.anchor("top"),
            k.text(message, { size: 28, align: "right" }),
            k.move(k.UP, 100),
            k.opacity(),
            k.lifespan(0.4, { fade: 1 }),
        ]);
    }

    // Combo
    const combo = k.add([
        k.pos(k.center().x, 60),
        k.anchor("top"),
        k.text("x0", { size: 28 }),
    ]);

    function addCombo(amount) {
        playData.combo += amount;
        combo.text = "x" + playData.combo;
    }

    function resetCombo() {
        playData.combo = 0;
        playData.oldestNote = notes[playData.noteIndex];
        combo.text = "x" + playData.combo;
    }

    // Song Data
    const songTitle = k.add([
        k.pos(k.center().x, k.height() - 60),
        k.anchor("bot"),
        k.text("", { size: 26 }),
    ]);

    const songSubtitle = k.add([
        k.pos(k.center().x, k.height() - 30),
        k.anchor("bot"),
        k.text("", { size: 22 }),
    ]);

    function tryHitNote(point) {
        const hitPoint = noteHitPoints.children[point];

        k.get("note").forEach((note) => {
            if (hitPoint.isColliding(note)) {
                note.play("cut", { loop: false });
                note.unuse("move");
                note.use(lifespan(0.1, { fade: 0.1 }));
                note.removeNote();

                const noteDis = note.worldPos().dist(hitPoint.worldPos());

                if (noteDis < 10) {
                    addScore(300, "Great!");
                    hitPoint.get("corner")[0].playNiceAnim();
                }
                else {
                    addScore(100, "Good");
                }

                if(note?.id === playData.oldestNote?.id) {
                    addCombo(1);
                }
                else {
                    resetCombo();
                }
    
                playData.noteIndex++;
                playData.oldestNote = notes[playData.noteIndex];
            }
        });

        // Sword animation
        sword.hit(point);
    }

    function makeNote(point) {
        const spawnPoint = spawnPoints.children[point];

        const moveTo = {
            "0": RIGHT,
            "1": DOWN,
            "2": LEFT,
        };

        const note = k.make([
            k.pos(spawnPoint.worldPos()),
            k.z(50),
            k.anchor(k.vec2(0, 0.28)),
            k.sprite("apple"),
            k.area(),
            k.move(moveTo[point.toString()], noteVel),
            k.opacity(1),
            "note",
            {
                point: point,
                removeNote() {
                    k.play("slice", { loop: false, volume: 0.5 });
                    k.add([
                        k.pos(note.worldPos()),
                        k.anchor("center"),
                        k.sprite("apple_break"),
                        k.move(k.vec2(moveTo[point.toString()].x * -1, point.toString() == "1" ? -1 : 1), 1000),
                        k.opacity(),
                        k.lifespan(0.05, { fade: 0.05 }),
                    ]);
                }
            }
        ]);

        note.onUpdate(() => {
            if (note.hasPoint(k.center())) {
                playData.noteIndex++;
                note.destroy();
                resetCombo();
            }
        });

        notes.push(note);
        if(!playData.oldestNote) playData.oldestNote = note;
        return note;
    }

    function addTempoNotes() {
        const tempoNoteComps = (pos, angle, dir) => [
            k.pos(pos),
            k.anchor("center"),
            k.rotate(angle),
            k.rect(2, 80),
            k.move(dir, noteVel),
            k.opacity(1),
            k.lifespan(((k.width() / 2) - 100) / noteVel),
            "tempo_note",
        ]

        k.add(tempoNoteComps(spawnPoints.children[0].worldPos(), 0, RIGHT));
        k.add(tempoNoteComps(spawnPoints.children[1].worldPos(), 90, DOWN));
        k.add(tempoNoteComps(spawnPoints.children[2].worldPos(), 0, LEFT));
    }

    function startSong(songData) {
        const bpm = songData.bpm;
        const bps = bpm / 60;
        const bpms = 1000 / bps;
        const msPerMeasure = bpms * 4;
        const distanceOfPoint = ((k.width() / 2) - 100) / noteVel;

        songTitle.text = songData.title;
        songSubtitle.text = songData.subtitle;

        k.wait(songData.offset + distanceOfPoint, () => {
            playingAudio = k.play(songData.sound);
        });

        ////////////////////////////////
        // Tempo viewer  ///////////////
        ///////////////////////////////
        // const tempoViewer = k.add([
        //     k.pos(60, 40),
        //     k.circle(20),
        // ]);

        // loopMs(bpms, () => {
        //     tempoViewer.use(k.scale(1.2));
        //     // addTempoNotes();

        //     waitMs(bpms / 2, () => {
        //         tempoViewer.use(k.scale(1));
        //         // k.play("metronome");
        //     });
        // });

        /////////////////////////////////
        // Load chart //////////////////
        ///////////////////////////////
        k.wait(0, () => {
            const measures = songData.chart.split(",,");

            measures.forEach((measure, mi) => {
                const chartNotes = measure.split("");
                const msPerNote = msPerMeasure / chartNotes.length;
   
                waitMs(msPerMeasure * mi, () => {
                    chartNotes.forEach((note, i) => {
                        if(note !== "0") {
                            const note2 = makeNote(parseInt(note) - 1);

                            waitMs(msPerNote * (i), () => {
                                k.add(note2);
                            });
                        }
                    });
                });

            });
        });
    }

    k.onUpdate(() => {
        if (k.isKeyPressed("left")) tryHitNote(0);
        if (k.isKeyPressed("up")) tryHitNote(1);
        if (k.isKeyPressed("right")) tryHitNote(2);
        if (k.isKeyPressed("escape")) {
            playingAudio?.stop();
            k.go("song_selection");
        }
    });

    startSong(songData);
});