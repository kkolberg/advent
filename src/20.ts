import * as bluebird from 'bluebird';

const AStar = require('a-star');

export interface Data {
    reg: string[];
    cur: { x: number, y: number };
    lastPosition: { x: number, y: number }[]
}
export class Mapping {
    public static fs = bluebird.Promise.promisifyAll(require('fs'));
    public static Map: string[][] = [];
    public static Y = 300;
    public static X = 300;
    public static XOffSet = 150;
    public static YOffSet = 150;
    public static raw: string[];

    public static run = async (): Promise<string> => {

        for (let y = 0; y < Mapping.Y; y++) {
            Mapping.Map.push([]);
            for (let x = 0; x < Mapping.X; x++) {
                Mapping.Map[y].push("?");
            }
        }

        Mapping.Map[Mapping.YOffSet][Mapping.XOffSet] = "X"
        let reg = await Mapping.getProgram();
        reg.shift();
        let data = {
            reg,
            cur: { x: Mapping.XOffSet, y: Mapping.YOffSet },
            lastPosition: [] as any
        };
        while (data.reg.length > 0) {
            data = Mapping.walk(data);
        }
        await Mapping.fs.writeFileAsync("input/Mapping.txt", Mapping.Map.map((x) => x.join('')).join("\n"));


        let i = 0;
        let points: { x: number, y: number }[] = [];

        for (let y = 0; y < Mapping.Y; y++) {
            for (let x = 0; x < Mapping.X; x++) {
                if (Mapping.Map[y][x] !== ".") {
                    continue;
                }
                points.push({ x, y });
            }
        }

        console.log("points " + points.length.toString());
        points.forEach((spot) => {
            let p = AStar({
                start: { x: Mapping.XOffSet, y: Mapping.YOffSet },
                isEnd: (s: any) => s.x === spot.x && s.y === spot.y,
                neighbor: (s1: any) => Mapping.getOptions(s1.x, s1.y),
                distance: (s1: any, s2: any) => {
                    return 1;
                },
                heuristic: (s: any) => {
                    return 1;
                },
                hash: (s: any) => s.x + "," + s.y
            });

            if (p.cost / 2 > 999) {
                i++;
            }
            //console.log(i);
        });

        console.log("amount: " + i);
        return "";
    }

    public static getOptions = (x: number, y: number): { x: number, y: number }[] => {

        let spots: { x: number, y: number }[] = [];
        let match = (xx: number, yy: number) => {
            let c = Mapping.Map[yy][xx];
            return c !== "?";
        }

        if (y + 1 < Mapping.Y + 1 && match(x, y + 1)) {
            spots.push({ x: x, y: y + 1 });
        }
        if (x + 1 < Mapping.X + 1 && match(x + 1, y)) {
            spots.push({ x: x + 1, y: y });
        }
        if (x - 1 > -1 && match(x - 1, y)) {
            spots.push({ x: x - 1, y: y });
        }

        if (y - 1 > -1 && match(x, y - 1)) {
            spots.push({ x: x, y: y - 1 });
        }
        return spots;
    }

    public static walk = (data: Data): Data => {
        let cur = data.cur;
        let lastPosition = data.lastPosition;
        let reg = data.reg;
        let char = reg.shift();
        if (!char || char === "$") {
            return data;
        }

        if (char === "|") {
            cur = lastPosition[lastPosition.length - 1];
        }

        if (char === ")") {
            cur = lastPosition.pop() as any;
        }

        if (char === "(") {
            lastPosition.push(cur);
        }

        switch (char) {
            case "N":
                cur = Mapping.N(cur.x, cur.y);
                break;
            case "S":
                cur = Mapping.S(cur.x, cur.y);
                break;
            case "W":
                cur = Mapping.W(cur.x, cur.y);
                break;
            case "E":
                cur = Mapping.E(cur.x, cur.y);
                break;
        }

        return { cur, lastPosition, reg };
    }

    public static N = (x: number, y: number): { x: number, y: number } => {
        let xx = x;
        let yy = y;
        yy--;
        Mapping.Map[yy][xx] = "-";
        yy--;
        Mapping.Map[yy][xx] = Mapping.Map[yy][xx] !== "X" ? "." : Mapping.Map[yy][xx];
        return { x: xx, y: yy };
    }

    public static S = (x: number, y: number): { x: number, y: number } => {
        let xx = x;
        let yy = y;
        yy++;
        Mapping.Map[yy][xx] = "-";
        yy++;
        Mapping.Map[yy][xx] = Mapping.Map[yy][xx] !== "X" ? "." : Mapping.Map[yy][xx];
        return { x: xx, y: yy };
    }

    public static W = (x: number, y: number): { x: number, y: number } => {
        let xx = x;
        let yy = y;
        xx--;
        Mapping.Map[yy][xx] = "|";
        xx--;
        Mapping.Map[yy][xx] = Mapping.Map[yy][xx] !== "X" ? "." : Mapping.Map[yy][xx];
        return { x: xx, y: yy };
    }

    public static E = (x: number, y: number): { x: number, y: number } => {
        let xx = x;
        let yy = y;
        xx++;
        Mapping.Map[yy][xx] = "|";
        xx++;
        Mapping.Map[yy][xx] = Mapping.Map[yy][xx] !== "X" ? "." : Mapping.Map[yy][xx];
        return { x: xx, y: yy };
    }


    public static getProgram = async (): Promise<string[]> => {
        let raw: string = await Mapping.fs.readFileAsync("input/20.txt", { encoding: "utf8" });
        // Mapping.raw = raw.split("");
        // Mapping.raw.shift();
        // let rooms: Room[] = [];
        // rooms.push({ x: 0, y: 0 });
        // let branches: Room[] = [];
        // branches.push(rooms[0]);
        // while (Mapping.raw.length > 0) {
        //     if (Mapping.raw[0] === ")") {
        //         branches.pop();
        //     }
        //     if (Mapping.raw[0] === "(") {
        //         Mapping.raw.shift();
        //         let newRooms = Mapping.walk(branches[branches.length - 1]);
        //         if (newRooms.length > 0) {
        //             branches.push(newRooms[newRooms.length - 1]);
        //         }
        //         rooms = rooms.concat(newRooms);
        //         continue;
        //     }
        //     let newRooms = Mapping.walk(branches[branches.length - 1]);
        //     rooms = rooms.concat(newRooms);
        //     branches.push(rooms[rooms.length - 1]);
        // }
        return raw.split('');
    }


}