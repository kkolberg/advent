import * as bluebird from 'bluebird';

export interface Region {
    geo: number;
    type: string;
    erosion: number;
    x: number;
    y: number;
    risk: number;
}
export class Cave {
    public static fs = bluebird.Promise.promisifyAll(require('fs'));
    public static Target = { x: 10, y: 10 };
    public static Cave: Region[][] = [];
    public static Depth: number = 510;

    public static run = async (): Promise<string> => {
        for (let y = 0; y < Cave.Target.y + 10; y++) {
            Cave.Cave.push([{ geo: 0, type: "", erosion: 0, y, x: 0, risk: 0 }]);
            Cave.Cave[y][0].geo = Cave.GeoIndex(0, y);
            Cave.Cave[y][0].erosion = Cave.Erosion(0, y);
            Cave.Cave[y][0].type = Cave.RegionType(0, y);
            Cave.Cave[y][0].risk = Cave.Risk(0, y);
        }


        for (let x = 1; x < Cave.Target.x + 10; x++) {
            Cave.Cave[0].push({ geo: 0, type: "", erosion: 0, x, y: 0, risk: 0 });
            Cave.Cave[0][x].geo = Cave.GeoIndex(x, 0);
            Cave.Cave[0][x].erosion = Cave.Erosion(x, 0);
            Cave.Cave[0][x].type = Cave.RegionType(x, 0);
            Cave.Cave[0][x].risk = Cave.Risk(x, 0);

        }

        for (let y = 1; y < Cave.Target.y + 10; y++) {
            for (let x = 1; x < Cave.Target.x + 10; x++) {
                Cave.Cave[y].push({ geo: 0, type: "", erosion: 0, x, y, risk: 0 });
                Cave.Cave[y][x].geo = Cave.GeoIndex(x, y);
                Cave.Cave[y][x].erosion = Cave.Erosion(x, y);
                Cave.Cave[y][x].type = Cave.RegionType(x, y);
                Cave.Cave[y][x].risk = Cave.Risk(x, y);

            }
        }
        Cave.fs.writeFileAsync("input/Cave.txt", Cave.Cave.map((x) => x.map((xx) => {
            if (xx.x === 0 && xx.y === 0) {
                return "M";
            }

            if (xx.x === Cave.Target.x && xx.y === Cave.Target.y) {
                return "T";
            }

            if (xx.x > 10) {
                return;
            }
            if (xx.y > 10) {
                return;
            }
            return xx.type;
        }).join('')).join('\n'));

        let wet = 0;
        let rocky = 0;
        let narrow = 0;
        let risk = 0;

        // for (let y = 0; y < 11; y++) {
        //     for (let x = 0; x < 11; x++) {
        //         let spot = Cave.Cave[y][x];
        //         wet += spot.type === "." ? 1 : 0;
        //         narrow += spot.type === "|" ? 1 : 0;
        //         rocky += spot.type === "=" ? 1 : 0;
        //         risk += spot.risk;
        //     }
        // }
        Cave.Cave.forEach((y) => {
            y.forEach((x) => {
                let spot = x;
                if ((spot.y > -1 && spot.y < Cave.Target.y + 1) &&
                    (spot.x > -1 && spot.x < Cave.Target.x + 1)) {
                    wet += spot.type === "." ? 1 : 0;
                    narrow += spot.type === "|" ? 1 : 0;
                    rocky += spot.type === "=" ? 1 : 0;
                    risk += spot.risk;
                }
            });
        });

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
                return 0;
            case ".":
                return 1;
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