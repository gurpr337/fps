// js/upgrades.js
// All data & pure helpers related to upgrades live here.  No DOM work – that
// will be handled by the game engine / UI modules.

// ─────────────────────────────────────────────────────────────────────────────
// Public constants
// ─────────────────────────────────────────────────────────────────────────────
export const MAX_UPGRADE_LEVEL = 10; // All upgrades max out at level 10

// ─────────────────────────────────────────────────────────────────────────────
// Upgrade catalogue (exact copy of the inline object that used to be in
// index.html).  Levels are stored here so the main game state can mutate them
// directly – this file deliberately exports a *live* object.
// ─────────────────────────────────────────────────────────────────────────────
export const upgradesConfig = {
  'click-upgrade': {
    level: 0,
    baseCost: 15,
    costMultiplier: 1.5,
    powerIncrease: 1, // FPS added per click, per level
    type: 'click',
  },
  'auto-upgrade': {
    level: 0,
    baseCost: 5,
    costMultiplier: 1.6,
    startValue: 10, // Base FPS/second when level 1
    rateMultiplierPerLevel: 1.2,
    type: 'auto',
  },
  'efficiency-upgrade': {
    level: 0,
    baseCost: 1000,
    costMultiplier: 2,
    multiplierPerLevel: 1.1,
    type: 'efficiency',
  },
  'money-multiplier-upgrade': {
    level: 0,
    baseCost: 500,
    costMultiplier: 1.7,
    multiplierPerLevel: 1.15,
    type: 'money_multiplier',
  },
  'market-price-upgrade': {
    level: 0,
    baseCost: 150,
    costMultiplier: 1.8,
    priceIncrease: 0.5,
    type: 'market',
  },
  'market-volatility-upgrade': {
    level: 0,
    baseCost: 2000,
    costMultiplier: 2.5,
    increasePerLevel: 0.1,
    type: 'market_volatility',
  },
  'auto-sell-upgrade': {
    level: 0,
    baseCost: 10000,
    costMultiplier: 3.0,
    intervalReduction: 50, // ms reduction per level
    type: 'auto_sell',
  },
  'quantum-cpu': {
    level: 0,
    baseCost: 10000,
    costMultiplier: 2.5,
    powerIncrease: 50,
    type: 'click_auto_bonus',
  },
  'virtual-gpu': {
    level: 0,
    baseCost: 50000,
    costMultiplier: 2.8,
    rateIncrease: 100,
    type: 'auto_bonus',
  },
  'dimensional-filter': {
    level: 0,
    baseCost: 250000,
    costMultiplier: 3,
    multiplierPerLevel: 1.2,
    type: 'global_efficiency_bonus',
  },
  'universe-replication': {
    level: 0,
    baseCost: 1000000,
    costMultiplier: 3.5,
    rateIncrease: 5000,
    type: 'auto_bonus',
  },
  'causal-loop': {
    level: 0,
    baseCost: 5000000,
    costMultiplier: 4,
    multiplierPerLevel: 1.5,
    type: 'global_efficiency_bonus',
  },
  'trans-market-hub': {
    // UI name: Omni-Market Singularity
    level: 0,
    baseCost: 10000000,
    costMultiplier: 4.5,
    priceBoost: 5,
    type: 'market_bonus',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Pure helper: how much will the next level cost?
// ─────────────────────────────────────────────────────────────────────────────
export function calculateUpgradeCost(baseCost, level, multiplier) {
  return Math.floor(baseCost * Math.pow(multiplier, level));
}

// ─────────────────────────────────────────────────────────────────────────────
// Upgrade-related DOM helpers & purchase logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update one upgrade card's cost/level/button state in the UI.
 * The heavy DOM cache object `elements` is still owned by the legacy code –
 * we access it via `window.elements` until the refactor is complete.
 */
export function updateUpgradeUI(upgradeId, upgrade = upgradesConfig[upgradeId]) {
  const elements = window.elements || {};
  const costElement  = elements[`${upgradeId}-cost`];
  const levelElement = elements[`${upgradeId}-level`];
  const buyButton    = elements[`buy-${upgradeId}`];
  const upgradeCard  = elements[`upgrade-card-${upgradeId}`];
  const maxedSet     = window.maxedOutUpgradesSet || new Set();
  const money        = window.money ?? 0;

  if (!upgradeCard || maxedSet.has(upgradeId)) return;

  upgradeCard.classList.remove('hidden');

  if (upgrade.level >= MAX_UPGRADE_LEVEL) {
    if (costElement)  costElement.textContent  = 'MAX LEVEL!';
    if (levelElement) levelElement.textContent = MAX_UPGRADE_LEVEL;
    if (buyButton) {
      buyButton.disabled = true;
      buyButton.classList.add('disabled-btn');
      buyButton.textContent = 'MAXED';
    }
    return;
  }

  const nextCost = calculateUpgradeCost(upgrade.baseCost, upgrade.level, upgrade.costMultiplier);
  if (costElement)  costElement.textContent  = `Cost: $${(nextCost).toLocaleString()}`;
  if (levelElement) levelElement.textContent = upgrade.level;
  if (buyButton) {
    buyButton.disabled = money < nextCost;
    buyButton.classList.toggle('disabled-btn', buyButton.disabled);
    buyButton.textContent = 'Buy';
  }
}

/** Toast & card removal when an upgrade hits max level */
export function handleMaxLevelReached(upgradeId) {
  const elements   = window.elements || {};
  const upgradeCard = elements[`upgrade-card-${upgradeId}`];
  const maxedSet    = window.maxedOutUpgradesSet || (window.maxedOutUpgradesSet = new Set());
  if (!upgradeCard || maxedSet.has(upgradeId)) return;

  maxedSet.add(upgradeId);

  // Congratulatory overlay
  const overlay = document.createElement('div');
  overlay.className = 'message-box-overlay';
  overlay.style.opacity = '0';
  const content = document.createElement('div');
  content.className = 'message-box-content';
  overlay.appendChild(content);
  const upgradeTitle = upgradeCard.querySelector('h3')?.textContent ?? upgradeId;
  content.innerHTML = `
    <button class="message-box-close-button">&times;</button>
    <h3 class="text-xl font-bold text-accent-teal mb-2">Congratulations!</h3>
    <p class="mb-3 text-lg">You've maxed out your "${upgradeTitle}"!</p>
    <p class="text-md text-gray-400">Its effects will continue to boost your game!</p>`;
  document.body.appendChild(overlay);
  content.querySelector('.message-box-close-button').addEventListener('click', () => {
    overlay.style.opacity = '0';
    overlay.addEventListener('transitionend', () => overlay.remove(), {once:true});
  });
  setTimeout(() => overlay.style.opacity = '1', 10);
  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.addEventListener('transitionend', () => overlay.remove(), {once:true});
  }, 2500);

  // Fade/remove card
  upgradeCard.classList.add('fade-out');
  upgradeCard.addEventListener('transitionend', () => {
    upgradeCard.remove();
    window.saveGame?.();
  }, {once:true});
}

