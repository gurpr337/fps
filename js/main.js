// js/main.js
// Central game engine – migrated from the old inline <script>.
// 1) imports data/helpers from the other modules
// 2) owns the entire mutable game state
// 3) wires DOM events & runs the game loop

// ─────────────────────────────────────────────────────────────────────────────
import {
  upgradesConfig,
  calculateUpgradeCost,
  MAX_UPGRADE_LEVEL,
  updateUpgradeUI,
  handleMaxLevelReached,
  buyUpgrade as upgradesBuyUpgrade
} from './upgrades.js';

import {
  updateStageGraphics,
  playStageUnlockAnimation
} from './stageEngine.js';

// Expose some functions for upgrades.js (which still calls window.* helpers)
window.calculateUpgradeCost = calculateUpgradeCost;

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL (module-level) STATE
// ─────────────────────────────────────────────────────────────────────────────
export let currentFPS = 0;
export let totalFPSDownloaded = 0;
export let money = 0;
export let downloadProgress = 0;

export const downloadTarget = 100;
export const fpsPerFullDownload = 10;
export const FINAL_FPS_GOAL = 1_000_000;

export let finalAchievementUnlocked = false;

export let fpsMarketPrice = 1.0;
export let marketBasePrice = 1.0;
export let currentMarketVolatility = 1.0;
export const marketTrendSpeed = 0.0001;

export let currentStage = 0;
export const numStages = 20;
export const stageInfo = {};
export let maxedOutUpgradesSet = new Set();

// Stage emojis – unchanged
export const stageEmojis = ["🚀","💻","⚙️","🔥","⚡","🌐","🔗","🧠","📈","🌌","🌀","🧊","⚛️","🌠","✨","⏱️","👾","💫","📈","🌌","🌟"];

// Derived stats (recalculated)
let fpsPerClickCurrent = 5;
let fpsPerSecondCurrent = 0;
let efficiencyMultiplierTotal = 1;
let moneyMultiplierTotal = 1;
let autoSellActive = false;
let autoSellIntervalId = null;
let stageFPSGainMultiplier = 1;

// DOM cache
const el = {};

