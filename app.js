import { createGame } from "./game.js";

const story = document.querySelector("#story");
const form = document.querySelector("#command-form");
const input = document.querySelector("#command");
const turns = document.querySelector("#turns");
const game = createGame();

function print(lines, command = "") {
  if (command) story.insertAdjacentHTML("beforeend", `<p class="command">› ${escape(command)}</p>`);
  for (const line of lines) story.insertAdjacentHTML("beforeend", line ? `<p>${escape(line)}</p>` : '<p class="space"></p>');
  story.scrollTop = story.scrollHeight;
}
function escape(value) { const element = document.createElement("span"); element.textContent = value; return element.innerHTML; }
function run(command) { const result = game.command(command); print(result.lines, command); turns.textContent = `turno ${result.state.turns}`; }

print(game.start().lines);
form.addEventListener("submit", event => { event.preventDefault(); const command = input.value.trim(); if (command) run(command); input.value = ""; });
document.querySelector("#help").addEventListener("click", () => run("aiuto"));
