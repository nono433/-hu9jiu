"use strict";
/* ============================================================
   POTATO VS. ZOMBIES — script.js
   1. Réglages   2. État   3. Interface   4. Actions du joueur
   5. Vagues     6. Boucle de jeu   7. Fin de partie   8. Démarrage
   Les positions sont en "cases" : x = 0 est le bord gauche du jardin.
   ============================================================ */

/* ---------- 1. RÉGLAGES (change les chiffres pour modifier le jeu) ---------- */
const COLS = 9, ROWS = 5;      // taille du jardin
const NB_VAGUES = 7;           // vagues à survivre
const VAGUES_PAR_MONDE = 4;
const MONDES = [
  { nom: "Plage des frites", theme: "monde-plage", monstres: ["crabe", "surfeur"], boss: { nom: "Capitaine Crabe", acc: "🦀", armure: 0.4 } },
  { nom: "Jardin crépusculaire", theme: "monde-nuit", monstres: ["fantome", "chauve-souris"], boss: { nom: "Reine spectrale", acc: "👻", esquive: 0.25 } },
  { nom: "Volcan Patator", theme: "monde-volcan", monstres: ["magma", "golem"], boss: { nom: "Roi Magma", acc: "🌋", brulure: 14 } },
  { nom: "Forêt des racines", theme: "monde-foret", monstres: ["spore", "liane"], boss: { nom: "Ancien champignon", acc: "🍄", soinAura: 38 } },
  { nom: "Glacier des patates", theme: "monde-glace", monstres: ["yeti", "patineur"], boss: { nom: "Yéti royal", acc: "❄️", geler: 2.2 } }
];
const NB_VAGUES_HISTOIRE = MONDES.length * VAGUES_PAR_MONDE;
const SOLEIL_DEPART = 125;     // choisir entre défense immédiate et économie
const NB_PATATES_EQUIPE = 5;
const NIVEAU_MAX = 3;          // fusion : 2 patates identiques -> niveau supérieur
const MULT = [1, 2.6, 6.5];            // force (dégâts, soleil, vie) selon le niveau
const CADENCE_NIV = [1, 1.3, 1.7];     // vitesse de tir selon le niveau
const GAIN_DOREE = 100;        // valeur de la patate dorée (mécanique n° 01)

const DEFENSEURS = {
  tireuse:   { nom: "Patate tireuse",   cout: 100, pv: 100, acc: "🕶️", cadence: 1.4, degats: 20, texte: "Tire sur sa ligne" },
  solaire:   { nom: "Patate solaire",   cout: 75,  pv: 80,  acc: "🌞", cadence: 8.5, gain: 20,    texte: "+20 ☀ toutes les 8,5 s" },
  gardienne: { nom: "Patate gardienne", cout: 75,  pv: 450, acc: "🪖", texte: "Très résistante, bloque" },
  bombarde:  { nom: "Patate pétarade",  cout: 125, pv: 95,  acc: "💣", cadence: 3.2, degats: 55, effet: "explosif", texte: "Explosion de zone" },
  glacee:    { nom: "Patate givrée",    cout: 110, pv: 90,  acc: "❄️", cadence: 1.8, degats: 16, effet: "ralentir", texte: "Ralentit les zombies" },
  boomerang: { nom: "Patate boomerang",cout: 135, pv: 95,  acc: "🪃", cadence: 2.2, degats: 28, effet: "percer", texte: "Traverse les zombies" },
  soigneuse: { nom: "Patate soigneuse",cout: 125, pv: 110, acc: "🌺", cadence: 2.5, soin: 35, texte: "Soigne les patates proches" },
  epineuse:  { nom: "Patate hérisson", cout: 90,  pv: 180, acc: "🌵", epines: 24, texte: "Blesse les zombies qui la mordent" },
  jumelle:   { nom: "Patate jumelle", cout: 160, pv: 100, acc: "🥽", cadence: 2.8, degats: 18, salves: 2, texte: "Tire deux projectiles à la fois" },
  electrique:{ nom: "Patate électrique",cout: 145, pv: 100, acc: "⚡", cadence: 2.2, degats: 30, effet: "chaine", texte: "Éclair rebondissant jusqu'à 3 fois" },
  mineuse:   { nom: "Patate mineuse", cout: 100, pv: 120, acc: "🧨", mine: 190, texte: "Explose près d'un zombie" }
};
const ZOMBIES = {
  classique: { pv: 115, vitesse: 0.16, degats: 24, acc: "🎩" },  // lent, résistant
  rapide:    { pv: 65,  vitesse: 0.36, degats: 24, acc: "💨" },  // rapide, fragile
  costaud:   { pv: 300, vitesse: 0.12, degats: 36, acc: "🪣" },  // très résistant
  boss:      { pv: 620, vitesse: 0.075, degats: 48, acc: "👑" },
  crabe:     { pv: 210, vitesse: 0.10, degats: 32, acc: "🦀", armure: 0.38 },
  surfeur:   { pv: 85, vitesse: 0.48, degats: 20, acc: "🏄" },
  fantome:   { pv: 150, vitesse: 0.20, degats: 25, acc: "👻", esquive: 0.28 },
  "chauve-souris": { pv: 75, vitesse: 0.50, degats: 18, acc: "🦇" },
  magma:     { pv: 190, vitesse: 0.15, degats: 28, acc: "🔥", brulure: 12 },
  golem:     { pv: 390, vitesse: 0.085, degats: 42, acc: "🪨" },
  spore:     { pv: 170, vitesse: 0.12, degats: 22, acc: "🍄", soinAura: 28 },
  liane:     { pv: 250, vitesse: 0.11, degats: 26, acc: "🌿", armure: 0.18 },
  yeti:      { pv: 360, vitesse: 0.10, degats: 38, acc: "❄️", geler: 1.8 },
  patineur:  { pv: 90, vitesse: 0.52, degats: 18, acc: "⛸️" }
};

/* ---------- 2. ÉTAT DE LA PARTIE ---------- */
const $ = id => document.getElementById(id);
let g = { running: false, pause: false };   // g = tout l'état de la partie
let cartes = {};                            // boutons de la barre de sélection
let modeSelectionne = "classique";
let equipeSelectionnee = ["tireuse", "solaire", "gardienne", "bombarde", "glacee"];
let numeroFusion = 0;
let numeroIllustration = 0;
let msgTimer = null;
function texteAide() {
  return g.mode === "infini"
    ? "Clique une patate puis une case vide pour la déplacer, ou une autre patate pour fusionner."
    : "Choisis une patate dans la barre, puis une case libre. Clique une patate posée puis une case vide pour la déplacer.";
}

