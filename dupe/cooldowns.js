const cooldowns = new Map();
const COOLDOWN_SECONDS = 30;

export function startCooldown(id) {
    cooldowns.set(id, Date.now());
}

export function isOnCooldown(id) {
    if (!cooldowns.has(id)) return false;
    const elapsed = (Date.now() - cooldowns.get(id)) / 1000;
    return elapsed < COOLDOWN_SECONDS;
}

export function getRemaining(id) {
    if (!cooldowns.has(id)) return 0;
    const elapsed = (Date.now() - cooldowns.get(id)) / 1000;
    return Math.max(0, COOLDOWN_SECONDS - elapsed);
}

export function resetCooldown(id) {
    cooldowns.delete(id);
}
