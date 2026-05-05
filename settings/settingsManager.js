// /settings/settingsManager.js
import fs from "fs";
import path from "path";

const settingsPath = path.resolve("./settings/settings.json");

class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
  }

  // Load settings.json or create defaults
  loadSettings() {
    try {
      if (!fs.existsSync(settingsPath)) {
        console.log("settings.json not found — creating default config.");
        const defaults = this.defaultSettings();
        fs.writeFileSync(settingsPath, JSON.stringify(defaults, null, 2));
        return defaults;
      }

      const raw = fs.readFileSync(settingsPath, "utf8");
      return JSON.parse(raw);

    } catch (err) {
      console.error("Failed to load settings.json:", err);
      return this.defaultSettings();
    }
  }

  // Default config structure
  defaultSettings() {
    return {
      prefix: "!",
      staffRoles: [],
      logChannels: {
        alerts: null,
        boosts: null,
        vouches: null
      },

      modules: {
        vouch: true,
        antiRaid: true,
        antiNuke: true,
        alerts: true,
        boosts: true
      },

      vouch: {
        enabled: true,
        logChannel: null,
        public: true,
        leaderboardVisible: true
      },

      antiRaid: {
        enabled: true,
        joinSpike: 5,
        msgSpam: 10,
        pingSpam: 5,
        autoLockdown: false
      },

      antiNuke: {
        enabled: true,
        logChannel: null,
        escalationPing: null,
        protectedRoles: [],
        protectedChannels: []
      },

      alerts: {
        enabled: true,
        alertChannel: null,
        pingRoles: [],
        cooldowns: {
          YELLOW: 240,
          ORANGE: 120,
          RED: 30
        },
        severityColors: {
          YELLOW: "#ffff00",
          ORANGE: "#ff9900",
          RED: "#ff0000"
        },
        buttonsEnabled: true
      },

      boosts: {
        enabled: true,
        rewardRole: null,
        logChannel: null
      }
    };
  }

  // Save settings.json safely
  save() {
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(this.settings, null, 2));
    } catch (err) {
      console.error("Failed to save settings.json:", err);
    }
  }

  // Get a value
  get(pathStr) {
    return pathStr.split(".").reduce((obj, key) => obj?.[key], this.settings);
  }

  // Set a value
  set(pathStr, value) {
    const keys = pathStr.split(".");
    let obj = this.settings;

    while (keys.length > 1) {
      const key = keys.shift();
      if (!obj[key]) obj[key] = {};
      obj = obj[key];
    }

    obj[keys[0]] = value;
    this.save();
  }
}

export default new SettingsManager();
