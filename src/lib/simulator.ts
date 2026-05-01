// 聖遺物シミュレーターのコアロジック (TypeScript版)

export const parts = ["花", "羽", "時計", "杯", "冠"] as const;
export type Part = typeof parts[number];

export const setNames = ["セット1", "セット2"] as const;
export type SetName = typeof setNames[number];

export const substatPool = [
    "会心率",
    "会心ダメージ",
    "攻撃%",
    "HP%",
    "防御%",
    "元素熟知",
    "元素チャージ効率",
    "攻撃",
    "HP",
    "防御"
] as const;
export type Substat = typeof substatPool[number];

export const substatValues: Record<Substat, number[]> = {
    "会心率": [2.7, 3.1, 3.5, 3.9],
    "会心ダメージ": [5.4, 6.2, 7.0, 7.8],
    "攻撃%": [4.1, 4.7, 5.3, 5.8],
    "HP%": [4.1, 4.7, 5.3, 5.8],
    "防御%": [5.1, 5.8, 6.6, 7.3],
    "元素熟知": [16, 19, 21, 23],
    "元素チャージ効率": [4.5, 5.2, 5.8, 6.5],
    "攻撃": [14, 16, 18, 19],
    "HP": [209, 239, 269, 299],
    "防御": [16, 19, 21, 23]
};

export const mainstatWeights: Record<Part, Record<string, number>> = {
    "花": { "HP": 100 },
    "羽": { "攻撃力": 100 },
    "時計": {
        "攻撃%": 26.68,
        "HP%": 26.66,
        "防御%": 26.66,
        "元素熟知": 10.00,
        "元素チャージ効率": 10.00
    },
    "杯": {
        "攻撃%": 19.25,
        "HP%": 19.25,
        "防御%": 19.00,
        "元素熟知": 2.50,
        "炎ダメージ": 5.00,
        "水ダメージ": 5.00, 
        "氷ダメージ": 5.00, 
        "雷ダメージ": 5.00,
        "風ダメージ": 5.00, 
        "岩ダメージ": 5.00,
        "草ダメージ": 5.00,
        "物理ダメージ": 5.00 
    },
    "冠": {
        "会心率": 10.00,
        "会心ダメージ": 10.00,
        "治療効果": 10.00,
        "攻撃%": 22.00,
        "HP%": 22.00,
        "防御%": 22.00,
        "元素熟知": 4.00
    }
};

export function getForbiddenSubstat(mainstat: string): Substat | null {
    if (substatPool.includes(mainstat as Substat)) {
        return mainstat as Substat;
    }
    return null;
}

// ユーティリティ: 重み付き抽選
export function weightedRandom(options: string[], weights: number[]): string {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let randomNum = Math.random() * totalWeight;
    for (let i = 0; i < options.length; i++) {
        if (randomNum < weights[i]) {
            return options[i];
        }
        randomNum -= weights[i];
    }
    return options[options.length - 1];
}

// ユーティリティ: 配列からのランダム抽出
export function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function randomSample<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

export interface Artifact {
    部位: Part;
    セット: string;
    メイン: string;
    初期サブ: Record<string, number>;
    サブ: Record<string, number>;
    初期OP数: number;
    スコア: number;
}

export function calcWeightedScore(substats: Record<string, number>, weights: Record<string, number>): number {
    let score = 0;
    for (const [stat, weight] of Object.entries(weights)) {
        if (substats[stat]) {
            score += substats[stat] * weight;
        }
    }
    return score;
}

export function generateArtifact(part: Part, scoreWeights?: Record<string, number>, forcedSet?: string): Artifact {
    const candidates = Object.keys(mainstatWeights[part]);
    const weights = Object.values(mainstatWeights[part]);
    const main = weightedRandom(candidates, weights);

    const artifactSet = forcedSet || randomChoice([...setNames]);

    const numSubstats = Math.random() < 0.8 ? 3 : 4;

    const forbiddenSub = getForbiddenSubstat(main);
    const availableSubstats = substatPool.filter(s => s !== forbiddenSub);

    const subs = randomSample(availableSubstats, numSubstats);

    const substats: Record<string, number> = {};
    for (const s of subs) {
        substats[s] = randomChoice(substatValues[s]);
    }

    const initialSubstats = { ...substats };

    if (numSubstats === 3) {
        const remainingSubs = availableSubstats.filter(s => !(s in substats));
        const newSub = randomChoice(remainingSubs);
        substats[newSub] = randomChoice(substatValues[newSub]);

        for (let i = 0; i < 4; i++) {
            const s = randomChoice(Object.keys(substats));
            substats[s] += randomChoice(substatValues[s as Substat]);
        }
    } else {
        for (let i = 0; i < 5; i++) {
            const s = randomChoice(Object.keys(substats));
            substats[s] += randomChoice(substatValues[s as Substat]);
        }
    }

    if (!scoreWeights) {
        scoreWeights = {
            "会心率": 2.0,
            "会心ダメージ": 1.0,
            "攻撃%": 1.0
        };
    }

    const score = Math.round(calcWeightedScore(substats, scoreWeights) * 10) / 10;

    return {
        部位: part,
        セット: artifactSet,
        メイン: main,
        初期サブ: initialSubstats,
        サブ: substats,
        初期OP数: numSubstats,
        スコア: score
    };
}

