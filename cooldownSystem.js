// cooldownSystem.js
export default class CooldownSystem {
  constructor() {
    this.cooldowns = new Map();
  }

  isOnCooldown(id) {
    const end = this.cooldowns.get(id);
    if (!end) return false;
    return Date.now() < end;
  }

  setCooldownEnd(id, timestamp) {
    this.cooldowns.set(id, timestamp);
  }

  // !cooldowns
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
