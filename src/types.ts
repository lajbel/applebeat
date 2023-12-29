export type Song = {
    title: string,
    subtitle: string,
    genre: string,
    bpm: number,
    offset: number,
    demoStart: number,
    chart: string,
    sound: string,
    courses: SongCourse[],
}

export type SongCourse = {
    difficulty: number,
    chart: string,
}

export type UserSettings = {
    demoMusic: boolean,
    volume: number,
}

export type Rail = 0 | 1 | 2;