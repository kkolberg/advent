import * as bluebird from 'bluebird';

import { Mine } from './dayThirteen';

const AStar = require('a-star');
export interface Spot { x: number; y: number; }
export interface Creature {
    hp: number;
    type: string;
    id: number;
    round: number;
    location: Spot;
}

export class DnD {
    public static fs = bluebird.Promise.promisifyAll(require('fs'));
    public static Creatures: { [id: string]: Creature } = {};
    public static Mine: string[][] = [];

    public static run = async (): Promise<string> => {
        DnD.Mine = await DnD.getMine();
        let final = "";
        let round = 0;
        let stop = false;
        while (!stop && round < 30) {
            round++;

            for (let y = 0; y < DnD.Mine.length; y++) {
                for (let x = 0; x < DnD.Mine[y].length; x++) {
                    if (["", "#", "."].indexOf(DnD.Mine[y][x]) > -1) {
                        continue;
                    }
                    let c = DnD.Creatures[DnD.Mine[y][x]];
                    if (c.hp < 1) {
                        DnD.Mine[y][x] = '.';
                        delete DnD.Creatures[c.id];
                    }

                    if (c.round === round) {
                        continue;
                    }

                    c.round = round;

                    let ids = DnD.FindEnemies(c);
                    if (ids.length === 0) {
                        stop = true;
                        break;
                    }

                    let bestStep = null as any;
                    let bestE: Creature = null as any;
                    let bestDistance = Number.MAX_SAFE_INTEGER;
                    ids.forEach((e) => {
                        let newE = DnD.Creatures[e];
                        let paths = DnD.getPath(c, newE);
                        if (paths.distance < 0) {
                            return;
                        }

                        let best = paths.paths.sort(DnD.sort)[0];

                        if (!bestE || paths.distance < bestDistance) {
                            bestE = newE;
                            bestStep = best;
                            bestDistance = paths.distance;
                            return;
                        }
                        if (bestDistance === paths.distance) {
                            if (newE.hp < bestE.hp) {
                                bestE = newE;
                                bestStep = best;
                                bestDistance = paths.distance;

                            }
                            return;
                        }
                        if (paths.distance !== bestDistance || newE.location.y > bestE.location.y) {
                            return;
                        }
                        if (newE.location.y < bestE.location.y) {
                            bestE = newE;
                            bestStep = best;
                            bestDistance = paths.distance;
                            return;
                        }
                        if (newE.location.x < bestE.location.x) {
                            bestE = newE;
                            bestStep = best;
                            bestDistance = paths.distance;
                            return;
                        }
                    });

                    if (!bestE) {
                        continue;
                    }

                    if (bestStep && bestDistance > 0) {
                        DnD.Mine[y][x] = '.';
                        DnD.Mine[bestStep.y][bestStep.x] = c.id.toString();
                        c.location = bestStep;
                    }

                    if (bestDistance < 2) {
                        DnD.Creatures[bestE.id].hp -= 3;
                        if (DnD.Creatures[bestE.id].hp < 1) {
                            DnD.Mine[bestE.location.y][bestE.location.x] = '.';
                            delete DnD.Creatures[bestE.id.toString()];
                        }
                    }
                }

                if (stop) {
                    break;
                }
            }

            DnD.killDead();
            let types = new Set();
            Object.entries(DnD.Creatures).forEach((c) => types.add(c[1].type));
            if ([...types].length === 1) {
                stop = true;
            }

            final += DnD.print(round) + "\n";
        }

        await DnD.fs.writeFileAsync("input/dndMap.txt", final);
        let hp = Object.entries(DnD.Creatures).reduce((sum, x) => sum + x[1].hp, 0);
        round--;
        console.log("round: " + round.toString() + " hp: " + hp.toString());
        return (round * hp).toString();
    }

    public static killDead = (): void => {
        let ids = Object.keys(DnD.Creatures).filter((key) => {
            return DnD.Creatures[key].hp < 1;
        });

        ids.forEach((key) => {
            delete DnD.Creatures[key];
        })
    }

    public static getPath = (c: Creature, e: Creature): { distance: number, paths: Spot[] } => {
        let mine = DnD.Mine.map((y) => {
            return y.map((x) => {
                return x;
            })
        });

        let neighbors = DnD.getOptions(e.location, e.location, mine);
        let step = 1;
        while (neighbors.length > 0) {
            neighbors.forEach((x) => {
                mine[x.y][x.x] = step.toString();
            });
            let newN: Spot[] = [];
            neighbors.forEach((x) => {
                DnD.getOptions(x, x, mine).forEach((y) => newN.push(y));
            });
            neighbors = newN;
            step++;
        }
        let best = -1;
        let found: Spot[] = [];
        neighbors = DnD.getRoutes(c.location, e.location, mine);
        let actual = false;
        neighbors.forEach((n) => {
            let v = Number(mine[n.y][n.x]);
            if (v === e.id) {
                actual = true;
            }
            if (isNaN(v)) {
                return;
            }

            if (best === -1 || v < best) {
                best = v;
            }
            found.push(n);
        });

        if (actual) {
            return {
                distance: 0,
                paths: []
            };
        }

        found = found.filter((n) => mine[n.y][n.x] === best.toString());

        return {
            distance: best,
            paths: found
        };
    }

