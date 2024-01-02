import type { AudioPlay, GameObj, Vec2 } from "kaboom";
import type { Rail, Song } from "../types";
import { gameData, k } from "../main";
import { waitMs } from "../util";
import { PlayData } from "../classes/playData";
import { playerObj } from "../objects/game/obj_player";
import { backgroundObj } from "../objects/game/obj_background";
import { swordObj } from "../objects/game/obj_sword";
import { noteSliderObj, noteSingleObj } from "../objects/game/obj_note";
import { playInfoObj } from "../objects/game/obj_play_info";
import { hitPointObj } from "../objects/game/obj_hit_point";

export const loadGameScene = () => k.scene("game", (songData) => {
    const playData = new PlayData();
    const noteStack: GameObj[] = [];
    const noteVel = 400;
    const hitPointSize = 60;
    let playingAudio: AudioPlay | null = null;

    k.layers([
        "background",
        "note",
        "player",
        "sword",
        "default",
        "ui",
    ], "default");

    const background = k.add(backgroundObj("#ee8fcb"));
    const player = k.add(playerObj());
    const sword = player.add(swordObj());
    const playInfo = k.add(playInfoObj());

    const songTitle = k.add([
        k.pos(k.center()),
        k.anchor("center"),
        k.text("", { size: 26 }),
        k.lifespan(1, { fade: 1 }),
    ]);

    const songSubtitle = songTitle.add([
        k.pos(0, 100),
        k.anchor("center"),
        k.text("", { size: 22 }),
    ]);

    const noteHitPoints = k.add([
        k.pos(k.center()),
        k.anchor("center"),
    ]);

    noteHitPoints.add(hitPointObj(k.vec2(-100, 0)));
    noteHitPoints.add(hitPointObj(k.vec2(0, -100)));
    noteHitPoints.add(hitPointObj(k.vec2(100, 0)));

    const railPoints = k.add([
        k.pos(k.center()),
        k.anchor("center"),
    ]);
    railPoints.add([
        k.pos(-k.width() / 2, 0),
        k.anchor("center"),
    ]);
    railPoints.add([
        k.pos(0, -k.height() / 2),
        k.anchor("center"),
    ]);
    railPoints.add([
        k.pos(k.width() / 2, 0),
        k.anchor("center"),
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
        playInfo.setScore(playData.score);

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

    function addCombo(amount: number) {
        playData.combo += amount;
        playInfo.setCombo(playData.combo);
    }

    function resetCombo() {
        playData.combo = 0;
        playInfo.setCombo(playData.combo);
        k.shake(1);
    }

    function registerMiss(rail: Rail) {
        addScore(0, "Miss", rail);
        playData.noteIndex++;
        playData.oldestNote = noteStack[playData.noteIndex];
    }

    function onHitRail(rail: Rail) {
        const hitPoint = noteHitPoints.children[rail];
        const hittedNote = k.get("note").filter((note) => hitPoint.isColliding(note) && note.state === "active")[0];

        // Sword animation
        sword.hit(rail);

        if (gameData.debug) {
            hitPoint.use(k.color(k.RED));
            hitPoint.use(k.opacity(1));

            const cleanUp = k.wait(0.05, () => {
                hitPoint.use(k.color(k.BLACK));
                hitPoint.use(k.opacity(0.1));
                cleanUp.cancel();
            });
        }

        if (!hittedNote) return;
        hittedNote.enterState("hit");

        const noteDis = hittedNote.worldPos().dist(hitPoint.worldPos());

        // Aplicate score
        if (noteDis > 30) {
            if (rail === 0) {
                if (hittedNote.worldPos().x > hitPoint.worldPos().x) addScore(30, "Late", rail);
                else addScore(30, "Early", rail);
            }
            else if (rail === 1) {
                if (hittedNote.worldPos().y < hitPoint.worldPos().y) addScore(30, "Early", rail);
                else addScore(30, "Late", rail);
            }
            else if (rail === 2) {
                if (hittedNote.worldPos().x < hitPoint.worldPos().x) addScore(30, "Late", rail);
                else addScore(30, "Early", rail);
            }
        }
        else if (noteDis < 15) {
            addScore(100, "Great!", rail);
            hitPoint.greatHit();
        }
        else {
            addScore(50, "Good", rail)
        };

        if (hittedNote?.id === playData.oldestNote?.id) addCombo(1);
        else resetCombo();

        playData.noteIndex++;
        playData.oldestNote = noteStack[playData.noteIndex];
    }

    function onHitUpdate(rail: Rail) { }

    function onHitEnd(rail: Rail) {
        const hitPoint = noteHitPoints.children[rail];
        const unhittedNote = k.get("note").filter((note) => hitPoint.isColliding(note))[0];

        if (!unhittedNote) return;

        if (unhittedNote.type === "slider") {
            unhittedNote.enterState("miss");
        }
    }

    function addSingle(rail: Rail) {
        const railPoint = railPoints.children[rail].worldPos();
        const single = noteSingleObj(rail, noteVel, railPoint);

        // Check for note miss
        single.onUpdate(() => {
            if (single.state === "active" && single.hasPoint(k.center())) {
                single.enterState("miss");
                registerMiss(rail);
            }
        });

        // Add notes to the stack and update note needed for combo
        noteStack.push(single);
        if (!playData.oldestNote) playData.oldestNote = single;

        k.add(single);
        return single;
    }

    function addSlider(rail: Rail) {
        const railPoint = railPoints.children[rail].worldPos();
        const slider = noteSliderObj(rail, noteVel, railPoint);

        slider.onUpdate(() => {
            if (slider.active && slider.hasPoint(k.center())) {
                slider.enterState("miss");
                registerMiss(rail);
            }
        });

        noteStack.push(slider);
        if (!playData.oldestNote) playData.oldestNote = slider;

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

    function exitGame() {
        playingAudio?.stop();
        k.go("song_selection");
    }

    k.onUpdate(() => {
        if (k.isKeyPressed("left") || k.isKeyPressed("a")) onHitRail(0);
        if (k.isKeyPressed("up") || k.isKeyPressed("w")) onHitRail(1);
        if (k.isKeyPressed("right") || k.isKeyPressed("d")) onHitRail(2);

        if (k.isKeyDown("left") || k.isKeyDown("a")) onHitUpdate(0);
        if (k.isKeyDown("up") || k.isKeyDown("a")) onHitUpdate(1);
        if (k.isKeyDown("right") || k.isKeyDown("a")) onHitUpdate(2);

        if (k.isKeyReleased("left") || k.isKeyReleased("a")) onHitEnd(0);
        if (k.isKeyReleased("up") || k.isKeyReleased("a")) onHitEnd(1);
        if (k.isKeyReleased("right") || k.isKeyReleased("a")) onHitEnd(2);

        if (k.isKeyPressed("escape")) exitGame();
    });

    startSong(songData);
});
