// cooldowns.js

import {
  isOnCooldown,
  getCooldownEnd,
  setCooldownEnd,
  resetCooldown,
  getRemaining
} from "../dupe/cooldowns.js";

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

export function getRemaining(playerId) {
    const end = cooldowns.get(playerId);
    if (!end) return 0;
    return Math.max(0, (end - Date.now()) / 1000);
}
