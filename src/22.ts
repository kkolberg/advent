import * as bluebird from 'bluebird';

const AStar = require('a-star');

export interface Person {
    x: number;
    y: number;
    tool: string;
}

export interface Region {
    geo: number;
    type: string;
    erosion: number;
    x: number;
    y: number;
    risk: number;
}

export interface Spot {
    x: number;
    y: number;
}
export class Cave {
    public static fs = bluebird.Promise.promisifyAll(require('fs'));
    public static Target = { x: 12, y: 763 };
    //    public static Target = { x: 10, y: 10 };
    public static Cave: Region[][] = [];
    public static Depth: number = 7740;



    public static walk = async (): Promise<void> => {
        Cave.makeCave();
        await Cave.fs.writeFileAsync("input/Cave.txt", Cave.Cave.map((x) => x.map((xx) => {
            if (xx.x === 0 && xx.y === 0) {
                return "M";
            }

            if (xx.x === Cave.Target.x && xx.y === Cave.Target.y) {
                return "T";
            }
            return xx.type;
        }).join('')).join('\n'));
        let person = {
            x: 0,
            y: 0,
            t: "torch"
        } as any;
        let p = AStar({
            start: person,
            isEnd: (s: Spot) => s.x === Cave.Target.x && s.y === Cave.Target.y,
            neighbor: (s1: any) => {
                let options = Cave.getOptions(s1);
                let mapped: any[] = [];
                options.forEach((x: any) => {
                    if (x.x === Cave.Target.x && x.y === Cave.Target.y) {
                        mapped.push(
                            {
                                x: x.x,
                                y: x.y,
                                t: "torch"
                            }
                        );
                        return;
                    }

                    let t = Cave.Cave[x.y][x.x].type;
                    if (t === ".") {
                        mapped.push(
                            {
                                x: x.x,
                                y: x.y,
                                t: "gear"
                            }
                        );
                        mapped.push(
                            {
                                x: x.x,
                                y: x.y,
                                t: "torch"
                            }
                        );
                    }
                    if (t === "|") {
                        mapped.push(
                            {
                                x: x.x,
                                y: x.y,
                                t: ""
                            }
                        );
                        mapped.push(
                            {
                                x: x.x,
                                y: x.y,
                                t: "torch"
                            }
                        );
                    }
                    if (t === "=") {
                        mapped.push(
                            {
                                x: x.x,
                                y: x.y,
                                t: ""
                            }
                        );
                        mapped.push(
                            {
                                x: x.x,
                                y: x.y,
                                t: "gear"
                            }
                        );
                    }
                });
                return mapped;
            },
            distance: (s1: any, s2: any) => {
                return s1.t === s2.t ? 1 : 7;
            },
            heuristic: (s: any) => {
                return 0;
            },
            hash: (s: any) => s.x + "," + s.y + "," + s.t
        });

        console.log(p);
        console.log("size: " + p.path.length)
    }

    public static getOptions = (person: Spot): Spot[] => {
        let spots: Spot[] = [];
        let y = person.y;
        let x = person.x;

        let match = (o: Spot) => {
            return o.x === Cave.Target.x && o.y === Cave.Target.y;
        }

        if (y + 1 < Cave.Target.y + 1 || match({ y: y + 1, x: x })) {
            spots.push({ x: x, y: y + 1 });
        }
        if (x + 1 < Cave.Target.x + 1 || match({ y, x: x + 1 })) {
            spots.push({ x: x + 1, y: y });
        }
        if (x - 1 > -1 || match({ y, x: x - 1 })) {
            spots.push({ x: x - 1, y: y });
        }

        if (y - 1 > -1 || match({ y: y - 1, x })) {
            spots.push({ x: x, y: y - 1 });
        }
        return spots;
    }

