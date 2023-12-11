import { k } from "./main";
import { waitMs, loopMs } from "./util";

const noteVel = 400;

export const gameScene = () => k.scene("game", (songData) => {
    let playingAudio;
    let gameData = {
        score: 0,
        combo: 0,
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
    const swordPoints = {
        "0": {
            pos: k.vec2(-sep, 0),
            angle: -90,
        },
        "1": {
            pos: k.vec2(0, -sep),
            angle: 0,
        },
        "2": {
            pos: k.vec2(sep, 0),
            angle: 90,
        },
        "o": {
            pos: k.vec2(0),
            angle: 0,
        }
    }

    const sword = player.add([
        k.pos(),
        k.z(100),
        k.rotate(),
        k.anchor(k.vec2(0, 0.8)),
        k.sprite("sword"),
    ]);

    // Action Points
    const actionPointSize = 80;

    const applePoints = k.add([
        k.pos(k.center()),
        k.anchor("center"),
    ]);

    applePoints.add([
        k.pos(-100, 0),
        k.z(50),
        k.anchor("center"),
        k.circle(20),
        k.area({ shape: new Rect(vec2(0), actionPointSize, actionPointSize) }),
    ]);

    applePoints.add([
        k.pos(0, -100),
        k.z(50),
        k.anchor("center"),
        k.circle(20),
        k.area({ shape: new Rect(vec2(0), actionPointSize, actionPointSize) }),
    ]);

    applePoints.add([
        k.pos(100, 0),
        k.z(50),
        k.anchor("center"),
        k.circle(20),
        k.area({ shape: new Rect(vec2(0), actionPointSize, actionPointSize) }),
    ]);

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
        gameData.score += amount;
        score.text = gameData.score;

        k.add([
            k.pos(k.center().x, 90),
            k.anchor("top"),
            k.text(message, { size: 28, align: "right" }),
            k.move(k.UP, 100),
            k.opacity(),
            k.lifespan(0.4, { fade: 1 }),
        ]);
    }

    // Song Data
    const songInfo = k.add([
        k.pos(k.center().x, k.height() - 20),
        k.anchor("bot"),
        k.text("", { size: 22 }),
    ]);

    function hitNote(point) {
        const applePoint = applePoints.children[point];

        k.get("apple").forEach((note) => {
            if (applePoint.isColliding(note)) {
                note.play("cut", { loop: false });
                note.unuse("move");
                note.use(lifespan(0.1, { fade: 0.1 }));

                const noteDis = note.worldPos().dist(applePoint.worldPos());

                if (noteDis < 10) {
                    addScore(300, "Great!");
                }
                else {
                    addScore(100, "Good");
                }
            }
        });

        // Sword animation
        const angleTween = k.tween(sword.angle, swordPoints[point].angle, 0.05, (v) => {
            sword.angle = v;
        }, k.easings.easeInOutCubic);

        const posTween = k.tween(sword.pos, swordPoints[point].pos, 0.05, (v) => {
            sword.pos = v;
        }, k.easings.easeInOutCubic);

        angleTween.onEnd(() => {
            k.tween(sword.angle, swordPoints["o"].angle, 0.05, (v) => {
                sword.angle = v;
            }, k.easings.easeInOutCubic);

            k.tween(sword.pos, swordPoints["o"].pos, 0.05, (v) => {
                sword.pos = v;
            }, k.easings.easeInOutCubic);
        });
    }

    function addNote(point) {
        const spawnPoint = spawnPoints.children[point];

        const moveTo = {
            "0": RIGHT,
            "1": DOWN,
            "2": LEFT,
        };

        const note = k.add([
            k.pos(spawnPoint.worldPos()),
            k.z(50),
            k.anchor("center"),
            k.sprite("apple"),
            k.area(),
            k.move(moveTo[point.toString()], noteVel),
            k.opacity(1),
            "apple",
        ]);

        note.onUpdate(() => {
            if (note.hasPoint(k.center())) {
                note.destroy();
            }
        });
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

        songInfo.text = `${songData.name} from ${songData.artist}`

        k.wait(songData.offset + distanceOfPoint, () => {
            playingAudio = k.play(songData.fileName);
        });

        ////////////////////////////////
        // Tempo viewer  ///////////////
        ///////////////////////////////

        const tempoViewer = k.add([
            k.pos(60, 40),
            k.circle(20),
        ]);

        loopMs(bpms, () => {
            tempoViewer.use(k.scale(1.2));
            // addTempoNotes();

            waitMs(bpms / 2, () => {
                tempoViewer.use(k.scale(1));
                // k.play("metronome");
            });
        });

        /////////////////////////////////
        // Load chart //////////////////
        ///////////////////////////////
        k.wait(0, () => {
            const measures = songData.chart.trim().replace(/(\r\n|\n|\r)/gm, "").replace(/\s/g, "").split(",");

            measures.forEach((measure, mi) => {
                const chartNotes = measure.split("");
                const msPerNote = msPerMeasure / chartNotes.length;
   
                waitMs(msPerMeasure * mi, () => {
                    chartNotes.forEach((note, i) => {
                        if(note !== "0") {
                            waitMs(msPerNote * (i), () => {
                                addNote(parseInt(note) - 1);
                            });
                        }
                    });
                });

            });
        });
    }

    k.onUpdate(() => {
        if (k.isKeyPressed("left")) hitNote(0);
        if (k.isKeyPressed("up")) hitNote(1);
        if (k.isKeyPressed("right")) hitNote(2);
        if (k.isKeyPressed("escape")) {
            playingAudio?.stop();
            k.go("song_selection");
        }
    });

    startSong(songData);
});