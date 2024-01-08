import type { StartCommand, Command, EndCommand, MeasureCommand, GoGoEndCommand, GoGoStartCommand, ScrollCommand, DelayCommand, NoteSequence } from "tja";
export type { CommandType } from "tja";

// Type functions
export function isStartCommand(cmd: Command): cmd is StartCommand {
    return cmd.commandType === "START";
}
export function isEndCommand(cmd: Command): cmd is EndCommand {
    return cmd.commandType === "END";
}
export function isMeasureCommand(cmd: Command): cmd is MeasureCommand {
    return cmd.commandType === "MEASURE";
}
export function isGoGoEndCommand(cmd: Command): cmd is GoGoEndCommand {
    return cmd.commandType === "GOGOEND";
}
export function isGoGoStartCommand(cmd: Command): cmd is GoGoStartCommand {
    return cmd.commandType === "GOGOSTART";
}
export function isScrollCommand(cmd: Command): cmd is ScrollCommand {
    return cmd.commandType === "SCROLL";
}
export function isDelayCommand(cmd: Command): cmd is DelayCommand {
    return cmd.commandType === "DELAY";
}
export function isNoteSequence(cmd: Command): cmd is NoteSequence {
    return cmd.commandType === "__NOTESEQUENCE";
}


// Types
export type Rail = 0 | 1 | 2;

export type Song = {
    title: string,
    subtitle: string,
    genre: string,
    bpm: number,
    offset: number,
    demoStart: number,
    chart: Command[],
    sound: string,
    courses: SongCourse[],
}

export type SongCourse = {
    difficulty: number,
    chart: Command[],
}

export type NoteType = "single" | "slider";