    public static makeCave = (): void => {
        for (let y = 0; y < Cave.Target.y + 100; y++) {
            Cave.Cave.push([{ geo: 0, type: "", erosion: 0, y, x: 0, risk: 0 }]);
            Cave.Cave[y][0].geo = Cave.GeoIndex(0, y);
            Cave.Cave[y][0].erosion = Cave.Erosion(0, y);
            Cave.Cave[y][0].type = Cave.RegionType(0, y);
            Cave.Cave[y][0].risk = Cave.Risk(0, y);
        }


        for (let x = 1; x < Cave.Target.x + 100; x++) {
            Cave.Cave[0].push({ geo: 0, type: "", erosion: 0, x, y: 0, risk: 0 });
            Cave.Cave[0][x].geo = Cave.GeoIndex(x, 0);
            Cave.Cave[0][x].erosion = Cave.Erosion(x, 0);
            Cave.Cave[0][x].type = Cave.RegionType(x, 0);
            Cave.Cave[0][x].risk = Cave.Risk(x, 0);

        }

        for (let y = 1; y < Cave.Target.y + 100; y++) {
            for (let x = 1; x < Cave.Target.x + 100; x++) {
                Cave.Cave[y].push({ geo: 0, type: "", erosion: 0, x, y, risk: 0 });
                Cave.Cave[y][x].geo = Cave.GeoIndex(x, y);
                Cave.Cave[y][x].erosion = Cave.Erosion(x, y);
                Cave.Cave[y][x].type = Cave.RegionType(x, y);
                Cave.Cave[y][x].risk = Cave.Risk(x, y);
            }
        }
    }

    public static run = async (): Promise<string> => {
        Cave.makeCave();
        Cave.fs.writeFileAsync("input/Cave.txt", Cave.Cave.map((x) => x.map((xx) => {
            if (xx.x === 0 && xx.y === 0) {
                return "M";
            }

            if (xx.x === Cave.Target.x && xx.y === Cave.Target.y) {
                return "T";
            }
            return xx.type;
        }).join('')).join('\n'));

        let wet = 0;
        let rocky = 0;
        let narrow = 0;
        let risk = 0;

        for (let y = 0; y < Cave.Target.y + 1; y++) {
            for (let x = 0; x < Cave.Target.x + 1; x++) {
                let spot = Cave.Cave[y][x];
                wet += spot.type === "." ? 1 : 0;
                narrow += spot.type === "|" ? 1 : 0;
                rocky += spot.type === "=" ? 1 : 0;
                risk += spot.risk;
            }
        }
        // Cave.Cave.forEach((y) => {
        //     y.forEach((x) => {
        //         let spot = x;
        //         if ((spot.y > -1 && spot.y < Cave.Target.y + 1) &&
        //             (spot.x > -1 && spot.x < Cave.Target.x + 1)) {
        //             wet += spot.type === "." ? 1 : 0;
        //             narrow += spot.type === "|" ? 1 : 0;
        //             rocky += spot.type === "=" ? 1 : 0;
        //             risk += spot.risk;
        //         }
        //     });
        // });

        console.log("wet: " + wet + " rocky: " + rocky + " narrow: " + narrow + " risk: " + risk);
        let answer = wet + (narrow * 2);
        return "answer: " + risk.toString();
    }

    public static GeoIndex = (x: number, y: number): number => {
        if (x === 0 && y === 0) {
            return 0;
        }

        if (x === Cave.Target.x && y === Cave.Target.y) {
            return 0;
        }

        if (y === 0) {
            return x * 16807;
        }

        if (x === 0) {
            return y * 48271;
        }

        return Cave.Cave[y][x - 1].erosion * Cave.Cave[y - 1][x].erosion;
    }

    public static Erosion = (x: number, y: number): number => {
        return (Cave.Cave[y][x].geo + Cave.Depth) % 20183;
    }

    public static Risk = (x: number, y: number): number => {
        let val = Cave.Cave[y][x].type
        switch (val) {
            case "=":
                return 1;
            case ".":
                return 0;
            default:
                return 2;
        }
    }

    public static RegionType = (x: number, y: number): string => {
        let val = Cave.Cave[y][x].erosion % 3;
        switch (val) {
            case 0:
                return ".";
            case 1:
                return "=";
            default:
                return "|";
        }
    }


    public static getProgram = async (): Promise<any[]> => {
        let raw: string = await Cave.fs.readFileAsync("input/23.txt", { encoding: "utf8" });
        let rows = raw.split("\n");
        return [];

    }


}