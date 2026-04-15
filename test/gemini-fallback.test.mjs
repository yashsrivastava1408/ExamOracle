import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

async function loadGenerator() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "examoracle-gemini-"));
  const typesSource = await fs.readFile(new URL("../types/index.ts", import.meta.url), "utf8");
  const geminiSource = await fs.readFile(new URL("../lib/gemini.ts", import.meta.url), "utf8");

  const compiledTypes = ts.transpileModule(typesSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2020,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const compiledGemini = ts.transpileModule(
    geminiSource.replace('from "@/types"', 'from "./types.js"'),
    {
      compilerOptions: {
        module: ts.ModuleKind.ES2020,
        target: ts.ScriptTarget.ES2020,
      },
    }
  ).outputText;

  const typesPath = path.join(tempDir, "types.js");
  const geminiPath = path.join(tempDir, "gemini.js");
  await fs.writeFile(typesPath, compiledTypes);
  await fs.writeFile(geminiPath, compiledGemini);

  return import(pathToFileURL(geminiPath).href);
}

const sampleNotes = `Cell Division

Mitosis is the process of cell division that produces two genetically identical diploid daughter cells.
The phases of mitosis are prophase, metaphase, anaphase, and telophase.
In metaphase, chromosomes align at the equatorial plate.
In anaphase, sister chromatids separate and move to opposite poles.
Cytokinesis divides the cytoplasm after nuclear division.
Meiosis produces four genetically different haploid cells and involves two divisions.
Mitosis and meiosis differ in number of divisions, chromosome number, and genetic similarity of daughter cells.
Humans have 46 chromosomes arranged in 23 pairs.
Crossing over occurs in meiosis I and increases genetic variation.
The cell cycle includes G1, S, G2, and M phase.`;

test("fallback exam prep returns enhanced revision fields", async () => {
  process.env.GEMINI_API_KEY = "";
  const { generateExamPrep } = await loadGenerator();
  const result = await generateExamPrep(sampleNotes);

  assert.equal(result.topicName, "Cell Division");
  assert.ok(result.examOracle.length >= 6);
  assert.ok(result.examOracle[0].answerOutline.length > 0);
  assert.equal(typeof result.examOracle[0].sampleAnswer, "string");
  assert.ok(result.examOracle[0].sampleAnswer.length > 20);
  assert.ok(result.flashcards.some((card) => card.mode === "comparison" || card.mode === "step-order"));
  assert.equal(result.mcqQuestions.length, 8);
  assert.ok(result.mcqQuestions.every((question) => question.options.length === 4));
  assert.ok(result.mcqQuestions.some((question) => question.options.some((option) => option.includes("It "))));
  assert.ok(result.keyTakeaways.length > 0);
  assert.ok(result.mistakeTraps.length > 0);
  assert.ok(result.mustMemorizeFacts.length > 0);
  assert.ok(result.summaryBlocks.likelyExamAngles.length > 20);
  assert.ok(result.rapidRevision.numbers.length > 0);
  assert.ok(result.rapidRevision.lists.length > 0);
});