export function generateElixirArtifact(part: Part, mainstat: string, fixedSubstats: string[], scoreWeights?: Record<string, number>): Artifact {
    const substats: Record<string, number> = {};
    const forbidden = getForbiddenSubstat(mainstat);

    for (const s of fixedSubstats) {
        if (substatValues[s as Substat] && s !== forbidden) {
            substats[s] = randomChoice(substatValues[s as Substat]);
        }
    }

    const available = substatPool.filter(s => !(s in substats) && s !== forbidden);
    const subs = randomSample(available, 4 - Object.keys(substats).length);
    for (const s of subs) {
        substats[s] = randomChoice(substatValues[s as Substat]);
    }

    const initialSubstats = { ...substats };

    for (let i = 0; i < 5; i++) {
        const s = randomChoice(Object.keys(substats));
        substats[s] += randomChoice(substatValues[s as Substat]);
    }

    if (!scoreWeights) {
        scoreWeights = { "会心率": 2.0, "会心ダメージ": 1.0, "攻撃%": 1.0 };
    }

    const score = Math.round(calcWeightedScore(substats, scoreWeights) * 10) / 10;

    return {
        部位: part,
        セット: "セット1",
        メイン: mainstat,
        初期サブ: initialSubstats,
        サブ: substats,
        初期OP数: 4,
        スコア: score
    };
}

export function findBestValidCombo(selected: Record<Part, Record<SetName, Artifact | null>>, requiredSet: string = "セット1", minCount: number = 4): number | null {
    const choicesPerPart: Artifact[][] = [];

    for (const p of parts) {
        const candidates: Artifact[] = [];
        for (const setName of setNames) {
            const artifact = selected[p][setName as SetName];
            if (artifact !== null) {
                candidates.push(artifact);
            }
        }
        if (candidates.length === 0) return null;
        choicesPerPart.push(candidates);
    }

    let bestTotal: number | null = null;

    const comboHelper = (partIndex: number, currentCombo: Artifact[]) => {
        if (partIndex === parts.length) {
            const requiredCount = currentCombo.filter(a => a.セット === requiredSet).length;
            if (requiredCount >= minCount) {
                const total = currentCombo.reduce((sum, a) => sum + a.スコア, 0);
                if (bestTotal === null || total > bestTotal) {
                    bestTotal = Math.round(total * 10) / 10;
                }
            }
            return;
        }

        for (const artifact of choicesPerPart[partIndex]) {
            currentCombo.push(artifact);
            comboHelper(partIndex + 1, currentCombo);
            currentCombo.pop();
        }
    };

    comboHelper(0, []);

    return bestTotal;
}

export function simulateUntilTotalScoreForCustomBuild(
    mainstats: Record<Part, string>,
    scoreWeights: Record<string, number>,
    targetScore: number = 180,
    maxAttempts: number = 100000,
    useStrongbox: boolean = true,
    elixirInterval: number = 0,
    elixirBulkCount: number = 0,
    elixirFixedSubstats?: Record<string, string[]>
) {
    const selected: Record<Part, Record<SetName, Artifact | null>> = {
        "花": { "セット1": null, "セット2": null },
        "羽": { "セット1": null, "セット2": null },
        "時計": { "セット1": null, "セット2": null },
        "杯": { "セット1": null, "セット2": null },
        "冠": { "セット1": null, "セット2": null }
    };

    let reinforceCount = 0;
    let trashCount = 0;
    
    const tryEquip = (artifact: Artifact) => {
        if (artifact.メイン === mainstats[artifact.部位]) {
            const artifactSet = artifact.セット as SetName;
            const current = selected[artifact.部位][artifactSet];
            if (!current || artifact.スコア > current.スコア) {
                selected[artifact.部位][artifactSet] = artifact;
                return true;
            }
        }
        return false;
    };

    if (elixirBulkCount > 0 && elixirFixedSubstats) {
        const priorityParts: Part[] = ["時計", "杯", "冠", "羽", "花"];
        for (let i = 0; i < Math.min(elixirBulkCount, parts.length); i++) {
            const targetPart = priorityParts[i];
            const elixirArt = generateElixirArtifact(targetPart, mainstats[targetPart], elixirFixedSubstats[targetPart] || [], scoreWeights);
            tryEquip(elixirArt);
        }
        
        const bestTotal = findBestValidCombo(selected);
        if (bestTotal !== null && bestTotal >= targetScore) {
            return {
                attempts: 0,
                bestTotal: bestTotal,
                selected: selected
            };
        }
    }

    while (reinforceCount < maxAttempts) {
        const part = randomChoice([...parts]) as Part;
        const artifact = generateArtifact(part, scoreWeights);
        reinforceCount++;

        const kept = tryEquip(artifact);
        if (!kept && useStrongbox) trashCount++;

        if (useStrongbox && trashCount >= 3) {
            trashCount -= 3;
            const sbPart = randomChoice([...parts]) as Part;
            const sbArt = generateArtifact(sbPart, scoreWeights, "セット1");
            const keptSb = tryEquip(sbArt);
            if (!keptSb) trashCount++;
        }

        const bestTotal = findBestValidCombo(selected);
        if (bestTotal !== null && bestTotal >= targetScore) {
            return {
                attempts: reinforceCount,
                bestTotal: bestTotal,
                selected: selected
            };
        }
    }
    
    return {
        attempts: reinforceCount,
        bestTotal: findBestValidCombo(selected),
        selected: selected
    };
}

