import * as bluebird from 'bluebird';

export class WareHouse {
    public static fs = bluebird.Promise.promisifyAll(require('fs'));

    public static findBox = async (): Promise<string> => {
        let raw: string = await WareHouse.fs.readFileAsync("input/dayTwo.txt", { encoding: "utf8" });
        let split = raw.split("\n");

        let boxComp: { other: number, diff: number, id: number }[] = [] as any;

        split.forEach((one, i) => {
            split.forEach((two, it) => {
                if (i === it) {
                    return;
                }
                let diff = WareHouse.diffCount(one, two);
                boxComp.push({ other: it, diff, id: i });
            });
        });

        let best = boxComp[0];

        boxComp.forEach((val) => {
            if (val.diff < best.diff) {
                best = val;
            }
        });

        let one = split[best.id];
        let two = split[best.other];

        let result = "";
        for (let i = 0; i < one.length; i++) {
            if (one[i] === two[i]) {
                result += one[i];
            }
        }
        return result;

    }

    public static diffCount = (one: string, two: string): number => {
        let diff = 0;
        for (let i = 0; i < one.length; i++) {
            if (one[i] !== two[i]) {
                diff++;
            }
        }
        return diff;
    }

    public static getChecksum = async (): Promise<number> => {
        let raw: string = await WareHouse.fs.readFileAsync("input/dayTwo.txt", { encoding: "utf8" });
        let split = raw.split("\n");
        let two = 0;
        let three = 0;
        split.forEach((box) => {
            if (WareHouse.hasMatch(box, 2)) {
                two++;
            }
            if (WareHouse.hasMatch(box, 3)) {
                three++;
            }
        });

        return two * three;
    }

    public static hasMatch = (val: string, req: number): boolean => {
        const d: { [id: string]: number } = {} as any;

        [...val].forEach((c) => {
            if (d[c]) {
                d[c]++;
                return;
            }
            d[c] = 1;
        });

        return !!Object.entries(d).find((v) => v[1] === req);
    }
}