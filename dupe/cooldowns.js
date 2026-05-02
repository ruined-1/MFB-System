// cooldowns.js

const cooldowns = new Map();

// Set the cooldown end timestamp
export function setCooldownEnd(id, timestamp) {
    cooldowns.set(id, timestamp);
}

// Check if user is still on cooldown
export function isOnCooldown(id) {
    if (!cooldowns.has(id)) return false;
    return Date.now() < cooldowns.get(id);
}

// Get remaining seconds
export function getRemaining(id) {
    if (!cooldowns.has(id)) return 0;
    return Math.max(0, Math.floor((cooldowns.get(id) - Date.now()) / 1000));
}

// Reset cooldown
export function resetCooldown(id) {
    cooldowns.delete(id);
}