function reinitialiser() {
  g = {
    running: true, pause: false, mode: modeSelectionne,
    soleil: SOLEIL_DEPART,
    vague: 0, file: [],                     // file = zombies de la vague qui restent à faire apparaître
    attente: 10,                            // secondes avant la prochaine vague
    delaiApparition: 0, intervalle: 6,
    facteurPV: 1, facteurVitesse: 1,
    facteurDegats: 1, mondeIndex: 0,
    tues: 0, tuesVague: 0, total: 0,
    plantes: [], zombies: [], tirs: [],
    grille: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
    choix: null, fusion: null,
    delaiDoree: 28 + Math.random() * 12
  };
  if (g.mode === "classique") for (let n = 1; n <= NB_VAGUES; n++) g.total += tailleVague(n);
  if (g.mode === "histoire") for (let n = 1; n <= NB_VAGUES_HISTOIRE; n++) g.total += tailleVague(n) + (n % VAGUES_PAR_MONDE === 0 ? 1 : 0);
  $("couche").innerHTML = "";
  $("jeu").classList.remove(...MONDES.map(m => m.theme));
}

/* ---------- 3. INTERFACE ---------- */
function creerEl(classe) {
  const e = document.createElement("div");
  e.className = classe;
  $("couche").appendChild(e);
  return e;
}
function positionner(e, x, ligne) {
  e.style.left = (x / COLS * 100) + "%";
  e.style.top = (ligne * 100 / ROWS) + "%";
}
// Illustration vectorielle intégrée : aucun fichier distant, nette à toute taille.
function illustration(type) {
  const couleurs = {
    tireuse:["#f1c26c","#ae6d34"], solaire:["#f8d86d","#da9630"], gardienne:["#c6a477","#765331"],
    bombarde:["#ef9d59","#ac4828"], glacee:["#a6e8ef","#438da1"], boomerang:["#c6b5eb","#7059a7"],
    soigneuse:["#ffc0d0","#c35c7d"], epineuse:["#abd676","#558341"], jumelle:["#f2d27b","#ae792f"],
    electrique:["#b9aaf0","#6654bb"], mineuse:["#d8a76d","#8e552e"],
    zombie:["#a9ce76","#557e43"], "zombie rapide":["#c6a0d8","#76548d"], "zombie costaud":["#a2aa91","#525c46"], "zombie boss":["#936076","#453044"],
    "zombie crabe":["#e89568","#9d4836"], "zombie surfeur":["#90c6d6","#386b83"],
    "zombie fantome":["#c4e7d7","#6d9b9d"], "zombie chauve-souris":["#aa8bc4","#594571"],
    "zombie magma":["#dd8053","#783628"], "zombie golem":["#b4a28a","#625746"],
    "zombie spore":["#c1ce82","#617b48"], "zombie liane":["#9dbb67","#4c6e3d"],
    "zombie yeti":["#c4e8ed","#6794a7"], "zombie patineur":["#9ed9df","#4d899d"],
    doree:["#fff28c","#db891a"]
  };
  let key = type;
  if (type.startsWith("hybride")) key = "tireuse";
  const [clairBase, foncéBase] = couleurs[key] || couleurs.tireuse;
  const donneesFusion = DEFENSEURS[type];
  const clair = type.startsWith("hybride") ? (donneesFusion.couleurA || clairBase) : clairBase;
  const foncé = type.startsWith("hybride") ? (donneesFusion.couleurB || foncéBase) : foncéBase;
  const idPeau = "peau-" + (++numeroIllustration);
  const zombie = type.startsWith("zombie");
  const accessoires = {
    tireuse:'<path d="M34 34q26-19 52 0l-4 9H38z" fill="#d94e36" stroke="#71301f" stroke-width="3"/><path d="M79 57h33v13H79z" rx="4" fill="#566e72" stroke="#2b4143" stroke-width="3"/><circle cx="108" cy="63" r="5" fill="#d6e2d4"/>',
    solaire:'<g fill="#ffcc38" stroke="#b87324" stroke-width="2"><path d="M60 5l6 18-6 7-6-7z"/><path d="M60 5l6 18-6 7-6-7z" transform="rotate(45 60 34)"/><path d="M60 5l6 18-6 7-6-7z" transform="rotate(90 60 34)"/><path d="M60 5l6 18-6 7-6-7z" transform="rotate(135 60 34)"/><path d="M60 5l6 18-6 7-6-7z" transform="rotate(180 60 34)"/><path d="M60 5l6 18-6 7-6-7z" transform="rotate(225 60 34)"/><path d="M60 5l6 18-6 7-6-7z" transform="rotate(270 60 34)"/><path d="M60 5l6 18-6 7-6-7z" transform="rotate(315 60 34)"/></g><circle cx="60" cy="34" r="10" fill="#a96727" stroke="#fff0a4" stroke-width="3"/>',
    gardienne:'<path d="M22 54l-14 9 5 26q10 12 20 0l4-26z" fill="#e4c17c" stroke="#654522" stroke-width="4"/><path d="M17 67h18m-18 9h18" stroke="#fff1bd" stroke-width="3"/>',
    bombarde:'<path d="M38 30q22-21 44 0l-3 10H41z" fill="#d94a32" stroke="#73321e" stroke-width="3"/><circle cx="60" cy="18" r="8" fill="#36302c" stroke="#191817" stroke-width="3"/><path d="M65 12q10-7 9-14" fill="none" stroke="#f6bf48" stroke-width="3"/>',
    glacee:'<path d="M39 37l8-17 8 14 7-18 9 18 9-12 5 17H39z" fill="#eaffff" stroke="#55a8ba" stroke-width="3"/><path d="M37 80h46v11H37z" fill="#dc5360"/><path d="M43 80l8 11m7-11 8 11m7-11 8 11" stroke="#fff4dc" stroke-width="4"/>',
    boomerang:'<path d="M22 42q-5-22 11-28l9 7-10 8q-3 6 0 12l26 20-8 8z" fill="#f4df78" stroke="#704625" stroke-width="4"/>',
    soigneuse:'<g fill="#fff0a6" stroke="#a84265" stroke-width="2"><circle cx="60" cy="18" r="8"/><circle cx="49" cy="23" r="8"/><circle cx="71" cy="23" r="8"/><circle cx="52" cy="11" r="8"/><circle cx="68" cy="11" r="8"/></g><circle cx="60" cy="18" r="6" fill="#eda133"/><path d="M60 54v18m-9-9h18" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
    epineuse:'<path d="M27 40l9-20 8 15 10-24 8 24 13-19 4 24" fill="#5c9b48" stroke="#315d31" stroke-width="3"/>',
    jumelle:'<path d="M32 36h21v17H32zm35 0h21v17H67z" fill="#a45d39" stroke="#542c22" stroke-width="4"/><path d="M53 42h14" stroke="#f4df9a" stroke-width="5"/><path d="M30 33q28-17 60 0" fill="none" stroke="#554632" stroke-width="5"/>',
    electrique:'<path d="M67 5L42 39h18l-8 29 30-41H64z" fill="#fff16b" stroke="#6855bf" stroke-width="4"/>',
    mineuse:'<path d="M31 34q4-22 29-22t29 22z" fill="#e6b04a" stroke="#73421f" stroke-width="4"/><path d="M29 35h62" stroke="#65401f" stroke-width="5"/><circle cx="60" cy="20" r="5" fill="#fff3a4" stroke="#b66d27" stroke-width="2"/>',
    zombie:'<path d="M37 33q3-16 23-13l-2 9 18-4 8 10-23 3z" fill="#68533f" stroke="#39372f" stroke-width="3"/><path d="M38 80l-4 15h18l8-14m8 0 5 14h18l-7-18" fill="#506676" stroke="#343c3d" stroke-width="3"/>',
    "zombie rapide":'<path d="M38 34q20-18 45 0l-4 9H41z" fill="#8157a0" stroke="#4b3264" stroke-width="3"/><path d="M39 81l-5 15h18l7-15m8 0 7 15h18l-7-19" fill="#a84145" stroke="#58353d" stroke-width="3"/>',
    "zombie costaud":'<path d="M34 33q2-27 26-27t26 27H34z" fill="#68715c" stroke="#323a30" stroke-width="4"/><path d="M35 28h50" stroke="#d4a75d" stroke-width="5"/><path d="M38 80l-4 16h20l4-15m7 0 5 15h19l-5-19" fill="#44464c" stroke="#303038" stroke-width="3"/>',
    "zombie boss":'<path d="M35 34l4-23 13 12 8-19 9 19 14-12 3 23z" fill="#f5c84b" stroke="#543522" stroke-width="4"/><circle cx="60" cy="24" r="5" fill="#fff1a1"/><path d="M32 87h56v12H32z" fill="#563845" stroke="#2e2530" stroke-width="4"/>',
    "zombie crabe":'<path d="M35 34q25-17 50 0v8H35z" fill="#a74336" stroke="#5a282a" stroke-width="4"/><path d="M36 35l-14-13 2 19 12 5m48-11 14-13-2 19-12 5" fill="#dc7555" stroke="#71352b" stroke-width="4"/>',
    "zombie surfeur":'<path d="M37 34q23-15 46 0v7H37z" fill="#287f9e" stroke="#254758" stroke-width="3"/><path d="M15 84q16-18 32-5t38 1" fill="none" stroke="#f2d36c" stroke-width="7" stroke-linecap="round"/>',
    "zombie fantome":'<path d="M37 33q23-21 46 0l-5 8H42z" fill="#d9f7e9" stroke="#659799" stroke-width="3"/><path d="M33 45q27-18 54 0" fill="none" stroke="#d4fff5" stroke-width="6"/>',
    "zombie chauve-souris":'<path d="M35 38l-20-18 8 26-17 7 25 3m54-18 20-18-8 26 17 7-25 3" fill="#47365e" stroke="#28243f" stroke-width="4"/><path d="M41 31l19-16 19 16" fill="#5e477e" stroke="#352846" stroke-width="3"/>',
    "zombie magma":'<path d="M34 37l8-17 8 10 10-24 8 23 12-17 6 25z" fill="#ff7a38" stroke="#772c23" stroke-width="4"/><path d="M44 34h32" stroke="#ffe279" stroke-width="4"/>',
    "zombie golem":'<path d="M34 33l4-19 15 8 8-15 11 16 13-5 3 18z" fill="#80725e" stroke="#413b34" stroke-width="4"/><path d="M36 84h48" stroke="#ddd0ac" stroke-width="7"/>',
    "zombie spore":'<path d="M31 35q4-24 29-24t29 24z" fill="#d6c170" stroke="#637440" stroke-width="4"/><circle cx="47" cy="29" r="4" fill="#fff4bd"/><circle cx="70" cy="22" r="3" fill="#fff4bd"/>',
    "zombie liane":'<path d="M35 33q-10-14-3-22 10 4 10 16 8-20 20-23 8 13-5 29 18-17 29-11-4 15-20 20z" fill="#628b45" stroke="#385d36" stroke-width="3"/>',
    "zombie yeti":'<path d="M32 37l7-19 9 12 11-24 9 24 13-15 7 22z" fill="#e3ffff" stroke="#74a8b4" stroke-width="4"/><path d="M38 83h44" stroke="#e6ffff" stroke-width="8"/>',
    "zombie patineur":'<path d="M37 35q23-18 46 0l-4 9H41z" fill="#53b4c2" stroke="#306b7a" stroke-width="3"/><path d="M31 80q29 15 58 0" fill="none" stroke="#e9ffff" stroke-width="6"/>'
  };
  let accessoire = accessoires[key] || (type.startsWith("hybride") ? '<path d="M37 31q23-17 46 0l-4 9H41z" fill="#ffdf74" stroke="#66462c" stroke-width="3"/>' : "");
  const visage = zombie
    ? '<path d="M36 53l18 5m30-5-18 5" stroke="#3e3028" stroke-width="6" stroke-linecap="round"/><path d="M48 79q12-10 24 0v8H48z" fill="#38282a" stroke="#583b30" stroke-width="3"/><path d="M52 79h5v5h-5zm11 0h5v5h-5z" fill="#fff0c9"/>'
    : '<path d="M36 50l18 5m30-5-18 5" stroke="#483022" stroke-width="5" stroke-linecap="round"/><path d="M48 78q12 10 24 0" fill="none" stroke="#62372c" stroke-width="4" stroke-linecap="round"/><path d="M52 79h16" stroke="#fff0d0" stroke-width="2"/>';
  return `<svg class="illustration" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="${idPeau}" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="${clair}"/><stop offset=".6" stop-color="${clair}"/><stop offset="1" stop-color="${foncé}"/></linearGradient></defs><ellipse cx="60" cy="108" rx="34" ry="7" fill="#211b18" opacity=".4"/><path d="M38 77q-7 17-4 27h18l8-13 9 13h18q3-14-5-29" fill="${zombie ? "#52616a" : "#76502c"}" stroke="#493323" stroke-width="4" stroke-linejoin="round"/><path d="M35 54q-13 4-17 17l13 10 14-15m39-12q13 4 17 17L89 81 75 66" fill="url(#${idPeau})" stroke="#633f28" stroke-width="4" stroke-linecap="round"/><path d="M60 18C35 18 24 39 27 64q2 30 33 33 31-3 33-33C96 39 85 18 60 18Z" fill="url(#${idPeau})" stroke="#654326" stroke-width="4"/><path d="M35 34q25-22 50 0" fill="none" stroke="#fff" stroke-opacity=".48" stroke-width="9" stroke-linecap="round"/>${visage}<ellipse cx="45" cy="61" rx="9" ry="12" fill="#fffdf0" stroke="#593f31" stroke-width="2"/><ellipse cx="75" cy="61" rx="9" ry="12" fill="#fffdf0" stroke="#593f31" stroke-width="2"/><ellipse cx="48" cy="63" rx="4" ry="7" fill="${zombie ? "#be2e37" : "#30251f"}"/><ellipse cx="78" cy="63" rx="4" ry="7" fill="${zombie ? "#be2e37" : "#30251f"}"/><circle cx="47" cy="60" r="2" fill="#fff"/><circle cx="77" cy="60" r="2" fill="#fff"/><circle cx="35" cy="71" r="4" fill="#ec927b" opacity=".7"/><circle cx="85" cy="71" r="4" fill="#ec927b" opacity=".7"/><g>${accessoire}</g>${zombie?'<path d="M83 44l-8 9 7 4-7 9" fill="none" stroke="#56683d" stroke-width="3"/>':''}</svg>`;
}
function dessinerPatate(classe, acc) {
  const e = creerEl("pot " + classe);
  const type = classe.includes("zombie") ? (classe.trim() === "zombie" ? "zombie" : "zombie " + classe.trim().split(/\s+/).slice(1).join(" ")) : classe.split(" ")[0];
  e.innerHTML = '<div class="corps">' + illustration(type) + '<i class="embleme embleme-a"></i><i class="embleme embleme-b"></i></div><span class="acc" aria-hidden="true">' + acc + '</span><i class="bras g"></i><i class="bras d"></i><i class="canon"></i><em class="niv"></em><i class="pv"><b></b></i>';
  return e;
}
/* Met à jour la petite barre de vie d'une patate ou d'un zombie */
function barreVie(o) {
  const b = o.el.querySelector(".pv");
  if (!b) return;
  b.style.display = o.pv < o.max ? "block" : "none";
  b.firstChild.style.width = Math.max(0, o.pv / o.max * 100) + "%";
}
function message(texte) {
  $("msg").textContent = texte;
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => $("msg").textContent = texteAide(), 2500);
}
function bandeau(texte) {
  const b = $("bandeau");
  b.textContent = texte;
  b.classList.remove("montre");
  void b.offsetWidth;                       // redémarre l'animation
  b.classList.add("montre");
}
function flottant(texte, x, ligne) {
  const f = creerEl("flottant");
  f.textContent = texte;
  positionner(f, x, ligne);
  setTimeout(() => f.remove(), 1000);
}
function majInterface() {
  $("soleil").textContent = Math.floor(g.soleil);
  $("vague").textContent = Math.max(1, g.vague);
  $("nbv").textContent = g.mode === "infini" ? "∞" : g.mode === "histoire" ? NB_VAGUES_HISTOIRE : NB_VAGUES;
  const mondeIndex = Math.floor(Math.max(0, g.vague - 1) / VAGUES_PAR_MONDE) % MONDES.length;
  $("monde-info").classList.toggle("cache", g.mode !== "histoire");
  if (g.mode === "histoire") {
    $("monde-nom").textContent = MONDES[mondeIndex].nom;
    $("monde-numero").textContent = mondeIndex + 1;
    $("monde-etape").textContent = ((Math.max(1, g.vague) - 1) % VAGUES_PAR_MONDE) + 1;
  }
  const progression = g.mode === "infini"
    ? (g.vague ? g.tuesVague / tailleVague(g.vague) : 0)
    : (g.total ? g.tues / g.total : 0);
  $("progres").style.width = (progression * 100) + "%";
  for (const type in cartes) cartes[type].classList.toggle("trop-cher", DEFENSEURS[type].cout > g.soleil);
}
function creerCases() {
  const zone = $("cases");
  zone.innerHTML = "";
  for (let l = 0; l < ROWS; l++) for (let c = 0; c < COLS; c++) {
    const b = document.createElement("button");
    b.className = "case" + ((l + c) % 2 ? " b" : "");
    b.dataset.ligne = l; b.dataset.col = c;
    b.setAttribute("aria-label", "Ligne " + (l + 1) + ", colonne " + (c + 1));
    zone.appendChild(b);
  }
  $("stock").innerHTML = '<div class="caisse">📦</div>'.repeat(ROWS);
}
function creerCartes() {
  const zone = $("cartes");
  zone.innerHTML = "";
  let i = 1;
  for (const type of equipeSelectionnee) {
    const d = DEFENSEURS[type];
    const b = document.createElement("button");
    b.className = "carte";
    b.innerHTML = '<span class="carte-icone">' + d.acc + '</span><span class="carte-titre">' + i++ + '. ' + d.nom + '</span><small>☀ ' + d.cout + ' — ' + d.texte + '</small>';
    b.onclick = () => choisir(type);
    zone.appendChild(b);
    cartes[type] = b;
  }
}

