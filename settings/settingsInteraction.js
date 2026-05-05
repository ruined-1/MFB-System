// /settings/settingsInteractions.js
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField
} from "discord.js";

import settings from "./settingsManager.js";

// ------------------------------------------------------------
// Helper: Build Main Dashboard Embed
// ------------------------------------------------------------
function buildMainEmbed() {
  return new EmbedBuilder()
    .setTitle("⚙️ Bot Settings Dashboard")
    .setColor("#5865F2")
    .setDescription(
      "Use the **menu below** to navigate between categories.\n\n" +
      "**Current Prefix:** `" + settings.get("prefix") + "`\n\n" +
      "**Modules:**\n" +
      `• Vouch: **${settings.get("modules.vouch") ? "Enabled" : "Disabled"}**\n` +
      `• Anti-Raid: **${settings.get("modules.antiRaid") ? "Enabled" : "Disabled"}**\n` +
      `• Anti-Nuke: **${settings.get("modules.antiNuke") ? "Enabled" : "Disabled"}**\n` +
      `• Alerts: **${settings.get("modules.alerts") ? "Enabled" : "Disabled"}**\n` +
      `• Boost Tracker: **${settings.get("modules.boosts") ? "Enabled" : "Disabled"}**\n`
    )
    .setFooter({ text: "Select a category to view or modify settings." })
    .setTimestamp();
}

// ------------------------------------------------------------
// Helper: Build Category Select Menu
// ------------------------------------------------------------
function buildCategoryMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("settings_category_select")
      .setPlaceholder("Select a settings category...")
      .addOptions([
        { label: "Main Dashboard", value: "main", emoji: "🏠" },
        { label: "Vouch System", value: "vouch", emoji: "📝" },
        { label: "Anti-Raid", value: "antiraid", emoji: "🛡️" },
        { label: "Anti-Nuke", value: "antinuke", emoji: "💣" },
        { label: "Alert System", value: "alerts", emoji: "🚨" },
        { label: "Boost Tracker", value: "boosts", emoji: "🎉" },
        { label: "General Bot Settings", value: "general", emoji: "⚙️" }
      ])
  );
}

