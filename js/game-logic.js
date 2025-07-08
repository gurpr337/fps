/**
 * Download More FPS! - Core Game Logic
 * 
 * This file contains the core game mechanics including:
 * - Game state variables and constants
 * - Download progress and FPS calculations
 * - Market price system
 * - Stage progression logic
 * - Save/load functionality
 * - Game loop and timing
 * 
 * How this file interacts with others:
 * - Calls functions from ui-manager.js to update the display
 * - Uses upgrade definitions from upgrades.js for calculations
 * - Communicates with individual stage files for stage-specific logic
 * - Manages the overall game state that other files depend on
 */

// ===== GAME CONSTANTS =====
// Core game configuration values
const FINAL_FPS_GOAL = 100000000; // 100 million FPS - the ultimate goal
const MAX_UPGRADE_LEVEL = 10; // Maximum level for any upgrade
const perStageFPSBonusFactor = 1.5; // FPS bonus multiplier per stage

// ===== GAME STATE VARIABLES =====
// Core game state - these values change during gameplay
let currentFPS = 0; // Current FPS that can be sold
let totalFPSDownloaded = 0; // Total FPS downloaded (for achievements and stage unlocks)
let downloadProgress = 0; // Progress towards next FPS download (0-100%)
let downloadTarget = 100; // Target progress needed for a complete download
let fpsPerFullDownload = 5; // Base FPS gained per complete download
let finalAchievementUnlocked = false; // Whether the final achievement has been unlocked

// Money and market system
let money = 0; // Current money from selling FPS
let fpsMarketPrice = 1.00; // Current market price per FPS
let marketBasePrice = 1.00; // Base market price (affected by upgrades)
let marketTrendSpeed = 0.01; // How fast the market returns to base price

// Stage progression
let currentStage = 0; // Current stage (0-11)
let numStages = 11; // Total number of stages

// Tracking for maxed out upgrades
let maxedOutUpgradesSet = new Set(); // Set of upgrade IDs that have been maxed out

// Stage emojis for social sharing
const stageEmojis = {
    0: '🔧', 1: '🎮', 2: '🚀', 3: '💾', 4: '❄️', 5: '🌈', 6: '🖥️', 7: '⚡', 8: '🔮', 9: '🧠', 10: '🌌', 11: '🏪'
};

// ===== CORE GAME MECHANICS =====

/**
 * Formats a number with commas for thousands separators
 * @param {number} num - The number to format
 * @returns {string} - Formatted number string
 */
