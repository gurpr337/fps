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

// For legacy (non-module) code that still relies on globals we attach these
// exports to the window object.  This lets us migrate incrementally without
// breaking the existing inline script.
if (typeof window !== 'undefined') {
  window.MAX_UPGRADE_LEVEL = MAX_UPGRADE_LEVEL;
  window.upgradesConfig = upgradesConfig;
  window.calculateUpgradeCost = calculateUpgradeCost;
}