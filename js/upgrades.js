/**
 * Download More FPS! - Upgrade Management System
 * 
 * This file contains all upgrade-related functionality including:
 * - Upgrade definitions and configurations
 * - Upgrade purchase logic
 * - Stat calculation and bonus effects
 * - UI management for upgrade cards
 * 
 * How this file interacts with others:
 * - Called by game-logic.js to recalculate stats when upgrades change
 * - Calls ui-manager.js to update upgrade card displays
 * - Provides upgrade data to stage files for unlock conditions
 * - Manages upgrade levels and effects for the entire game
 */

// ===== UPGRADE MANAGER =====
const UpgradeManager = {
    // ===== UPGRADE DEFINITIONS =====
    // Each upgrade has properties that define its behavior and cost scaling
    upgradesConfig: {
        'click-upgrade': {
            level: 0,
            baseCost: 15,
            costMultiplier: 1.5,
            powerIncrease: 1, 
            type: 'click',
            name: 'Click Upgrade',
            description: 'Increases FPS gained per click by 1'
        },
        'auto-upgrade': {
            level: 0,
            baseCost: 5,
            costMultiplier: 1.6,
            startValue: 10, 
            rateMultiplierPerLevel: 1.2, 
            type: 'auto',
            name: 'Auto Download',
            description: 'Automatically downloads FPS over time'
        },
        'efficiency-upgrade': {
            level: 0,
            baseCost: 1000,
            costMultiplier: 2,
            multiplierPerLevel: 1.1, 
            type: 'efficiency',
            name: 'Download Efficiency',
            description: 'Multiplies all FPS gains by 1.1x per level'
        },
        'money-multiplier-upgrade': { 
            level: 0,
            baseCost: 500,
            costMultiplier: 1.7,
            multiplierPerLevel: 1.15, 
            type: 'money_multiplier',
            name: 'Money Multiplier',
            description: 'Multiplies money gained from sales by 1.15x per level'
        },
        'market-price-upgrade': {
            level: 0,
            baseCost: 150,
            costMultiplier: 1.8,
            priceIncrease: 0.5, 
            type: 'market',
            name: 'Market Price Booster',
            description: 'Increases base FPS market price by $0.50 per level'
        },
        'market-volatility-upgrade': { 
            level: 0,
            baseCost: 2000,
            costMultiplier: 2.5,
            increasePerLevel: 0.1, 
            type: 'market_volatility',
            name: 'Market Volatility',
            description: 'Increases market price volatility by 0.1 per level'
        },
        'auto-sell-upgrade': { 
            level: 0,
            baseCost: 10000,
            costMultiplier: 3.0,
            intervalReduction: 50, 
            type: 'auto_sell',
            name: 'Auto Sell',
            description: 'Automatically sells FPS every few seconds'
        },
        'quantum-cpu': {
            level: 0,
            baseCost: 10000,
            costMultiplier: 2.5,
            powerIncrease: 50, 
            type: 'click_auto_bonus',
            name: 'Quantum CPU',
            description: 'Boosts both click and auto download by 50 per level'
        },
        'virtual-gpu': {
            level: 0,
            baseCost: 50000,
            costMultiplier: 2.8,
            rateIncrease: 100, 
            type: 'auto_bonus',
            name: 'Virtual GPU',
            description: 'Increases auto download rate by 100 per level'
        },
        'dimensional-filter': {
            level: 0,
            baseCost: 250000,
            costMultiplier: 3,
            multiplierPerLevel: 1.2, 
            type: 'global_efficiency_bonus',
            name: 'Dimensional Filter',
            description: 'Global efficiency multiplier of 1.2x per level'
        },
        'universe-replication': {
            level: 0,
            baseCost: 1000000,
            costMultiplier: 3.5,
            rateIncrease: 5000, 
            type: 'auto_bonus',
            name: 'Universe Replication',
            description: 'Massive auto download boost of 5000 per level'
        },
        'causal-loop': {
            level: 0,
            baseCost: 5000000,
            costMultiplier: 4,
            multiplierPerLevel: 1.5, 
            type: 'global_efficiency_bonus',
            name: 'Causal Loop',
            description: 'Powerful global efficiency multiplier of 1.5x per level'
        },
        'trans-market-hub': {
            level: 0,
            baseCost: 10000000,
            costMultiplier: 4.5,
            priceBoost: 5, 
            type: 'market_bonus',
            name: 'Omni-Market Singularity',
            description: 'Increases base market price by $5.00 per level'
        }
    },

    // ===== DERIVED STATS =====
    // These are calculated based on upgrade levels and current bonuses
    derivedStats: {
        fpsPerClickCurrent: 0,
        fpsPerSecondCurrent: 0,
        efficiencyMultiplierTotal: 1,
        moneyMultiplierTotal: 1,
        currentMarketVolatility: 1.0,
        autoSellActive: false,
        stageFPSGainMultiplier: 1
    },

    // Auto-sell interval management
    autoSellIntervalId: null,

    // ===== UPGRADE MANAGEMENT FUNCTIONS =====

    /**
     * Gets the current levels of all upgrades
     * @returns {Object} - Object containing upgrade ID to level mappings
     */
    getUpgradeLevels() {
        const levels = {};
        for (const upgradeId in this.upgradesConfig) {
            levels[upgradeId] = this.upgradesConfig[upgradeId].level;
        }
        return levels;
    },

    /**
     * Sets the levels of all upgrades from saved data
     * @param {Object} levels - Object containing upgrade ID to level mappings
     */
    setUpgradeLevels(levels) {
        for (const upgradeId in this.upgradesConfig) {
            if (levels[upgradeId] !== undefined) {
                this.upgradesConfig[upgradeId].level = levels[upgradeId];
            }
        }
    },

    /**
     * Resets all upgrades to level 0
     */
    resetAllUpgrades() {
        for (const upgradeId in this.upgradesConfig) {
            this.upgradesConfig[upgradeId].level = 0;
        }
        
        // Clear auto-sell interval
        if (this.autoSellIntervalId) {
            clearInterval(this.autoSellIntervalId);
            this.autoSellIntervalId = null;
        }
    },

    /**
     * Calculates the cost of upgrading a specific upgrade
     * @param {string} upgradeId - The ID of the upgrade
     * @returns {number} - The cost for the next level
     */
    calculateUpgradeCost(upgradeId) {
        const upgrade = this.upgradesConfig[upgradeId];
        if (!upgrade) return 0;
        
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    },

    /**
     * Attempts to buy an upgrade level
     * @param {string} upgradeId - The ID of the upgrade to buy
     * @returns {boolean} - True if purchase was successful
     */
    buyUpgrade(upgradeId) {
        const upgrade = this.upgradesConfig[upgradeId];
        if (!upgrade) return false;

        // Check if upgrade is already at max level
        if (upgrade.level >= MAX_UPGRADE_LEVEL) {
            return false;
        }

        // Calculate cost
        const cost = this.calculateUpgradeCost(upgradeId);
        
        // Check if player has enough money
        if (money < cost) {
            return false;
        }

        // Purchase the upgrade
        money -= cost;
        upgrade.level++;
        
        console.log(`Purchased ${upgrade.name} level ${upgrade.level} for $${formatNumberWithCommas(cost)}`);
        
        // Recalculate all stats
        this.recalculateStats();
        
        // Handle max level reached
        if (upgrade.level >= MAX_UPGRADE_LEVEL) {
            this.handleMaxLevelReached(upgradeId);
        } else {
            // Save game if not at max level (max level handling has its own save)
            if (typeof saveGame === 'function') {
                saveGame();
            }
        }
        
        return true;
    },

    /**
     * Recalculates all derived stats based on current upgrade levels
     * This is called whenever upgrades change or the game loads
     */
    recalculateStats() {
        // Get current stage multiplier
        const currentStageData = StageManager ? StageManager.getStageInfo(currentStage) : null;
        this.derivedStats.stageFPSGainMultiplier = currentStageData ? currentStageData.fpsGainMultiplier : 1.0;

        // Reset derived stats to base values
        this.derivedStats.fpsPerClickCurrent = 5; // Base click power
        this.derivedStats.fpsPerSecondCurrent = 0;
        this.derivedStats.efficiencyMultiplierTotal = 1;
        this.derivedStats.moneyMultiplierTotal = 1;
        
        // Reset market values to base
        if (typeof marketBasePrice !== 'undefined') {
            marketBasePrice = 1.00;
        }
        this.derivedStats.currentMarketVolatility = 1.0;
        this.derivedStats.autoSellActive = false;

        // Apply all upgrade effects
        for (const upgradeId in this.upgradesConfig) {
            const upgrade = this.upgradesConfig[upgradeId];
            
            // Skip upgrades with no levels
            if (upgrade.level === 0) continue;

            // Apply upgrade effects based on type
            switch (upgrade.type) {
                case 'click':
                    this.derivedStats.fpsPerClickCurrent += upgrade.level * upgrade.powerIncrease;
                    break;
                    
                case 'auto':
                    // Auto upgrade: starts at base value, multiplies per level
                    if (upgrade.level > 0) {
                        this.derivedStats.fpsPerSecondCurrent += upgrade.startValue * 
                            Math.pow(upgrade.rateMultiplierPerLevel, upgrade.level - 1);
                    }
                    break;
                    
                case 'efficiency':
                    this.derivedStats.efficiencyMultiplierTotal *= 
                        Math.pow(upgrade.multiplierPerLevel, upgrade.level);
                    break;
                    
                case 'money_multiplier':
                    this.derivedStats.moneyMultiplierTotal *= 
                        Math.pow(upgrade.multiplierPerLevel, upgrade.level);
                    break;
                    
                case 'market':
                    if (typeof marketBasePrice !== 'undefined') {
                        marketBasePrice += upgrade.level * upgrade.priceIncrease;
                    }
                    break;
                    
                case 'market_volatility':
                    this.derivedStats.currentMarketVolatility += upgrade.level * upgrade.increasePerLevel;
                    break;
                    
                case 'auto_sell':
                    this.derivedStats.autoSellActive = true;
                    break;
                    
                case 'click_auto_bonus':
                    // Boosts both click and auto
                    this.derivedStats.fpsPerClickCurrent += upgrade.level * upgrade.powerIncrease;
                    this.derivedStats.fpsPerSecondCurrent += upgrade.level * upgrade.powerIncrease;
                    break;
                    
                case 'auto_bonus':
                    this.derivedStats.fpsPerSecondCurrent += upgrade.level * upgrade.rateIncrease;
                    break;
                    
                case 'global_efficiency_bonus':
                    this.derivedStats.efficiencyMultiplierTotal *= 
                        Math.pow(upgrade.multiplierPerLevel, upgrade.level);
                    break;
                    
                case 'market_bonus':
                    if (typeof marketBasePrice !== 'undefined') {
                        marketBasePrice += upgrade.level * upgrade.priceBoost;
                    }
                    break;
            }
        }

        // Update global variables (for backward compatibility)
        if (typeof fpsPerClickCurrent !== 'undefined') {
            fpsPerClickCurrent = this.derivedStats.fpsPerClickCurrent;
        }
        if (typeof fpsPerSecondCurrent !== 'undefined') {
            fpsPerSecondCurrent = this.derivedStats.fpsPerSecondCurrent;
        }
        if (typeof efficiencyMultiplierTotal !== 'undefined') {
            efficiencyMultiplierTotal = this.derivedStats.efficiencyMultiplierTotal;
        }
        if (typeof moneyMultiplierTotal !== 'undefined') {
            moneyMultiplierTotal = this.derivedStats.moneyMultiplierTotal;
        }
        if (typeof currentMarketVolatility !== 'undefined') {
            currentMarketVolatility = this.derivedStats.currentMarketVolatility;
        }
        if (typeof autoSellActive !== 'undefined') {
            autoSellActive = this.derivedStats.autoSellActive;
        }
        if (typeof stageFPSGainMultiplier !== 'undefined') {
            stageFPSGainMultiplier = this.derivedStats.stageFPSGainMultiplier;
        }

        // Manage auto-sell functionality
        this.manageAutoSell();

        // Update UI after recalculation
        if (UIManager && UIManager.updateUI) {
            UIManager.updateUI();
        }
    },

    /**
     * Manages the auto-sell interval based on upgrade level
     */
    manageAutoSell() {
        if (this.derivedStats.autoSellActive && this.upgradesConfig['auto-sell-upgrade'].level > 0) {
            const baseInterval = 5000; // 5 seconds base
            const levelReduction = this.upgradesConfig['auto-sell-upgrade'].level * 
                                 this.upgradesConfig['auto-sell-upgrade'].intervalReduction;
            const newInterval = Math.max(1000, baseInterval - levelReduction); // Minimum 1 second

            // Clear existing interval
            if (this.autoSellIntervalId) {
                clearInterval(this.autoSellIntervalId);
            }
            
            // Set up new interval
            this.autoSellIntervalId = setInterval(() => {
                if (typeof currentFPS !== 'undefined' && currentFPS > 0) {
                    const moneyGained = currentFPS * fpsMarketPrice * this.derivedStats.moneyMultiplierTotal;
                    if (typeof money !== 'undefined') {
                        money += moneyGained;
                    }
                    
                    // Drop market price
                    const priceDropAmount = (currentFPS / 100) * 0.05;
                    if (typeof fpsMarketPrice !== 'undefined') {
                        fpsMarketPrice = Math.max(0.2, fpsMarketPrice - priceDropAmount);
                    }
                    
                    // Reset FPS
                    currentFPS = 0;
                    
                    console.log(`Auto-sold ALL FPS for $${formatNumberWithCommas(moneyGained)} money.`);
                    
                    // Update UI and save
                    if (UIManager && UIManager.updateUI) {
                        UIManager.updateUI();
                    }
                    if (typeof saveGame === 'function') {
                        saveGame();
                    }
                }
            }, newInterval);
        } else {
            // Clear auto-sell if not active
            if (this.autoSellIntervalId) {
                clearInterval(this.autoSellIntervalId);
                this.autoSellIntervalId = null;
            }
        }
    },

    /**
     * Handles when an upgrade reaches maximum level
     * @param {string} upgradeId - The ID of the maxed upgrade
     */
    handleMaxLevelReached(upgradeId) {
        const upgrade = this.upgradesConfig[upgradeId];
        if (!upgrade) return;

        // Add to maxed upgrades set
        if (typeof maxedOutUpgradesSet !== 'undefined') {
            maxedOutUpgradesSet.add(upgradeId);
        }

        // Show congratulations message
        if (UIManager && UIManager.showMaxLevelMessage) {
            UIManager.showMaxLevelMessage(upgrade.name || upgradeId);
        }

        // Update UI to reflect max level
        if (UIManager && UIManager.updateUpgradeUI) {
            UIManager.updateUpgradeUI(upgradeId, upgrade);
        }

        // Save game
        if (typeof saveGame === 'function') {
            saveGame();
        }
    },

    /**
     * Updates the UI for a specific upgrade
     * @param {string} upgradeId - The ID of the upgrade to update
     */
    updateUpgradeUI(upgradeId) {
        const upgrade = this.upgradesConfig[upgradeId];
        if (!upgrade) return;

        if (UIManager && UIManager.updateUpgradeUI) {
            UIManager.updateUpgradeUI(upgradeId, upgrade);
        }
    },

    /**
     * Gets upgrade information for display
     * @param {string} upgradeId - The ID of the upgrade
     * @returns {Object} - Upgrade information object
     */
    getUpgradeInfo(upgradeId) {
        const upgrade = this.upgradesConfig[upgradeId];
        if (!upgrade) return null;

        return {
            id: upgradeId,
            name: upgrade.name || upgradeId,
            description: upgrade.description || 'No description available',
            level: upgrade.level,
            maxLevel: MAX_UPGRADE_LEVEL,
            cost: this.calculateUpgradeCost(upgradeId),
            canAfford: typeof money !== 'undefined' ? money >= this.calculateUpgradeCost(upgradeId) : false,
            isMaxed: upgrade.level >= MAX_UPGRADE_LEVEL
        };
    },

    /**
     * Gets all upgrades that should be visible at the current stage
     * @returns {Array} - Array of upgrade IDs that should be visible
     */
    getVisibleUpgrades() {
        const visibleUpgrades = [];
        
        // Get upgrades from all unlocked stages
        for (let i = 0; i <= (typeof currentStage !== 'undefined' ? currentStage : 0); i++) {
            const stageInfo = StageManager ? StageManager.getStageInfo(i) : null;
            if (stageInfo && stageInfo.upgradesUnlockedAtStage) {
                stageInfo.upgradesUnlockedAtStage.forEach(upgradeId => {
                    if (!visibleUpgrades.includes(upgradeId)) {
                        // Only show if not maxed out
                        if (typeof maxedOutUpgradesSet === 'undefined' || !maxedOutUpgradesSet.has(upgradeId)) {
                            visibleUpgrades.push(upgradeId);
                        }
                    }
                });
            }
        }
        
        return visibleUpgrades;
    }
};

// Make UpgradeManager globally available
if (typeof window !== 'undefined') {
    window.UpgradeManager = UpgradeManager;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UpgradeManager;
}