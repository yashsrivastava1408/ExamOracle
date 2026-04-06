import test from "node:test";
import assert from "node:assert/strict";
import {
  getAuraProfile,
  getCookedSignal,
  getCoverageGapScan,
  getNotesRank,
} from "../lib/prepSignals.mjs";

const sampleResult = {
  examOracle: [
    { question: "Compare mitosis and meiosis", probability: "high" },
    { question: "Explain the stages of mitosis", probability: "high" },
    { question: "Define cytokinesis", probability: "medium" },
  ],
  flashcards: new Array(10).fill({}),
  mcqQuestions: new Array(8).fill({}),
  difficultyRating: "Medium",
  topicName: "Cell Division",
};

test("getCookedSignal returns bounded score and label", () => {
  const cooked = getCookedSignal("Heading:\n- one\n- two\n- three\nDetailed revision notes here", sampleResult);
  assert.ok(cooked.cookedScore >= 0 && cooked.cookedScore <= 100);
  assert.equal(typeof cooked.label, "string");
});

test("getNotesRank distinguishes structured notes", () => {
  const ranked = getNotesRank(
    "Unit 1:\n- point one\n- point two\nMechanism:\n- stage a\n- stage b\nCompare:\n- x\n- y"
  );
  assert.equal(ranked.label, "Locked In");
});

test("getCoverageGapScan returns inferred missing areas", () => {
  const gaps = getCoverageGapScan("Simple notes without comparisons or stages", sampleResult);
  assert.ok(Array.isArray(gaps));
  assert.ok(gaps.length > 0);
});

test("getAuraProfile returns readiness and aura label", () => {
  const aura = getAuraProfile("Notes:\n- one\n- two\n- three", sampleResult);
  assert.ok(aura.readiness >= 0 && aura.readiness <= 100);
  assert.equal(typeof aura.aura, "string");
});
