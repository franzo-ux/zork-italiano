import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL(".", import.meta.url).pathname;
const read = file => fs.readFileSync(`${root}source/zork-it/${file}`, "utf8");
const english = /\b(?:The|You|There|This|Your|It|cannot|can't|isn't|don't|must)\b/;

test("il perimetro del primo capitolo non contiene messaggi inglesi", () => {
  const actions = read("1actions.zil").split("\n").slice(0, 575).join("\n");
  const dungeon = read("1dungeon.zil").split("\n").slice(1236, 1464).join("\n");
  const header = actions.indexOf("Zork I: The Great Underground Empire");
  const playable = header >= 0 ? actions.slice(actions.indexOf("\n", header) + 1) : actions;
  const withoutReleaseBanner = playable.replace(/The ZORK trilogy continues[\s\S]*?ZORK: The Great Underground Empire\.\|/g, "");
  assert.equal(english.test(withoutReleaseBanner), false);
  assert.equal(english.test(dungeon), false);
});

test("il vocabolario italiano base è presente", () => {
  const syntax = read("gsyntax.zil");
  for (const word of ["GUARDA", "ESAMINA", "APRI", "CHIUDI", "PRENDI", "LEGGI", "ENTRA", "SPOSTA", "AIUTO"]) {
    assert.match(syntax, new RegExp(`\\b${word}\\b`));
  }
});
