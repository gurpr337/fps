// js/main.js
// Central entry-point.  Right now this module only ensures that upgrades.js
// and stageEngine.js are loaded; the rest of the game logic still lives in the
// legacy inline script.  We will migrate that logic here step-by-step.

import './upgrades.js';
import './stageEngine.js';

console.debug('[main] ES-modules initialised');