export function simulateScoreAfterFixedAttemptsForCustomBuild(
    mainstats: Record<Part, string>,
    scoreWeights: Record<string, number>,
    totalAttempts: number,
    useStrongbox: boolean = true,
    elixirInterval: number = 250,
    elixirBulkCount: number = 0,
    elixirFixedSubstats?: Record<string, string[]>
) {
    const selected: Record<Part, Record<SetName, Artifact | null>> = {
        "花": { "セット1": null, "セット2": null },
        "羽": { "セット1": null, "セット2": null },
        "時計": { "セット1": null, "セット2": null },
        "杯": { "セット1": null, "セット2": null },
        "冠": { "セット1": null, "セット2": null }
    };

    let trashCount = 0;

    const tryEquip = (artifact: Artifact) => {
        if (artifact.メイン === mainstats[artifact.部位]) {
            const artifactSet = artifact.セット as SetName;
            const current = selected[artifact.部位][artifactSet];
            if (!current || artifact.スコア > current.スコア) {
                selected[artifact.部位][artifactSet] = artifact;
                return true;
            }
        }
        return false;
    };

    if (elixirBulkCount > 0 && elixirFixedSubstats) {
        const priorityParts: Part[] = ["時計", "杯", "冠", "羽", "花"];
        for (let i = 0; i < Math.min(elixirBulkCount, parts.length); i++) {
            const targetPart = priorityParts[i];
            const elixirArt = generateElixirArtifact(targetPart, mainstats[targetPart], elixirFixedSubstats[targetPart] || [], scoreWeights);
            tryEquip(elixirArt);
        }
    }

    for (let i = 0; i < totalAttempts; i++) {
        const part = randomChoice([...parts]) as Part;
        const artifact = generateArtifact(part, scoreWeights);

        const kept = tryEquip(artifact);
        if (!kept && useStrongbox) trashCount++;

        if (elixirInterval > 0 && i > 0 && i % elixirInterval === 0 && elixirFixedSubstats) {
            const targetPart = randomChoice([...parts]) as Part;
            const elixirArt = generateElixirArtifact(targetPart, mainstats[targetPart], elixirFixedSubstats[targetPart] || [], scoreWeights);
            tryEquip(elixirArt);
        }

        if (useStrongbox && trashCount >= 3) {
            trashCount -= 3;
            const sbPart = randomChoice([...parts]) as Part;
            const sbArt = generateArtifact(sbPart, scoreWeights, "セット1");
            const keptSb = tryEquip(sbArt);
            if (!keptSb) trashCount++;
        }
    }
    
    return {
        bestTotal: findBestValidCombo(selected),
        selected: selected
    };
}

export function calculateDamageIndex(selected: Record<Part, Record<SetName, Artifact | null>>, scoreMode: string): number {
    let mainStatValue = 0;
    let critRate = 5.0; // 基礎会心率
    let critDmg = 50.0; // 基礎会心ダメージ
    let dmgBonus = 0;

    let targetMainSub = "攻撃%";
    if (scoreMode === "HP型") targetMainSub = "HP%";
    if (scoreMode === "防御力型") targetMainSub = "防御%";
    
    for (const part of parts) {
        const a = selected[part]["セット1"] || selected[part]["セット2"];
        if (!a) continue;
        
        if (a.メイン === targetMainSub) mainStatValue += 46.6;
        if (a.メイン === "会心率") critRate += 31.1;
        if (a.メイン === "会心ダメージ") critDmg += 62.2;
        if (a.メイン.includes("ダメージ")) dmgBonus += 46.6;
        
        if (a.サブ[targetMainSub]) mainStatValue += a.サブ[targetMainSub];
        if (a.サブ["会心率"]) critRate += a.サブ["会心率"];
        if (a.サブ["会心ダメージ"]) critDmg += a.サブ["会心ダメージ"];
    }
    
    const effectiveCR = Math.min(critRate / 100, 1.0);
    const effectiveCD = critDmg / 100;
    
    const baseMultiplier = 1 + (mainStatValue / 100);
    const critMultiplier = 1 + (effectiveCR * effectiveCD);
    const dmgMultiplier = 1 + (dmgBonus / 100);
    
    return baseMultiplier * critMultiplier * dmgMultiplier;
}

