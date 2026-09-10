import { createGame, translateAssistedInput } from "./game.js";

const story = document.querySelector("#story");
const form = document.querySelector("#command-form");
const input = document.querySelector("#command");
const turns = document.querySelector("#turns");
const game = createGame();
let mode = "classic";
let pending = [];

function escape(value) { const element = document.createElement("span"); element.textContent = value; return element.innerHTML; }
function print(lines, command = "") {
  if (command) story.insertAdjacentHTML("beforeend", `<p class="command">› ${escape(command)}</p>`);
  for (const line of lines) {
    const room = line && line === line.toUpperCase() && /[A-ZÀ-Ü]/.test(line);
    const assisted = line?.startsWith("Interpreto:");
    const className = room ? "room" : assisted ? "assisted" : "";
    story.insertAdjacentHTML("beforeend", line ? `<p${className ? ` class="${className}"` : ""}>${escape(line)}</p>` : '<p class="space"></p>');
  }
  story.scrollTop = story.scrollHeight;
}
function run(command) { const result = game.command(command); print(result.lines, command); turns.textContent = `turno ${result.state.turns}`; }
function preview(command) {
  const translated = translateAssistedInput(command);
  if (!translated.commands.length) return print(["Non riesco a tradurlo in un comando del gioco. Prova a formulare un'azione alla volta."]);
  pending = translated.commands;
  const note = translated.understood ? "Premi INVIO per eseguire, oppure scrivi una nuova frase." : "Ho interpretato solo le parti che riconosco. Premi INVIO per eseguire.";
  print([`Interpreto: ${pending.join(" → ").toUpperCase()}. ${note}`], command);
  input.value = "";
  input.placeholder = "Invio per eseguire la sequenza";
}
function executePending() {
  const commands = pending;
  pending = [];
  input.placeholder = mode === "assisted" ? "Scrivi cosa vuoi provare…" : "";
  commands.forEach(run);
}

print(game.start().lines);
form.addEventListener("submit", event => {
  event.preventDefault();
  const command = input.value.trim();
  if (!command && pending.length) return executePending();
  if (!command) return;
  if (mode === "assisted") preview(command); else { run(command); input.value = ""; }
});
document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => {
  mode = button.dataset.mode;
  pending = [];
  input.value = "";
  input.placeholder = mode === "assisted" ? "Scrivi cosa vuoi provare…" : "";
  document.querySelectorAll("[data-mode]").forEach(item => item.classList.toggle("active", item === button));
  print([mode === "assisted" ? "Modalità assistita: descrivi l'azione; ti proporrò i comandi prima di eseguirli." : "Modalità classica: il parser riceve i comandi direttamente."]);
}));
const help = document.querySelector("#help");
let hints = 0;
help.addEventListener("click", () => {
  const result = game.hint();
  hints = Math.min(hints + 1, 3);
  print(result.lines);
  help.textContent = `AIUTO · ${hints}/3`;
});
