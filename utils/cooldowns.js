// utils/cooldowns.js

const cooldowns = new Map();

/**
 * Start a cooldown timer for a given key.
 */
export function startCooldown(key, durationMs) {
    const expires = Date.now() + durationMs;
    cooldowns.set(key, expires);
}

/**
 * Check if a cooldown is active.
 */
export function isOnCooldown(key) {
    const expires = cooldowns.get(key);
    if (!expires) return false;
    return Date.now() < expires;
}

/**
 * Get remaining cooldown time in ms.
 */
export function getRemaining(key) {
    const expires = cooldowns.get(key);
    if (!expires) return 0;
    return Math.max(0, expires - Date.now());
}

/**
 * Reset a cooldown manually.
 */
export function resetCooldown(key) {
    cooldowns.delete(key);
}
