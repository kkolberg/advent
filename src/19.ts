import * as bluebird from 'bluebird';

export interface Program {
    num: number;
    operations: Operation[];
}
export interface Operation {
    op: (input: number[], vals: number[]) => number[];
    name: string;
    vals: number[];
}
export class Assembly {
    public static fs = bluebird.Promise.promisifyAll(require('fs'));



    public static addr = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] + input[opp[1]];
        return input;
    }

    public static addi = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] + opp[1];
        return input;
    }

    public static mulr = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] * input[opp[1]];
        return input;
    }


    public static muli = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] * opp[1];
        return input;
    }

    public static banr = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] & input[opp[1]];
        return input;
    }

    public static bani = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] & opp[1];
        return input;
    }

    public static borr = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] | input[opp[1]];
        return input;
    }

    public static bori = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] | opp[1];
        return input;
    }

    public static setr = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]];
        return input;
    }

    public static seti = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = opp[0];
        return input;
    }


    public static gtir = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = opp[0] > input[opp[1]] ? 1 : 0;
        return input;
    }

    public static gtri = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] > opp[1] ? 1 : 0;
        return input;
    }


    public static gtrr = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] > input[opp[1]] ? 1 : 0;
        return input;
    }

    public static eqir = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = opp[0] === input[opp[1]] ? 1 : 0;
        return input;
    }

    public static eqri = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] === opp[1] ? 1 : 0;
        return input;
    }

    public static eqrr = (input: number[], opp: number[]): number[] => {
        //let x = input.join("|").split("|").map((n) => Number(n));
        input[opp[2]] = input[opp[0]] === input[opp[1]] ? 1 : 0;
        return input;
    }

    public static getProgram = async (): Promise<Program> => {
        let raw: string = await Assembly.fs.readFileAsync("input/19.txt", { encoding: "utf8" });
        let cleaned = raw.split("\n");
        let start = cleaned.shift() as string;
        let num = Number(start.replace("#ip", "").trim());
        let operations: Operation[] = [];
        cleaned.forEach((row) => {
            row = row.trim();
            if (!row) {
                return;
            }
            let operation: Operation = {} as any;
            let parts = row.split(" ");
            operation.op = Assembly.map[parts[0].trim()];
            operation.name = parts[0].trim();
            parts.shift();
            operation.vals = parts.map((x) => Number(x.trim()));
            operations.push(operation);
        });

        return {
            num,
            operations
        }
    }

    public static run = async (): Promise<string> => {
        let input = await Assembly.getProgram();
        let start = [0, 0, 0, 0, 0, 0];
        let ipReg = input.num;
        let ins = 0;
        let run = true;
        let c = 0;
        let oldFour = -1;
        let commands = [];
        let zero = 7129802;

        start = [0, 0, 0, 0, 0, 0];
        let t = [];
        let bobs = new Set();
        while (run) {
            start[ipReg] = ins;
            let op = input.operations[ins].op;
            if (ins === 28) {
                //console.log(start.join(" "));
                if (bobs.has(start[4].toString())) {
                    console.log(start.join(" "));
                    console.log(t[t.length - 1]);
                    console.log(t[t.length - 2]);
                    break;
                }
                t.push(start[4]);
                bobs.add(start[4].toString());
            }
            start = op(start, input.operations[ins].vals);
            oldFour = start[4];

            ins = start[ipReg];
            ins++;
            run = ins > -1 && ins < input.operations.length;
            c++;
        }
        return "";
    }

    public static map: { [id: string]: (input: number[], vals: number[]) => number[] } = {
        "addr": Assembly.addr,
        "addi": Assembly.addi,
        "mulr": Assembly.mulr,
        "muli": Assembly.muli,
        "banr": Assembly.banr,
        "bani": Assembly.bani,
        "borr": Assembly.borr,
        "bori": Assembly.bori,
        "setr": Assembly.setr,
        "seti": Assembly.seti,
        "gtir": Assembly.gtir,
        "gtri": Assembly.gtri,
        "gtrr": Assembly.gtrr,
        "eqir": Assembly.eqir,
        "eqri": Assembly.eqri,
        "eqrr": Assembly.eqrr
    }

    public static cat = async (): Promise<number> => {

        let one = 0;
        let two = 0;
        let three = 0;
        let four = 0;
        let c = 0;
        let zero = 0;
        while (true) {
            while (true) {
                one = four | 65536;
                four = 2024736;
                two = one & 255;
                four = four + two;
                four = four & 16777215;
                four = four * 65899;
                four = four & 16777215;

                if (256 > one) {
                    continue;
                }

                break;
            }

            four = 2024736;

            if (four === zero) {
                break;
            }
        }
        return c;
    }

    public static tree = async (): Promise<number> => {
        let five = 10550400;
        let four = 0;
        let one = 0;
        let answer = 0;


        while (one < 10551419) {
            if (10551418 / one)
                five = four * one;
            if (five === 10551418) {
                answer++;
            }
            four++;
            if (four > 10551418) {
                one++;
                four = 1;
                if (one % 10000 === 0) {
                    console.log(one);
                }
            }
        }
        return answer;
    }
}

