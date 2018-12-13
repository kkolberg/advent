import * as bluebird from 'bluebird';

export interface Pattern {
    pattern: string;
    result: string;
}

export class Plots {
    public static fs = bluebird.Promise.promisifyAll(require('fs'));

    public static initalState: string;
    public static patterns: { [id: string]: string } = {};

    public static bob = async (): Promise<number> => {

        let sum = 5335;
        for (let i = 160; i < 0; i++) {
            sum += 33;
        }
        return sum;
    }
    public static addPlots = async (): Promise<number> => {

        await Plots.getData();
        let zero = 0;
        let current = Plots.initalState;

        let tree = 0;
        let dStarting = "".padStart(5, ".");
        let found: { [id: string]: string } = {};
        let lastSum = 0;
        current = "".padStart(100, ".") + current;
        zero = 100;
        console.log(current.substring(0, current.lastIndexOf("#") + 1));
        for (let g = 0; g < 20; g++) {
            let next: string[] = [];
            while (!current.endsWith("...")) {
                current = current + ".";
            }
            let ll = current.length;
            let dummy = "".padStart(current.length, ".");
            next = dummy.split('');
            for (let p = 0; p < ll; p++) {
                if (p > current.length - 5) {
                    current = current.padEnd(current.length + 5, ".");
                }
                let part = current.substr(p, 5);
                if (Plots.patterns[part]) {
                    next[p + 2] = Plots.patterns[part];
                } else {
                    next[p + 2] = ".";
                }
            }

            let cat = next.join("");


            found[current.substring(current.indexOf("#"), current.lastIndexOf("#") + 1)] = "cat";
            current = cat;
            // if (g % 1000 === 0) {

            // }

        }
        console.log();
        console.log(current);
        console.log(current.length);
        console.log(tree);
        let sum = 0;
        console.log(zero);


        for (let i = 0; i < current.length; i++) {
            if (i < zero && current[i] === "#") {
                sum -= zero - i;
                continue;
            }
            if (i === zero) {
                continue;
            }
            if (current[i] === "#") {
                sum += i - zero;
            }
        }
        return sum;
    }

    public static getData = async (): Promise<void> => {
        let raw: string = await Plots.fs.readFileAsync("input/dayTwelve.txt", { encoding: "utf8" });
        let rows = raw.split("\n");

        rows.forEach((row) => {
            if (row.indexOf("initial state: ") > -1) {
                row = row.replace("initial state: ", "");
                Plots.initalState = row;
                return;
            }

            if (!row.trim()) {
                return;
            }

            let parts = row.split(" => ");

            Plots.patterns[parts[0]] = parts[1];
        });
    }

}