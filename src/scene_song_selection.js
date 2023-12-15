import { k, gameData } from "./main";

export const sceneSongSelection = () => k.scene("song_selection", () => {
    const songs = gameData.songs;
    console.log(songs);
    let selectedSong = 0;
    let demoSong = null;

    k.add([
        k.pos(0),
        k.rect(k.width(), k.height()),
        k.color("ee8fcb"),
    ]);

    k.add([
        k.pos(k.center().x, 90),
        k.anchor("center"),
        k.text("AppleBeat", { size: 32 }),
    ]);

    k.add([
        k.pos(10, k.height() - 10),
        k.anchor("botleft"),
        k.text("AppleBeat 1.1.0 - 12/11/2023 - dev by lajbel", { size: 18 })
    ]);

    // Song List
    songs.forEach((song, i) => {
        k.add([
            k.pos(40, 290 + (i * 40)),
            k.anchor("left"),
            k.text(song.title, { size: 28, align: "left" }),
            "song",
            {
                songData: song,
                select() {
                    demoSong = k.play(song.sound, { loop: true, volume: 0.5, seek: this.songData.demoStart });

                    k.tween(this.pos.x, 70, 0.2, (v) => {
                        this.pos.x = v;
                    }, k.easings.easeInOutQuad);
                },
                unselect() {
                    demoSong?.stop();

                    k.tween(this.pos.x, 40, 0.2, (v) => {
                        this.pos.x = v;
                    }, k.easings.easeInOutQuad);
                }
            }
        ]);
    });

    // Arrow
    const arrow = k.add([
        k.pos(k.center().x + 200, 290),
        k.anchor("center"),
        k.text("<"),
        "arrow",
    ]);

    // Input
    k.onUpdate(() => {
        if (k.isKeyPressed("down")) {
            k.get("song")[selectedSong].unselect();
            selectedSong = (selectedSong + 1) % songs.length;
            k.get("song")[selectedSong].select();
            arrow.pos = k.vec2(k.center().x + 200, 290 + (selectedSong * 40));
        }
        if (k.isKeyPressed("up")) {
            k.get("song")[selectedSong].unselect();
            selectedSong = (selectedSong - 1 + songs.length) % songs.length
            k.get("song")[selectedSong].select();
            arrow.pos = k.vec2(k.center().x + 200, 290 + (selectedSong * 40));
        }
        if (k.isKeyPressed("enter")) {
            demoSong?.stop();
            k.go("game", songs[selectedSong]);
        }
    });

    // Select the first song
    k.get("song")[selectedSong].select();
});