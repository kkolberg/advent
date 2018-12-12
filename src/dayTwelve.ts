import * as bluebird from 'bluebird';

export interface Pattern {
    pattern: string[];
    result: string;
}

export interface Plot {
    value: string;
    index: number;
}
export class Plots {
    public static fs = bluebird.Promise.promisifyAll(require('fs'));

    public static initalState: string[] = [];
    public static patterns: Pattern[] = [];

    public static current: Plot[] = [];


    public static addPlots = async (): Promise<number> => {
        await Plots.getData();

        let next: Plot[] = Plots.current.map((x) => x);
        for (let g = 0; g < 21; g++) {
            let string = "";
            Plots.current.forEach((x) => {
                string += x.value;
            });
            console.log(string);
            for (let p = 0; p < Plots.current.length; p++) {

                let foundPat = null;
                for (let x = 0; x < Plots.patterns.length; x++) {

                    //console.log("x: " + x.toString() + " p: " + p.toString() + " g: " + g.toString());

                    let pat = Plots.patterns[x];
                    let rr = next[p - 2] ? Plots.current[p - 2].value : '.';
                    let r = Plots.current[p - 1] ? Plots.current[p - 1].value : '.';
                    let c = Plots.current[p] ? Plots.current[p].value : '.';
                    let l = Plots.current[p + 1] ? Plots.current[p + 1].value : '.';
                    let ll = Plots.current[p + 2] ? Plots.current[p + 2].value : '.';
                    if (pat.pattern[0] !== rr) {
                        continue;
                    }
                    if (pat.pattern[1] !== r) {
                        continue;
                    }
                    if (pat.pattern[2] !== c) {
                        continue;
                    }

                    if (pat.pattern[3] !== l) {
                        continue;
                    }

                    if (pat.pattern[4] !== ll) {
                        continue;
                    }
                    foundPat = pat;

                    next[p] = {
                        index: Plots.current[p].index,
                        value: foundPat.result
                    };
                    break;
                }
            }
            Plots.current = next.map((x) => x);

        }

        let sum = 0;
        Plots.current.forEach((x) => {
            if (x.value === "#") {
                sum += x.index;
            }
        });

        return sum;
    }

    public static getData = async (): Promise<void> => {
        let raw: string = await Plots.fs.readFileAsync("input/dayTwelve.txt", { encoding: "utf8" });
        let rows = raw.split("\n");

        rows.forEach((row) => {
            if (row.indexOf("initial state: ") > -1) {
                row = row.replace("initial state: ", "");
                Plots.initalState = row.split('');
                return;
            }

            if (!row.trim()) {
                return;
            }

            let parts = row.split(" => ");

            Plots.patterns.push({
                result: parts[1],
                pattern: parts[0].split('')
            });

        });

        Plots.initalState.forEach((v, i) => {
            Plots.current.push({
                value: v,
                index: i
            })
        });

        for (let i = 1; i < 300; i++) {
            Plots.current.push({
                value: '.',
                index: Plots.initalState.length - 1
            });
            Plots.current.unshift({
                value: '.',
                index: i * -1
            });
        }
    }

}