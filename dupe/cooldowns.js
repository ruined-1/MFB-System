const cooldowns = new Map();
const COOLDOWN_SECONDS = 30;

export function startCooldown(userId) {
    cooldowns.set(userId, Date.now());
}

export function isOnCooldown(userId) {
    if (!cooldowns.has(userId)) return false;
    const elapsed = (Date.now() - cooldowns.get(userId)) / 1000;
    return elapsed < COOLDOWN_SECONDS;
}

export function getRemaining(userId) {
    if (!cooldowns.has(userId)) return 0;
    const elapsed = (Date.now() - cooldowns.get(userId)) / 1000;
    return Math.max(0, COOLDOWN_SECONDS - elapsed);
}

export function resetCooldown(userId) {
    cooldowns.delete(userId);
}
