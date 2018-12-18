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
    public static Creatures: Creature[] = [];
    public static Mine: string[][] = [];
    public static attack = 23;
    public static runBetter = async (): Promise<string> => {
        DnD.Mine = await DnD.getMine();
        let final = "";
        let round = 0;
        let stop = false;
        let fullRound = true;

        while (!stop && round < 50000) {
            round++;
            DnD.Creatures.sort(DnD.sort);
            DnD.Creatures.forEach((c) => {
                if (c.hp < 1) {
                    DnD.Mine[c.location.y][c.location.x] = ".";
                    return;
                }

                let enemySpots: { e: Creature, s: Spot }[] = [];
                let enemies = DnD.FindEnemies(c);
                if (enemies.length === 0) {
                    fullRound = false;
                }
                enemies.forEach((e) => {
                    DnD.getOptions(e.location, c.location, DnD.Mine).forEach((s) => enemySpots.push({ e, s }));
                });

                let options: { e: Creature, s: Spot, p: Spot, distance: number }[] = [];
                enemySpots.forEach((es) => {
                    let paths = DnD.getPath(c, es.s);
                    if (paths.distance === -1) {
                        return;
                    }
                    options.push({ e: es.e, s: es.s, p: paths.path, distance: paths.distance });
                });

                if (options.length === 0) {
                    return;
                }

                options.sort((a, b) => {
                    let d = a.distance - b.distance;
                    if (d !== 0) {
                        return d;
                    }
                    let y = a.s.y - b.s.y;
                    if (y !== 0) {
                        return y;
                    }
                    return a.s.x - b.s.x;
                });

                DnD.Mine[c.location.y][c.location.x] = ".";
                c.location = options[0].p;
                DnD.Mine[c.location.y][c.location.x] = c.type;

                let targets: Creature[] = DnD.getTargets(c, DnD.Mine).map((t) => {
                    return DnD.Creatures.find((e) => {
                        return e.location.y === t.y && e.location.x === t.x;
                    });
                }).filter((e) => e) as Creature[];
                if (targets.length === 0) {
                    return;
                }
                targets.sort((a, b) => {
                    let hp = a.hp - b.hp;
                    if (hp !== 0) {
                        return hp;
                    }
                    let y = a.location.y - b.location.y;
                    if (y !== 0) {
                        return y;
                    }
                    return a.location.x - b.location.x;

                });

                targets[0].hp -= (targets[0].type === "G" ? DnD.attack : 3);

                if (targets[0].hp < 1) {
                    DnD.Mine[targets[0].location.y][targets[0].location.x] = ".";
                }
            });

            DnD.killDead();
            let types = new Set();
            Object.entries(DnD.Creatures).forEach((c) => types.add(c[1].type));
            if ([...types].length === 1) {
                stop = true;
            }
            console.log(round);
            //   await DnD.fs.writeFileAsync("input/dnd/" + round, DnD.print(round));
        }

        await DnD.fs.writeFileAsync("input/dndMap.txt", DnD.print(round));
        let hp = Object.entries(DnD.Creatures).reduce((sum, x) => sum + x[1].hp, 0);
        if (!fullRound) {
            round--;
        }
        console.log("round: " + round.toString() + " hp: " + hp.toString());
        return (round * hp).toString();
    }

    public static run = async (): Promise<string> => {
        DnD.Mine = await DnD.getMine();
        let final = "";
        let round = 0;
        let stop = false;
        let fullRound = true;
        while (!stop && round < 50000) {
            round++;
            DnD.Creatures.sort(DnD.sort);
            DnD.Creatures.forEach((c) => {
                if (c.hp < 1) {
                    DnD.Mine[c.location.y][c.location.x] = ".";
                    return;
                }

                let enemySpots: { e: Creature, s: Spot }[] = [];
                let enemies = DnD.FindEnemies(c);
                if (enemies.length === 0) {
                    fullRound = false;
                }
                enemies.forEach((e) => {
                    DnD.getOptions(e.location, c.location, DnD.Mine).forEach((s) => enemySpots.push({ e, s }));
                });

                let options: { e: Creature, s: Spot, p: Spot, distance: number }[] = [];
                enemySpots.forEach((es) => {
                    let paths = DnD.getPath(c, es.s);
                    if (paths.distance === -1) {
                        return;
                    }
                    options.push({ e: es.e, s: es.s, p: paths.path, distance: paths.distance });
                });

                if (options.length === 0) {
                    return;
                }

                options.sort((a, b) => {
                    let d = a.distance - b.distance;
                    if (d !== 0) {
                        return d;
                    }
                    let y = a.s.y - b.s.y;
                    if (y !== 0) {
                        return y;
                    }
                    return a.s.x - b.s.x;
                });

                DnD.Mine[c.location.y][c.location.x] = ".";
                c.location = options[0].p;
                DnD.Mine[c.location.y][c.location.x] = c.type;

                let targets: Creature[] = DnD.getTargets(c, DnD.Mine).map((t) => {
                    return DnD.Creatures.find((e) => {
                        return e.location.y === t.y && e.location.x === t.x;
                    });
                }).filter((e) => e) as Creature[];
                if (targets.length === 0) {
                    return;
                }
                targets.sort((a, b) => {
                    let hp = a.hp - b.hp;
                    if (hp !== 0) {
                        return hp;
                    }
                    let y = a.location.y - b.location.y;
                    if (y !== 0) {
                        return y;
                    }
                    return a.location.x - b.location.x;

                });

                targets[0].hp -= 3;

                if (targets[0].hp < 1) {
                    DnD.Mine[targets[0].location.y][targets[0].location.x] = ".";
                }
            });

            DnD.killDead();
            let types = new Set();
            Object.entries(DnD.Creatures).forEach((c) => types.add(c[1].type));
            if ([...types].length === 1) {
                stop = true;
            }
            console.log(round);
            await DnD.fs.writeFileAsync("input/dnd/" + round, DnD.print(round));
        }

        await DnD.fs.writeFileAsync("input/dndMap.txt", DnD.print(round));
        let hp = Object.entries(DnD.Creatures).reduce((sum, x) => sum + x[1].hp, 0);
        if (!fullRound) {
            round--;
        }
        console.log("round: " + round.toString() + " hp: " + hp.toString());
        return (round * hp).toString();
    }

    public static FindEnemies = (npc: Creature): Creature[] => {
        return DnD.Creatures.filter((e) => {
            if (e.hp < 1) {
                DnD.Mine[e.location.y][e.location.x] = ".";
                return false;
            }
            return e.type !== npc.type
        });
    }

    public static killDead = (): void => {
        DnD.Creatures = DnD.Creatures.filter((e) => {
            if (e.hp < 1) {
                DnD.Mine[e.location.y][e.location.x] = ".";
                if (e.type === "E") {
                    throw new Error("Elf died");
                }
            }
            return e.hp > 0;
        });
    }

    public static getPath = (c: Creature, e: Spot): { distance: number, path: Spot } => {
        if (c.location.x === e.x && c.location.y === e.y) {
            return {
                distance: 0,
                path: e
            }
        }

        let mine = DnD.Mine.map((y) => {
            return y.map((x) => {
                return x;
            })
        });
        mine[e.y][e.x] = "1";
        let neighbors = DnD.getOptions(e, c.location, mine);

        let step = 2;
        let foundNpc = false;
        let added = new Set();
        neighbors.forEach((x) => added.add(x.x + "," + x.y));
        while (neighbors.length > 0 && !foundNpc) {
            neighbors.forEach((x) => {
                if (c.location.x === x.x && c.location.y === x.y) {
                    return;
                }
                mine[x.y][x.x] = step.toString();
            });

            let newS: Spot[] = [];
            neighbors.forEach((x) => {
                if (foundNpc) {
                    return;
                }
                if (c.location.x === x.x && c.location.y === x.y) {
                    foundNpc = true;
                    return;
                }
                let ops = DnD.getOptions(x, c.location, mine);
                ops.forEach((y) => {
                    if (added.has(y.x + "," + y.y)) {
                        return;
                    }
                    added.add(y.x + "," + y.y);
                    newS.push(y);
                });
            });
            neighbors = newS;
            step++;
        }

        neighbors = DnD.getRoutes(c, mine);

        let best = neighbors.reduce((b, s) => {
            let n = Number(mine[s.y][s.x]);
            if (b === -1) {
                return n;
            }

            return n < b ? n : b;
        }, -1);

        let matches = neighbors.filter((s) => Number(mine[s.y][s.x]) === best);
        matches.sort(DnD.sort);
        return {
            distance: best,
            path: best !== -1 ? matches[0] : null as any
        }
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

    public static getRoutes = (creature: Creature, mine: string[][]): Spot[] => {
        let spot = creature.location;
        let spots: Spot[] = [];
        let y = spot.y;
        let x = spot.x;

        let match = (o: Spot) => {
            if (!mine[o.y]) {
                return false;
            }

            if (!mine[o.y][o.x]) {
                return false;
            }
            let b = Number(mine[o.y][o.x]);

            if (isNaN(b)) {
                return false;
            }

            return true;
        }

        //down
        if (match({ y: y + 1, x })) {
            spots.push({ x: x, y: y + 1 });
        }

        //right
        if (match({ y, x: x + 1 })) {
            spots.push({ x: x + 1, y: y });
        }

        //left
        if (match({ y, x: x - 1 })) {
            spots.push({ x: x - 1, y: y });
        }

        //up
        if (match({ y: y - 1, x })) {
            spots.push({ x: x, y: y - 1 });
        }
        return spots;
    }

    public static getTargets = (creature: Creature, mine: string[][]): Spot[] => {
        let spot = creature.location;
        let spots: Spot[] = [];
        let y = spot.y;
        let x = spot.x;

        let match = (o: Spot) => {
            if (!mine[o.y]) {
                return false;
            }
            if (!mine[o.y][o.x]) {
                return false;
            }
            let c = mine[o.y][o.x];
            if (c === "." || c === "#" || c === creature.type) {
                return false;
            }
            return true;
        }

        //down
        if (match({ y: y + 1, x })) {
            spots.push({ x: x, y: y + 1 });
        }

        //right
        if (match({ y, x: x + 1 })) {
            spots.push({ x: x + 1, y: y });
        }

        //left
        if (match({ y, x: x - 1 })) {
            spots.push({ x: x - 1, y: y });
        }

        //up
        if (match({ y: y - 1, x })) {
            spots.push({ x: x, y: y - 1 });
        }
        return spots;
    }

    public static print = (round: number): string => {
        let out = DnD.Mine.map((y, i) => {
            let row = y.join('');
            let hp: string[] = [];
            DnD.Creatures.forEach((c) => {
                if (i === c.location.y) {
                    hp.push(c.type + "(" + c.hp.toString() + ")");
                }
            })
            return row + "   " + hp.join(",");
        });
        let final = round.toString() + "\n" + out.join("\n");

        return final;
    }

    public static getMine = async (): Promise<string[][]> => {
        let raw: string = await DnD.fs.readFileAsync("input/dayFifteen.txt", { encoding: "utf8" });
        let cleaned = raw.split("\n");
        let e = 0;
        let map: string[][] = cleaned.map((row, y) => {
            let yv = row.split('');
            return yv.map((xv, x) => {
                if (xv === "E" || xv === "G") {
                    e++;
                    let c: Creature = {
                        hp: 200,
                        type: xv,
                        id: e,
                        round: 0,
                        location: { x: x, y }
                    };
                    DnD.Creatures.push(c);
                }
                return xv;
            });
        });

        return map;
    }

}