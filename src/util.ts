import type { SongCourse } from "./types";
import type * as KA from "kaboom";
import { k, gameData } from "./main";
import { TJAParser } from 'tja';

export function waitMs(ms: number, action: () => void) {
    const msToSec = ms / 1000;
    k.wait(msToSec, action);
}

export function loopMs(ms: number, action: () => void) {
    const msToSec = ms / 1000;
    k.loop(msToSec, action);
}

export function padlZero(str: string, len: number) {
    return str.padStart(len, "0");
}

export function complexAdd<T extends KA.Comp, T2>(obj: KA.GameObj<T2>, parent: KA.GameObj | null, comps?: KA.CompList<T>): KA.GameObj<T2> {
    let parentObj = parent ?? k;
    const newObj = parentObj.add(obj);

    if (comps) {
        for (const component of comps) {
            newObj.use(component);
        }
    }

    return newObj;
}

export function loadTJA(tjaPath: string) {
    return k.load(new Promise((resolve, reject) => {
        fetch(tjaPath).then((response) => {
            return response.text();
        }).then(async (text) => {
            try {
                const song = TJAParser.parse(text);
                const commands = song.courses[0].singleCourse.getCommands();
                const chart = commands.toString().replace("#START,", "").replace(",#END", "");
                const soungCourses: SongCourse[] = [];

                song.courses.forEach((course) => {
                    soungCourses.push({
                        difficulty: course.stars,
                        chart: course.singleCourse.getCommands().toString().replace("#START,", "").replace(",#END", ""),
                    });
                });

                if (!song.wave) return reject("No sound file found");
                if (!song.title) return reject("No title found");
                if (!song.subtitle) return reject("No subtitle found");
                if (!song.genre) return reject("No genre found");
                if (!song.bpm) return reject("No BPM found");

                await k.loadSound(song.wave.slice(0, -3), `sounds/music/${song.wave}`);

                gameData.songs.push({
                    title: song.title,
                    subtitle: song.subtitle,
                    genre: song.genre,
                    bpm: song.bpm,
                    offset: song.offset,
                    demoStart: song.demoStart,
                    chart: chart,
                    sound: song.wave.slice(0, -3),
                    courses: soungCourses,
                });

                resolve(song);
            }
            catch (e) {
                reject("Error parsing TJA file");
            }
        });
    }));
}