// Écran de préparation : on compose une équipe de cinq patates avant la partie.
function creerSelectionPatates() {
  const zone = $("choix-plantes");
  zone.innerHTML = "";
  for (const [type, d] of Object.entries(DEFENSEURS)) {
    const b = document.createElement("button");
    b.className = "choix-plante" + (equipeSelectionnee.includes(type) ? " active" : "");
    b.innerHTML = '<span class="choix-icone">' + d.acc + '</span><b>' + d.nom + '</b><small>☀ ' + d.cout + ' · ' + d.texte + '</small>';
    b.onclick = () => {
      if (equipeSelectionnee.includes(type)) {
        equipeSelectionnee = equipeSelectionnee.filter(t => t !== type);
      } else if (equipeSelectionnee.length < NB_PATATES_EQUIPE) {
        equipeSelectionnee.push(type);
      }
      creerSelectionPatates();
    };
    zone.appendChild(b);
  }
  $("compteur-selection").textContent = "Patates choisies : " + equipeSelectionnee.length + "/" + NB_PATATES_EQUIPE + " · " + Object.keys(DEFENSEURS).length + " disponibles";
  $("b-partie").disabled = equipeSelectionnee.length !== NB_PATATES_EQUIPE;
}
function ouvrirPreparation() {
  $("menu").classList.add("cache");
  $("preparation").classList.remove("cache");
  choisirMode(modeSelectionne);
  creerSelectionPatates();
}
function choisirMode(mode) {
  modeSelectionne = mode;
  $("mode-classique").classList.toggle("active", mode === "classique");
  $("mode-infini").classList.toggle("active", mode === "infini");
  $("mode-histoire").classList.toggle("active", mode === "histoire");
}

