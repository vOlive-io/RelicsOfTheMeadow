// ======= GLOBAL STATE =======
let energy = 10;
let gold = 200;
let numTradePosts = 0;
let buildCosts = {};
let currentFaction = null;

const eventLog = document.getElementById('event-log');
const energyEl = document.getElementById('energy');
const factionInfo = document.getElementById('faction-info');
const factionAbilitiesList = document.getElementById('faction-abilities-list');

// ======= LOADERS =======
async function loadBuildCosts() {
  const res = await fetch('./data/build_costs.json');
  buildCosts = await res.json();
}

async function loadFactionData(factionKey) {
  const res = await fetch(`./data/factions/${factionKey}.json`);
  const data = await res.json();
  currentFaction = data;
  localStorage.setItem('chosenFaction', factionKey);
  updateFactionHUD();
}

// ======= INITIAL SETUP =======
async function initGame() {
  await loadBuildCosts();
  const savedFaction = localStorage.getItem('chosenFaction') || 'crimson_horde';
  await loadFactionData(savedFaction);
  updateHUD();
}

initGame();

// ======= ACTION COSTS =======
function getBuildCost() {
  // example dynamic cost scaling
  return (buildCosts.trade_post || 25) * (1 + numTradePosts * 0.5);
}

const actions = {
  'declare-war': { cost: 5, gold: 100 },
  'battle': { cost: 1, gold: 0 },
  'fortify': { cost: 2, gold: 50 },
  'build': { cost: 2, gold: () => getBuildCost() },
  'trade': { cost: 1, gold: 0 },
  'use-relic': { cost: 1, gold: 15 },
  'faction-abilities': { cost: 1, gold: 0 },
  'end-turn': { cost: 0, gold: 0 }
};

// ======= UTILITIES =======
function log(msg) {
  const p = document.createElement('p');
  p.textContent = msg;
  eventLog.prepend(p);
}

function updateHUD() {
  energyEl.textContent = `Energy: ${energy} ⚡ | Gold: ${gold} 💰`;
}

function updateFactionHUD() {
  factionInfo.innerHTML = `
    <h2>${currentFaction.emoji} ${currentFaction.name}</h2>
    <p>Prowess: ${currentFaction.prowess} | Resilience: ${currentFaction.resilience} | Economy: ${currentFaction.economy}</p>
    <p>Relics: ${currentFaction.relics?.join(', ') || 'None'}</p>
  `;
  factionAbilitiesList.innerHTML = currentFaction.abilities.map(
    ab => `<li>${ab.emoji || '✨'} <b>${ab.name}</b> – ${ab.desc}</li>`
  ).join('');
}

function spend(cost, gCost, label) {
  const goldCost = typeof gCost === 'function' ? gCost() : gCost;
  if (energy < cost) return log(`❌ Not enough energy to ${label}!`);
  if (gold < goldCost) return log(`💸 You need ${goldCost} gold to ${label}!`);
  energy -= cost;
  gold -= goldCost;
  updateHUD();
  log(`✅ ${label} (-${cost}⚡, -${goldCost}💰)`);
  if (energy <= 0) endTurn();
}

// ======= TURN HANDLING =======
function endTurn() {
  log('🌙 Turn ended. AI factions are acting...');
  setTimeout(() => {
    log('🌅 A new day dawns!');
    energy = 10;
    gold += 25;
    updateHUD();
  }, 1500);
}

// ======= BUTTON HANDLERS =======
document.querySelectorAll('#actions button').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.action;
    const { cost, gold: gCost } = actions[key];

    switch (key) {
      case 'trade': return openTradePopup();
      case 'faction-abilities': return openFactionPopup();
      case 'end-turn': return endTurn();
      default: return spend(cost, gCost, btn.textContent);
    }
  });
});

// ======= POPUPS =======
const tradePopup = document.getElementById('trade-popup');
const closeTrade = document.getElementById('close-trade');
closeTrade?.addEventListener('click', () => tradePopup.classList.add('hidden'));

function openTradePopup() {
  tradePopup.classList.remove('hidden');
  log('📦 Managing trade routes...');
}

document.querySelectorAll('[data-trade]').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.trade;
    if (t === 'cut') log('✂️ Trade route cut. No gold spent.');
    else if (t === 'expand' && gold >= 25) { gold -= 25; numTradePosts++; log('🛣️ Expanded trade route (-25💰).'); }
    else if (t === 'deal' && gold >= 50) { gold -= 50; log('🤝 Formed new trade deal (-50💰).'); }
    else log('💸 Not enough gold!');
    updateHUD();
  });
});

const factionPopup = document.getElementById('faction-popup');
const closeFaction = document.getElementById('close-faction');
closeFaction?.addEventListener('click', () => factionPopup.classList.add('hidden'));

function openFactionPopup() {
  factionPopup.classList.remove('hidden');
  log(`🌟 Viewing ${currentFaction.name} abilities...`);
}