function formatNumberWithCommas(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Calculates the cost of an upgrade based on its level
 * @param {number} baseCost - The base cost of the upgrade
 * @param {number} level - Current level of the upgrade
 * @param {number} multiplier - Cost multiplier per level
 * @returns {number} - The cost for the next level
 */
function calculateUpgradeCost(baseCost, level, multiplier) {
    return Math.floor(baseCost * Math.pow(multiplier, level));
}

/**
 * Progresses the download and grants FPS if complete
 * @param {number} amount - Amount of progress to add
 * @param {Event} event - Click event (optional, for floating text positioning)
 */
function progressDownload(amount, event = null) {
    downloadProgress += amount;

    if (downloadProgress >= downloadTarget) {
        // Calculate FPS gained based on current bonuses
        const gainedFPS = fpsPerFullDownload * efficiencyMultiplierTotal * stageFPSGainMultiplier;
        currentFPS += gainedFPS;
        totalFPSDownloaded += gainedFPS;
        downloadProgress = 0; // Reset progress for next download

        // Create floating text effect if event is provided
        if (event && UIManager && UIManager.createFloatingText) {
            UIManager.createFloatingText(
                `+${formatNumberWithCommas(Math.floor(gainedFPS))} FPS!`,
                event.clientX,
                event.clientY
            );
        }
    }
    
    // Update the UI after progress
    if (UIManager && UIManager.updateUI) {
        UIManager.updateUI();
    }
}

/**
 * Updates the market price with volatility and trend
 * Market price fluctuates based on volatility and slowly returns to base price
 */
function updateMarketPrice() {
    // Apply random volatility
    fpsMarketPrice = marketBasePrice + (Math.random() - 0.5) * currentMarketVolatility;
    
    // Apply trend back to base price
    fpsMarketPrice += (marketBasePrice - fpsMarketPrice) * marketTrendSpeed;
    
    // Ensure price stays within reasonable bounds
    fpsMarketPrice = Math.max(0.2, Math.min(100.0, fpsMarketPrice));
    
    // Update the market price display
    if (UIManager && UIManager.updateMarketPrice) {
        UIManager.updateMarketPrice(fpsMarketPrice);
    }
}

/**
 * Sells all current FPS for money
 * Calculates money based on current FPS, market price, and money multiplier
 */
function sellFPS() {
    if (currentFPS > 0) {
        // Calculate money gained
        const moneyGained = currentFPS * fpsMarketPrice * moneyMultiplierTotal;
        money += moneyGained;
        
        // Market price drops based on amount sold
        const priceDropAmount = (currentFPS / 100) * 0.1;
        fpsMarketPrice = Math.max(0.2, fpsMarketPrice - priceDropAmount);
        
        // Reset FPS to 0 after selling
        currentFPS = 0;
        
        // Update UI and save game
        if (UIManager && UIManager.updateUI) {
            UIManager.updateUI();
        }
        saveGame();
    }
}

/**
 * Checks if the conditions for the next stage are met
 * @returns {boolean} - True if next stage can be unlocked
 */
function canUnlockNextStage() {
    const nextStageNum = currentStage + 1;
    if (nextStageNum > numStages) {
        return false;
    }
    
    // Get unlock threshold from stage information
    const threshold = StageManager.getStageInfo(nextStageNum).unlockThreshold;
    return totalFPSDownloaded >= threshold.totalFps;
}

/**
 * Unlocks and transitions to the next stage
 * Handles stage progression, graphics updates, and UI notifications
 */
function unlockNextStage() {
    if (canUnlockNextStage()) {
        const previousStage = currentStage;
        currentStage++;
        
        console.log(`Advancing to ${StageManager.getStageInfo(currentStage).title}`);
        
        // Reset download progress for new stage
        downloadProgress = 0;
        
        // Recalculate all stats for new stage
        if (UpgradeManager && UpgradeManager.recalculateStats) {
            UpgradeManager.recalculateStats();
        }
        
        // Update UI
        if (UIManager && UIManager.updateUI) {
            UIManager.updateUI();
        }
        
        // Update stage graphics
        if (StageManager && StageManager.updateStageGraphics) {
            StageManager.updateStageGraphics();
            StageManager.playStageUnlockAnimation(currentStage);
        }
        
        // Save game state
        saveGame();

        // Show stage unlock notification
        if (UIManager && UIManager.showStageUnlockedMessage) {
            const stageInfo = StageManager.getStageInfo(currentStage);
            const newUpgrades = getNewlyUnlockedUpgrades(currentStage, previousStage);
            UIManager.showStageUnlockedMessage(stageInfo.title, newUpgrades);
        }
    }
}

/**
 * Gets upgrades that are newly unlocked at a specific stage
 * @param {number} currentStage - The current stage
 * @param {number} previousStage - The previous stage
 * @returns {Array} - Array of newly unlocked upgrade IDs
 */
function getNewlyUnlockedUpgrades(currentStage, previousStage) {
    const currentStageInfo = StageManager.getStageInfo(currentStage);
    const newUpgrades = currentStageInfo.upgradesUnlockedAtStage;
    
    // Filter out upgrades that were already unlocked in previous stages
    const trulyNewUpgrades = newUpgrades.filter(upgradeId => {
        let wasAlreadyUnlocked = false;
        for (let i = 0; i < currentStage; i++) {
            const stageInfo = StageManager.getStageInfo(i);
            if (stageInfo && stageInfo.upgradesUnlockedAtStage.includes(upgradeId)) {
                wasAlreadyUnlocked = true;
                break;
            }
        }
        return !wasAlreadyUnlocked;
    });
    
    return trulyNewUpgrades;
}

/**
 * Main game loop - runs every 100ms
 * Handles passive FPS generation and market updates
 */
function gameLoop() {
    // Generate passive FPS if auto-upgrades are active
    if (fpsPerSecondCurrent > 0) {
        progressDownload(fpsPerSecondCurrent / 10); // Divide by 10 since loop runs 10 times per second
    }
    
    // Update market price
    updateMarketPrice();
    
    // Update UI
    if (UIManager && UIManager.updateUI) {
        UIManager.updateUI();
    }
}

/**
 * Test function to add resources for debugging
 * Can be called from browser console
 */
function handleTestButtonClick() {
    totalFPSDownloaded += 10000;
    currentFPS += 10000;
    money += 5000;
    
    // Recalculate stats and update UI
    if (UpgradeManager && UpgradeManager.recalculateStats) {
        UpgradeManager.recalculateStats();
    }
    if (UIManager && UIManager.updateUI) {
        UIManager.updateUI();
    }
    
    saveGame();
    console.log("Added resources for testing!");
}

// ===== SAVE/LOAD SYSTEM =====

/**
 * Saves the current game state to localStorage
 * Saves all important game variables and upgrade levels
 */
function saveGame() {
    // Get upgrade levels from UpgradeManager
    const upgradeLevels = UpgradeManager ? UpgradeManager.getUpgradeLevels() : {};

    const gameData = {
        currentFPS,
        totalFPSDownloaded,
        downloadProgress,
        finalAchievementUnlocked,
        money,
        fpsMarketPrice,
        currentStage,
        upgradeLevels,
        maxedOutUpgrades: Array.from(maxedOutUpgradesSet)
    };
    
    localStorage.setItem('downloadMoreFPSGame', JSON.stringify(gameData));
}

/**
 * Loads the game state from localStorage
 * Restores all game variables and upgrade levels
 */
function loadGame() {
    const savedData = localStorage.getItem('downloadMoreFPSGame');
    
    if (savedData) {
        const gameData = JSON.parse(savedData);
        
        // Restore basic game state
        currentFPS = gameData.currentFPS || 0;
        totalFPSDownloaded = gameData.totalFPSDownloaded || 0;
        downloadProgress = gameData.downloadProgress || 0;
        finalAchievementUnlocked = gameData.finalAchievementUnlocked || false;
        money = gameData.money || 0;
        fpsMarketPrice = gameData.fpsMarketPrice || 1.00;
        currentStage = gameData.currentStage || 0;
        
        // Restore upgrade levels
        if (gameData.upgradeLevels && UpgradeManager) {
            UpgradeManager.setUpgradeLevels(gameData.upgradeLevels);
        }
        
        // Restore maxed out upgrades
        maxedOutUpgradesSet = new Set(gameData.maxedOutUpgrades || []);
        
        console.log("Game loaded!");
    } else {
        console.log("No saved game found, starting new game.");
    }
    
    // Recalculate stats after loading
    if (UpgradeManager && UpgradeManager.recalculateStats) {
        UpgradeManager.recalculateStats();
    }
    
    // Update UI
    if (UIManager && UIManager.updateUI) {
        UIManager.updateUI();
    }
    
    // Update stage graphics
    if (StageManager && StageManager.updateStageGraphics) {
        StageManager.updateStageGraphics();
    }
}

/**
 * Resets the game to its initial state
 * Shows confirmation dialog before resetting
 */
function resetGame() {
    if (UIManager && UIManager.showResetConfirmation) {
        UIManager.showResetConfirmation(() => {
            // Reset all game state
            currentFPS = 0;
            totalFPSDownloaded = 0;
            downloadProgress = 0;
            finalAchievementUnlocked = false;
            money = 0;
            fpsMarketPrice = 1.00;
            currentStage = 0;
            maxedOutUpgradesSet.clear();
            
            // Reset upgrades
            if (UpgradeManager && UpgradeManager.resetAllUpgrades) {
                UpgradeManager.resetAllUpgrades();
            }
            
            // Clear saved data
            localStorage.removeItem('downloadMoreFPSGame');
            
            console.log("Game reset!");
            
            // Recalculate stats and update UI
            if (UpgradeManager && UpgradeManager.recalculateStats) {
                UpgradeManager.recalculateStats();
            }
            if (UIManager && UIManager.updateUI) {
                UIManager.updateUI();
            }
            if (StageManager && StageManager.updateStageGraphics) {
                StageManager.updateStageGraphics();
            }
        });
    }
}

/**
 * Shares the current game results to clipboard
 * Creates a shareable text with current stats
 */
function shareGameResults() {
    const shareText = `Stage: ${stageEmojis[currentStage]}\n${formatNumberWithCommas(Math.floor(totalFPSDownloaded))} FPS\nDownloadMoreFPS.com`;
    
    // Copy to clipboard
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = shareText;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
    
    // Show confirmation message
    if (UIManager && UIManager.showClipboardMessage) {
        UIManager.showClipboardMessage('Copied to clipboard!');
    }
}

// ===== GAME INITIALIZATION =====

/**
 * Initializes the game when the page loads
 * Sets up the game loop and loads saved data
 */
function initializeGame() {
    // Load saved game or start new game
    loadGame();
    
    // Set up game loop (runs every 100ms)
    setInterval(gameLoop, 100);
    
    // Auto-save every 5 seconds
    setInterval(saveGame, 5000);
    
    // Set up stage tick marks
    if (UIManager && UIManager.setupStageTickMarks) {
        UIManager.setupStageTickMarks();
    }
    
    console.log("Game initialized!");
    console.log("To add resources for testing, type: handleTestButtonClick()");
}

// Handle page visibility change to prevent offline progress issues
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        saveGame();
    } else {
        loadGame();
    }
});

// Make test function available globally for console access
window.handleTestButtonClick = handleTestButtonClick;