import { createGame, translateAssistedInput } from "./game.js";

const story = document.querySelector("#story");
const form = document.querySelector("#command-form");
const input = document.querySelector("#command");
const turns = document.querySelector("#turns");
const mapElement = document.querySelector("#map");
const game = createGame();
let mode = "classic";
let pending = [];
const vectors = { nord: [0, -1, 0], sud: [0, 1, 0], est: [1, 0, 0], ovest: [-1, 0, 0], su: [0, 0, 1], giu: [0, 0, -1] };

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
function mapPositions(map) {
  const positions = new Map([[map.rooms[0].id, { x: 0, y: 0, z: 0 }]]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of map.connections) {
      const from = positions.get(edge.from);
      const to = positions.get(edge.to);
      if (from && !to) place(edge.to, from, edge.direction, 1);
      if (to && !from) place(edge.from, to, edge.direction, -1);
    }
  }
  return positions;

  function place(id, origin, direction, sign) {
    const [dx, dy, dz] = vectors[direction] || [0, 0, 0];
    const position = { x: origin.x + dx * sign, y: origin.y + dy * sign, z: origin.z + dz * sign };
    while ([...positions.values()].some(point => point.x === position.x && point.y === position.y && point.z === position.z)) {
      position.x += .35;
      position.y += .35;
    }
    positions.set(id, position);
    changed = true;
  }
}
function renderMap(map) {
  const positions = mapPositions(map);
  const points = [...positions.values()];
  const minX = Math.min(...points.map(point => point.x));
  const maxX = Math.max(...points.map(point => point.x));
  const minY = Math.min(...points.map(point => point.y));
  const maxY = Math.max(...points.map(point => point.y));
  const cell = 40;
  const width = (maxX - minX + 1) * cell + 32;
  const height = (maxY - minY + 1) * cell + 32;
  const point = position => ({ x: (position.x - minX) * cell + 16 + position.z * 7, y: (position.y - minY) * cell + 16 - position.z * 7 });
  mapElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const links = map.connections.map(edge => {
    const from = point(positions.get(edge.from));
    const to = point(positions.get(edge.to));
    const vertical = edge.direction === "su" || edge.direction === "giu";
    const marker = vertical ? `<text class="map-arrow" x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 - 3}">${edge.direction === "su" ? "↑" : "↓"}</text>` : "";
    return `<line class="map-link${vertical ? " vertical" : ""}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"/>${marker}`;
  }).join("");
  const nodes = map.rooms.map(room => {
    const position = point(positions.get(room.id));
    const current = room.id === map.currentRoom;
    return `<g class="map-node${current ? " current" : ""}" transform="translate(${position.x} ${position.y})"><title>${escape(room.title)}</title><rect x="-9" y="-9" width="18" height="18" rx="2"/><text y="3">${escape(room.id.slice(0, 2).toUpperCase())}</text></g>`;
  }).join("");
  mapElement.innerHTML = `${links}${nodes}`;
}
function apply(result, command = "") { print(result.lines, command); turns.textContent = `turno ${result.state.turns}`; renderMap(result.state.map); }
function run(command) { apply(game.command(command), command); }
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

apply(game.start());
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
  apply(result);
  help.textContent = `AIUTO · ${hints}/3`;
});