/* ---------- 4. ACTIONS DU JOUEUR ---------- */
function choisir(type) {
  g.fusion = null; marquerFusion();
  g.choix = (g.choix === type) ? null : type;
  for (const t in cartes) cartes[t].classList.toggle("choisie", t === g.choix);
  $("cases").classList.toggle("avec-choix", !!g.choix);
}
function poser(ligne, col) {
  if (g.grille[ligne][col]) return cliquerPlante(g.grille[ligne][col]);   // sélection ou fusion selon le mode
  // Une patate sélectionnée se déplace vers la case vide, sans coût.
  if (g.fusion) {
    const p = g.fusion;
    g.grille[p.ligne][p.col] = null;
    p.ligne = ligne; p.col = col;
    g.grille[ligne][col] = p;
    positionner(p.el, col, ligne);
    g.fusion = null;
    marquerFusion();
    message("Patate déplacée !");
    return;
  }
  if (!g.choix) return message("Choisis d'abord une patate !");
  const d = DEFENSEURS[g.choix];
  if (g.soleil < d.cout) return message("Pas assez de soleil !");
  g.soleil -= d.cout;
  const p = { type: g.choix, ligne, col, niveau: 1, pv: d.pv, max: d.pv, t: d.cadence || 0,
    tSoleil: d.cadenceSolaire || d.cadence || 0, tSoin: d.cadenceSoin || d.cadence || 0,
    el: dessinerPatate(g.choix + " niv1", d.acc) };
  p.el.__plante = p;
  positionner(p.el, col, ligne);
  g.grille[ligne][col] = p;
  g.plantes.push(p);
  majInterface();
}
/* ---- Fusion : disponible uniquement en mode Infini Fusion ---- */
function puissance(niv) { return MULT[niv - 1] || MULT[2] * Math.pow(2.25, niv - 3); }
function pvMax(type, niv) { return DEFENSEURS[type].pv * puissance(niv); }
function niveauMaxAtteint(niv) { return niv >= NIVEAU_MAX; }
function marquerFusion() {
  for (const p of g.plantes || []) {
    const f = g.fusion;
    p.el.classList.toggle("select", p === f);
    const compatible = g.mode === "infini" && f && p !== f;
    p.el.classList.toggle("fusionnable", !!compatible && !niveauMaxAtteint(Math.max(p.niveau, f.niveau)));
  }
}
function cliquerPlante(p) {
  if (g.choix) choisir(g.choix);                 // range la carte choisie
  const a = g.fusion;
  if (g.mode !== "infini") {
    g.fusion = (a === p) ? null : p;
    marquerFusion();
    message(g.fusion ? "Patate sélectionnée : clique une case vide pour la déplacer." : "Sélection annulée.");
    return;
  }
  if (a && a !== p) {
    const memeTypeEtNiveau = a.type === p.type && a.niveau === p.niveau;
    if (memeTypeEtNiveau || g.mode === "infini") {
      if (niveauMaxAtteint(Math.max(a.niveau, p.niveau))) return message("Maximum atteint : deux étoiles !");
      return fusionner(a, p);
    }
  }
  g.fusion = (a === p) ? null : p;
  if (a && a !== p) message("Il faut deux patates du même type ET du même niveau.");
  else if (niveauMaxAtteint(p.niveau)) message("Deux étoiles : clique une case vide pour déplacer cette patate.");
  else message("Sélectionnée ! Clique une case vide pour la déplacer ou une autre patate pour fusionner.");
  marquerFusion();
}
function fusionner(a, b) {
  if (g.mode !== "infini") return message("La fusion est réservée au mode Infini Fusion.");
  const fusionCroisee = a.type !== b.type;
  const nouveauNiveau = Math.min(NIVEAU_MAX, Math.max(a.niveau, b.niveau) + 1);
  const typeResultat = fusionCroisee ? creerHybride(a.type, b.type, a.niveau, b.niveau, nouveauNiveau) : b.type;
  a.mort = true; a.el.remove(); g.grille[a.ligne][a.col] = null;
  b.type = typeResultat;
  b.niveau = nouveauNiveau;
  b.max = pvMax(b.type, b.niveau); b.pv = b.max; b.t = 0; b.tSoleil = 0; b.tSoin = 0;
  b.el.className = "pot " + (DEFENSEURS[b.type].hybride ? "hybride " : "") + b.type + " niv" + b.niveau;
  const apparence = DEFENSEURS[b.type];
  b.el.querySelector(".acc").textContent = apparence.acc;
  b.el.querySelector(".illustration").outerHTML = illustration(b.type);
  b.el.querySelector(".embleme-a").textContent = apparence.emblemeA || "";
  b.el.querySelector(".embleme-b").textContent = apparence.emblemeB || "";
  b.el.style.setProperty("--fusion-a", apparence.couleurA || "#e8a34f");
  b.el.style.setProperty("--fusion-b", apparence.couleurB || "#654f9c");
  if (apparence.forme) b.el.classList.add("fusion-" + apparence.forme);
  b.el.querySelector(".niv").textContent = "★".repeat(b.niveau - 1);
  barreVie(b);
  if (fusionCroisee) { flottant("✨", b.col, b.ligne); message("Nouveau personnage : " + DEFENSEURS[b.type].nom); }
  else flottant("✨ Niveau " + b.niveau + " !", b.col, b.ligne);
  g.fusion = null; marquerFusion();
}
function gagnerSoleil(n, x, ligne) {
  g.soleil += n;
  flottant("+" + n + " ☀", x, ligne);
}
// En mode Infini Fusion, deux rôles différents donnent une nouvelle patate hybride.
function creerHybride(typeA, typeB, niveauA, niveauB, niveauResultat) {
  const a = DEFENSEURS[typeA], b = DEFENSEURS[typeB];
  const attaques = [a, b].filter(d => d.degats);
  const producteurs = [a, b].filter(d => d.gain);
  const soigneuses = [a, b].filter(d => d.soin);
  const effets = [a.effet, b.effet].filter(Boolean);
  let effet = effets.includes("explosif") ? (effets.includes("ralentir") ? "explosif-glace" : "explosif") :
    effets.includes("chaine") ? "chaine" : effets.includes("ralentir") ? "ralentir" : effets.includes("percer") ? "percer" : undefined;
  const type = "hybride" + (++numeroFusion);
  const couleurs = { tireuse:"#72b747", solaire:"#f4bd43", gardienne:"#a8875b", bombarde:"#e87538", glacee:"#62c7dc", boomerang:"#8b78d4", soigneuse:"#e98ba4", epineuse:"#70a94d" };
  const formes = { "bombarde-glacee":"bombe-givree", "gardienne-tireuse":"bouclier-canon", "soigneuse-solaire":"aube-fleurie", "epineuse-gardienne":"rempart-epineux" };
  const origines = [typeA, typeB].sort();
  const forme = formes[origines.join("-")];
  DEFENSEURS[type] = {
    nom: "Patate " + a.nom.replace("Patate ", "") + "-" + b.nom.replace("Patate ", ""),
    cout: a.cout + b.cout,
    pv: Math.ceil((a.pv + b.pv) * 0.72),
    acc: "✨",
    emblemeA: a.hybride ? "✨" : a.acc,
    emblemeB: b.hybride ? "✨" : b.acc,
    couleurA: a.couleurA || couleurs[typeA] || "#e8a34f",
    couleurB: b.couleurB || couleurs[typeB] || "#654f9c",
    forme,
    // Seuls les parents qui attaquent contribuent. Le niveau hybride ne crée
    // pas de dégâts gratuits quand l'autre parent est un soigneur/producteur.
    degats: attaques.length ? Math.ceil(attaques.reduce((s, d) => {
      const niveauParent = d === a ? niveauA : niveauB;
      return s + d.degats * puissance(niveauParent);
    }, 0) / attaques.length / puissance(niveauResultat)) : 0,
    cadence: attaques.length ? Math.min(...attaques.map(d => d.cadence)) : 0,
    effet,
    gain: producteurs.length ? Math.ceil(producteurs.reduce((s, d) => s + d.gain, 0) * 0.65) : 0,
    cadenceSolaire: producteurs.length ? Math.min(...producteurs.map(d => d.cadenceSolaire || d.cadence)) : 0,
    soin: soigneuses.length ? Math.ceil(soigneuses.reduce((s, d) => s + d.soin, 0) * 0.75) : 0,
    cadenceSoin: soigneuses.length ? Math.min(...soigneuses.map(d => d.cadenceSoin || d.cadence)) : 0,
    epines: (a.epines || 0) + (b.epines || 0),
    salves: Math.max(a.salves || 0, b.salves || 0),
    mine: Math.max(a.mine || 0, b.mine || 0), hybride: true
  };
  return type;
}
/* Patate dorée (n° 01) : bonus rare, disparaît si on ne le récupère pas */
function apparaitreDoree() {
  const l = Math.floor(Math.random() * ROWS), c = Math.floor(Math.random() * COLS);
  const e = dessinerPatate("doree", "✨");
  positionner(e, c, l);
  e.onclick = () => { if (!g.pause) { gagnerSoleil(GAIN_DOREE, c, l); e.remove(); } };
  setTimeout(() => e.remove(), 9000);
}

