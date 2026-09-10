import test from "node:test";
import assert from "node:assert/strict";
import { createGame, translateAssistedInput } from "./game.js";

test("accetta comandi italiani e inglesi e conserva l'inventario", () => {
  const game = createGame();
  game.start();
  assert.equal(game.command("north").state.room, "nord");
  assert.equal(game.command("sud").state.room, "ovest");
  game.command("apri cassetta");
  assert.match(game.command("take leaflet").lines[0], /Preso/);
  assert.match(game.command("leggi volantino").lines[0], /Benvenuto/);
});

test("non permette di prendere il volantino prima di aprire la cassetta", () => {
  const game = createGame();
  game.start();
  assert.match(game.command("prendi volantino").lines[0], /Non vedi/);
});

test("distingue verbo sconosciuto, oggetto assente e azione impossibile", () => {
  const game = createGame();
  game.start();
  assert.match(game.command("danza").lines[0], /verbo/);
  assert.match(game.command("apri tesoro").lines[0], /Non vedi/);
  assert.match(game.command("apri porta").lines[0], /Non puoi/);
});

test("offre suggerimenti progressivi", () => {
  const game = createGame();
  assert.match(game.hint().lines[0], /1\/3/);
  assert.match(game.hint().lines[0], /2\/3/);
  assert.match(game.hint().lines[0], /3\/3/);
});

test("traduce una frase assistita in una sequenza classica", () => {
  const result = translateAssistedInput("provo ad aprire la finestra e poi entro");
  assert.deepEqual(result.commands, ["apri finestra", "est"]);
  assert.equal(result.understood, true);
});
