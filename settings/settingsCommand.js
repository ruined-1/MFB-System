// /settings/settingsCommand.js
import pkg from "discord.js";
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField
} = pkg;

import settings from "./settingsManager.js";

export default async function settingsCommand(msg, client) {
  // Prefix command trigger
  if (!msg.content.startsWith(settings.get("prefix") + "settings")) return;

  // Admin check
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply("❌ You must be an **Administrator** to access bot settings.");
  }

  // Build main dashboard embed
  const embed = new EmbedBuilder()
    .setTitle("⚙️ Bot Settings Dashboard")
    .setColor("#5865F2")
    .setDescription(
      "Welcome to the **Bot Settings Panel**.\n" +
      "Use the **menu below** to navigate between categories.\n\n" +
      "**Current Prefix:** `" + settings.get("prefix") + "`\n" +
      "**Modules Enabled:**\n" +
      `• Vouch: **${settings.get("modules.vouch") ? "Enabled" : "Disabled"}**\n` +
      `• Anti-Raid: **${settings.get("modules.antiRaid") ? "Enabled" : "Disabled"}**\n` +
      `• Anti-Nuke: **${settings.get("modules.antiNuke") ? "Enabled" : "Disabled"}**\n` +
      `• Alerts: **${settings.get("modules.alerts") ? "Enabled" : "Disabled"}**\n` +
      `• Boost Tracker: **${settings.get("modules.boosts") ? "Enabled" : "Disabled"}**\n`
    )
    .setFooter({ text: "Use the menu to view or modify settings." })
    .setTimestamp();

  // Category select menu
  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("settings_category_select")
      .setPlaceholder("Select a settings category...")
      .addOptions([
        {
          label: "Main Dashboard",
          value: "main",
          emoji: "🏠"
        },
        {
          label: "Vouch System",
          value: "vouch",
          emoji: "📝"
        },
        {
          label: "Anti-Raid",
          value: "antiraid",
          emoji: "🛡️"
        },
        {
          label: "Anti-Nuke",
          value: "antinuke",
          emoji: "💣"
        },
        {
          label: "Alert System",
          value: "alerts",
          emoji: "🚨"
        },
        {
          label: "Boost Tracker",
          value: "boosts",
          emoji: "🎉"
        },
        {
          label: "General Bot Settings",
          value: "general",
          emoji: "⚙️"
        }
      ])
  );

  // Navigation buttons
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("settings_home")
      .setLabel("Home")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🏠"),

    new ButtonBuilder()
      .setCustomId("settings_refresh")
      .setLabel("Refresh")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🔄"),

    new ButtonBuilder()
      .setCustomId("settings_close")
      .setLabel("Close")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🗑️")
  );

  // Send the dashboard
  await msg.reply({
    embeds: [embed],
    components: [menu, buttons]
  });
}