/* ---------- 5. VAGUES (niveaux de difficulté, n° 12) ---------- */
function tailleVague(n) { return g.mode === "histoire" ? 10 + 3 * n : 9 + 5 * n; }
function lancerVague() {
  g.vague++;
  const n = g.vague;
  const mondeIndex = Math.floor((n - 1) / VAGUES_PAR_MONDE) % MONDES.length;
  const etape = ((n - 1) % VAGUES_PAR_MONDE) + 1;
  if (g.mode !== "classique") {
    $("jeu").classList.remove(...MONDES.map(m => m.theme));
    $("jeu").classList.add(MONDES[mondeIndex].theme);
  }
  let partRapides = n > 1 ? Math.min(0.1 * n, 0.4) : 0;
  let partCostauds = n >= 3 ? Math.min(0.1 + 0.05 * (n - 3), 0.3) : 0;
  if (g.mode === "histoire") {
    partRapides = Math.min(0.08 * n + mondeIndex * 0.06, 0.42);
    partCostauds = Math.min(Math.max(0, (n - 2) * 0.045) + mondeIndex * 0.06, 0.35);
  }
  g.file = [];
  for (let i = 0; i < tailleVague(n); i++) {
    const r = Math.random();
    let type = r < partCostauds ? "costaud" : r < partCostauds + partRapides ? "rapide" : "classique";
    // Chaque région ajoute ses monstres exclusifs aux vagues de l'histoire.
    if (g.mode === "histoire" && Math.random() < Math.min(0.22 + mondeIndex * 0.035 + etape * 0.025, 0.42)) {
      type = MONDES[mondeIndex].monstres[Math.floor(Math.random() * MONDES[mondeIndex].monstres.length)];
    }
    g.file.push(type);
  }
  if (g.mode === "histoire" && etape === VAGUES_PAR_MONDE) g.file.push("boss");
  g.facteurPV = g.mode === "infini" ? 1 + 0.28 * (n - 1) + 0.012 * (n - 1) ** 2 : g.mode === "histoire" ? 1 + 0.2 * (n - 1) : 1 + 0.38 * (n - 1);
  g.facteurVitesse = g.mode === "infini" ? Math.min(2.2, 1 + 0.06 * (n - 1)) : g.mode === "histoire" ? Math.min(1.5, 1 + 0.035 * (n - 1)) : 1 + 0.07 * (n - 1);
  g.facteurDegats = g.mode === "infini" ? 1 + 0.12 * (n - 1) : g.mode === "histoire" ? 1 + 0.08 * (n - 1) : 1 + 0.12 * (n - 1);
  g.intervalle = Math.max(g.mode === "infini" ? 0.9 : 1.15, 4.8 - 0.48 * n);
  g.delaiApparition = 0;
  g.tuesVague = 0;
  g.attente = 6;
  if (g.mode === "histoire" && etape === 1) bandeau("Monde " + (mondeIndex + 1) + " : " + MONDES[mondeIndex].nom);
  else if (g.mode === "histoire" && etape === VAGUES_PAR_MONDE) bandeau("Boss : " + MONDES[mondeIndex].boss.nom + " !");
  else bandeau(g.mode === "classique" && n === NB_VAGUES ? "Dernière vague !" : "Vague " + n);
}
function apparaitreZombie(type) {
  let z = ZOMBIES[type], bossNom = "", indexBoss = -1;
  if (type === "boss" && g.mode === "histoire") {
    indexBoss = Math.floor((g.vague - 1) / VAGUES_PAR_MONDE);
    z = { ...z, ...MONDES[indexBoss].boss };
    bossNom = z.nom;
  }
  const ligne = Math.floor(Math.random() * ROWS);
  const obj = { type, ligne, x: COLS + 0.3, pv: z.pv * g.facteurPV, max: z.pv * g.facteurPV, vitesse: z.vitesse * g.facteurVitesse, degats: z.degats * g.facteurDegats, ralentissement: 0,
    armure: z.armure || 0, esquive: z.esquive || 0, brulure: z.brulure || 0, geler: z.geler || 0, soinAura: z.soinAura || 0, soinTimer: 3,
    el: dessinerPatate("zombie " + (type === "classique" ? "" : type), z.acc) };
  if (bossNom) { obj.el.classList.add("boss", "boss-monde-" + indexBoss); obj.el.title = bossNom; }
  g.zombies.push(obj);
}
function blesser(z, degats) {
  if (z.mort) return;
  if (z.esquive && Math.random() < z.esquive) { flottant("💨 esquive", z.x, z.ligne); return; }
  z.pv -= degats * (1 - (z.armure || 0));
  barreVie(z);
  z.el.classList.add("hit");
  setTimeout(() => z.el.classList.remove("hit"), 100);
  if (z.pv <= 0 && !z.mort) { z.mort = true; z.el.remove(); g.tues++; g.tuesVague++; flottant("💨", z.x - 0.5, z.ligne); }
}
// Chaque impact givré ajoute du ralentissement, jusqu'à un plancher de vitesse.
function ralentirZombie(z, duree = 3) {
  z.ralentissement = Math.max(z.ralentissement || 0, duree);
  z.freins = Math.min(0.78, (z.freins || 0) + 0.16);
  z.el.classList.add("gele");
}
// Dessine un éclair entre la première cible et chaque zombie touché par rebond.
function montrerChaineElectrique(source, cibles) {
  if (!cibles.length) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 900 500");
  svg.setAttribute("class", "eclair-chaine");
  for (const cible of cibles) {
    const x1 = source.x / COLS * 900, y1 = (source.ligne + 0.5) / ROWS * 500;
    const x2 = cible.x / COLS * 900, y2 = (cible.ligne + 0.5) / ROWS * 500;
    const dx = x2 - x1, dy = y2 - y1, longueur = Math.hypot(dx, dy) || 1;
    const decalage = Math.min(24, longueur * 0.16), px = -dy / longueur * decalage, py = dx / longueur * decalage;
    const trait = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    trait.setAttribute("points", `${x1},${y1} ${x1 + dx * .33 + px},${y1 + dy * .33 + py} ${x1 + dx * .58 - px},${y1 + dy * .58 - py} ${x1 + dx * .78 + px},${y1 + dy * .78 + py} ${x2},${y2}`);
    trait.setAttribute("fill", "none"); trait.setAttribute("stroke", "#fff56b");
    trait.setAttribute("stroke-width", "7"); trait.setAttribute("stroke-linecap", "round");
    trait.setAttribute("stroke-linejoin", "round"); trait.setAttribute("class", "trait-eclair");
    svg.appendChild(trait);
    cible.el.classList.add("electrocute");
    setTimeout(() => cible.el.classList.remove("electrocute"), 300);
  }
  $("couche").appendChild(svg);
  setTimeout(() => svg.remove(), 260);
}

