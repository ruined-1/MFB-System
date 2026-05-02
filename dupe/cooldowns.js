// cooldowns.js

// Stores cooldowns as: cooldowns[playerId] = timestamp (ms)
const cooldowns = new Map();

export function isOnCooldown(playerId) {
    const end = cooldowns.get(playerId);
    if (!end) return false;
    return Date.now() < end;
}

export function getCooldownEnd(playerId) {
    return cooldowns.get(playerId) || null;
}

export function setCooldownEnd(playerId, timestamp) {
    cooldowns.set(playerId, timestamp);
}

export function resetCooldown(playerId) {
    cooldowns.delete(playerId);
}
