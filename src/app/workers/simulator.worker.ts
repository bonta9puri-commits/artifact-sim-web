import { simulateUntilScore, simulateFixedAttempts, simulateUpgradeProgress } from "@/lib/simulator";
import { calculateTotalStats, calculateDamageExpectation } from "@/lib/stats_values";

addEventListener("message", async (event: MessageEvent) => {
  const {
    simMode,
    gameId,
    trials,
    days,
    staminaPerDay,
    staminaCost,
    scoreWeights,
    subPool,
    useStrongbox,
    mainStats,
    targetSets,
    userPartScores,
    targetSpeed,
    baseSpeed,
    currentSubSpeed,
    rollInitialOpt,
    rollCurrentLevel,
    rollSubs,
    rollMainStat,
    rollTargetScore,
    targetScore,
    elixirEnabled,
    elixirInitialCount,
    elixirPerVersion,
    elixirTargetPart,
    elixirTargetSet,
    elixirTargetMain,
    elixirSub1,
    elixirSub2,
    baseWhite,
    flatStatId,
    percentStatId,
    baseOtherVal,
    baseOtherCritRate,
    baseOtherCritDmg,
    baseOtherDmgBonus,
    dmgBonusStatId,
    currentDmg,
    overrideDays,
  } = event.data;

  // upgrade モードのシミュレーション
  if (simMode === "upgrade") {
    const upgradeStats: Record<string, { count: number; totalIncrease: number }> = {};
    const slots = Object.keys(userPartScores);
    slots.forEach((s) => {
      upgradeStats[s] = { count: 0, totalIncrease: 0 };
    });
    let overallUpgraded = 0;
    const attempts = Math.ceil((days * staminaPerDay) / staminaCost);

    for (let i = 0; i < trials; i++) {
      if (i % 10 === 0) {
        postMessage({ type: "progress", progress: Math.floor((i / trials) * 100) });
      }
      const res = simulateFixedAttempts(
        gameId,
        attempts,
        staminaPerDay,
        scoreWeights,
        subPool,
        useStrongbox,
        mainStats,
        targetSets,
        null,
        null,
        gameId === "starrail" ? { targetSpeed, baseSpeed, currentSubSpeed } : null
      );

      let upgradedAny = false;
      Object.entries(res.pieces).forEach(([slot, piece]: [string, any]) => {
        const current = userPartScores[slot] || 0;
        if (piece && piece.score > current) {
          if (!upgradeStats[slot]) {
            upgradeStats[slot] = { count: 0, totalIncrease: 0 };
          }
          upgradeStats[slot].count++;
          upgradeStats[slot].totalIncrease += piece.score - current;
          upgradedAny = true;
        }
      });
      if (upgradedAny) overallUpgraded++;
    }

    const overallProb = (overallUpgraded / trials) * 100;
    const slotResults = Object.entries(upgradeStats)
      .map(([slot, stat]) => ({
        slot,
        prob: (stat.count / trials) * 100,
        avgIncrease: stat.count > 0 ? stat.totalIncrease / stat.count : 0,
      }))
      .sort((a, b) => b.prob - a.prob);

    postMessage({
      type: "result",
      result: { type: "upgrade" },
      upgradeResult: { overallProb, slotResults, trials, days },
      progress: 100,
    });
    return;
  }

  // roll モードのシミュレーション
  if (simMode === "roll") {
    postMessage({ type: "progress", progress: 10 });
    
    const filteredSubs = rollSubs
      .filter((sub: any) => sub.name && sub.name !== "未選択")
      .map((sub: any) => ({ name: sub.name, value: sub.value }));

    const finalRes = simulateUpgradeProgress(
      gameId,
      rollInitialOpt,
      rollCurrentLevel,
      filteredSubs,
      scoreWeights,
      subPool,
      rollMainStat,
      rollTargetScore,
      trials
    );

    postMessage({
      type: "result",
      result: finalRes,
      sortedResults: finalRes.rawScores.map((score) => ({ score })),
      progress: 100,
    });
    return;
  }

  // target モードのシミュレーション
  if (simMode === "target") {
    const elixirConfig = {
      enabled: elixirEnabled,
      initialCount: elixirInitialCount,
      perVersion: elixirPerVersion,
      targetPart: elixirTargetPart,
      targetSet: elixirTargetSet,
      targetMain: elixirTargetMain,
      sub1: elixirSub1,
      sub2: elixirSub2,
    };
    let collectedGods: any[] = [];
    const results: any[] = [];
    const baselineResults: any[] = [];

    for (let i = 0; i < trials; i++) {
      if (i % 20 === 0) {
        postMessage({ type: "progress", progress: Math.floor((i / trials) * 100) });
      }
      const res = simulateUntilScore(
        gameId,
        targetScore,
        scoreWeights,
        subPool,
        useStrongbox,
        mainStats,
        targetSets,
        elixirConfig,
        userPartScores,
        gameId === "starrail" ? { targetSpeed, baseSpeed, currentSubSpeed } : null
      );
      results.push(res);

      if (elixirEnabled && i < 50) {
        const base = simulateUntilScore(
          gameId,
          targetScore,
          scoreWeights,
          subPool,
          useStrongbox,
          mainStats,
          targetSets,
          { ...elixirConfig, enabled: false },
          userPartScores,
          gameId === "starrail" ? { targetSpeed, baseSpeed, currentSubSpeed } : null
        );
        baselineResults.push(base);
      }

      if (res.godPieces && res.godPieces.length > 0) {
        collectedGods.push(...res.godPieces);
        postMessage({
          type: "godPiece",
          latestGodPiece: res.godPieces[res.godPieces.length - 1],
        });
      }
    }
    results.sort((a, b) => a.attempts - b.attempts);
    baselineResults.sort((a, b) => a.attempts - b.attempts);
    collectedGods.sort((a, b) => b.score - a.score);

    const medianRes = results[Math.floor(trials / 2)];
    const top10Res = results[Math.floor(trials * 0.1)];
    const bottom10Res = results[Math.floor(trials * 0.9)];
    const medianBase = baselineResults.length > 0 ? baselineResults[Math.floor(baselineResults.length / 2)] : null;

    const sortedMinus10 = [...results].sort((a, b) => a.attemptsMinus10 - b.attemptsMinus10);
    const medianMinus10 = Math.ceil((sortedMinus10[Math.floor(trials / 2)].attemptsMinus10 * staminaCost) / staminaPerDay);
    const worst5Days = Math.ceil((results[Math.floor(trials * 0.95)].attempts * staminaCost) / staminaPerDay);

    const finalRes = {
      type: "target",
      median: Math.ceil((medianRes.attempts * staminaCost) / staminaPerDay),
      top10: Math.ceil((top10Res.attempts * staminaCost) / staminaPerDay),
      bottom10: Math.ceil((bottom10Res.attempts * staminaCost) / staminaPerDay),
      medianWithoutElixir: medianBase ? Math.ceil((medianBase.attempts * staminaCost) / staminaPerDay) : null,
      medianMinus10,
      worst5Days,
      pieces: medianRes.pieces,
      trials,
    };

    postMessage({
      type: "result",
      result: finalRes,
      sortedResults: results,
      allGodPieces: collectedGods.slice(0, 10),
      progress: 100,
    });
    return;
  }

  // period / rank / damage モードのシミュレーション
  const activeDays = simMode === "period" || simMode === "damage" ? overrideDays || days : days;
  const totalAttempts = Math.floor((activeDays * staminaPerDay) / staminaCost);
  const elixirConfig = {
    enabled: elixirEnabled,
    initialCount: elixirInitialCount,
    perVersion: elixirPerVersion,
    targetPart: elixirTargetPart,
    targetSet: elixirTargetSet,
    targetMain: elixirTargetMain,
    sub1: elixirSub1,
    sub2: elixirSub2,
  };

  let collectedGods: any[] = [];
  const results: {
    score: number;
    pieces: any;
    godPieces?: any[];
    scoreBeforeElixir?: number;
    damage?: number;
    afterStats?: any;
  }[] = [];

  for (let i = 0; i < trials; i++) {
    if (i % 10 === 0) {
      postMessage({ type: "progress", progress: Math.floor((i / trials) * 100) });
    }
    const res = simulateFixedAttempts(
      gameId,
      totalAttempts,
      staminaPerDay,
      scoreWeights,
      subPool,
      useStrongbox,
      mainStats,
      targetSets,
      elixirConfig,
      simMode === "period" || simMode === "damage" ? userPartScores : null,
      gameId === "starrail" ? { targetSpeed, baseSpeed, currentSubSpeed } : null
    );

    let trialDmg = 0;
    let trialStats: any = null;

    if (simMode === "damage") {
      const afterArtStats = calculateTotalStats(gameId, res.pieces);
      const afterArtValFlat = afterArtStats[flatStatId] || 0;
      const afterArtValPer = afterArtStats[percentStatId] || 0;
      const afterArtValTotal = afterArtValFlat + (afterArtValPer * baseWhite) / 100;

      const afterArtCritRate = afterArtStats["会心率"] || 0;
      const afterArtCritDmg = afterArtStats["会心ダメージ"] || 0;
      const afterArtDmgBonus = afterArtStats[dmgBonusStatId] || 0;

      const afterTotalVal = baseOtherVal + afterArtValTotal;
      const afterTotalCritRate = baseOtherCritRate + afterArtCritRate;
      const afterTotalCritDmg = baseOtherCritDmg + afterArtCritDmg;
      const afterTotalDmgBonus = baseOtherDmgBonus + afterArtDmgBonus;

      trialDmg = calculateDamageExpectation(afterTotalVal, afterTotalCritRate, afterTotalCritDmg, afterTotalDmgBonus);
      trialStats = {
        baseVal: afterTotalVal,
        critRate: afterTotalCritRate,
        critDmg: afterTotalCritDmg,
        dmgBonus: afterTotalDmgBonus,
      };
    }

    results.push({
      ...res,
      damage: trialDmg,
      afterStats: trialStats,
    });

    if (res.godPieces && res.godPieces.length > 0) {
      collectedGods.push(...res.godPieces);
      postMessage({
        type: "godPiece",
        latestGodPiece: res.godPieces[res.godPieces.length - 1],
      });
    }
  }

  if (simMode === "damage") {
    results.sort((a, b) => (b.damage || 0) - (a.damage || 0));
  } else {
    results.sort((a, b) => b.score - a.score);
  }

  collectedGods.sort((a, b) => b.score - a.score);

  if (simMode === "damage") {
    const medianRes = results[Math.floor(trials / 2)];
    const top10Res = results[Math.floor(trials * 0.1)];
    const bottom10Res = results[Math.floor(trials * 0.9)];
    const worst5Dmg = results[Math.floor(trials * 0.95)].damage || 0;

    const finalRes = {
      type: "damage",
      currentDmg,
      median: medianRes.damage || 0,
      top10: top10Res.damage || 0,
      bottom10: bottom10Res.damage || 0,
      worst5Dmg,
      pieces: medianRes.pieces,
      top10Pieces: top10Res.pieces,
      bottom10Pieces: bottom10Res.pieces,
      medianStats: medianRes.afterStats,
      top10Stats: top10Res.afterStats,
      bottom10Stats: bottom10Res.afterStats,
      trials,
    };

    postMessage({
      type: "result",
      result: finalRes,
      sortedResults: results,
      allGodPieces: collectedGods.slice(0, 10),
      progress: 100,
    });
  } else {
    // period / rank モード
    const medianRes = results[Math.floor(trials / 2)];
    const top10Res = results[Math.floor(trials * 0.1)];
    const bottom10Res = results[Math.floor(trials * 0.9)];

    if (simMode === "period") {
      const worst5Score = results[Math.floor(trials * 0.95)].score;
      const avgBonus = results.reduce((acc, r) => acc + (r.score - (r.scoreBeforeElixir || r.score)), 0) / trials;

      const finalRes = {
        type: "period",
        median: medianRes.score,
        top10: top10Res.score,
        bottom10: bottom10Res.score,
        worst5Score,
        elixirBonus: avgBonus,
        pieces: medianRes.pieces,
        top10Pieces: top10Res.pieces,
        bottom10Pieces: bottom10Res.pieces,
        rawScores: results.map((r) => r.score),
        trials,
      };

      postMessage({
        type: "result",
        result: finalRes,
        sortedResults: results,
        allGodPieces: collectedGods.slice(0, 10),
        progress: 100,
      });
    } else {
      // rank モード
      const userTotal = Object.values(userPartScores || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
      const belowCount = results.filter((r) => r.score <= userTotal).length;
      const percentile = Math.max(0.1, 100 - (belowCount / trials) * 100);

      const finalRes = {
        type: "rank",
        percentile,
        userScore: userTotal,
        median: results[Math.floor(trials / 2)].score,
        pieces: results[Math.floor(trials / 2)].pieces,
        trials,
      };

      postMessage({
        type: "result",
        result: finalRes,
        sortedResults: results,
        allGodPieces: collectedGods.slice(0, 10),
        progress: 100,
      });
    }
  }
});