    public static FindNextStep = (npc: Creature, enemies: number[]) => {

    }

    public static FindEnemies = (npc: Creature): string[] => {
        return Object.entries(DnD.Creatures).filter((e) => e[1].type !== npc.type).map((e) => e[0]);
    }

    public static sort = (a: Creature | { x: number, y: number }, b: Creature | { x: number, y: number }): number => {
        let aLoc = (a as any).location || a;
        let bLoc = (b as any).location || b;
        let y = aLoc.y - bLoc.y;
        if (y !== 0) {
            return y;
        }

        return aLoc.x - bLoc.x;
    }

    public static getOptions = (spot: Spot, target: Spot, mine: string[][]): Spot[] => {
        let spots: Spot[] = [];
        let y = spot.y;
        let x = spot.x;

        let match = (o: Spot) => {
            return o.x === target.x && o.y === target.y;
        }

        //down
        if (mine[y + 1] && (mine[y + 1][x] === "." || match({ y: y + 1, x }))) {
            spots.push({ x: x, y: y + 1 });
        }

        //right
        if (mine[y][x + 1] === "." || match({ y, x: x + 1 })) {
            spots.push({ x: x + 1, y: y });
        }

        //left
        if (mine[y][x - 1] === "." || match({ y, x: x - 1 })) {
            spots.push({ x: x - 1, y: y });
        }

        //up
        if (mine[y - 1] && (mine[y - 1][x] === "." || match({ y: y - 1, x }))) {
            spots.push({ x: x, y: y - 1 });
        }
        return spots;
    }

    public static getRoutes = (spot: Spot, target: Spot, mine: string[][]): Spot[] => {
        let spots: Spot[] = [];
        let y = spot.y;
        let x = spot.x;

        let match = (o: Spot) => {
            return o.x === target.x && o.y === target.y;
        }

        //down
        if (mine[y + 1] || match({ y: y + 1, x })) {
            let b = Number(mine[y + 1][x]);
            if (!isNaN(b) && b > -1) {
                spots.push({ x: x, y: y + 1 });
            }
        }

        //right
        if (mine[y][x + 1] || match({ y, x: x + 1 })) {
            let b = Number(mine[y][x + 1]);
            if (!isNaN(b) && b > -1) {
                spots.push({ x: x + 1, y: y });
            }
        }

        //left
        if (mine[y][x - 1] || match({ y, x: x - 1 })) {
            let b = Number(mine[y][x - 1]);
            if (!isNaN(b) && b >-1) {
                spots.push({ x: x - 1, y: y });
            }
        }

        //up
        if (mine[y - 1] && (mine[y - 1][x] || match({ y: y - 1, x }))) {
            let b = Number(mine[y - 1][x]);
            if (!isNaN(b) && b > -1) {
                spots.push({ x: x, y: y - 1 });
            }
        }
        return spots;
    }


    public static print = (round: number): string => {
        let out = DnD.Mine.map((y) => {
            let row = y.join('');
            let hp: string[] = [];
            Object.entries(DnD.Creatures).forEach((c) => {
                if (row.indexOf(c[0]) > -1) {
                    hp.push(c[1].type + "(" + c[1].hp.toString() + ")");
                }
                row = row.replace(c[0], c[1].type);
            })
            return row + "   " + hp.join(",");
        });
        let final = round.toString() + "\n" + out.join("\n");

        return final;
    }

    public static getMine = async (): Promise<string[][]> => {
        let raw: string = await DnD.fs.readFileAsync("input/dayFifteen.txt", { encoding: "utf8" });
        let cleaned = raw.split("\n");
        let e = -10;
        let map: string[][] = cleaned.map((row, y) => {
            let yv = row.split('');
            return yv.map((xv, x) => {
                if (xv === "E" || xv === "G") {
                    e--;
                    let c: Creature = {
                        hp: 200,
                        type: xv,
                        id: e,
                        round: 0,
                        location: { x: x, y }
                    };
                    DnD.Creatures[e.toString()] = c;
                    return e.toString();
                }
                return xv;
            });
        });

        return map;
    }

}