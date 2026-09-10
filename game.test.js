import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "./game.js";

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

test("l'automappa registra solo movimenti riusciti", () => {
  const game = createGame();
  const start = game.start().state.map;
  assert.deepEqual(start.rooms.map(room => room.id), ["ovest"]);
  assert.equal(start.connections.length, 0);
  const failed = game.command("est").state.map;
  assert.deepEqual(failed, start);
  const north = game.command("nord").state.map;
  assert.deepEqual(north.rooms.map(room => room.id), ["ovest", "nord"]);
  assert.deepEqual(north.connections, [{ from: "ovest", to: "nord", direction: "nord" }]);
  const back = game.command("sud").state.map;
  assert.equal(back.connections.length, 1);
  assert.equal(back.currentRoom, "ovest");
});
