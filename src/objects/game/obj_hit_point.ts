import type { Vec2 } from "kaboom";
import { k } from "../../main";
import { doubleTween } from "../../util";

const hitPointSize = 60;

export const hitPointObj = (pos: Vec2) => {
    const noteHitPoint = k.make([
        k.pos(pos),
        k.z(50),
        k.anchor("center"),
        k.circle(20),
        k.color(k.BLACK),
        k.opacity(0.1),
        k.area({ shape: new k.Rect(k.vec2(0), hitPointSize, hitPointSize) }),
        {
            greatHit() {
                for (let i = 0; i < 3; i++) {
                    const hitParticle = this.add([
                        k.pos(),
                        k.anchor("center"),
                        k.scale(0.5),
                        k.sprite("star"),
                        k.lifespan(0.2, { fade: 0.2 }),
                    ]);

                    let gotoX = 0;

                    if (i === 0) gotoX = -100;
                    if (i === 1) gotoX = 0;
                    if (i === 2) gotoX = 100;

                    doubleTween(hitParticle.pos.x, gotoX, 0.2, (v) => hitParticle.pos.x = v, k.easings.linear);
                    doubleTween(hitParticle.pos.y, hitParticle.pos.y + -100, 0.2, (v) => hitParticle.pos.y = v, k.easings.linear);
                }
            }
        }
    ]);

    return noteHitPoint;
}