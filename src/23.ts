import * as bluebird from 'bluebird';

export interface Bot {
    x: number;
    y: number;
    z: number;
    r: number;
    touching: number;
}
export class Nanos {
    public static fs = bluebird.Promise.promisifyAll(require('fs'));
    public static run = async (): Promise<string> => {
        let input = await Nanos.getProgram();

        let best = Nanos.getMaxR(input);

        let inR = input.filter((x) => Nanos.getInR(best, x));
        return inR.length.toString();
    }

    public static key = (bot: Bot): string => {
        return bot.x + "," + bot.y + "," + bot.z;
    }

    public static runT = async (): Promise<string> => {
        let input = await Nanos.getProgram();
        let maxSpot: { c: number, x: number, y: number, z: number } = { c: -1, x: -1, y: -1, z: -1 };
        let maxes = Nanos.getMaxes(input);
        let mins = Nanos.getMins(input);
        console.log("Max:" + maxes.x + "," + maxes.y + "," + maxes.z);
        console.log("Min:" + mins.x + "," + mins.y + "," + mins.z);
        let home: Bot = { x: 0, y: 0, z: 0, r: 0, touching: 0 };


        input.forEach((one) => {
            let touching = 0;
            input.forEach((two) => {
                touching += Nanos.Touching(one, two) ? 1 : 0;
            });
            one.touching = touching;
        });

        let maxTouching = 0;
        input.forEach((b) => {
            maxTouching = b.touching > maxTouching ? b.touching : maxTouching;
        });

        return "max touching: " + maxTouching;
    }

    public static Touching = (one: Bot, two: Bot): boolean => {
        let distance = Nanos.dist(one, two);
        let radiusOne = one.r;
        let radiusTwo = two.r;
        if (distance <= radiusOne + radiusTwo) {
            return true;
        }

        return false;
    }

    public static dist = (base: Bot, other: Bot): number => {
        return Math.abs(base.x - other.x) + Math.abs(base.y - other.y) + Math.abs(base.z - other.z);
    }

    public static getInR = (base: Bot, other: Bot): boolean => {
        let d = Nanos.dist(base, other);
        return d <= base.r;
    }

    public static getMins = (bots: Bot[]): { x: number, y: number, z: number } => {
        let x = Number.MAX_SAFE_INTEGER;
        let y = Number.MAX_SAFE_INTEGER;
        let z = Number.MAX_SAFE_INTEGER;
        bots.forEach((b) => {
            x = b.x < x ? b.x : x;
            z = b.z < z ? b.z : z;
            y = b.y < y ? b.y : y;
        });
        return { x, y, z };
    }


    public static getMaxes = (bots: Bot[]): { x: number, y: number, z: number } => {
        let x = 0;
        let y = 0;
        let z = 0;
        bots.forEach((b) => {
            x = b.x > x ? b.x : x;
            z = b.z > z ? b.z : z;
            y = b.y > y ? b.y : y;
        });
        return { x, y, z };
    }

    public static getMaxR = (bots: Bot[]): Bot => {
        let max = { r: -1 } as any;
        bots.forEach((b) => {
            max = b.r > max.r ? b : max;
        });
        return max;
    }

    public static getProgram = async (): Promise<Bot[]> => {
        let raw: string = await Nanos.fs.readFileAsync("input/23.txt", { encoding: "utf8" });
        let rows = raw.split("\n");

        return rows.map((row) => {
            row = row.replace("pos=<", "");
            let parts = row.split(">,");
            let pos = parts[0].split(",");
            let x = Number(pos[0]);
            let y = Number(pos[1]);
            let z = Number(pos[2]);
            let r = Number(parts[1].split("=")[1]);

            return {
                x, y, z, r, touching: 0
            }
        });
    }


}