// ─────────────────────────────────────────────────────────────────────────────
// STAGE INFO CONSTRUCTION (same math as before)
// ─────────────────────────────────────────────────────────────────────────────
const perStageFPSBonusFactor = 1.05;
const initialFpsThresholdForStage1 = 500;
const fpsThresholdGrowthFactor = Math.pow(FINAL_FPS_GOAL / initialFpsThresholdForStage1, 1 / (numStages - 1));
for (let i = 0; i <= numStages; i++) {
  let stageTitleSuffix = '';
  if (i === 0) stageTitleSuffix = 'Initializing Core Drivers';
  else {
    const names = [
      '',
      'Basic Rig Buildout',
      'OS Optimization Suite',
      'Advanced Thermal Management',
      'SSD Overclocking Protocol',
      'Next-Gen RAM Module',
      'Fiber Optic Network',
      'Quantum Entanglement Link',
      'Virtual Machine Re-allocation',
      'Distributed Computing Grid',
      'Neural Network Optimization',
      'Gravitational Data Compression',
      'Dark Matter Cooling System',
      'Sub-Atomic FPS Accelerator',
      'Parallel Universe Render Farm',
      'Interdimensional Resource Harvesting',
      'Chronological Frame Alignment',
      'Astro-Quantum Processor Integration',
      'Cosmic Thread Optimization',
      'Singularity Simulation Protocol',
      'Minecraft Omniverse Unlocked!'
    ];
    stageTitleSuffix = names[i] || 'Unknown Territory';
  }

  const totalFpsThresh =
    i === 0 ? 0 : i === numStages ? FINAL_FPS_GOAL : Math.round(initialFpsThresholdForStage1 * Math.pow(fpsThresholdGrowthFactor, i - 1));

  const title = i === 0 ? `Pre-Stage ${stageEmojis[i]}: ${stageTitleSuffix}` : `Stage ${i} ${stageEmojis[i]}: ${stageTitleSuffix}`;

  const unlocks = (function(){
    switch(i){
      case 0:return ['click-upgrade','auto-upgrade'];
      case 1:return ['efficiency-upgrade'];
      case 2:return ['money-multiplier-upgrade'];
      case 3:return ['market-price-upgrade'];
      case 4:return ['market-volatility-upgrade'];
      case 5:return ['auto-sell-upgrade'];
      case 6:return ['quantum-cpu'];
      case 7:return ['virtual-gpu'];
      case 8:return ['dimensional-filter'];
      case 9:return ['universe-replication'];
      case 10:return ['causal-loop'];
      case 11:return ['trans-market-hub'];
      default:return [];
    }
  })();

  stageInfo[i] = {
    title,
    unlockThreshold: { totalFps: totalFpsThresh, money: 0 },
    upgradesUnlockedAtStage: unlocks,
    fpsGainMultiplier: Math.pow(perStageFPSBonusFactor, i)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function formatNumber(num){return Math.floor(num).toLocaleString();}

// Recalculate derived stats from upgrade levels & stage multipliers
window.recalculateStats = function recalculateStats(){
  const stageData = stageInfo[currentStage] || stageInfo[0];
  stageFPSGainMultiplier = stageData.fpsGainMultiplier;

  fpsPerClickCurrent = 5;
  fpsPerSecondCurrent = 0;
  efficiencyMultiplierTotal = 1;
  moneyMultiplierTotal = 1;
  marketBasePrice = 1.0;
  currentMarketVolatility = 1.0;
  autoSellActive = false;

  for(const id in upgradesConfig){
    const upg = upgradesConfig[id];
    if(upg.level === 0) continue;
    switch(upg.type){
      case 'click': fpsPerClickCurrent += upg.level * upg.powerIncrease; break;
      case 'auto': fpsPerSecondCurrent += upg.startValue * Math.pow(upg.rateMultiplierPerLevel, upg.level-1); break;
      case 'efficiency': efficiencyMultiplierTotal *= Math.pow(upg.multiplierPerLevel, upg.level); break;
      case 'money_multiplier': moneyMultiplierTotal *= Math.pow(upg.multiplierPerLevel, upg.level); break;
      case 'market': marketBasePrice += upg.level * upg.priceIncrease; break;
      case 'market_volatility': currentMarketVolatility += upg.level * upg.increasePerLevel; break;
      case 'auto_sell': autoSellActive = true; break;
      case 'click_auto_bonus':
        fpsPerClickCurrent += upg.level * upg.powerIncrease;
        fpsPerSecondCurrent += upg.level * upg.powerIncrease;
        break;
      case 'auto_bonus': fpsPerSecondCurrent += upg.level * upg.rateIncrease; break;
      case 'global_efficiency_bonus': efficiencyMultiplierTotal *= Math.pow(upg.multiplierPerLevel, upg.level); break;
      case 'market_bonus': marketBasePrice += upg.level * upg.priceBoost; break;
    }
  }

  // manage auto sell timer
  if(autoSellActive && upgradesConfig['auto-sell-upgrade'].level>0){
    const base = 5000;
    const newInt = Math.max(1000, base - upgradesConfig['auto-sell-upgrade'].level*upgradesConfig['auto-sell-upgrade'].intervalReduction);
    if(autoSellIntervalId) clearInterval(autoSellIntervalId);
    autoSellIntervalId = setInterval(()=>{
      if(currentFPS>0){
        const gain = currentFPS * fpsMarketPrice * moneyMultiplierTotal;
        money += gain;
        fpsMarketPrice = Math.max(0.2, fpsMarketPrice - (currentFPS/100)*0.05);
        currentFPS = 0;
        updateUI();
        saveGame();
      }
    }, newInt);
  }else if(autoSellIntervalId){
    clearInterval(autoSellIntervalId);
    autoSellIntervalId = null;
  }

  updateUI();
};

function progressDownload(amount){
  downloadProgress += amount;
  if(downloadProgress >= downloadTarget){
    const gained = fpsPerFullDownload * efficiencyMultiplierTotal * stageFPSGainMultiplier;
    currentFPS += gained;
    totalFPSDownloaded += gained;
    downloadProgress = 0;
  }
  updateUI();
}

function updateMarketPrice(){
  fpsMarketPrice = marketBasePrice + (Math.random()-0.5)*currentMarketVolatility;
  fpsMarketPrice += (marketBasePrice - fpsMarketPrice)*marketTrendSpeed;
  fpsMarketPrice = Math.max(0.2, Math.min(100, fpsMarketPrice));
  if(el.fpsMarketPriceDisplay) el.fpsMarketPriceDisplay.textContent = fpsMarketPrice.toFixed(2);
}

function sellFPS(){
  if(currentFPS<=0) return;
  money += currentFPS * fpsMarketPrice * moneyMultiplierTotal;
  fpsMarketPrice = Math.max(0.2, fpsMarketPrice - (currentFPS/100)*0.1);
  currentFPS = 0;
  updateUI();
  saveGame();
}

function updateUI(){
  if(!el.moneyDisplay) return; // not yet initialised
  el.moneyDisplay.textContent = `$${formatNumber(money)}`;
  el.downloadProgressFill.style.width = `${(downloadProgress/downloadTarget)*100}%`;
  el.downloadProgressText.textContent = `${Math.round((downloadProgress/downloadTarget)*100)}%`;
  const totalPct = Math.min(100, (totalFPSDownloaded/FINAL_FPS_GOAL)*100);
  el.totalFpsProgressFill.style.width = `${totalPct}%`;
  el.totalFpsProgressText.textContent = `Total FPS: ${formatNumber(totalFPSDownloaded)}`;
  el.sellFpsButton.textContent = `Sell ${formatNumber(currentFPS)} FPS!`;
  el.sellFpsButton.disabled = currentFPS<=0;
  el.sellFpsButton.classList.toggle('disabled-btn', currentFPS<=0);

  // upgrade card refresh
  for(const id in upgradesConfig){
    updateUpgradeUI(id, upgradesConfig[id]);
  }

  updateStageGraphics(currentStage);
  updateUnlockNextStageButton();
}

function updateUnlockNextStageButton(){
  const next = currentStage+1;
  if(next>numStages){ el.unlockNextStageButton.classList.add('hidden'); return; }
  const thresh = stageInfo[next].unlockThreshold;
  const met = totalFPSDownloaded >= thresh.totalFps;
  el.unlockNextStageButton.classList.remove('hidden');
  el.unlockNextStageButton.disabled = !met;
  el.unlockNextStageButton.classList.toggle('disabled-btn', !met);
  el.unlockNextStageButton.textContent = met ? `Unlock ${stageInfo[next].title}!` : `Requires FPS: ${formatNumber(totalFPSDownloaded)}/${formatNumber(thresh.totalFps)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENCE
// ─────────────────────────────────────────────────────────────────────────────
function saveGame(){
  const levels = {};
  for(const id in upgradesConfig) levels[id] = upgradesConfig[id].level;
  const data = { currentFPS,totalFPSDownloaded,downloadProgress,finalAchievementUnlocked,money,fpsMarketPrice,currentStage,upgradeLevels:levels,maxedOutUpgrades:[...maxedOutUpgradesSet] };
  localStorage.setItem('downloadMoreFPSGame', JSON.stringify(data));
}
window.saveGame = saveGame;

function loadGame(){
  const raw = localStorage.getItem('downloadMoreFPSGame');
  if(!raw){ window.recalculateStats(); return; }
  try{
    const data = JSON.parse(raw);
    currentFPS = data.currentFPS||0;
    totalFPSDownloaded = data.totalFPSDownloaded||0;
    downloadProgress = data.downloadProgress||0;
    finalAchievementUnlocked = data.finalAchievementUnlocked||false;
    money = data.money||0;
    fpsMarketPrice = data.fpsMarketPrice||1;
    currentStage = data.currentStage||0;
    maxedOutUpgradesSet = new Set(data.maxedOutUpgrades||[]);
    for(const id in upgradesConfig){ if(data.upgradeLevels && data.upgradeLevels[id]!=null) upgradesConfig[id].level = data.upgradeLevels[id]; }
  }catch(e){ console.error('save decode',e); }
  window.recalculateStats();
}

// ─────────────────────────────────────────────────────────────────────────────
// UI INIT & EVENT WIRING
// ─────────────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded',()=>{
  // Dom refs
  el.moneyDisplay = document.getElementById('money-display');
  el.fpsMarketPriceDisplay = document.getElementById('fps-market-price-display');
  el.downloadButton = document.getElementById('download-button');
  el.sellFpsButton = document.getElementById('sell-fps-button');
  el.downloadProgressFill = document.getElementById('download-progress-fill');
  el.downloadProgressText = document.getElementById('download-progress-text');
  el.totalFpsProgressFill = document.getElementById('total-fps-progress-fill');
  el.totalFpsProgressText = document.getElementById('total-fps-progress-text');
  el.finalAchievementDisplay = document.getElementById('final-achievement-display');
  el.stageTickMarksContainer = document.getElementById('stage-tick-marks-container');
  el.unlockNextStageButton = document.getElementById('unlock-next-stage-button');
  el.stageDisplay = document.getElementById('stage-display');
  // progress bars container existing etc.

  for(const id in upgradesConfig){
    el[`${id}-cost`] = document.getElementById(`${id}-cost`);
    el[`buy-${id}`] = document.getElementById(`buy-${id}`);
    el[`${id}-level`] = document.getElementById(`${id}-level`);
    el[`upgrade-card-${id}`] = document.getElementById(`upgrade-card-${id}`);
  }

  // events
  el.downloadButton.addEventListener('click', ()=>progressDownload(fpsPerClickCurrent));
  el.sellFpsButton.addEventListener('click', sellFPS);
  for(const id in upgradesConfig){
    const btn = el[`buy-${id}`];
    if(btn) btn.addEventListener('click', ()=> upgradesBuyUpgrade(id));
  }
  el.unlockNextStageButton.addEventListener('click', ()=>{
    if(totalFPSDownloaded >= stageInfo[currentStage+1]?.unlockThreshold.totalFps){
      currentStage++;
      downloadProgress = 0;
      window.recalculateStats();
      playStageUnlockAnimation(currentStage);
      saveGame();
    }
  });

  setupStageTickMarks();
  loadGame();

  setInterval(gameLoop, 100);
  setInterval(saveGame, 5000);
});

function gameLoop(){
  if(fpsPerSecondCurrent>0) progressDownload(fpsPerSecondCurrent/10);
  updateMarketPrice();
  updateUI();
}

function setupStageTickMarks(){
  const cont = el.stageTickMarksContainer; if(!cont) return; cont.innerHTML='';
  for(let i=1;i<=numStages;i++){
    const s=stageInfo[i]; if(!s) continue;
    const pct = (s.unlockThreshold.totalFps/FINAL_FPS_GOAL)*100;
    if(pct<=0||pct>=100) continue;
    const div=document.createElement('div'); div.className='stage-tick-mark'; div.style.left=`${pct}%`; cont.appendChild(div);
  }
}

console.debug('[main] game engine loaded');