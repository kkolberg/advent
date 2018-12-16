import * as bluebird from 'bluebird';

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

    public static run = async (): Promise<string> => {
        DnD.Mine = await DnD.getMine();
        let stopFight = false;
        let round = 0;
        let final = "";
        let hadFight = false;
        while (!stopFight) {
            round++;
            stopFight = true;
            DnD.Creatures.sort(DnD.sort);


            let changes: { location: Spot, c: Creature }[] = [];
            let fight = false;
            for (let c of DnD.Creatures) {
                if (c.hp < 1) {
                    continue;
                }
                let enemies = DnD.FindEnemies(c);
                if (!enemies.length) {
                    stopFight = true;
                    round--;
                    break;
                }
                stopFight = false;
                c.round = round;
                let bestE: Creature = null as any;
                let bestPath: Spot[] = [];
                enemies.forEach((e => {
                    if (e.hp < 1) {
                        return;
                    }
                    let path = DnD.getPath(c, e);

                    if (path.status !== "success") {
                        return;
                    }
                    path = path.path.filter((p: Spot) => {
                        return p.x !== c.location.x || p.y !== c.location.y;
                    });
                    if (!bestE || path.length < bestPath.length) {
                        bestE = e;
                        bestPath = path;
                        return;
                    }
                    if (path.length < bestPath.length) {
                        bestE = e;
                        bestPath = path;
                        return;
                    }
                    if (path.length === bestPath.length) {
                        if (e.hp < bestE.hp) {
                            bestE = e;
                            bestPath = path;
                            return;
                        }
                        if (e.location.y < bestE.location.y) {
                            bestE = e;
                            bestPath = path;
                            return;
                        }
                        if (e.location.y === bestE.location.y && e.location.x < bestE.location.x) {
                            bestE = e;
                            bestPath = path;
                            return;
                        }
                    }
                }));

                if (bestE) {
                    let neighbors = DnD.getOptions(c.location, {} as any);
                    let possibles: Spot[][] = neighbors.map((x) => DnD.getPath({
                        type: c.type,
                        location: x
                    } as any, bestE)).filter((p) => {
                        return p.status === "success";
                    }).map((p) => p.path);

                    let shortest = possibles.reduce((s, path) => {
                        return path.length < s ? path.length : s;
                    }, Number.MAX_SAFE_INTEGER);

                    possibles = possibles.filter((x) => {
                        return x.length <= shortest;
                    });
                    if (possibles.length > 1) {
                        possibles.sort((a, b) => DnD.sort(a[0], b[0]));
                        bestPath = possibles.shift() as any;
                    }
                }

                if (bestPath.length > 1) {
                    // changes.push({
                    //     location: bestPath[0],
                    //     c
                    // });
                    DnD.Mine[c.location.y][c.location.x] = ".";
                    c.location = bestPath[0];
                    DnD.Mine[bestPath[0].y][bestPath[0].x] = c.type;
                    bestPath.shift();

                }
                if (bestPath.length === 1 && bestE) {
                    bestE.hp -= 3;
                    fight = true;
                    if (bestE.hp < 1) {
                        DnD.Mine[bestE.location.y][bestE.location.x] = ".";
                    }
                }
                hadFight = fight;
            }

            // changes.forEach((change) => {
            //     DnD.Mine[change.c.location.y][change.c.location.x] = ".";
            //     change.c.location = change.location;
            //     DnD.Mine[change.location.y][change.location.x] = change.c.type;
            //     change.c.location = change.location;
            // });

            DnD.Creatures = DnD.Creatures.filter((c) => {
                if (c.hp > 0) {
                    console.log("id: " + c.id.toString() + " hp: " + c.hp.toString());
                    return true;
                }
                return false;
            });

            final += DnD.print(round) + "\n";

            console.log(round);
        }
        await DnD.fs.writeFileAsync("input/dndMap.txt", final);


        let hp = DnD.Creatures.reduce((p, c) => {
            return p + c.hp;
        }, 0);
        console.log("round: " + (round).toString() + " hp: " + hp.toString());
        let bob = ["round: " + (round).toString() + " hp: " + hp.toString() + " score: " + ((round) * (hp)).toString() + " winner: " + DnD.Creatures[0].type];
        bob.push("round: " + (round - 1).toString() + " hp: " + hp.toString() + " score: " + ((round - 1) * (hp)).toString() + " winner: " + DnD.Creatures[0].type);
        return bob.join('\n');
    }

    public static getPath = (c: Creature, e: Creature): any => {
        let p = AStar({
            start: c.location,
            isEnd: (s: Spot) => s.x === e.location.x && s.y === e.location.y,
            neighbor: (s: Spot) => {
                return DnD.getOptions(s, e.location);
            },
            distance: (s1: Spot, s2: Spot) => Math.abs(s1.x - s2.x) + Math.abs(s1.y - s2.y),
            heuristic: (s: Spot) => Math.abs(s.x - e.location.x) + Math.abs(s.y - e.location.y),
            hash: (s: Spot) => s.x + "," + s.y
        });

        return p;
    }

    public static FindNextStep = (npc: Creature, enemies: number[]) => {
        let e = DnD.Creatures.filter((x) => enemies.indexOf(x.id) > -1);

        for (let c of e) {

        }
    }

    public static FindEnemies = (npc: Creature): Creature[] => {
        return DnD.Creatures.filter((e) => e.type !== npc.type);
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

    public static getOptions = (spot: Spot, target: Spot): Spot[] => {
        let spots: Spot[] = [];
        let y = spot.y;
        let x = spot.x;

        let match = (o: Spot) => {
            return o.x === target.x && o.y === target.y;
        }

        //down
        if (DnD.Mine[y + 1] && DnD.Mine[y + 1][x] === "." || match({ y: y + 1, x })) {
            spots.push({ x: x, y: y + 1 });
        }

        //right
        if (DnD.Mine[y][x + 1] === "." || match({ y, x: x + 1 })) {
            spots.push({ x: x + 1, y: y });
        }

        //left
        if (DnD.Mine[y][x - 1] === "." || match({ y, x: x - 1 })) {
            spots.push({ x: x - 1, y: y });
        }

        //up
        if (DnD.Mine[y - 1] && DnD.Mine[y - 1][x] === "." || match({ y: y - 1, x })) {
            spots.push({ x: x, y: y - 1 });
        }
        return spots;
    }

    public static print = (round: number): string => {
        let out = DnD.Mine.map((y) => {
            return y.join('');
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
                    let c: Creature = {
                        hp: 200,
                        type: xv,
                        id: e,
                        round: 0,
                        location: { x: x, y }
                    };
                    DnD.Creatures.push(c);
                    e++;
                }
                return xv;
            });
        });

        return map;
    }

}