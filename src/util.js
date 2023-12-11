import { k } from "../src/main.js";

export function waitMs(ms, action) {
    const msToSec = ms / 1000;

    k.wait(msToSec, action);
}

export function loopMs(ms, action) {
    const msToSec = ms / 1000;

    k.loop(msToSec, action);
}