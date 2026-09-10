const rooms = {
  ovest: { title: "A ovest della casa", text: "Ti trovi in un campo aperto a ovest di una casa bianca, con una porta d'ingresso sbarrata.", exits: { nord: "nord", sud: "sud", ovest: "bosco" } },
  nord: { title: "A nord della casa", text: "Ti trovi a nord della casa bianca. Non ci sono porte qui; tutte le finestre sono sbarrate.", exits: { sud: "ovest", est: "est", ovest: "bosco" } },
  est: { title: "A est della casa", text: "Ti trovi in un campo aperto a est di una casa bianca. Una piccola finestra è leggermente socchiusa.", exits: { nord: "nord", sud: "sud", ovest: "dietro" } },
  sud: { title: "A sud della casa", text: "Ti trovi in un campo aperto a sud di una casa bianca. Non ci sono porte qui; tutte le finestre sono sbarrate.", exits: { nord: "ovest", est: "est", ovest: "bosco" } },
  dietro: { title: "Dietro la casa", text: "Ti trovi dietro la casa bianca. A est c'è una piccola finestra, ora socchiusa.", exits: { est: "cucina", nord: "est", sud: "sud" } },
  cucina: { title: "Cucina", text: "Sei nella cucina di una casa. Una scala porta in alto; a ovest c'è un soggiorno.", exits: { ovest: "soggiorno", est: "dietro", fuori: "dietro" } },
  soggiorno: { title: "Soggiorno", text: "Sei nel soggiorno. C'è un tappeto al centro della stanza e una porta a est conduce alla cucina.", exits: { est: "cucina" } },
  bosco: { title: "Bosco", text: "Questo è un bosco, con alberi in tutte le direzioni. Il sentiero verso la casa è a est.", exits: { est: "ovest" } }
};

const aliases = {
  n: "nord", north: "nord", nord: "nord", s: "sud", south: "sud", sud: "sud",
  e: "est", east: "est", est: "est", w: "ovest", west: "ovest", ovest: "ovest",
  out: "fuori", exit: "fuori", fuori: "fuori",
  u: "su", up: "su", su: "su", d: "giu", down: "giu", giu: "giu"
};
const verbs = {
  guarda: "guarda", look: "guarda", l: "guarda", osserva: "guarda",
  inventario: "inventario", inventory: "inventario", i: "inventario",
  apri: "apri", open: "apri", chiudi: "chiudi", close: "chiudi",
  prendi: "prendi", take: "prendi", get: "prendi", leggi: "leggi", read: "leggi",
  aiuto: "aiuto", help: "aiuto", ripeti: "guarda", again: "guarda"
};

function normalizza(command) {
  return command.toLowerCase().trim().replace(/[.!?]/g, "").replace(/\s+/g, " ");
}
function has(words, values) { return values.some(value => words.includes(value)); }

export function createGame() {
  const state = { room: "ovest", inventory: [], mailboxOpen: false, leafletRead: false, turns: 0 };
  const visited = new Set([state.room]);
  const connections = [];
  let hintLevel = 0;
  const describe = () => [`\n${rooms[state.room].title.toUpperCase()}`, rooms[state.room].text];
  const mapState = () => ({
    rooms: [...visited].map(id => ({ id, title: rooms[id].title })),
    connections: connections.map(connection => ({ ...connection })),
    currentRoom: state.room
  });
  const output = (lines, changed = false) => ({ lines, state: { ...state, map: mapState() }, changed });

  function move(direction) {
    const from = state.room;
    const target = rooms[from].exits[direction];
    if (!target) return output(["Non puoi andare da quella parte."]);
    if (!connections.some(edge => (edge.from === from && edge.to === target) || (edge.from === target && edge.to === from))) {
      connections.push({ from, to: target, direction });
    }
    visited.add(target);
    state.room = target;
    state.turns++;
    return output(describe(), true);
  }

  function inspect(target) {
    if (has(target, ["casa", "house"])) return output(["La casa è bianca, modesta e decisamente sospetta."]);
    if (has(target, ["finestra", "window"]) && ["est", "dietro", "cucina"].includes(state.room)) return output(["La piccola finestra è aperta abbastanza da poter entrare."]);
    if (has(target, ["cassetta", "mailbox", "posta"]) && state.room === "ovest") return output([state.mailboxOpen ? "La cassetta è aperta." : "C'è una piccola cassetta delle lettere qui."]);
    if (has(target, ["tappeto", "rug"]) && state.room === "soggiorno") return output(["È un tappeto persiano, di gran gusto."]);
    return output(["Non vedi nulla di simile qui."]);
  }

  return {
    start() { return output(["ZORK I — Edizione italiana", "Capitolo 1: La casa bianca", ...describe(), "", "Scrivi AIUTO per i comandi."]); },
    command(raw) {
      const command = normalizza(raw);
      if (!command) return output([]);
      const words = command.split(" ");
      const direct = aliases[words[0]];
      if (direct && words.length === 1) return move(direct);
      const verb = verbs[words[0]];
      const target = words.slice(1);
      if (!verb) return output([`Non riconosco il verbo “${words[0]}”. Prova AIUTO per i comandi disponibili.`]);
      if (verb === "guarda" && !target.length) return output(describe());
      if (verb === "inventario") return output([state.inventory.length ? `Hai con te: ${state.inventory.join(", ")}.` : "Non stai portando nulla."]);
      if (verb === "aiuto") return output(["Comandi: GUARDA, NORD/SUD/EST/OVEST, APRI, LEGGI, PRENDI, INVENTARIO.", "Sono accettati anche i comandi inglesi: LOOK, NORTH, OPEN, READ, TAKE, INVENTORY."]);
      if (verb === "apri" && has(target, ["cassetta", "mailbox", "posta"]) && state.room === "ovest") {
        if (state.mailboxOpen) return output(["La cassetta è già aperta."]);
        state.mailboxOpen = true; state.turns++;
        return output(["Apri la piccola cassetta delle lettere. Dentro c'è un volantino."], true);
      }
      if (verb === "chiudi" && has(target, ["cassetta", "mailbox"]) && state.room === "ovest") { state.mailboxOpen = false; return output(["Chiusa."]); }
      if (verb === "prendi" && has(target, ["volantino", "leaflet"])) {
        if (!state.mailboxOpen || state.room !== "ovest") return output(["Non vedi alcun volantino qui."]);
        if (state.inventory.includes("un volantino")) return output(["Lo hai già."]);
        state.inventory.push("un volantino"); state.turns++;
        return output(["Preso."], true);
      }
      if (verb === "leggi" && has(target, ["volantino", "leaflet"])) {
        if (!state.inventory.includes("un volantino")) return output(["Non lo stai portando."]);
        state.leafletRead = true; state.turns++;
        return output(["\"Benvenuto alla Grande Avventura Sotterranea.\"", "Il resto del volantino è purtroppo illeggibile."], true);
      }
      if (verb === "guarda") return inspect(target);
      if (has(target, ["porta", "door", "finestra", "window"])) return output(["Non puoi farlo adesso."]);
      return output([`Non vedi “${target.join(" ") || "quello"}” qui.`]);
    },
    hint() {
      hintLevel = Math.min(hintLevel + 1, 3);
      const hints = [
        "Osserva attentamente ciò che ti circonda: qualcosa vicino alla casa può contenere informazioni utili.",
        "La cassetta delle lettere merita attenzione. Prova ad aprirla.",
        "APRI CASSETTA, poi PRENDI VOLANTINO e LEGGI VOLANTINO."
      ];
      return output([`Suggerimento ${hintLevel}/3 — ${hints[hintLevel - 1]}`]);
    }
  };
}
