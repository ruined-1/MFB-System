export const cooldowns = new Map();

export function startCooldown(userId, durationMs) {
    const expires = Date.now() + durationMs;
    cooldowns.set(userId, expires);
    return expires;
}

export function getRemaining(userId) {
    if (!cooldowns.has(userId)) return 0;
    return Math.max(0, cooldowns.get(userId) - Date.now());
}

export function clearCooldown(userId) {
    cooldowns.delete(userId);
}

export function isOnCooldown(userId) {
    return getRemaining(userId) > 0;
}
