// cooldownSystem.js
export default class CooldownSystem {
  constructor() {
    this.cooldowns = new Map();
  }

  isOnCooldown(playerId) {
    const end = this.cooldowns.get(playerId);
    if (!end) return false;
    return Date.now() < end;
  }

  getCooldownEnd(playerId) {
    return this.cooldowns.get(playerId) || null;
  }

  setCooldownEnd(playerId, timestamp) {
    this.cooldowns.set(playerId, timestamp);
  }

  resetCooldown(playerId) {
    this.cooldowns.delete(playerId);
  }

  getRemaining(playerId) {
    const end = this.cooldowns.get(playerId);
    if (!end) return 0;
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  }

  showCooldowns(msg) {
    if (this.cooldowns.size === 0)
      return msg.reply("No active cooldowns.");

    const lines = [];
    for (const [id, end] of this.cooldowns.entries()) {
      const unix = Math.floor(end / 1000);
      lines.push(`<@${id}> — ends <t:${unix}:R>`);
    }

    return msg.reply(lines.join("\n"));
  }
}