/* ---------- 6. BOUCLE DE JEU ---------- */
function tirer(p) {
  const d = DEFENSEURS[p.type];
  for (let i = 0; i < (d.salves || 1); i++) {
    const s = { x: p.col + 0.8 - i * 0.18, ligne: p.ligne, degats: d.degats * puissance(p.niveau), effet: d.effet || "normal", touchees: [], el: creerEl("tir tir-" + p.type + " niv" + p.niveau) };
    g.tirs.push(s);
  }
  p.el.classList.add("tire");
  setTimeout(() => p.el.classList.remove("tire"), 150);
}
function miseAJour(dt) {
  // Vagues : on fait apparaître les zombies un par un, puis on attend la fin
  if (g.file.length > 0) {
    g.delaiApparition -= dt;
    if (g.delaiApparition <= 0) { apparaitreZombie(g.file.shift()); g.delaiApparition = g.intervalle * (0.7 + Math.random() * 0.6); }
  } else if (g.zombies.length === 0) {
    if (g.mode === "classique" && g.vague >= NB_VAGUES) return finir(true);   // toutes les vagues vaincues
    if (g.mode === "histoire" && g.vague >= NB_VAGUES_HISTOIRE) return finir(true);
    g.attente -= dt;
    if (g.attente <= 0) lancerVague();
  }
  // Patate dorée
  g.delaiDoree -= dt;
  if (g.delaiDoree <= 0) { apparaitreDoree(); g.delaiDoree = 38 + Math.random() * 17; }

  // Patates : production de soleil (patate solaire) et tirs
  for (const p of g.plantes) {
    const d = DEFENSEURS[p.type];
    p.el.classList.remove("hit");
    p.gel = Math.max(0, (p.gel || 0) - dt);
    p.el.classList.toggle("gele-plante", p.gel > 0);
    if (d.mine) {
      const cibleMine = g.zombies.find(z => !z.mort && z.ligne === p.ligne && Math.abs(z.x - (p.col + 0.5)) < 0.78);
      p.el.classList.toggle("armee", !!cibleMine);
      if (cibleMine) {
        g.zombies.filter(z => !z.mort && z.ligne === p.ligne && Math.abs(z.x - cibleMine.x) <= 1.2)
          .forEach(z => blesser(z, d.mine * puissance(p.niveau)));
        flottant("💥", p.col, p.ligne);
        p.el.remove(); p.mort = true; g.grille[p.ligne][p.col] = null;
        continue;
      }
    }
    if (d.gain) {
      p.tSoleil -= dt;
      if (p.tSoleil <= 0) { gagnerSoleil(Math.round(d.gain * puissance(p.niveau)), p.col, p.ligne); p.tSoleil = d.cadenceSolaire || d.cadence; }
    }
    if (d.soin) {
      p.tSoin -= dt;
      if (p.tSoin <= 0) {
        // La soigneuse répare elle-même et ses voisines (même rang ou rang adjacent).
        const cible = g.plantes.filter(a => Math.abs(a.ligne - p.ligne) <= 1 && a.pv < a.max)
          .sort((a, b) => (a.pv / a.max) - (b.pv / b.max) || Math.abs(a.ligne - p.ligne) - Math.abs(b.ligne - p.ligne))[0];
        if (cible) {
          const rendu = Math.min(d.soin * puissance(p.niveau), cible.max - cible.pv);
          cible.pv += rendu; barreVie(cible);
          p.el.classList.add("soigne"); cible.el.classList.add("guerri");
          setTimeout(() => { p.el.classList.remove("soigne"); cible.el.classList.remove("guerri"); }, 450);
          flottant("+" + Math.round(rendu) + " ❤", cible.col, cible.ligne);
        }
        p.tSoin = d.cadenceSoin || d.cadence;
      }
    }
    if (d.degats) {
      p.t -= dt;
      const cible = g.zombies.some(z => z.ligne === p.ligne && z.x > p.col + 0.5 && z.x < COLS + 0.4);
      if (cible && p.t <= 0 && p.gel <= 0) { tirer(p); p.t = d.cadence / (CADENCE_NIV[p.niveau - 1] || 1); }
      if (!cible && p.t < 0) p.t = 0;
    }
  }
  // Projectiles : touchent le premier zombie de leur ligne
  for (const s of g.tirs) {
    s.x += 5 * dt;
    const z = g.zombies.find(z => !z.mort && !s.touchees.includes(z) && z.ligne === s.ligne && Math.abs(z.x - s.x) < 0.35);
    if (z) {
      if (s.effet && s.effet.startsWith("explosif")) {
        // La bombe touche aussi les ennemis proches dans la même ligne.
        g.zombies.filter(voisin => !voisin.mort && voisin.ligne === s.ligne && Math.abs(voisin.x - z.x) <= 1.15)
          .forEach(voisin => {
            blesser(voisin, s.degats);
            if (s.effet === "explosif-glace" && !voisin.mort) ralentirZombie(voisin);
          });
      } else {
        blesser(z, s.degats);
        if (s.effet === "chaine") {
          const rebonds = g.zombies.filter(voisin => !voisin.mort && voisin !== z &&
            Math.hypot(voisin.x - z.x, (voisin.ligne - z.ligne) * 1.25) <= 1.8)
            .sort((a, b) => Math.hypot(a.x - z.x, (a.ligne - z.ligne) * 1.25) - Math.hypot(b.x - z.x, (b.ligne - z.ligne) * 1.25)).slice(0, 3);
          rebonds.forEach(voisin => blesser(voisin, s.degats * 0.75));
          montrerChaineElectrique(z, rebonds);
        }
        if (s.effet === "ralentir" && !z.mort) ralentirZombie(z);
        if (s.effet === "percer") s.touchees.push(z);
      }
      if (s.effet !== "percer") s.fini = true;
    }
    else if (s.x > COLS + 1) s.fini = true;
    if (s.fini) s.el.remove(); else positionner(s.el, s.x, s.ligne);
  }
  // Zombies : avancent vers le stock, s'arrêtent pour manger une patate
  for (const z of g.zombies) {
    if (z.mort) continue;
    // Les spores guérissent régulièrement le monstre allié le plus blessé à proximité.
    if (z.soinAura) {
      z.soinTimer -= dt;
      if (z.soinTimer <= 0) {
        const allie = g.zombies.filter(a => a !== z && !a.mort && a.ligne === z.ligne && Math.abs(a.x - z.x) < 1.8 && a.pv < a.max)
          .sort((a, b) => a.pv / a.max - b.pv / b.max)[0];
        if (allie) { allie.pv = Math.min(allie.max, allie.pv + z.soinAura); barreVie(allie); flottant("+❤", allie.x, allie.ligne); }
        z.soinTimer = 3;
      }
    }
    z.ralentissement = Math.max(0, z.ralentissement - dt);
    if (z.ralentissement === 0) z.freins = 0;
    z.el.classList.toggle("gele", z.ralentissement > 0);
    const p = g.plantes.find(p => p.ligne === z.ligne && z.x - (p.col + 0.5) < 0.55 && z.x - (p.col + 0.5) > -0.3);
    z.el.classList.toggle("mange", !!p);
    if (p) {
      p.pv -= (z.degats + (z.brulure || 0)) * dt;
      if (z.brulure) p.el.classList.add("brule");
      if (z.geler) { p.gel = Math.max(p.gel || 0, z.geler); p.el.classList.add("gele-plante"); }
      if (DEFENSEURS[p.type].epines) blesser(z, DEFENSEURS[p.type].epines * puissance(p.niveau) * dt);
      barreVie(p);
      p.el.classList.add("hit");
      if (p.pv <= 0) { p.el.remove(); p.mort = true; g.grille[p.ligne][p.col] = null; }
    } else {
      z.x -= z.vitesse * (z.ralentissement > 0 ? 1 - (z.freins || 0) : 1) * dt;
      if (z.x < 0) return finir(false);             // cible à protéger atteinte (n° 24)
    }
    positionner(z.el, z.x, z.ligne);
  }
  g.plantes = g.plantes.filter(p => !p.mort);
  g.zombies = g.zombies.filter(z => !z.mort);
  g.tirs = g.tirs.filter(s => !s.fini);
  majInterface();
}
let dernier = 0;
function boucle(t) {
  const dt = Math.min(0.05, (t - dernier) / 1000 || 0);   // dt limité si l'onglet était caché
  dernier = t;
  if (g.running && !g.pause) miseAJour(dt);
  requestAnimationFrame(boucle);
}

