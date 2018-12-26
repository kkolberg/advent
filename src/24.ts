import * as bluebird from 'bluebird';

export interface Army {
    id: string;
    hp: number;
    units: number;
    init: number;
    damage: number;
    damageType: string;
    weak: string[];
    immune: string[];
    side: string;
}

export interface Side {
    armies: Army[];
}

export interface Body {
    Immune: Side;
    Infection: Side;
}
export class Battle {
    public static boost = 35;
    public static fs = bluebird.Promise.promisifyAll(require('fs'));
    public static body: Body = {} as any;
    public static run = async (): Promise<string> => {
        Battle.body = await Battle.getProgram();
        let immuneIds: string[] = Battle.getIds(Battle.body.Immune.armies);
        let infectionIds: string[] = Battle.getIds(Battle.body.Infection.armies);
        let deads: string[] = [];
        let battled = true;
        while (immuneIds.length > 0 && infectionIds.length > 0 && battled) {
            //console.log("")
            //console.log("------------")
            //console.log("")
            //console.log("Immune System:");
            Battle.body.Immune.armies.forEach((e) => {
                //console.log(e.id + " contains " + e.units.toString() + " units effective: " + Battle.getEffectivePower(e).toString());
            });
            //console.log("");
            //console.log("Infection System:");
            Battle.body.Infection.armies.forEach((e) => {
                //console.log(e.id + " contains " + e.units.toString() + " units effective: " + Battle.getEffectivePower(e).toString());
            });
            //console.log("")
            battled = false;
            let allids = immuneIds.concat(infectionIds);
            // let eFs = allids.map((m) => {
            //     let a = Battle.findArmy(m);
            //     return a.id + ":" + Battle.getEffectivePower(a).toString();
            // }).join(",")
            // //console.log("Eff powers: " + eFs);
            allids.sort(Battle.sortTargeting);

            let matched: string[] = [];
            let fighting: { att: Army, def: Army }[] = allids.map((id) => {

                let att = Battle.findArmy(id);
                let def = Battle.findTarget(att, matched);

                //console.log(att.id + " picks " + (def ? def.id : " no one"));
                if (!def) {
                    return { att, def }
                }
                matched.push(def.id);
                return { att, def }
            });

            fighting.sort((a, b) => {
                return b.att.init - a.att.init;
            });

            //console.log("  ")
            //console.log("  ")

            fighting.forEach((battle) => {
                if (!battle.def) {
                    return;
                }

                if (deads.indexOf(battle.att.id) > -1) {
                    return;
                }
                let u = battle.def.units;
                Battle.dealDamage(battle.att, battle.def);

                if (battle.def.units < 1) {
                    deads.push(battle.def.id);
                }
                if (u !== battle.def.units) {
                    battled = true;
                }


            });

            Battle.body.Immune.armies = Battle.body.Immune.armies.filter((x) => {
                let alive = x.units > 0 && deads.indexOf(x.id) === -1;
                if (!alive) {
                    //console.log("========= " + x.id + " =========")
                }
                return alive;
            });

            Battle.body.Infection.armies = Battle.body.Infection.armies.filter((x) => {
                let alive = x.units > 0 && deads.indexOf(x.id) === -1;
                if (!alive) {
                    //console.log("========= " + x.id + " =========")
                }
                return alive;
            });

            immuneIds = Battle.getIds(Battle.body.Immune.armies);
            infectionIds = Battle.getIds(Battle.body.Infection.armies);
        }

        let answer = 0;
        Battle.body.Immune.armies.forEach((e) => {
            answer += e.units;
        });
        console.log("Immune: " + answer.toString());

        answer = 0;
        Battle.body.Infection.armies.forEach((e) => {
            answer += e.units;
        });
        console.log("Infection: " + answer.toString());
        // if (Battle.body.Immune.armies.length > 0) {
        //     Battle.body.Immune.armies.forEach((a) => {
        //         answer += a.units;
        //     });
        // } else {
        //     Battle.body.Infection.armies.forEach((a) => {
        //         answer += a.units;
        //     });
        // }

        return "";
    }

    public static dealDamage = (att: Army, def: Army): void => {
        let damage = Battle.CalDamage(att, def);
        let d = Math.floor(damage / def.hp);
        if (d > def.units) {
            d = def.units;
        }

        //console.log(att.id + " attacks " + def.id + " for " + damage.toString() + " damage, killing " + d.toString() + " units");
        def.units = def.units - d;
    }

