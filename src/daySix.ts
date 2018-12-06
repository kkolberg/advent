import * as bluebird from 'bluebird';
import moment from 'moment';

export interface Place {
    x: number;
    y: number;
    id: number;
}

export interface Info {
    id: number;
    dist: number;
}
export class GridPlaces {
    public static fs = bluebird.Promise.promisifyAll(require('fs'));

    public static getLargestWithinArea = async (): Promise<number> => {
        let starttime = moment();
        let places = await GridPlaces.getCleaned();

        let maxX = GridPlaces.getMaxAxis(places, "x") + 1;
        let maxY = GridPlaces.getMaxAxis(places, "y") + 1;
        let safeSpots = 0;
        for (let y = 0; y <= maxY; y++) {
            for (let x = 0; x <= maxX; x++) {
                let here: Place = { x, y, id: -1 };
                let distances = places.map((p) => {
                    let dist = GridPlaces.calculateDistance(here, p);
                    return dist;
                });

                let total = distances.reduce((sum, c) => {
                    return sum + c;
                }, 0);

                if (total < 10000) {
                    safeSpots++;
                }
            }
        }
        let endtime = moment();
        console.log("time took: " + endtime.diff(starttime, "milliseconds").toString());
        return safeSpots;
    }

    public static getLargestArea = async (): Promise<number> => {
        let starttime = moment();
        let map = await GridPlaces.drawMap();

        let toFile = map.map((x) => x.join(' ')).join('\n');
        await GridPlaces.fs.writeFileAsync("input/daySixMap.txt", toFile);

        let areas: { [id: string]: number } = {};
        map.forEach((ys, yI) => {
            ys.forEach((xs, xI) => {
                if (xs === '.') {
                    return;
                }
                if (!areas.hasOwnProperty(xs)) {
                    areas[xs] = 0;
                }
                if (areas[xs] === -1) {
                    return;
                }
                if (xI === ys.length - 1 || xI === 0) {
                    areas[xs] = -1;
                    return;
                }
                if (yI === map.length - 1 || yI === 0) {
                    areas[xs] = -1;
                    return;
                }

                areas[xs]++;
            });
        });

        let max = Object.entries(areas).reduce((max, c) => {
            return c[1] > max[1] ? c : max;
        }, ["", 0]);
        console.log("id: " + max[0] + "   area: " + max[1]);
        let endtime = moment();
        console.log("time took: " + endtime.diff(starttime, "milliseconds").toString());
        return max[1];
    }

    public static drawMap = async (): Promise<string[][]> => {
        let places = await GridPlaces.getCleaned();

        let maxX = GridPlaces.getMaxAxis(places, "x") + 1;
        let maxY = GridPlaces.getMaxAxis(places, "y") + 1;
        let plots: string[][] = [];
        for (let y = 0; y <= maxY; y++) {
            for (let x = 0; x <= maxX; x++) {
                let here: Place = { x, y, id: -1 };
                if (!plots[y]) {
                    plots[y] = [];
                }
                plots[y][x] = '.';

                let distances = places.map((p): Info => {
                    let dist = GridPlaces.calculateDistance(here, p);
                    return {
                        id: p.id,
                        dist
                    }
                });

                let shortest = distances.reduce((short, c) => {
                    return c.dist < short.dist ? c : short;
                }, { dist: Number.MAX_VALUE, id: 0 } as Info);

                let matches = distances.filter((c) => {
                    return c.dist === shortest.dist;
                });

                if (matches.length > 1) {
                    continue;
                }

                plots[y][x] = shortest.id.toString();
            }
        }
        return plots;
    }

    public static getMaxAxis = (places: Place[], axis: "x" | "y"): number => {
        return places.reduce((max, c) => {
            return c[axis] > max ? c[axis] : max;
        }, 0);
    }

    public static calculateDistance = (start: Place, other: Place): number => {
        return Math.abs(start.x - other.x) + Math.abs(start.y - other.y);
    }

    public static getCleaned = async (): Promise<Place[]> => {
        let raw: string = await GridPlaces.fs.readFileAsync("input/daySix.txt", { encoding: "utf8" });
        return raw.split("\n").map((val, i) => {
            let parts = val.split(", ");
            return {
                x: Number(parts[0]),
                y: Number(parts[1]),
                id: i
            }
        });
    }
}