/* ---------- 7. FIN DE PARTIE ---------- */
function finir(victoire) {
  g.running = false;
  majInterface();
  $("fin-titre").textContent = victoire ? "🏆 Victoire !" : "💀 Défaite…";
  $("fin-texte").textContent = victoire
    ? (g.mode === "histoire" ? "Tu as libéré les cinq mondes et sauvé les vacances des patates !" : "Le stock est sauvé : tu as repoussé les " + NB_VAGUES + " vagues !")
    : "Un zombie a atteint le stock. Tu as tenu jusqu'à la vague " + Math.max(1, g.vague) + ".";
  $("fin").classList.remove("cache");
}

/* ---------- 8. DÉMARRAGE ET BOUTONS ---------- */
function demarrer() {
  reinitialiser();
  creerCases();
  creerCartes();
  $("menu").classList.add("cache");
  $("preparation").classList.add("cache");
  $("regles").classList.add("cache");
  $("fin").classList.add("cache");
  $("jeu").classList.remove("cache");
  majInterface();
  $("msg").textContent = texteAide();
  bandeau("Prépare ton jardin !");
}
function ouvrirRegles() { $("regles").classList.remove("cache"); g.pause = true; }
function fermerRegles() { $("regles").classList.add("cache"); g.pause = false; }

