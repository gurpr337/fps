/**
 * Download More FPS! - Stage Management System
 * 
 * This file manages all stage-related functionality including:
 * - Stage information and unlock conditions
 * - Stage graphics display and animations
 * - Stage progression and unlock logic
 * - Integration with upgrade system
 * 
 * How this file interacts with others:
 * - Called by game-logic.js for stage progression and unlock conditions
 * - Provides stage information to upgrades.js for upgrade unlocking
 * - Manages SVG graphics and animations for each stage
 * - Coordinates with ui-manager.js for stage display updates
 */

// ===== STAGE MANAGER =====
const StageManager = {
    // ===== STAGE INFORMATION =====
    // Contains all stage data including unlock conditions, titles, and upgrades
    stageInfo: {
        0: {
            title: "Motherboard Initialization",
            unlockThreshold: { totalFps: 0 },
            upgradesUnlockedAtStage: ['click-upgrade', 'auto-upgrade'],
            fpsGainMultiplier: Math.pow(1.5, 0) // Base multiplier
        },
        1: {
            title: "RTX GPU Installation",
            unlockThreshold: { totalFps: 100 },
            upgradesUnlockedAtStage: ['efficiency-upgrade'],
            fpsGainMultiplier: Math.pow(1.5, 1)
        },
        2: {
            title: "CPU Cooling System",
            unlockThreshold: { totalFps: 500 },
            upgradesUnlockedAtStage: ['money-multiplier-upgrade'],
            fpsGainMultiplier: Math.pow(1.5, 2)
        },
        3: {
            title: "NVMe SSD Storage",
            unlockThreshold: { totalFps: 2000 },
            upgradesUnlockedAtStage: ['market-price-upgrade'],
            fpsGainMultiplier: Math.pow(1.5, 3)
        },
        4: {
            title: "Liquid Cooling Loop",
            unlockThreshold: { totalFps: 8000 },
            upgradesUnlockedAtStage: ['market-volatility-upgrade'],
            fpsGainMultiplier: Math.pow(1.5, 4)
        },
        5: {
            title: "RGB Memory Upgrade",
            unlockThreshold: { totalFps: 25000 },
            upgradesUnlockedAtStage: ['auto-sell-upgrade'],
            fpsGainMultiplier: Math.pow(1.5, 5)
        },
        6: {
            title: "Gaming Computer Complete",
            unlockThreshold: { totalFps: 75000 },
            upgradesUnlockedAtStage: ['quantum-cpu'],
            fpsGainMultiplier: Math.pow(1.5, 6)
        },
        7: {
            title: "Quantum Processing Unit",
            unlockThreshold: { totalFps: 200000 },
            upgradesUnlockedAtStage: ['virtual-gpu'],
            fpsGainMultiplier: Math.pow(1.5, 7)
        },
        8: {
            title: "Neural Network Brain",
            unlockThreshold: { totalFps: 500000 },
            upgradesUnlockedAtStage: ['dimensional-filter'],
            fpsGainMultiplier: Math.pow(1.5, 8)
        },
        9: {
            title: "Cosmic Singularity",
            unlockThreshold: { totalFps: 1250000 },
            upgradesUnlockedAtStage: ['universe-replication'],
            fpsGainMultiplier: Math.pow(1.5, 9)
        },
        10: {
            title: "Temporal Manipulation",
            unlockThreshold: { totalFps: 3000000 },
            upgradesUnlockedAtStage: ['causal-loop'],
            fpsGainMultiplier: Math.pow(1.5, 10)
        },
        11: {
            title: "Omni-Market Singularity",
            unlockThreshold: { totalFps: 7500000 },
            upgradesUnlockedAtStage: ['trans-market-hub'],
            fpsGainMultiplier: Math.pow(1.5, 11)
        }
    },

    // ===== STAGE GRAPHICS MANAGEMENT =====

    /**
     * Gets stage information for a specific stage
     * @param {number} stageNumber - The stage number to get info for
     * @returns {Object} - Stage information object
     */
    getStageInfo(stageNumber) {
        return this.stageInfo[stageNumber] || this.stageInfo[0];
    },

    /**
     * Updates the stage graphics display based on current stage
     * Shows graphics for all unlocked stages, hides locked ones
     */
    updateStageGraphics() {
        const currentStage = typeof window !== 'undefined' && window.currentStage !== undefined ? 
                            window.currentStage : 0;
        
        // Show all graphics up to and including the current stage
        for (let i = 0; i <= currentStage; i++) {
            const graphicsElement = document.getElementById(`stage-${i}-graphics`);
            if (graphicsElement) {
                graphicsElement.classList.remove('hidden');
            }
        }
        
        // Hide graphics for stages not yet unlocked
        for (let i = currentStage + 1; i <= 20; i++) {
            const graphicsElement = document.getElementById(`stage-${i}-graphics`);
            if (graphicsElement) {
                graphicsElement.classList.add('hidden');
            }
        }
        
        // Special handling: Hide "initializing" text when stage 1+ is reached
        const initializingText = document.getElementById('initializing-text');
        if (initializingText && currentStage >= 1) {
            initializingText.style.display = 'none';
        } else if (initializingText && currentStage === 0) {
            initializingText.style.display = 'block';
        }
    },

    /**
     * Plays a special animation when a new stage is unlocked
     * @param {number} stageNumber - The stage number that was unlocked
     */
    playStageUnlockAnimation(stageNumber) {
        const graphicsElement = document.getElementById(`stage-${stageNumber}-graphics`);
        if (graphicsElement) {
            // Add a special unlock animation
            graphicsElement.style.transform = 'scale(0.8)';
            graphicsElement.style.opacity = '0';
            
            // Animate in
            setTimeout(() => {
                graphicsElement.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
                graphicsElement.style.transform = 'scale(1)';
                graphicsElement.style.opacity = '1';
            }, 100);
            
            // Reset styles after animation
            setTimeout(() => {
                graphicsElement.style.transform = '';
                graphicsElement.style.opacity = '';
                graphicsElement.style.transition = '';
            }, 700);
        }
    },

    /**
     * Gets the total number of stages in the game
     * @returns {number} - Total number of stages
     */
    getTotalStages() {
        return Object.keys(this.stageInfo).length - 1; // Subtract 1 because stages are 0-indexed
    },

    /**
     * Checks if a specific stage is unlocked
     * @param {number} stageNumber - The stage number to check
     * @returns {boolean} - True if the stage is unlocked
     */
    isStageUnlocked(stageNumber) {
        const currentStage = typeof window !== 'undefined' && window.currentStage !== undefined ? 
                            window.currentStage : 0;
        return stageNumber <= currentStage;
    },

    /**
     * Gets the next stage that can be unlocked
     * @returns {Object|null} - Next stage info or null if at max stage
     */
    getNextUnlockableStage() {
        const currentStage = typeof window !== 'undefined' && window.currentStage !== undefined ? 
                            window.currentStage : 0;
        const nextStage = currentStage + 1;
        
        if (nextStage <= this.getTotalStages()) {
            return {
                stageNumber: nextStage,
                stageInfo: this.getStageInfo(nextStage)
            };
        }
        
        return null;
    },

    /**
     * Gets all upgrades that should be unlocked up to the current stage
     * @returns {Array} - Array of upgrade IDs that should be unlocked
     */
    getAllUnlockedUpgrades() {
        const currentStage = typeof window !== 'undefined' && window.currentStage !== undefined ? 
                            window.currentStage : 0;
        const unlockedUpgrades = [];
        
        for (let i = 0; i <= currentStage; i++) {
            const stageInfo = this.getStageInfo(i);
            if (stageInfo && stageInfo.upgradesUnlockedAtStage) {
                stageInfo.upgradesUnlockedAtStage.forEach(upgradeId => {
                    if (!unlockedUpgrades.includes(upgradeId)) {
                        unlockedUpgrades.push(upgradeId);
                    }
                });
            }
        }
        
        return unlockedUpgrades;
    },

    /**
     * Initializes the stage graphics container with all SVG elements
     * This creates the complete SVG structure for all stages
     */
    initializeStageGraphics() {
        const container = document.getElementById('stage-graphics-container');
        if (!container) return;

        // Create the main SVG element if it doesn't exist
        let svg = document.getElementById('stage-graphics-svg');
        if (!svg) {
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.id = 'stage-graphics-svg';
            svg.setAttribute('viewBox', '0 0 500 280');
            svg.setAttribute('class', 'stage-graphics-svg');
            container.appendChild(svg);
        }

        // Add SVG definitions for gradients and patterns
        this.addSVGDefinitions(svg);

        // Create graphics for each stage
        this.createStageGraphics(svg);
    },

    /**
     * Adds SVG gradient definitions to the SVG element
     * @param {SVGElement} svg - The SVG element to add definitions to
     */
    addSVGDefinitions(svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Create gradient definitions
        const gradients = [
            {
                id: 'motherboardGradient',
                type: 'linearGradient',
                x1: '0%', y1: '0%', x2: '100%', y2: '100%',
                stops: [
                    { offset: '0%', color: '#006400', opacity: '0.8' },
                    { offset: '100%', color: '#228B22', opacity: '0.6' }
                ]
            },
            {
                id: 'gpuGradient',
                type: 'linearGradient',
                x1: '0%', y1: '0%', x2: '100%', y2: '100%',
                stops: [
                    { offset: '0%', color: 'var(--accent-green)', opacity: '1' },
                    { offset: '100%', color: '#004d1a', opacity: '1' }
                ]
            },
            {
                id: 'fanGradient',
                type: 'radialGradient',
                cx: '50%', cy: '50%', r: '50%',
                stops: [
                    { offset: '0%', color: 'var(--accent-purple)', opacity: '1' },
                    { offset: '100%', color: 'var(--accent-purple)', opacity: '0.3' }
                ]
            },
            {
                id: 'liquidGradient',
                type: 'linearGradient',
                x1: '0%', y1: '0%', x2: '100%', y2: '100%',
                stops: [
                    { offset: '0%', color: 'var(--accent-teal)', opacity: '0.8' },
                    { offset: '50%', color: '#00ffff', opacity: '0.6' },
                    { offset: '100%', color: 'var(--accent-teal)', opacity: '0.8' }
                ]
            },
            {
                id: 'caseGradient',
                type: 'linearGradient',
                x1: '0%', y1: '0%', x2: '100%', y2: '100%',
                stops: [
                    { offset: '0%', color: 'var(--bg-primary)', opacity: '1' },
                    { offset: '100%', color: 'var(--accent-teal)', opacity: '0.8' }
                ]
            },
            {
                id: 'galaxyGradient',
                type: 'radialGradient',
                cx: '50%', cy: '50%', r: '50%',
                stops: [
                    { offset: '0%', color: 'var(--accent-purple)', opacity: '0.4' },
                    { offset: '100%', color: 'var(--bg-primary)', opacity: '0.1' }
                ]
            }
        ];

        gradients.forEach(gradientData => {
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', gradientData.type);
            gradient.id = gradientData.id;
            
            // Set gradient attributes
            Object.keys(gradientData).forEach(key => {
                if (key !== 'id' && key !== 'type' && key !== 'stops') {
                    gradient.setAttribute(key, gradientData[key]);
                }
            });
            
            // Add stops
            gradientData.stops.forEach(stopData => {
                const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop.setAttribute('offset', stopData.offset);
                stop.setAttribute('stop-color', stopData.color);
                stop.setAttribute('stop-opacity', stopData.opacity);
                gradient.appendChild(stop);
            });
            
            defs.appendChild(gradient);
        });
        
        svg.appendChild(defs);
    },

    /**
     * Creates the graphics for all stages
     * @param {SVGElement} svg - The SVG element to add graphics to
     */
    createStageGraphics(svg) {
        // Import and create graphics for each stage
        for (let i = 0; i <= this.getTotalStages(); i++) {
            const stageGroup = this.createStageGroup(i);
            if (stageGroup) {
                svg.appendChild(stageGroup);
            }
        }
    },

    /**
     * Creates a graphics group for a specific stage
     * @param {number} stageNumber - The stage number to create graphics for
     * @returns {SVGElement|null} - The created stage group element
     */
    createStageGroup(stageNumber) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.id = `stage-${stageNumber}-graphics`;
        group.setAttribute('class', 'stage-graphics-layer');
        
        // Add hidden class to all stages except stage 0 initially
        if (stageNumber > 0) {
            group.classList.add('hidden');
        }

        // Create graphics based on stage number
        switch (stageNumber) {
            case 0:
                this.createStage0Graphics(group);
                break;
            case 1:
                this.createStage1Graphics(group);
                break;
            case 2:
                this.createStage2Graphics(group);
                break;
            case 3:
                this.createStage3Graphics(group);
                break;
            case 4:
                this.createStage4Graphics(group);
                break;
            case 5:
                this.createStage5Graphics(group);
                break;
            case 6:
                this.createStage6Graphics(group);
                break;
            default:
                // For stages 7+ create simpler placeholder graphics
                this.createAdvancedStageGraphics(group, stageNumber);
                break;
        }

        return group;
    },

    // ===== INDIVIDUAL STAGE GRAPHICS CREATION =====
    // Each method creates the SVG elements for a specific stage

    /**
     * Creates Stage 0 graphics - Motherboard Base
     * @param {SVGElement} group - The group element to add graphics to
     */
    createStage0Graphics(group) {
        // Main Motherboard
        const motherboard = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        motherboard.setAttribute('x', '50');
        motherboard.setAttribute('y', '40');
        motherboard.setAttribute('width', '400');
        motherboard.setAttribute('height', '200');
        motherboard.setAttribute('fill', 'url(#motherboardGradient)');
        motherboard.setAttribute('stroke', 'var(--accent-teal)');
        motherboard.setAttribute('stroke-width', '2');
        motherboard.setAttribute('rx', '8');
        motherboard.setAttribute('class', 'motherboard');
        group.appendChild(motherboard);

        // PCB traces
        const traces = [
            { x1: '60', y1: '60', x2: '440', y2: '60' },
            { x1: '60', y1: '80', x2: '440', y2: '80' },
            { x1: '60', y1: '100', x2: '440', y2: '100' },
            { x1: '80', y1: '50', x2: '80', y2: '230' },
            { x1: '150', y1: '50', x2: '150', y2: '230' },
            { x1: '250', y1: '50', x2: '250', y2: '230' },
            { x1: '350', y1: '50', x2: '350', y2: '230' }
        ];

        traces.forEach(trace => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', trace.x1);
            line.setAttribute('y1', trace.y1);
            line.setAttribute('x2', trace.x2);
            line.setAttribute('y2', trace.y2);
            line.setAttribute('stroke', 'var(--accent-yellow)');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('opacity', '0.6');
            group.appendChild(line);
        });

        // CPU Socket
        const cpuSocket = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cpuSocket.setAttribute('x', '180');
        cpuSocket.setAttribute('y', '100');
        cpuSocket.setAttribute('width', '60');
        cpuSocket.setAttribute('height', '60');
        cpuSocket.setAttribute('fill', 'var(--bg-primary)');
        cpuSocket.setAttribute('stroke', 'var(--accent-teal)');
        cpuSocket.setAttribute('stroke-width', '2');
        cpuSocket.setAttribute('rx', '4');
        group.appendChild(cpuSocket);

        // Add status text
        const statusText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        statusText.setAttribute('x', '250');
        statusText.setAttribute('y', '270');
        statusText.setAttribute('text-anchor', 'middle');
        statusText.setAttribute('fill', 'var(--accent-teal)');
        statusText.setAttribute('font-size', '12');
        statusText.setAttribute('font-weight', 'bold');
        statusText.setAttribute('stroke', 'white');
        statusText.setAttribute('stroke-width', '0.5');
        statusText.textContent = 'MOTHERBOARD INITIALIZED';
        group.appendChild(statusText);
    },

    /**
     * Creates Stage 1 graphics - RTX GPU Card
     * @param {SVGElement} group - The group element to add graphics to
     */
    createStage1Graphics(group) {
        // GPU Card
        const gpuCard = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        gpuCard.setAttribute('x', '60');
        gpuCard.setAttribute('y', '165');
        gpuCard.setAttribute('width', '140');
        gpuCard.setAttribute('height', '22');
        gpuCard.setAttribute('fill', 'url(#gpuGradient)');
        gpuCard.setAttribute('stroke', 'var(--accent-green)');
        gpuCard.setAttribute('stroke-width', '2');
        gpuCard.setAttribute('rx', '3');
        gpuCard.setAttribute('class', 'gpu-card');
        group.appendChild(gpuCard);

        // GPU Cooling Fans
        const fan1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        fan1.setAttribute('cx', '100');
        fan1.setAttribute('cy', '176');
        fan1.setAttribute('r', '12');
        fan1.setAttribute('fill', 'none');
        fan1.setAttribute('stroke', 'var(--accent-green)');
        fan1.setAttribute('stroke-width', '2');
        group.appendChild(fan1);

        const fan2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        fan2.setAttribute('cx', '160');
        fan2.setAttribute('cy', '176');
        fan2.setAttribute('r', '12');
        fan2.setAttribute('fill', 'none');
        fan2.setAttribute('stroke', 'var(--accent-green)');
        fan2.setAttribute('stroke-width', '2');
        group.appendChild(fan2);

        // GPU brand text
        const brandText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        brandText.setAttribute('x', '130');
        brandText.setAttribute('y', '145');
        brandText.setAttribute('text-anchor', 'middle');
        brandText.setAttribute('fill', 'var(--accent-green)');
        brandText.setAttribute('font-size', '10');
        brandText.setAttribute('font-weight', 'bold');
        brandText.setAttribute('stroke', 'white');
        brandText.setAttribute('stroke-width', '0.5');
        brandText.textContent = 'RTX 4090 GPU';
        group.appendChild(brandText);
    },

    /**
     * Creates Stage 2 graphics - CPU + CPU Cooler
     * @param {SVGElement} group - The group element to add graphics to
     */
    createStage2Graphics(group) {
        // CPU installed in socket
        const cpu = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cpu.setAttribute('x', '185');
        cpu.setAttribute('y', '105');
        cpu.setAttribute('width', '50');
        cpu.setAttribute('height', '50');
        cpu.setAttribute('fill', 'var(--accent-yellow)');
        cpu.setAttribute('stroke', 'var(--accent-yellow)');
        cpu.setAttribute('stroke-width', '1');
        cpu.setAttribute('rx', '2');
        group.appendChild(cpu);

        // CPU Cooler
        const cooler = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        cooler.setAttribute('cx', '210');
        cooler.setAttribute('cy', '120');
        cooler.setAttribute('r', '25');
        cooler.setAttribute('fill', 'none');
        cooler.setAttribute('stroke', 'var(--accent-purple)');
        cooler.setAttribute('stroke-width', '3');
        cooler.setAttribute('class', 'cpu-cooler');
        group.appendChild(cooler);

        // CPU text
        const cpuText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        cpuText.setAttribute('x', '210');
        cpuText.setAttribute('y', '170');
        cpuText.setAttribute('text-anchor', 'middle');
        cpuText.setAttribute('fill', 'var(--accent-purple)');
        cpuText.setAttribute('font-size', '10');
        cpuText.setAttribute('font-weight', 'bold');
        cpuText.setAttribute('stroke', 'white');
        cpuText.setAttribute('stroke-width', '0.5');
        cpuText.textContent = 'INTEL i9 + COOLER';
        group.appendChild(cpuText);
    },

    /**
     * Creates Stage 3 graphics - M.2 NVMe SSD
     * @param {SVGElement} group - The group element to add graphics to
     */
    createStage3Graphics(group) {
        // M.2 SSD
        const ssd = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        ssd.setAttribute('x', '270');
        ssd.setAttribute('y', '180');
        ssd.setAttribute('width', '80');
        ssd.setAttribute('height', '12');
        ssd.setAttribute('fill', 'var(--accent-yellow)');
        ssd.setAttribute('stroke', 'var(--accent-yellow)');
        ssd.setAttribute('stroke-width', '1');
        ssd.setAttribute('rx', '2');
        ssd.setAttribute('class', 'ssd');
        group.appendChild(ssd);

        // SSD text
        const ssdText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        ssdText.setAttribute('x', '310');
        ssdText.setAttribute('y', '205');
        ssdText.setAttribute('text-anchor', 'middle');
        ssdText.setAttribute('fill', 'var(--accent-yellow)');
        ssdText.setAttribute('font-size', '10');
        ssdText.setAttribute('font-weight', 'bold');
        ssdText.setAttribute('stroke', 'white');
        ssdText.setAttribute('stroke-width', '0.5');
        ssdText.textContent = '4TB NVMe SSD';
        group.appendChild(ssdText);
    },

    /**
     * Creates Stage 4 graphics - Liquid Cooling System
     * @param {SVGElement} group - The group element to add graphics to
     */
    createStage4Graphics(group) {
        // Liquid cooling block
        const liquidBlock = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        liquidBlock.setAttribute('x', '180');
        liquidBlock.setAttribute('y', '90');
        liquidBlock.setAttribute('width', '60');
        liquidBlock.setAttribute('height', '60');
        liquidBlock.setAttribute('fill', 'url(#liquidGradient)');
        liquidBlock.setAttribute('stroke', 'var(--accent-teal)');
        liquidBlock.setAttribute('stroke-width', '3');
        liquidBlock.setAttribute('rx', '4');
        liquidBlock.setAttribute('class', 'liquid-block');
        group.appendChild(liquidBlock);

        // Radiator
        const radiator = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        radiator.setAttribute('x', '100');
        radiator.setAttribute('y', '20');
        radiator.setAttribute('width', '120');
        radiator.setAttribute('height', '15');
        radiator.setAttribute('fill', 'none');
        radiator.setAttribute('stroke', 'var(--accent-teal)');
        radiator.setAttribute('stroke-width', '2');
        radiator.setAttribute('rx', '2');
        group.appendChild(radiator);

        // Liquid cooling text
        const liquidText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        liquidText.setAttribute('x', '160');
        liquidText.setAttribute('y', '15');
        liquidText.setAttribute('text-anchor', 'middle');
        liquidText.setAttribute('fill', 'var(--accent-teal)');
        liquidText.setAttribute('font-size', '10');
        liquidText.setAttribute('font-weight', 'bold');
        liquidText.setAttribute('stroke', 'white');
        liquidText.setAttribute('stroke-width', '0.5');
        liquidText.textContent = 'AIO LIQUID COOLING';
        group.appendChild(liquidText);
    },

    /**
     * Creates Stage 5 graphics - RGB RAM Sticks
     * @param {SVGElement} group - The group element to add graphics to
     */
    createStage5Graphics(group) {
        // Create 4 RAM sticks
        for (let i = 0; i < 4; i++) {
            const ramStick = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            ramStick.setAttribute('x', 300 + (i * 20));
            ramStick.setAttribute('y', '72');
            ramStick.setAttribute('width', '10');
            ramStick.setAttribute('height', '76');
            ramStick.setAttribute('fill', 'var(--bg-primary)');
            ramStick.setAttribute('stroke', 'var(--accent-green)');
            ramStick.setAttribute('stroke-width', '2');
            ramStick.setAttribute('rx', '2');
            ramStick.setAttribute('class', 'ram-stick');
            group.appendChild(ramStick);
        }

        // RGB text
        const rgbText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rgbText.setAttribute('x', '335');
        rgbText.setAttribute('y', '165');
        rgbText.setAttribute('text-anchor', 'middle');
        rgbText.setAttribute('fill', 'var(--accent-green)');
        rgbText.setAttribute('font-size', '10');
        rgbText.setAttribute('font-weight', 'bold');
        rgbText.setAttribute('stroke', 'white');
        rgbText.setAttribute('stroke-width', '0.5');
        rgbText.textContent = '64GB DDR5 RGB';
        group.appendChild(rgbText);
    },

    /**
     * Creates Stage 6 graphics - Complete Gaming Computer Tower
     * @param {SVGElement} group - The group element to add graphics to
     */
    createStage6Graphics(group) {
        // Computer tower case
        const computerCase = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        computerCase.setAttribute('x', '200');
        computerCase.setAttribute('y', '80');
        computerCase.setAttribute('width', '100');
        computerCase.setAttribute('height', '140');
        computerCase.setAttribute('fill', 'url(#caseGradient)');
        computerCase.setAttribute('stroke', 'var(--accent-teal)');
        computerCase.setAttribute('stroke-width', '3');
        computerCase.setAttribute('rx', '8');
        computerCase.setAttribute('class', 'computer-tower');
        group.appendChild(computerCase);

        // Power button
        const powerButton = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        powerButton.setAttribute('cx', '220');
        powerButton.setAttribute('cy', '100');
        powerButton.setAttribute('r', '5');
        powerButton.setAttribute('fill', 'var(--accent-green)');
        powerButton.setAttribute('class', 'power-button');
        group.appendChild(powerButton);

        // Computer text
        const computerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        computerText.setAttribute('x', '250');
        computerText.setAttribute('y', '240');
        computerText.setAttribute('text-anchor', 'middle');
        computerText.setAttribute('fill', 'var(--accent-teal)');
        computerText.setAttribute('font-size', '10');
        computerText.setAttribute('font-weight', 'bold');
        computerText.setAttribute('stroke', 'white');
        computerText.setAttribute('stroke-width', '0.5');
        computerText.textContent = 'GAMING COMPUTER';
        group.appendChild(computerText);
    },

    /**
     * Creates graphics for advanced stages (7+)
     * @param {SVGElement} group - The group element to add graphics to
     * @param {number} stageNumber - The stage number
     */
    createAdvancedStageGraphics(group, stageNumber) {
        const stageNames = {
            7: 'QUANTUM PROCESSING',
            8: 'NEURAL NETWORK',
            9: 'COSMIC SINGULARITY',
            10: 'TEMPORAL MANIPULATION',
            11: 'OMNI-MARKET'
        };

        // Create a simple geometric representation
        const centerX = 250;
        const centerY = 140;
        const radius = 40 + (stageNumber - 7) * 10;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', centerX);
        circle.setAttribute('cy', centerY);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', 'var(--accent-purple)');
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('opacity', '0.8');
        group.appendChild(circle);

        // Add stage text
        const stageText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        stageText.setAttribute('x', centerX);
        stageText.setAttribute('y', centerY + 5);
        stageText.setAttribute('text-anchor', 'middle');
        stageText.setAttribute('fill', 'var(--accent-purple)');
        stageText.setAttribute('font-size', '12');
        stageText.setAttribute('font-weight', 'bold');
        stageText.setAttribute('stroke', 'white');
        stageText.setAttribute('stroke-width', '0.5');
        stageText.textContent = stageNames[stageNumber] || `STAGE ${stageNumber}`;
        group.appendChild(stageText);
    }
};

// Make StageManager globally available
if (typeof window !== 'undefined') {
    window.StageManager = StageManager;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StageManager;
}