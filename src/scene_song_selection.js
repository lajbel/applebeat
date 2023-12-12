import { k } from "../src/main";

const michelle = {
    "name": "Michelle",
    "fileName": "michelle",
    "artist": "Sir Chloe",
    "bpm": 116,
    "notes": "10002100021000210002",
}

const deathByGlamour = {
    "name": "Death by Glamour",
    "fileName": "Mus_ex",
    "offset": -0.13,
    "artist": "Toby Fox",
    "bpm": 148,
    "demoStart": 60,
    "chart": `
0000000000000,
323232,
1001202120020010,
0011200020120000,
1001202120020010,
0011200020020000,
1001201120120010,
0011201110120000,
1001201220120010,
30,
112010,
300,
300,
2000,
100010001000200200200200100100100000000000000000
    `,
}

const koiNoMahou = {
    "name": "Koi no Mahou",
    "fileName": "koi_no_mahou",
    "artist": "ICHIKO",
    "bpm": 152,
    "offset": 1.380,
    "demoStart": 56.464,
    "chart": `
    ,
    1331,
    3130,
    0111,
    1111,
    1112,
    2211,
    3001,
    1110,
    2220,
    1212,
    1212,
    1212,
    30030030,
    0,
    0,
    0,
    1111,
    1012,
    1202,
    1212,
    0121,
    1111,
    0111,
    10020000,
    1112,
    2211,
    30000002,
    1111,
    1111,
    2121,
    00000002,
    1111,
    1111,
    2211,
    1111,
    0,
    1101,
    1101,
    1111,
    1212,
    1002,
    1202,
    1101,
    2222,
    3002,
    1201,
    1120,
    1221,
    3011,
    1210,
    1211,
    2222,
    3333,
    2233,
    0,
    ,       
    `,
}

const snowHalation = {
    "name": "Snow Halation",
    "fileName": "snow_halation",
    "artist": "u's",
    "bpm": 173,
    "offset": -12.596,
    "demoStart": 51.434,
    "chart": `
1,
3,
1,
,
3,
1,
3,
22001100,
12,
1210,
2121,
,
11,
1120,
3,
1000030001002010030,
10003001,
0320,
30002001,
0120,
1313,
10320000,
1313,
10220000,
10101022,
01010105,
000000000000000000000000000000000008000000000000,
30030000,
00101022,
0111,
1500,
000000000000000000000008000000000000000000000000,
00101022,
00000011,
10022005,
000000000000000000000000000000000008000000000000,
00101022,
0111,
1500,
000000000000000000000008000000000000000000000000,
00101022,
00000011,
10022005,
000000000000000000000000000000000008000000000000,
0111,
10220000,
00111010,
11220000,
00111100,
3,
12,
1120,
12,
1120,
12,
1120,
12,
10040000,
1111,
1122,
1111,
2211,
1111,
1122,
1111,
33003300,
0400,
`
}

const songs = [koiNoMahou, snowHalation, deathByGlamour];

export const sceneSongSelection = () => k.scene("song_selection", () => {
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
            k.text(song.name, { size: 28, align: "left" }),
            "song",
            {
                songData: song,
                select() {
                    demoSong = k.play(song.fileName, { loop: true, volume: 0.5, seek: this.songData.demoStart });

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