/** Main purchase entry point */
export function buyUpgrade(upgradeId) {
  const upgrade = upgradesConfig[upgradeId];
  if (!upgrade) {
    console.error(`Upgrade ${upgradeId} not found`);
    return;
  }
  if (upgrade.level >= MAX_UPGRADE_LEVEL) {
    handleMaxLevelReached(upgradeId);
    return;
  }

  const moneyRef = { value: window.money ?? 0 };
  const cost = calculateUpgradeCost(upgrade.baseCost, upgrade.level, upgrade.costMultiplier);
  if (moneyRef.value < cost) return; // cannot afford

  window.money = moneyRef.value - cost;
  upgrade.level++;

  // Special logic preserved from original code
  if (upgradeId === 'click-upgrade' && upgrade.level <= MAX_UPGRADE_LEVEL) {
    window.downloadProgress = (window.downloadProgress ?? 0) + 10;
    if (window.downloadProgress > (window.downloadTarget ?? 100)) {
      window.downloadProgress = window.downloadTarget;
    }
  }

  window.recalculateStats?.();
  if (upgrade.level >= MAX_UPGRADE_LEVEL) {
    handleMaxLevelReached(upgradeId);
  } else {
    window.saveGame?.();
  }
}

// For legacy (non-module) code that still relies on globals we attach these
// exports to the window object.  This lets us migrate incrementally without
// breaking the existing inline script.
if (typeof window !== 'undefined') {
  window.MAX_UPGRADE_LEVEL = MAX_UPGRADE_LEVEL;
  window.upgradesConfig = upgradesConfig;
  window.calculateUpgradeCost = calculateUpgradeCost;
  window.updateUpgradeUI    = updateUpgradeUI;
  window.handleMaxLevelReached = handleMaxLevelReached;
  window.buyUpgrade         = buyUpgrade;
}