// ------------------------------------------------------------
// Helper: Build Navigation Buttons
// ------------------------------------------------------------
function buildNavButtons() {
  return new ActionRowBuilder().addComponents(
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
}

// ------------------------------------------------------------
// Category Embeds
// ------------------------------------------------------------
function buildVouchEmbed() {
  return new EmbedBuilder()
    .setTitle("📝 Vouch System Settings")
    .setColor("#00b894")
    .setDescription(
      "**Enabled:** " + (settings.get("vouch.enabled") ? "Yes" : "No") + "\n" +
      "**Logging Channel:** " + (settings.get("vouch.logChannel") ? `<#${settings.get("vouch.logChannel")}>` : "None") + "\n" +
      "**Public Vouching:** " + (settings.get("vouch.public") ? "Yes" : "Staff Only") + "\n" +
      "**Leaderboard Visible:** " + (settings.get("vouch.leaderboardVisible") ? "Yes" : "No") + "\n"
    )
    .setFooter({ text: "Modify vouch system settings using the menu or buttons." });
}

function buildAntiRaidEmbed() {
  return new EmbedBuilder()
    .setTitle("🛡️ Anti-Raid Settings")
    .setColor("#0984e3")
    .setDescription(
      "**Enabled:** " + (settings.get("antiRaid.enabled") ? "Yes" : "No") + "\n" +
      `**Join Spike Threshold:** ${settings.get("antiRaid.joinSpike")}\n` +
      `**Message Spam Threshold:** ${settings.get("antiRaid.msgSpam")}\n` +
      `**Ping Spam Threshold:** ${settings.get("antiRaid.pingSpam")}\n` +
      "**Auto-Lockdown:** " + (settings.get("antiRaid.autoLockdown") ? "Enabled" : "Disabled")
    );
}

function buildAntiNukeEmbed() {
  return new EmbedBuilder()
    .setTitle("💣 Anti-Nuke Settings")
    .setColor("#d63031")
    .setDescription(
      "**Enabled:** " + (settings.get("antiNuke.enabled") ? "Yes" : "No") + "\n" +
      "**Log Channel:** " + (settings.get("antiNuke.logChannel") ? `<#${settings.get("antiNuke.logChannel")}>` : "None") + "\n" +
      "**Escalation Ping:** " + (settings.get("antiNuke.escalationPing") ? `<@&${settings.get("antiNuke.escalationPing")}>` : "None") + "\n" +
      `**Protected Roles:** ${settings.get("antiNuke.protectedRoles").length}\n` +
      `**Protected Channels:** ${settings.get("antiNuke.protectedChannels").length}`
    );
}

function buildAlertsEmbed() {
  return new EmbedBuilder()
    .setTitle("🚨 Alert System Settings")
    .setColor("#e17055")
    .setDescription(
      "**Enabled:** " + (settings.get("alerts.enabled") ? "Yes" : "No") + "\n" +
      "**Alert Channel:** " + (settings.get("alerts.alertChannel") ? `<#${settings.get("alerts.alertChannel")}>` : "None") + "\n" +
      `**Ping Roles:** ${settings.get("alerts.pingRoles").length}\n` +
      "**Buttons Enabled:** " + (settings.get("alerts.buttonsEnabled") ? "Yes" : "No")
    );
}

function buildBoostsEmbed() {
  return new EmbedBuilder()
    .setTitle("🎉 Boost Tracker Settings")
    .setColor("#6c5ce7")
    .setDescription(
      "**Enabled:** " + (settings.get("boosts.enabled") ? "Yes" : "No") + "\n" +
      "**Reward Role:** " + (settings.get("boosts.rewardRole") ? `<@&${settings.get("boosts.rewardRole")}>` : "None") + "\n" +
      "**Log Channel:** " + (settings.get("boosts.logChannel") ? `<#${settings.get("boosts.logChannel")}>` : "None")
    );
}

function buildGeneralEmbed() {
  return new EmbedBuilder()
    .setTitle("⚙️ General Bot Settings")
    .setColor("#fdcb6e")
    .setDescription(
      "**Prefix:** `" + settings.get("prefix") + "`\n" +
      `**Staff Roles:** ${settings.get("staffRoles").length}\n` +
      "**Log Channels:**\n" +
      `• Alerts: ${settings.get("logChannels.alerts") ? `<#${settings.get("logChannels.alerts")}>` : "None"}\n` +
      `• Boosts: ${settings.get("logChannels.boosts") ? `<#${settings.get("logChannels.boosts")}>` : "None"}\n` +
      `• Vouches: ${settings.get("logChannels.vouches") ? `<#${settings.get("logChannels.vouches")}>` : "None"}\n`
    );
}

// ------------------------------------------------------------
// MAIN INTERACTION HANDLER
// ------------------------------------------------------------
export default async function settingsInteractions(interaction, client) {
  if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

  // Admin check
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: "❌ Administrator only.", ephemeral: true });
  }

  // ------------------------------------------------------------
  // CATEGORY SELECT MENU
  // ------------------------------------------------------------
  if (interaction.isStringSelectMenu() && interaction.customId === "settings_category_select") {
    const value = interaction.values[0];

    let embed;
    if (value === "main") embed = buildMainEmbed();
    if (value === "vouch") embed = buildVouchEmbed();
    if (value === "antiraid") embed = buildAntiRaidEmbed();
    if (value === "antinuke") embed = buildAntiNukeEmbed();
    if (value === "alerts") embed = buildAlertsEmbed();
    if (value === "boosts") embed = buildBoostsEmbed();
    if (value === "general") embed = buildGeneralEmbed();

    return interaction.update({
      embeds: [embed],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  // ------------------------------------------------------------
  // BUTTON: HOME
  // ------------------------------------------------------------
  if (interaction.customId === "settings_home") {
    return interaction.update({
      embeds: [buildMainEmbed()],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  // ------------------------------------------------------------
  // BUTTON: REFRESH
  // ------------------------------------------------------------
  if (interaction.customId === "settings_refresh") {
    const currentEmbed = interaction.message.embeds[0];
    const title = currentEmbed?.title || "";

    let embed = buildMainEmbed();
    if (title.includes("Vouch")) embed = buildVouchEmbed();
    if (title.includes("Anti-Raid")) embed = buildAntiRaidEmbed();
    if (title.includes("Anti-Nuke")) embed = buildAntiNukeEmbed();
    if (title.includes("Alert System")) embed = buildAlertsEmbed();
    if (title.includes("Boost Tracker")) embed = buildBoostsEmbed();
    if (title.includes("General Bot Settings")) embed = buildGeneralEmbed();

    return interaction.update({
      embeds: [embed],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  // ------------------------------------------------------------
  // BUTTON: CLOSE
  // ------------------------------------------------------------
  if (interaction.customId === "settings_close") {
    return interaction.message.delete().catch(() => {});
  }

  // ------------------------------------------------------------
  // MODALS & EDITING (COMING NEXT)
  // ------------------------------------------------------------
  // I will generate the full modal system next message.
}
