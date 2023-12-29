import type { AudioPlay, GameObj, Vec2 } from "kaboom";
import type { Rail, Song } from "../types";
import { gameData, k } from "../main";
import { padlZero, waitMs } from "../util";
import { noteSlider, noteSingle } from "../objects/obj_note";
import { tweenAnim } from "../components/tweenAnim"
import { swordAnimation } from "../animations/anim_sword";
import { PlayData } from "../classes/playData";

const noteVel = 400;

export const loadGameScene = () => k.scene("game", (songData) => {
    const playData = new PlayData();
    const noteStack: GameObj[] = [];
    let playingAudio: AudioPlay | null = null;

    // Backround
    k.add([
        k.layer("background"),
        k.rect(k.width(), k.height()),
        k.color(k.Color.fromHex("#ee8fcb")),
    ]);

    // Player
    const player = k.add([
        k.pos(k.center()),
        k.layer("player"),
        k.anchor("center"),
        k.sprite(gameData.player.skin),
    ]);

    // Swords
    const sword = player.add([
        k.pos(-20, 20),
        k.rotate(90),
        k.layer("sword"),
        k.anchor(k.vec2(0, 0.8)),
        k.sprite("sword"),
        tweenAnim(swordAnimation(), 0.1),
        "sword",
        {
            lastRail: null,
            variantUsed: true,
            hit(rail: Rail) {
                if (this.lastRail !== rail) this.variantUsed = true;
                this.playTAnim(String(rail) + (this.variantUsed ? "first" : "second"));
                this.lastRail = rail;
                this.variantUsed = !this.variantUsed;
            }
        }
    ]);

    // #region PlayInfo
    const playInfo = k.add([
        k.pos(k.center().x, k.height() - 200),
        k.anchor("top"),
        k.rect(k.width(), 200),
        k.color(k.Color.fromHex("#1f102a")),
    ]);

    const score = playInfo.add([
        k.pos(k.center().x - 10, 20 + 10),
        k.anchor("right"),
        k.text(padlZero(String(playData.score), 8), { size: 40 }),
    ]);

    const combo = playInfo.add([
        k.pos(score.pos.add(k.vec2(0, 40))),
        k.anchor("right"),
        k.text("x" + padlZero(String(playData.combo), 3), { size: 28 }),
    ]);

    function addScore(amount: number, message: string, rail: Rail) {
        const hitPoint = noteHitPoints.children[rail];

        // Combo bonuses
        let comboBonus = 0;
        if (playData.combo >= 10) comboBonus = 10;
        if (playData.combo >= 20) comboBonus = 20;
        if (playData.combo >= 50) comboBonus = 50;
        if (playData.combo >= 100) comboBonus = 100;
        if (playData.combo >= 200) comboBonus = 200;
        if (playData.combo >= 500) comboBonus = 500;
        if (playData.combo >= 1000) comboBonus = 1000;

        // Update texts
        playData.score += amount + comboBonus;
        score.text = padlZero(String(playData.score), 8);

        // Score text
        k.add([
            k.pos(hitPoint.worldPos().add(k.vec2(0, -40))),
            k.anchor("top"),
            k.text(message, { size: 18, align: "center" }),
            k.move(k.UP, 100),
            k.opacity(),
            k.lifespan(0.4, { fade: 0.4 }),
        ]);
    }

    // #endregion

    // Action Points
    const actionPointSize = 60;

    const noteHitPoints = k.add([
        k.pos(k.center()),
        k.anchor("center"),
    ]);

    function addNoteHitPoint(pos: Vec2) {
        const noteHitPoint = noteHitPoints.add([
            k.pos(pos),
            k.z(50),
            k.anchor("center"),
            k.circle(20),
            k.color(k.BLACK),
            k.opacity(0.1),
            k.area({ shape: new k.Rect(k.vec2(0), actionPointSize, actionPointSize) }),
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

    addNoteHitPoint(k.vec2(-100, 0));
    addNoteHitPoint(k.vec2(0, -100));
    addNoteHitPoint(k.vec2(100, 0));

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

    // #region Combo
    function addCombo(amount: number) {
        playData.combo += amount;
        combo.text = "x" + padlZero(String(playData.combo), 5);
    }

    function resetCombo() {
        playData.combo = 0;
        combo.text = "x" + padlZero(String(playData.combo), 5);
        k.shake(1);
    }
    // #endregion

    // #region Song Data
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
    // #endregion

    function hitRail(rail: Rail) {
        const hitPoint = noteHitPoints.children[rail];

        if (gameData.debug) {
            hitPoint.use(k.color(k.RED));
            hitPoint.use(k.opacity(1));

            const cleanUp = k.onUpdate(() => {
                hitPoint.use(k.color(k.BLACK));
                hitPoint.use(k.opacity(0.1));
                cleanUp.cancel();
            });
        }

        const hittedNote = k.get("note").filter((note) => hitPoint.isColliding(note) && note.active)[0];

        if (hittedNote) {
            if (hittedNote.type === "single") {
                hittedNote.removeNote();
            }

            // left notes
            if (rail === 0) {
                const noteDis = hittedNote.worldPos().dist(hitPoint.worldPos());
                if (noteDis > 30) {
                    if (hittedNote.worldPos().x > hitPoint.worldPos().x) addScore(30, "Late", rail);
                    else addScore(30, "Early", rail);
                }
                else if (noteDis < 15) {
                    addScore(100, "Great!", rail);
                    hitPoint.get("corner")[0].playNiceAnim();
                }
                else {
                    addScore(50, "Good", rail)
                };
            }
            // right nots
            else if (rail === 2) {
                const noteDis = hittedNote.worldPos().dist(hitPoint.worldPos());
                if (noteDis > 30) {
                    if (hittedNote.worldPos().x < hitPoint.worldPos().x) addScore(30, "Late", rail);
                    else addScore(30, "Early", rail);
                }
                else if (noteDis < 15) {
                    addScore(100, "Great!", rail);
                    hitPoint.get("corner")[0].playNiceAnim();
                }
                else {
                    addScore(50, "Good", rail)
                };
            }
            // up notes
            else if (rail === 1) {
                const noteDis = hittedNote.worldPos().dist(hitPoint.worldPos());
                if (noteDis > 30) {
                    if (hittedNote.worldPos().y < hitPoint.worldPos().y) addScore(30, "Early", rail);
                    else addScore(30, "Late", rail);
                }
                else if (noteDis < 15) {
                    addScore(100, "Great!", rail);
                    hitPoint.get("corner")[0].playNiceAnim();
                }
                else {
                    addScore(50, "Good", rail)
                };
            }

            if (hittedNote?.id === playData.oldestNote?.id) {
                addCombo(1);
            }
            else {
                resetCombo();
            }

            playData.noteIndex++;
            playData.oldestNote = noteStack[playData.noteIndex];
        }

        // Sword animation
        sword.hit(rail);
    }

    function mantainHitRail(rail: Rail) {
        const hitPoint = noteHitPoints.children[rail];
        const hittedNote = k.get("note").filter((note) => hitPoint.isColliding(note))[0];

        if (hittedNote) {
            if (hittedNote.type === "slider") {
                hittedNote.get("subnote").forEach((subnote) => {

                });
                hittedNote.removeOldestNote();
            }
        }
    }

    function addSingle(rail: Rail) {
        const spawnPoint = spawnPoints.children[rail].worldPos();
        const note = noteSingle(rail, noteVel, spawnPoint);

        note.onUpdate(() => {
            if (note.hasPoint(k.center())) {
                note.destroy();
                if (note.active) {
                    addScore(0, "Miss", rail);
                    resetCombo();
                    playData.noteIndex++;
                    playData.oldestNote = noteStack[playData.noteIndex];
                }
            }
        });

        noteStack.push(note);
        if (!playData.oldestNote) playData.oldestNote = note;

        k.add(note);
        return note;
    }

    function addSlider(rail: Rail) {
        const spawnPoint = spawnPoints.children[rail].worldPos();
        const slider = noteSlider(rail, noteVel, spawnPoint);

        k.add(slider);
        return slider;
    }

    function startSong(songData: Song) {
        const bpm = songData.bpm;
        const bps = bpm / 60;
        const bpms = 1000 / bps;
        const msPerMeasure = bpms * 4 / (4 / 4);
        const distanceOfPoint = ((k.width() / 2) - 100) / noteVel;

        songTitle.text = songData.title;
        songSubtitle.text = songData.subtitle;

        k.wait(songData.offset + distanceOfPoint, () => {
            playingAudio = k.play(songData.sound);
        });

        k.wait(0, () => {
            let curSlider: GameObj | null = null;
            const measures = songData.chart.split(",,");

            measures.forEach((measure, mi) => {
                const chartNotes = measure.split("");
                const msPerNote = msPerMeasure / chartNotes.length;

                waitMs(msPerMeasure * mi, () => {
                    chartNotes.forEach((note, i) => {
                        const numberNote = Number(note);
                        if (numberNote === 0) return;
                        else if (numberNote === 1 || numberNote === 2 || numberNote === 3) {
                            waitMs(msPerNote * (i), () => {
                                addSingle(numberNote - 1 as Rail);
                            });
                        }
                        else if (numberNote === 5 || numberNote === 6 || numberNote === 7) {
                            const sliderRail = numberNote - 5 as Rail;

                            waitMs(msPerNote * (i), () => {
                                curSlider = addSlider(sliderRail);
                            });
                        }
                        else if (numberNote === 8) {
                            waitMs(msPerNote * (i - 1), () => {
                                curSlider?.end();
                            });
                        }
                    });
                });
            });
        });
    }

    k.onUpdate(() => {
        if (k.isKeyPressed("left") || k.isKeyPressed("a")) hitRail(0);
        if (k.isKeyPressed("up") || k.isKeyPressed("w")) hitRail(1);
        if (k.isKeyPressed("right") || k.isKeyPressed("d")) hitRail(2);

        if (k.isKeyDown("left") || k.isKeyDown("a")) mantainHitRail(0);
        if (k.isKeyDown("up") || k.isKeyDown("a")) mantainHitRail(1);
        if (k.isKeyDown("right") || k.isKeyDown("a")) mantainHitRail(2);

        if (k.isKeyPressed("escape")) {
            playingAudio?.stop();
            k.go("song_selection");
        }
    });

    startSong(songData);
});