$("b-jouer").onclick = ouvrirPreparation;
$("b-partie").onclick = demarrer;
$("b-retour-menu").onclick = () => { $("preparation").classList.add("cache"); $("menu").classList.remove("cache"); };
$("mode-classique").onclick = () => choisirMode("classique");
$("mode-infini").onclick = () => choisirMode("infini");
$("mode-histoire").onclick = () => choisirMode("histoire");
$("b-rejouer").onclick = demarrer;
$("b-recommencer").onclick = demarrer;
$("b-regles-menu").onclick = ouvrirRegles;
$("b-regles").onclick = ouvrirRegles;
$("b-fermer").onclick = fermerRegles;
$("nbv").textContent = NB_VAGUES;
$("b-menu").onclick = () => { g.running = false; $("jeu").classList.add("cache"); $("menu").classList.remove("cache"); };
$("cases").addEventListener("click", e => {
  const c = e.target.closest(".case");
  if (c && g.running && !g.pause) poser(+c.dataset.ligne, +c.dataset.col);
});
$("champ").addEventListener("click", e => {
  const el = e.target.closest(".pot:not(.zombie):not(.doree)");
  if (el && el.__plante && g.running && !g.pause) cliquerPlante(el.__plante);
});
document.addEventListener("keydown", e => {
  if (!g.running || g.pause) return;
  const types = equipeSelectionnee;
  if (e.key >= "1" && e.key <= String(types.length)) choisir(types[e.key - 1]);
  if (e.key === "Escape" && g.choix) choisir(g.choix);
});
requestAnimationFrame(boucle);
creerSelectionPatates();
choisirMode("classique");