    public static findTarget = (att: Army, not_valid: string[]): Army => {
        let defs = att.side === "Immune" ? Battle.body.Infection : Battle.body.Immune;
        let bestDamage = 0;
        let bestD: Army = null as any;

        defs.armies.forEach((d) => {
            if (not_valid.indexOf(d.id) > -1) {
                return;
            }
            let damage = Battle.CalDamage(att, d);
            if (damage > bestDamage) {
                bestD = d;
                bestDamage = damage;
                return;
            }
            if (!bestD) {
                bestD = d;
                bestDamage = damage;
                return;
            }
            if (bestDamage === damage) {
                let dE = Battle.getEffectivePower(d);
                let bE = Battle.getEffectivePower(bestD);
                if (dE > bE) {
                    bestD = d;
                    bestDamage = damage;
                    return;
                }
                if (dE === bE) {
                    if (d.init > bestD.init) {
                        bestD = d;
                        bestDamage = damage;
                        return;
                    }
                }
            }
        });

        if (bestDamage === 0) {
            return null as any;
        }
        return bestD as any;
    };

    public static CalDamage = (att: Army, def: Army): number => {
        let aE = Battle.getEffectivePower(att);
        if (def.immune.indexOf(att.damageType) > -1) {
            return 0;
        }

        if (def.weak.indexOf(att.damageType) > -1) {
            return aE * 2;
        }

        return aE;
    }

    public static getIds = (armies: Army[]): string[] => {
        return armies.map((a) => a.id);
    }

    public static sortTargeting = (one: string, two: string): number => {
        let a = Battle.findArmy(one);
        let b = Battle.findArmy(two);

        let aE = Battle.getEffectivePower(a);
        let bE = Battle.getEffectivePower(b);

        let result = bE - aE;
        if (result !== 0) {
            return result;
        }
        return b.init - a.init;
    }

    public static findArmy = (id: string): Army => {
        let all = Battle.body.Immune.armies.concat(Battle.body.Infection.armies);
        return all.find((a) => {
            return a.id === id
        }) as any;
    }

    public static getEffectivePower = (army: Army): number => {
        return army.units * army.damage;
    }


    public static getProgram = async (): Promise<Body> => {
        let raw: string = await Battle.fs.readFileAsync("input/24.txt", { encoding: "utf8" });

        let rows = raw.split("\n");
        let body: Body = {
            Immune: {
                armies: []
            },
            Infection: {
                armies: []
            }
        }
        let side = "";
        let id = 0;
        rows.forEach((row) => {
            if (!row.trim()) {
                return;
            }
            if (row === "Immune System:") {
                side = "Immune";
                id = 1;
                return;
            }
            if (row === "Infection:") {
                side = "Infection"
                id = 1;
                return;
            }
            let unitsOther = row.split(" units each with ");
            let units = Number(unitsOther[0].trim());
            let hpOthers = unitsOther[1].split(" hit points ");
            let hp = Number(hpOthers[0].trim());

            let weaknessOthers = hpOthers[1].split(")");
            if (weaknessOthers.length === 1) {
                weaknessOthers.unshift("");
            }
            let weaknesses = weaknessOthers[0].replace("(", "").trim().split(";");

            let weak: string[] = [];
            let immune: string[] = [];
            weaknesses.forEach((w) => {
                w = w.trim();
                if (w.indexOf("immune to") > -1) {
                    let stuff = w.replace("immune to", "").trim().split(",");
                    stuff.forEach((s) => {
                        immune.push(s.trim());
                    });
                    return;
                }
                if (w.indexOf("weak to") > -1) {
                    let stuff = w.replace("weak to", "").trim().split(",");
                    stuff.forEach((s) => {
                        weak.push(s.trim());
                    });
                }
            });

            let damageOther = weaknessOthers[1].split(" damage at initiative ");
            let init = Number(damageOther[1].trim());
            let damageStuff = damageOther[0].replace("with an attack that does ", "").trim().split(" ");
            let damage = Number(damageStuff[0].trim());
            let damageType = damageStuff[1].trim();

            (body as any)[side].armies.push({
                id: side === "Immune" ? "M" + id.toString() : "N" + id.toString(),
                init,
                damage: side === "Immune" ? damage + Battle.boost : damage,
                damageType,
                hp,
                units,
                weak,
                immune,
                side
            });
            id++;
            // 2033 units each with 4054 hit points (immune to cold; weak to fire, slashing) with an attack that does 18 slashing damage at initiative 3
        });

        return body;
    }
}