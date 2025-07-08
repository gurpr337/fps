/**
 * Download More FPS! - UI Management System
 * 
 * This file manages all user interface functionality including:
 * - DOM element management and updates
 * - Progress bar updates and animations
 * - Modal dialogs and messages
 * - Event handling and user interactions
 * - Stage visibility and upgrade card management
 * 
 * How this file interacts with others:
 * - Called by game-logic.js to update UI when game state changes
 * - Called by upgrades.js to update upgrade card displays
 * - Calls functions in game-logic.js when user interacts with buttons
 * - Coordinates with stage-manager.js for stage display updates
 */

// ===== UI MANAGER =====
const UIManager = {
    // ===== DOM ELEMENTS CACHE =====
    // Cache frequently used DOM elements for better performance
    elements: {},

    // ===== INITIALIZATION =====

    /**
     * Initializes the UI Manager and caches DOM elements
     * Should be called when the page loads
     */
    initialize() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupStageTickMarks();
        console.log("UI Manager initialized");
    },

    /**
     * Caches frequently used DOM elements for performance
     */
    cacheElements() {
        // Currency displays
        this.elements.moneyDisplay = document.getElementById('money-display');
        this.elements.fpsMarketPriceDisplay = document.getElementById('fps-market-price-display');
        
        // Main action buttons
        this.elements.downloadButton = document.getElementById('download-button');
        this.elements.sellFpsButton = document.getElementById('sell-fps-button');
        
        // Progress bars
        this.elements.downloadProgressFill = document.getElementById('download-progress-fill');
        this.elements.downloadProgressText = document.getElementById('download-progress-text');
        this.elements.totalFpsProgressFill = document.getElementById('total-fps-progress-fill');
        this.elements.totalFpsProgressText = document.getElementById('total-fps-progress-text');
        
        // Final achievement display
        this.elements.finalAchievementDisplay = document.getElementById('final-achievement-display');
        
        // Stage progress elements
        this.elements.stageTickMarksContainer = document.getElementById('stage-tick-marks-container');
        this.elements.stageDisplay = document.getElementById('stage-display');
        this.elements.unlockNextStageButton = document.getElementById('unlock-next-stage-button');
        
        // Utility buttons
        this.elements.resetButton = document.getElementById('reset-game');
        this.elements.shareButton = document.getElementById('share-button');
        this.elements.infoButton = document.getElementById('info-button');
        
        // Game container for floating text
        this.elements.gameContainer = document.getElementById('game');
        
        // Cache upgrade elements dynamically
        this.cacheUpgradeElements();
    },

    /**
     * Caches upgrade-related DOM elements
     */
    cacheUpgradeElements() {
        if (!UpgradeManager) return;
        
        for (const upgradeId in UpgradeManager.upgradesConfig) {
            this.elements[`${upgradeId}-cost`] = document.getElementById(`${upgradeId}-cost`);
            this.elements[`buy-${upgradeId}`] = document.getElementById(`buy-${upgradeId}`);
            this.elements[`${upgradeId}-level`] = document.getElementById(`${upgradeId}-level`);
            this.elements[`upgrade-card-${upgradeId}`] = document.getElementById(`upgrade-card-${upgradeId}`);
        }
    },

    /**
     * Sets up event listeners for all interactive elements
     */
    setupEventListeners() {
        // Main action buttons
        if (this.elements.downloadButton) {
            this.elements.downloadButton.addEventListener('click', (event) => {
                if (typeof progressDownload === 'function' && typeof fpsPerClickCurrent !== 'undefined') {
                    progressDownload(fpsPerClickCurrent, event);
                }
            });
        }

        if (this.elements.sellFpsButton) {
            this.elements.sellFpsButton.addEventListener('click', () => {
                if (typeof sellFPS === 'function') {
                    sellFPS();
                }
            });
        }

        // Upgrade buttons
        if (UpgradeManager) {
            for (const upgradeId in UpgradeManager.upgradesConfig) {
                const buyButton = this.elements[`buy-${upgradeId}`];
                if (buyButton) {
                    buyButton.addEventListener('click', () => {
                        UpgradeManager.buyUpgrade(upgradeId);
                    });
                }
            }
        }

        // Utility buttons
        if (this.elements.resetButton) {
            this.elements.resetButton.addEventListener('click', () => {
                if (typeof resetGame === 'function') {
                    resetGame();
                }
            });
        }

        if (this.elements.shareButton) {
            this.elements.shareButton.addEventListener('click', () => {
                if (typeof shareGameResults === 'function') {
                    shareGameResults();
                }
            });
        }

        if (this.elements.infoButton) {
            this.elements.infoButton.addEventListener('click', () => {
                this.showGameInfoMessage();
            });
        }

        if (this.elements.unlockNextStageButton) {
            this.elements.unlockNextStageButton.addEventListener('click', () => {
                if (typeof unlockNextStage === 'function') {
                    unlockNextStage();
                }
            });
        }
    },

    // ===== UI UPDATE FUNCTIONS =====

    /**
     * Main UI update function - updates all UI elements
     * Called frequently by the game loop
     */
    updateUI() {
        this.updateCurrencyDisplays();
        this.updateProgressBars();
        this.updateMainButtons();
        this.updateStageDisplay();
        this.updateUpgradeVisibility();
        this.updateFinalAchievement();
    },

    /**
     * Updates currency displays (money and market price)
     */
    updateCurrencyDisplays() {
        if (this.elements.moneyDisplay && typeof money !== 'undefined') {
            this.elements.moneyDisplay.textContent = `$${formatNumberWithCommas(money)}`;
        }

        if (this.elements.fpsMarketPriceDisplay && typeof fpsMarketPrice !== 'undefined') {
            this.elements.fpsMarketPriceDisplay.textContent = fpsMarketPrice.toFixed(2);
        }
    },

    /**
     * Updates progress bars for download and total FPS
     */
    updateProgressBars() {
        // Download progress bar
        if (this.elements.downloadProgressFill && typeof downloadProgress !== 'undefined' && typeof downloadTarget !== 'undefined') {
            const progressPercentage = (downloadProgress / downloadTarget) * 100;
            this.elements.downloadProgressFill.style.width = `${progressPercentage}%`;
            
            if (this.elements.downloadProgressText) {
                this.elements.downloadProgressText.textContent = `${Math.round(progressPercentage)}%`;
                this.elements.downloadProgressText.style.display = 'block';
            }
        }

        // Total FPS progress bar
        if (this.elements.totalFpsProgressFill && typeof totalFPSDownloaded !== 'undefined' && typeof FINAL_FPS_GOAL !== 'undefined') {
            let totalFpsProgressPercentage = 0;
            if (FINAL_FPS_GOAL > 0) {
                totalFpsProgressPercentage = (totalFPSDownloaded / FINAL_FPS_GOAL) * 100;
            }
            totalFpsProgressPercentage = Math.min(100, totalFpsProgressPercentage);

            this.elements.totalFpsProgressFill.style.width = `${totalFpsProgressPercentage}%`;
            
            if (this.elements.totalFpsProgressText) {
                this.elements.totalFpsProgressText.textContent = `Total FPS: ${formatNumberWithCommas(totalFPSDownloaded)}`;
                this.elements.totalFpsProgressText.style.display = 'block';
            }
        }
    },

    /**
     * Updates the main action buttons (More FPS and Sell FPS)
     */
    updateMainButtons() {
        // Update sell FPS button
        if (this.elements.sellFpsButton && typeof currentFPS !== 'undefined') {
            this.elements.sellFpsButton.textContent = `Sell ${formatNumberWithCommas(currentFPS)} FPS!`;
            this.elements.sellFpsButton.disabled = currentFPS <= 0;
            
            if (this.elements.sellFpsButton.disabled) {
                this.elements.sellFpsButton.classList.add('disabled-btn');
            } else {
                this.elements.sellFpsButton.classList.remove('disabled-btn');
            }
        }
    },

    /**
     * Updates stage display and unlock button
     */
    updateStageDisplay() {
        // Update stage title
        if (this.elements.stageDisplay && StageManager && typeof currentStage !== 'undefined') {
            const stageInfo = StageManager.getStageInfo(currentStage);
            this.elements.stageDisplay.textContent = stageInfo.title;
        }

        // Update unlock next stage button
        this.updateUnlockNextStageButton();
    },

    /**
     * Updates the "Unlock Next Stage" button visibility and state
     */
    updateUnlockNextStageButton() {
        if (!this.elements.unlockNextStageButton || !StageManager || typeof currentStage === 'undefined') return;

        const nextStageNum = currentStage + 1;
        const totalStages = StageManager.getTotalStages();
        
        if (nextStageNum <= totalStages) {
            const nextStage = StageManager.getStageInfo(nextStageNum);
            const threshold = nextStage.unlockThreshold;
            const metFps = typeof totalFPSDownloaded !== 'undefined' && totalFPSDownloaded >= threshold.totalFps;
            
            if (metFps) {
                this.elements.unlockNextStageButton.classList.remove('hidden');
                this.elements.unlockNextStageButton.disabled = false;
                this.elements.unlockNextStageButton.textContent = `Unlock ${nextStage.title}!`;
                this.elements.unlockNextStageButton.classList.remove('disabled-btn');
            } else {
                this.elements.unlockNextStageButton.classList.remove('hidden');
                this.elements.unlockNextStageButton.disabled = true;
                this.elements.unlockNextStageButton.textContent = `Requires FPS: ${formatNumberWithCommas(totalFPSDownloaded)}/${formatNumberWithCommas(threshold.totalFps)}`;
                this.elements.unlockNextStageButton.classList.add('disabled-btn');
            }
        } else {
            this.elements.unlockNextStageButton.classList.add('hidden');
        }
    },

    /**
     * Updates upgrade card visibility based on current stage
     */
    updateUpgradeVisibility() {
        if (!UpgradeManager || typeof currentStage === 'undefined') return;

        // Hide all upgrade cards initially
        for (const upgradeId in UpgradeManager.upgradesConfig) {
            const upgradeCard = this.elements[`upgrade-card-${upgradeId}`];
            if (upgradeCard) {
                upgradeCard.classList.add('hidden');
            }
        }

        // Show upgrades based on current stage and maxed status
        for (let i = 0; i <= currentStage; i++) {
            const stageData = StageManager ? StageManager.getStageInfo(i) : null;
            if (stageData && stageData.upgradesUnlockedAtStage) {
                stageData.upgradesUnlockedAtStage.forEach(upgradeId => {
                    const upgradeCard = this.elements[`upgrade-card-${upgradeId}`];
                    const isMaxed = typeof maxedOutUpgradesSet !== 'undefined' && maxedOutUpgradesSet.has(upgradeId);
                    
                    if (upgradeCard && !isMaxed) {
                        upgradeCard.classList.remove('hidden');
                        this.updateUpgradeUI(upgradeId, UpgradeManager.upgradesConfig[upgradeId]);
                    }
                });
            }
        }
    },

    /**
     * Updates final achievement display
     */
    updateFinalAchievement() {
        if (!this.elements.finalAchievementDisplay || typeof totalFPSDownloaded === 'undefined' || typeof FINAL_FPS_GOAL === 'undefined') return;

        if (totalFPSDownloaded >= FINAL_FPS_GOAL && typeof finalAchievementUnlocked !== 'undefined' && !finalAchievementUnlocked) {
            this.elements.finalAchievementDisplay.classList.remove('hidden');
            if (typeof window !== 'undefined') {
                window.finalAchievementUnlocked = true;
            }
        } else if (totalFPSDownloaded < FINAL_FPS_GOAL && typeof finalAchievementUnlocked !== 'undefined' && finalAchievementUnlocked) {
            this.elements.finalAchievementDisplay.classList.add('hidden');
            if (typeof window !== 'undefined') {
                window.finalAchievementUnlocked = false;
            }
        }
    },

    // ===== UPGRADE UI MANAGEMENT =====

    /**
     * Updates the UI for a specific upgrade card
     * @param {string} upgradeId - The ID of the upgrade to update
     * @param {Object} upgrade - The upgrade configuration object
     */
    updateUpgradeUI(upgradeId, upgrade) {
        if (!upgrade) return;

        const costElement = this.elements[`${upgradeId}-cost`];
        const levelElement = this.elements[`${upgradeId}-level`];
        const buyButton = this.elements[`buy-${upgradeId}`];
        const upgradeCard = this.elements[`upgrade-card-${upgradeId}`];

        if (!upgradeCard || (typeof maxedOutUpgradesSet !== 'undefined' && maxedOutUpgradesSet.has(upgradeId))) {
            return;
        }

        // Ensure the card is visible if it's not maxed out
        upgradeCard.classList.remove('hidden');

        if (upgrade.level >= (typeof MAX_UPGRADE_LEVEL !== 'undefined' ? MAX_UPGRADE_LEVEL : 10)) {
            // Handle max level state
            if (costElement) costElement.textContent = `MAX LEVEL!`;
            if (levelElement) levelElement.textContent = typeof MAX_UPGRADE_LEVEL !== 'undefined' ? MAX_UPGRADE_LEVEL : 10;
            if (buyButton) {
                buyButton.disabled = true;
                buyButton.classList.add('disabled-btn');
                buyButton.textContent = "MAXED";
            }
        } else {
            // Normal upgrade state
            if (costElement && UpgradeManager) {
                const nextCost = UpgradeManager.calculateUpgradeCost(upgradeId);
                costElement.textContent = `Cost: $${formatNumberWithCommas(nextCost)}`;
            }
            if (levelElement) {
                levelElement.textContent = upgrade.level;
            }
            if (buyButton && UpgradeManager) {
                const nextCost = UpgradeManager.calculateUpgradeCost(upgradeId);
                const canAfford = typeof money !== 'undefined' && money >= nextCost;
                
                buyButton.disabled = !canAfford;
                if (buyButton.disabled) {
                    buyButton.classList.add('disabled-btn');
                } else {
                    buyButton.classList.remove('disabled-btn');
                }
                buyButton.textContent = "Buy";
            }
        }
    },

    // ===== VISUAL EFFECTS =====

    /**
     * Creates floating text effect at specified coordinates
     * @param {string} text - The text to display
     * @param {number} x - X coordinate (relative to viewport)
     * @param {number} y - Y coordinate (relative to viewport)
     */
    createFloatingText(text, x, y) {
        if (!this.elements.gameContainer) return;

        const floatText = document.createElement('div');
        floatText.className = 'fps-float';
        floatText.textContent = text;

        const rect = this.elements.gameContainer.getBoundingClientRect();
        const relativeX = x - rect.left;
        const relativeY = y - rect.top;

        floatText.style.left = `${relativeX}px`;
        floatText.style.top = `${relativeY}px`;

        this.elements.gameContainer.appendChild(floatText);

        floatText.addEventListener('animationend', () => {
            floatText.remove();
        });
    },

    /**
     * Updates market price display
     * @param {number} price - The current market price
     */
    updateMarketPrice(price) {
        if (this.elements.fpsMarketPriceDisplay) {
            this.elements.fpsMarketPriceDisplay.textContent = price.toFixed(2);
        }
    },

    /**
     * Generates and adds tick marks to the total FPS progress bar
     */
    setupStageTickMarks() {
        if (!this.elements.stageTickMarksContainer || !StageManager || typeof FINAL_FPS_GOAL === 'undefined') return;

        this.elements.stageTickMarksContainer.innerHTML = '';

        const totalStages = StageManager.getTotalStages();
        for (let i = 1; i <= totalStages; i++) {
            const stageData = StageManager.getStageInfo(i);
            if (stageData && stageData.unlockThreshold.totalFps > 0 && stageData.unlockThreshold.totalFps < FINAL_FPS_GOAL) {
                const percentage = (stageData.unlockThreshold.totalFps / FINAL_FPS_GOAL) * 100;
                const tickMark = document.createElement('div');
                tickMark.className = 'stage-tick-mark';
                tickMark.style.left = `${percentage}%`;
                this.elements.stageTickMarksContainer.appendChild(tickMark);
            }
        }
    },

    // ===== MESSAGE DIALOGS =====

    /**
     * Shows the game info message dialog
     */
    showGameInfoMessage() {
        const messageBoxOverlay = document.createElement('div');
        messageBoxOverlay.className = 'message-box-overlay';
        messageBoxOverlay.style.opacity = '0';

        const messageBoxContent = document.createElement('div');
        messageBoxContent.className = 'message-box-content';
        messageBoxOverlay.appendChild(messageBoxContent);

        messageBoxContent.innerHTML = `
            <button class="message-box-close-button">&times;</button>
            <h3 class="text-xl font-bold text-accent-teal mb-2">How to Play</h3>
            <p class="text-sm text-left mb-2">Download FPS and unlock upgrades until you reach the ultimate achievement of mankind.</p>
            <ul class="text-left text-sm mb-3 list-disc list-inside">
                <li>Tap the More FPS!!! button to instantly download FPS.</li>
                <li>Sell FPS! you've downloaded to earn money. The market price fluctuates, so sell high!</li>
                <li>Use your money to purchase powerful Upgrades. These boost your click power, automate FPS downloads, increase money from sales, and more.</li>
                <li>Reach Total FPS goals to unlock new Stages. Each stage gives a global FPS bonus and reveals new, more powerful upgrades!</li>
                <li>Fully level up an upgrade to max its potential and earn an achievement!</li>
            </ul>
            <p class="text-sm text-gray-400">Good luck, gamer!</p>
        `;
        document.body.appendChild(messageBoxOverlay);

        this.setupMessageBoxEvents(messageBoxOverlay, messageBoxContent);

        setTimeout(() => {
            messageBoxOverlay.style.opacity = '1';
        }, 10);
    },

    /**
     * Shows a stage unlocked message
     * @param {string} stageTitle - The title of the unlocked stage
     * @param {Array} newUpgrades - Array of newly unlocked upgrade IDs
     */
    showStageUnlockedMessage(stageTitle, newUpgrades) {
        const messageBoxOverlay = document.createElement('div');
        messageBoxOverlay.className = 'message-box-overlay';
        messageBoxOverlay.style.opacity = '0';

        const messageBoxContent = document.createElement('div');
        messageBoxContent.className = 'message-box-content';
        messageBoxOverlay.appendChild(messageBoxContent);

        let upgradeMessage = '';
        if (newUpgrades.length > 0) {
            const upgradeNames = newUpgrades.map(id => {
                const cardElement = this.elements[`upgrade-card-${id}`];
                return cardElement ? cardElement.querySelector('h3').textContent : id;
            });
            if (upgradeNames.length === 1) {
                upgradeMessage = `New Upgrade Available: ${upgradeNames[0]}!`;
            } else {
                upgradeMessage = `New Upgrades Available: ${upgradeNames.join(', ')}!`;
            }
        } else {
            upgradeMessage = `No new upgrades available this stage.`;
        }

        messageBoxContent.innerHTML = `
            <button class="message-box-close-button">&times;</button>
            <h3 class="text-xl font-bold text-accent-teal mb-2">Congratulations!!</h3>
            <p class="mb-3 text-lg">${upgradeMessage}</p>
        `;
        document.body.appendChild(messageBoxOverlay);

        this.setupMessageBoxEvents(messageBoxOverlay, messageBoxContent);

        setTimeout(() => {
            messageBoxOverlay.style.opacity = '1';
        }, 10);
    },

    /**
     * Shows a max level achievement message
     * @param {string} upgradeName - The name of the maxed upgrade
     */
    showMaxLevelMessage(upgradeName) {
        const messageBoxOverlay = document.createElement('div');
        messageBoxOverlay.className = 'message-box-overlay';
        messageBoxOverlay.style.opacity = '0';

        const messageBoxContent = document.createElement('div');
        messageBoxContent.className = 'message-box-content';
        messageBoxOverlay.appendChild(messageBoxContent);

        messageBoxContent.innerHTML = `
            <button class="message-box-close-button">&times;</button>
            <h3 class="text-xl font-bold text-accent-teal mb-2">Congratulations!</h3>
            <p class="mb-3 text-lg">You've maxed out your "${upgradeName}"!</p>
            <p class="text-md text-gray-400">Its effects will continue to boost your game!</p>
        `;
        document.body.appendChild(messageBoxOverlay);

        this.setupMessageBoxEvents(messageBoxOverlay, messageBoxContent);

        setTimeout(() => {
            messageBoxOverlay.style.opacity = '1';
        }, 10);

        // Auto-close after a few seconds
        setTimeout(() => {
            messageBoxOverlay.style.opacity = '0';
            messageBoxOverlay.addEventListener('transitionend', () => {
                messageBoxOverlay.remove();
            }, { once: true });
        }, 2500);
    },

    /**
     * Shows reset confirmation dialog
     * @param {Function} onConfirm - Callback function when reset is confirmed
     */
    showResetConfirmation(onConfirm) {
        const confirmationBoxOverlay = document.createElement('div');
        confirmationBoxOverlay.className = 'message-box-overlay';
        const confirmationBoxContent = document.createElement('div');
        confirmationBoxContent.className = 'message-box-content';
        confirmationBoxOverlay.appendChild(confirmationBoxContent);

        confirmationBoxContent.innerHTML = `
            <p class="mb-3 text-lg">Are you sure you want to reset the game? This cannot be undone</p>
            <button id="confirm-reset" class="btn-upgrade btn-red mx-2">Yes, Reset</button>
            <button id="cancel-reset" class="btn-upgrade btn-gray mx-2">Cancel</button>
        `;
        document.body.appendChild(confirmationBoxOverlay);

        document.getElementById('confirm-reset').addEventListener('click', () => {
            onConfirm();
            confirmationBoxOverlay.remove();
        });

        document.getElementById('cancel-reset').addEventListener('click', () => {
            confirmationBoxOverlay.remove();
        });
    },

    /**
     * Shows a clipboard message
     * @param {string} message - The message to display
     */
    showClipboardMessage(message) {
        if (!this.elements.gameContainer) return;

        const messageBox = document.createElement('div');
        messageBox.className = 'clipboard-message';
        messageBox.textContent = message;
        this.elements.gameContainer.appendChild(messageBox);

        // Position and show message (relative to game container)
        const gameRect = this.elements.gameContainer.getBoundingClientRect();
        messageBox.style.left = `${gameRect.width / 2}px`;
        messageBox.style.top = `${gameRect.height / 2}px`;

        setTimeout(() => {
            messageBox.classList.add('show');
        }, 10);

        setTimeout(() => {
            messageBox.classList.remove('show');
            setTimeout(() => {
                messageBox.remove();
            }, 300);
        }, 1500);
    },

    /**
     * Sets up event listeners for message box close functionality
     * @param {HTMLElement} overlay - The message box overlay element
     * @param {HTMLElement} content - The message box content element
     */
    setupMessageBoxEvents(overlay, content) {
        // Close button listener
        const closeButton = content.querySelector('.message-box-close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                overlay.style.opacity = '0';
                overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
            });
        }

        // Click overlay to close
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                overlay.style.opacity = '0';
                overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
            }
        });
    }
};

// Make UIManager globally available
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}