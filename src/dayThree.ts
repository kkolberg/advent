import * as bluebird from 'bluebird';


export interface FabricInput {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export class Fabric {
    public static fs = bluebird.Promise.promisifyAll(require('fs'));

    public static findNoOverlap = async (): Promise<string> => {
        let claims = await Fabric.getData();
        let sheet = await Fabric.buildClaims(claims);
        let validClaim = "";
        for (let claim of claims) {
            let valid = true;
            for (let h = 0; h < claim.height; h++) {
                let validRow = true;
                for (let w = 0; w < claim.width; w++) {
                    if (sheet[h + claim.y][w + claim.x] === 'X') {
                        validRow = false;
                        break;
                    }
                }
                if (!validRow) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                validClaim = claim.id;
                break;
            }
        }
        return validClaim;
    }

    public static findOverlap = async (): Promise<number> => {
        let claims = await Fabric.getData();
        let sheet = await Fabric.buildClaims(claims);

        return sheet.reduce((total, row): number => {
            let subTotal = row.reduce((sub: number, inch: string): number => {
                if (inch === 'X') {
                    return sub + 1;
                }
                return sub;
            }, 0);

            return total + subTotal;
        }, 0);
    }

    public static buildSheet = (): string[][] => {
        let sheet = [];
        for (let i = 0; i < 1000; i++) {
            let row = [];
            for (let i = 0; i < 1000; i++) {
                row.push('.');
            }
            sheet.push(row);
        }

        return sheet;
    }
    public static buildClaims = (claims: FabricInput[]): string[][] => {
        let sheet = Fabric.buildSheet();

        claims.forEach((claim) => {

            for (let h = 0; h < claim.height; h++) {
                for (let w = 0; w < claim.width; w++) {
                    if (sheet[h + claim.y][w + claim.x] === '.') {
                        sheet[h + claim.y][w + claim.x] = claim.id;
                        continue;
                    }

                    sheet[h + claim.y][w + claim.x] = 'X';
                }
            }
        });

        return sheet;
    }


    public static getData = async (): Promise<FabricInput[]> => {
        let raw: string = await Fabric.fs.readFileAsync("input/dayThree.txt", { encoding: "utf8" });
        let rawSplit = raw.split("\n");
        return rawSplit.map((val) => {
            let parts = val.split(' @ ');
            let id = parts[0].trim().replace('#', '');
            let info = parts[1].split(': ');
            let location = info[0].split(',');
            let size = info[1].split('x');
            let x = Number(location[0]);
            let y = Number(location[1]);
            let width = Number(size[0]);
            let height = Number(size[1]);
            return {
                id,
                x,
                y,
                width,
                height
            };
        });
    }
}