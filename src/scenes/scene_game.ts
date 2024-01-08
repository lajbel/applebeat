import type { AudioPlay, GameObj, Vec2 } from "kaboom";
import type { Rail, Song } from "../types";
import { gameData, k } from "../main";
import { isNoteSequence, isStartCommand, isEndCommand, isMeasureCommand, isScrollCommand } from "../types";
import { PlayState } from "../classes/PlayState";
import { playerObj } from "../objects/game/obj_player";
import { backgroundObj } from "../objects/game/obj_background";
import { swordObj } from "../objects/game/obj_sword";
import { noteSliderObj, noteSingleObj } from "../objects/game/obj_note";
import { playInfoObj } from "../objects/game/obj_play_info";
import { hitPointObj } from "../objects/game/obj_hit_point";
import { waitMs } from "../util";
import { hitPointDistance } from "../config";

export const loadGameScene = () => k.scene("game", (songData) => {
    const playData = new PlayState();
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
        k.pos(k.center().x, 100),
        k.anchor("center"),
        k.text("", { size: 26 }),
        k.opacity(),
        k.lifespan(1, { fade: 1 }),
    ]);

    const songSubtitle = songTitle.add([
        k.pos(0, 50),
        k.anchor("center"),
        k.opacity(),
        k.text("", { size: 22 }),
        k.lifespan(1, { fade: 1 })
    ]);

    const noteHitPoints = k.add([
        k.pos(k.center()),
        k.anchor("center"),
    ]);

    noteHitPoints.add(hitPointObj(k.vec2(-hitPointDistance, 0)));
    noteHitPoints.add(hitPointObj(k.vec2(0, -hitPointDistance)));
    noteHitPoints.add(hitPointObj(k.vec2(hitPointDistance, 0)));

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

    function registerMiss(rail: Rail) {
        k.shake(4);
        addScore(0, "Miss", rail);
        playData.noteIndex++;
        playData.oldestNote = noteStack[playData.noteIndex];
        playData.health--;
        playData.combo = 0;
        playInfo.updateHealth(playData.health);
        playInfo.setCombo(playData.combo);
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

        if (hittedNote?.id === playData.oldestNote?.id) {
            addCombo(1);
        }

        playData.noteIndex++;
        playData.oldestNote = noteStack[playData.noteIndex];
    }

    function onHitUpdate(rail: Rail) {
        // Nothing for now
    }

    function onHitEnd(rail: Rail) {
        const hitPoint = noteHitPoints.children[rail];
        const unhittedNote = k.get("note").filter((note) => hitPoint.isColliding(note))[0];

        if (!unhittedNote) return;
        if (unhittedNote.type === "slider") {
            unhittedNote.enterState("miss");
        }
    }

    function addSingle(rail: Rail, velMultiplier = 1) {
        const railPoint = railPoints.children[rail].worldPos();
        const single = noteSingleObj(rail, noteVel * velMultiplier, railPoint, 0);

        // Note hit
        single.onStateEnter("hit", () => {
            playInfo.addNote("single");
        });

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

    function addSlider(rail: Rail, velMultiplier = 1) {
        const railPoint = railPoints.children[rail].worldPos();
        const slider = noteSliderObj(rail, noteVel * velMultiplier, railPoint, 0);

        slider.on("subnote_destroy", () => {
            playInfo.addNote("slider");
        });

        slider.onUpdate(() => {
            if (slider.state === "active" && slider.hasPoint(k.center())) {
                slider.enterState("miss");
                registerMiss(rail);
            }
        });

        noteStack.push(slider);
        if (!playData.oldestNote) playData.oldestNote = slider;

        k.add(slider);
        return slider;
    }

    function startGame(songData: Song) {
        const bpm = songData.bpm;
        const defaultMeasure = 4 / 4;
        const getDistanceTimeOfHitPoint = () => ((k.width() / 2) - hitPointDistance) / (noteVel * scrollSpeed);
        console.log(songData.offset);
        let scrollSpeed = 1;
        let musicOffset = songData.offset >= 0 ? songData.offset : 0;
        let notesOffset = songData.offset < 0 ? -songData.offset : 0;

        console.log(musicOffset, notesOffset)

        songTitle.text = songData.title;
        songSubtitle.text = songData.subtitle;


        k.wait(musicOffset + getDistanceTimeOfHitPoint(), () => {
            playingAudio = k.play(songData.sound);
        });

        k.wait(notesOffset, () => {
            const chartCommands = songData.chart;
            const msPerMeasure = () => 60000 * measure * 4 / bpm;
            let measure = defaultMeasure;
            let measureIndex = 0;
            let musicDuration = k.play(songData.sound, { volume: 0 }).duration();
            let curSlider: GameObj | null = null;

            chartCommands.forEach((chartCommand) => {
                if (isNoteSequence(chartCommand)) {
                    waitMs(msPerMeasure() * measureIndex, () => {
                        let noteCount = 0;
                        if (chartCommand.notes.length === 1) noteCount = chartCommand.notes.length;
                        else noteCount = chartCommand.notes.length - 1;

                        const msPerNote = msPerMeasure() / noteCount;

                        chartCommand.notes.forEach((note, ni) => {
                            if (note.noteType == "1" || note.noteType == "2" || note.noteType == "3") {
                                waitMs(msPerNote * ni, () => {
                                    addSingle(Number(note.noteType) - 1 as Rail, scrollSpeed);
                                });
                            }
                            else if (note.noteType == "5" || note.noteType == "6" || note.noteType == "7") {
                                const sliderRail = (Number(note.noteType) - 5) as Rail;

                                waitMs(msPerNote * ni, () => {
                                    curSlider = addSlider(sliderRail, scrollSpeed);
                                });
                            }
                            else if (note.noteType == "8") {
                                waitMs(msPerNote * ni, () => {
                                    curSlider?.end();
                                });
                            }
                        });
                    });

                    measureIndex++;
                }
                else if (isMeasureCommand(chartCommand)) {
                    measure = chartCommand.value.fraction;
                }
                else if (isScrollCommand(chartCommand)) {
                    scrollSpeed = chartCommand.value;
                }
            });

            k.wait(musicDuration, () => {
                k.debug.log("music finished");
            });
        });
    }

    function exitGame() {
        playingAudio?.stop();
        k.go("song_selection");
    }

    // Input
    k.onUpdate(() => {
        if (k.areKeysPressed(["left", "a"])) onHitRail(0);
        if (k.areKeysPressed(["up", "w"])) onHitRail(1);
        if (k.areKeysPressed(["right", "d"])) onHitRail(2);

        if (k.areKeysDown(["left", "a"])) onHitUpdate(0);
        if (k.areKeysDown(["up", "a"])) onHitUpdate(1);
        if (k.areKeysDown(["right", "a"])) onHitUpdate(2);

        if (k.areKeysReleased(["left", "a"])) onHitEnd(0);
        if (k.areKeysReleased(["up", "a"])) onHitEnd(1);
        if (k.areKeysReleased(["right", "a"])) onHitEnd(2);

        if (k.isKeyPressed("escape")) exitGame();
    });

    if (k.isTouchscreen()) {
        const leftArea = k.add([
            k.pos(0, k.center().y),
            k.area({ shape: new k.Rect(k.vec2(0), k.width() / 2, k.height() / 2) }),
        ]);

        const rightArea = k.add([
            k.pos(k.center()),
            k.area({ shape: new k.Rect(k.vec2(0), k.width() / 2, k.height() / 2) }),
        ]);

        const topArea = k.add([
            k.area({ shape: new k.Rect(k.vec2(0), k.width(), k.height() / 2) }),
        ]);

        k.onMousePress(() => {
            if (leftArea.hasPoint(k.mousePos())) onHitRail(0);
            if (topArea.hasPoint(k.mousePos())) onHitRail(1);
            if (rightArea.hasPoint(k.mousePos())) onHitRail(2);
        });

        k.onMouseMove(() => {
            if (leftArea.hasPoint(k.mousePos())) onHitUpdate(0);
            if (topArea.hasPoint(k.mousePos())) onHitUpdate(1);
            if (rightArea.hasPoint(k.mousePos())) onHitUpdate(2);
        });

        k.onMouseRelease(() => {
            if (leftArea.hasPoint(k.mousePos())) onHitEnd(0);
            if (topArea.hasPoint(k.mousePos())) onHitEnd(1);
            if (rightArea.hasPoint(k.mousePos())) onHitEnd(2);
        });
    }

    // Start the game
    startGame(songData);
});
