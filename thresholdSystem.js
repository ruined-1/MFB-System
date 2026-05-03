// thresholdSystem.js
export default class ThresholdSystem {
  constructor() {
    this.threshold = 20;
  }

  setThreshold(msg, args) {
    const value = parseInt(args[0]);
    if (isNaN(value) || value < 1)
      return msg.reply("Provide a valid number.");

    this.threshold = value;
    return msg.reply(`Threshold updated to **${value}**.`);
  }
}
