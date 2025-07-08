// js/stageEngine.js
// Visual helpers for stage graphics.  Right now they still operate on the
// inline <svg> groups that exist inside index.html — once we finish extracting
// each stage into its own SVG this file will instead hot-swap <object> data.

export const MAX_DEFINED_STAGE = 20; // number of <g id="stage-N-graphics"> groups currently in HTML

/**
 * Show the graphics for all stages <= currentStage and hide the rest.
 * Mirrors the original `updateStageGraphics` behaviour.
 */
export function updateStageGraphics(currentStage) {
  // guard
  if (typeof document === 'undefined') return;
  for (let i = 0; i <= currentStage; i++) {
    const el = document.getElementById(`stage-${i}-graphics`);
    if (el) el.classList.remove('hidden');
  }
  for (let i = currentStage + 1; i <= MAX_DEFINED_STAGE; i++) {
    const el = document.getElementById(`stage-${i}-graphics`);
    if (el) el.classList.add('hidden');
  }

  // hide "initialising" text after stage 1
  const initTxt = document.getElementById('initializing-text');
  if (initTxt) {
    initTxt.style.display = currentStage >= 1 ? 'none' : 'block';
  }
}

/** pop-in animation when a new stage unlocks */
export function playStageUnlockAnimation(stageNumber) {
  const el = document.getElementById(`stage-${stageNumber}-graphics`);
  if (!el) return;
  el.style.transform = 'scale(0.8)';
  el.style.opacity   = '0';
  setTimeout(() => {
    el.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    el.style.transform  = 'scale(1)';
    el.style.opacity    = '1';
  }, 100);
  setTimeout(() => {
    el.style.transform  = '';
    el.style.opacity    = '';
    el.style.transition = '';
  }, 700);
}

// Convenience re-export for legacy code – keeps old names working
if (typeof window !== 'undefined') {
  window.updateStageGraphics      = updateStageGraphics;
  window.playStageUnlockAnimation = playStageUnlockAnimation;
}