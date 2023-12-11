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


const songs = [koiNoMahou, deathByGlamour];

export const sceneSongSelection = () => k.scene("song_selection", () => {
    let selectedSong = 0;

    k.add([
        k.pos(0),
        k.rect(k.width(), k.height()),
        k.color("ee8fcb"),
    ]);

    k.add([
        k.pos(k.center().x, 90),
        k.anchor("center"),
        k.text("AppleBeat ALPHA 0", { size: 32 }),
    ]);

    // Song List
    songs.forEach((song, i) => {
        k.add([
            k.pos(k.center().x, 290 + (i * 40)),
            k.anchor("center"),
            k.text(song.name, { size: 28 }),
            "song",
            {
                songData: song,
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
            selectedSong = (selectedSong + 1) % songs.length;
            arrow.pos = k.vec2(k.center().x + 200, 290 + (selectedSong * 40));
        }
        if (k.isKeyPressed("up")) {
            selectedSong = (selectedSong - 1 + songs.length) % songs.length
            arrow.pos = k.vec2(k.center().x + 200, 290 + (selectedSong * 40));
        }
        if (k.isKeyPressed("enter")) {
            k.go("game", songs[selectedSong]);
        }
    });
});