function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function extractHeadings(notes) {
  return notes
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.length < 70 && /[:\-]/.test(line))
    .slice(0, 8);
}

export function getCookedSignal(notes, result) {
  const noteLength = notes.trim().length;
  const structureScore = clamp(extractHeadings(notes).length * 6, 0, 24);
  const depthScore = clamp(noteLength / 180, 0, 28);
  const assetScore = clamp(
    result.examOracle.length * 2 + result.flashcards.length + result.mcqQuestions.length,
    0,
    30
  );

  const difficultyPenalty =
    result.difficultyRating === "Hard"
      ? 18
      : result.difficultyRating === "Medium"
        ? 10
        : 4;

  const preparedness = clamp(structureScore + depthScore + assetScore - difficultyPenalty, 0, 85);
  const cookedScore = clamp(100 - preparedness, 8, 96);

  let label = "Charcoal";
  let status = "You need a rescue plan.";

  if (cookedScore <= 28) {
    label = "Chill";
    status = "You are more prepared than stressed.";
  } else if (cookedScore <= 50) {
    label = "Warm";
    status = "Manageable if you revise sharply.";
  } else if (cookedScore <= 74) {
    label = "Cooked";
    status = "Trim the fluff and drill the likely questions.";
  }

  return { cookedScore, label, status };
}

export function getNotesRank(notes) {
  const lines = notes.split("\n").map((line) => line.trim()).filter(Boolean);
  const headings = extractHeadings(notes).length;
  const bullets = lines.filter((line) => /^[-*0-9]/.test(line)).length;
  const avgLineLength =
    lines.length === 0 ? 0 : lines.reduce((sum, line) => sum + line.length, 0) / lines.length;

  if (headings >= 4 && bullets >= 6 && avgLineLength < 120) {
    return {
      label: "Locked In",
      reason: "Your notes have visible structure and revision-friendly chunks.",
    };
  }

  if (headings >= 2 || bullets >= 4) {
    return {
      label: "Decent",
      reason: "There is enough shape here to revise fast, but it can be tighter.",
    };
  }

  return {
    label: "Chaotic",
    reason: "The material is usable, but the structure is fighting you.",
  };
}

export function getCoverageGapScan(notes, result) {
  const lowerNotes = notes.toLowerCase();
  const checks = [
    {
      key: "compare",
      trigger: /compare|difference|distinguish|contrast/i,
      fallback: "Comparisons and distinctions are under-signaled in the notes.",
    },
    {
      key: "process",
      trigger: /step|process|stage|mechanism|pathway/i,
      fallback: "Stepwise mechanisms look thin. Expect process-based questions.",
    },
    {
      key: "definition",
      trigger: /define|definition|meaning|concept/i,
      fallback: "Core definitions are not highlighted clearly enough.",
    },
    {
      key: "application",
      trigger: /application|example|case|use|scenario/i,
      fallback: "Application-style examples may be missing from the note set.",
    },
  ];

  const gaps = checks
    .filter((item) => !item.trigger.test(lowerNotes))
    .map((item) => item.fallback);

  if (gaps.length >= 3) {
    return gaps.slice(0, 3);
  }

  const oracleGaps = result.examOracle
    .filter((item) => item.probability !== "low")
    .map((item) => item.question)
    .filter((question) => !lowerNotes.includes(question.toLowerCase().slice(0, 20)))
    .slice(0, 2)
    .map((question) => `Your notes do not state this clearly enough yet: ${question}`);

  return [...gaps, ...oracleGaps].slice(0, 3);
}

export function getAuraProfile(notes, result) {
  const { cookedScore } = getCookedSignal(notes, result);
  const rank = getNotesRank(notes);

  let aura = "Silent Sniper";
  let color = "from-emerald-300 via-cyan-300 to-sky-400";

  if (result.difficultyRating === "Hard" && cookedScore > 60) {
    aura = "Last-Minute Mystic";
    color = "from-amber-300 via-orange-300 to-rose-400";
  } else if (rank.label === "Locked In") {
    aura = "Topper Static";
    color = "from-cyan-200 via-sky-300 to-indigo-400";
  } else if (cookedScore > 75) {
    aura = "Panic Spark";
    color = "from-rose-200 via-fuchsia-300 to-orange-300";
  }

  return {
    aura,
    color,
    readiness: clamp(100 - cookedScore, 4, 95),
  };
}

export function getShareText(notes, result) {
  const cooked = getCookedSignal(notes, result);
  const aura = getAuraProfile(notes, result);

  return `Exam Aura: ${aura.aura}\nTopic: ${result.topicName}\nDifficulty: ${result.difficultyRating}\nHow Cooked Am I?: ${cooked.cookedScore}/100\nReadiness: ${aura.readiness}%`;
}
