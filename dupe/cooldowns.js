const cooldowns = new Map();

export function setCooldownEnd(id, timestamp) {
    cooldowns.set(id, timestamp);
}

export function isOnCooldown(id) {
    if (!cooldowns.has(id)) return false;
    return Date.now() < cooldowns.get(id);
}

export function getRemaining(id) {
    if (!cooldowns.has(id)) return 0;
    return Math.max(0, Math.floor((cooldowns.get(id) - Date.now()) / 1000));
}

export function resetCooldown(id) {
    cooldowns.delete(id);
}
