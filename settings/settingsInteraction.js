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
// MODALS + EDITING SYSTEM
// ------------------------------------------------------------

// Utility: Build a modal
function buildModal(id, title, label, placeholder, value = "") {
  return new ModalBuilder()
    .setCustomId(id)
    .setTitle(title)
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("input")
          .setLabel(label)
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(placeholder)
          .setValue(value)
          .setRequired(true)
      )
    );
}

// ------------------------------------------------------------
// CATEGORY-SPECIFIC BUTTON HANDLERS
// ------------------------------------------------------------
export async function handleSettingsButtons(interaction) {
  const id = interaction.customId;

  // ---------------------------
  // VOUCH SYSTEM
  // ---------------------------
  if (id === "vouch_toggle") {
    settings.set("vouch.enabled", !settings.get("vouch.enabled"));
    return interaction.update({
      embeds: [buildVouchEmbed()],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  if (id === "vouch_public_toggle") {
    settings.set("vouch.public", !settings.get("vouch.public"));
    return interaction.update({
      embeds: [buildVouchEmbed()],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  if (id === "vouch_leaderboard_toggle") {
    settings.set("vouch.leaderboardVisible", !settings.get("vouch.leaderboardVisible"));
    return interaction.update({
      embeds: [buildVouchEmbed()],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  if (id === "vouch_logchannel_edit") {
    const modal = buildModal(
      "modal_vouch_logchannel",
      "Edit Vouch Log Channel",
      "Channel ID",
      "Enter a channel ID",
      settings.get("vouch.logChannel") || ""
    );
    return interaction.showModal(modal);
  }

  if (id === "vouch_reset_all") {
    // You will need to integrate this with your vouch system
    // Example: client.vouchSystem.resetAll();
    return interaction.reply({
      content: "🗑️ All vouches have been reset.",
      ephemeral: true
    });
  }

  // ---------------------------
  // ANTI-RAID
  // ---------------------------
  if (id === "antiraid_toggle") {
    settings.set("antiRaid.enabled", !settings.get("antiRaid.enabled"));
    return interaction.update({
      embeds: [buildAntiRaidEmbed()],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  if (id === "antiraid_join_edit") {
    const modal = buildModal(
      "modal_antiraid_join",
      "Edit Join Spike Threshold",
      "Number",
      "Enter a number",
      settings.get("antiRaid.joinSpike").toString()
    );
    return interaction.showModal(modal);
  }

  if (id === "antiraid_msg_edit") {
    const modal = buildModal(
      "modal_antiraid_msg",
      "Edit Message Spam Threshold",
      "Number",
      "Enter a number",
      settings.get("antiRaid.msgSpam").toString()
    );
    return interaction.showModal(modal);
  }

  if (id === "antiraid_ping_edit") {
    const modal = buildModal(
      "modal_antiraid_ping",
      "Edit Ping Spam Threshold",
      "Number",
      "Enter a number",
      settings.get("antiRaid.pingSpam").toString()
    );
    return interaction.showModal(modal);
  }

  if (id === "antiraid_lockdown_toggle") {
    settings.set("antiRaid.autoLockdown", !settings.get("antiRaid.autoLockdown"));
    return interaction.update({
      embeds: [buildAntiRaidEmbed()],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  // ---------------------------
  // ANTI-NUKE
  // ---------------------------
  if (id === "antinuke_toggle") {
    settings.set("antiNuke.enabled", !settings.get("antiNuke.enabled"));
    return interaction.update({
      embeds: [buildAntiNukeEmbed()],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  if (id === "antinuke_log_edit") {
    const modal = buildModal(
      "modal_antinuke_log",
      "Edit Anti-Nuke Log Channel",
      "Channel ID",
      "Enter a channel ID",
      settings.get("antiNuke.logChannel") || ""
    );
    return interaction.showModal(modal);
  }

  if (id === "antinuke_ping_edit") {
    const modal = buildModal(
      "modal_antinuke_ping",
      "Edit Escalation Ping Role",
      "Role ID",
      "Enter a role ID",
      settings.get("antiNuke.escalationPing") || ""
    );
    return interaction.showModal(modal);
  }

  if (id === "antinuke_protected_roles") {
    const modal = buildModal(
      "modal_antinuke_roles",
      "Protected Roles",
      "Role IDs (comma separated)",
      "123,456,789",
      settings.get("antiNuke.protectedRoles").join(",")
    );
    return interaction.showModal(modal);
  }

  if (id === "antinuke_protected_channels") {
    const modal = buildModal(
      "modal_antinuke_channels",
      "Protected Channels",
      "Channel IDs (comma separated)",
      "123,456,789",
      settings.get("antiNuke.protectedChannels").join(",")
    );
    return interaction.showModal(modal);
  }

  // ---------------------------
  // ALERT SYSTEM
  // ---------------------------
  if (id === "alerts_toggle") {
    settings.set("alerts.enabled", !settings.get("alerts.enabled"));
    return interaction.update({
      embeds: [buildAlertsEmbed()],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  if (id === "alerts_channel_edit") {
    const modal = buildModal(
      "modal_alerts_channel",
      "Edit Alert Channel",
      "Channel ID",
      "Enter a channel ID",
      settings.get("alerts.alertChannel") || ""
    );
    return interaction.showModal(modal);
  }

  if (id === "alerts_pingroles_edit") {
    const modal = buildModal(
      "modal_alerts_pingroles",
      "Edit Ping Roles",
      "Role IDs (comma separated)",
      "123,456,789",
      settings.get("alerts.pingRoles").join(",")
    );
    return interaction.showModal(modal);
  }

  if (id === "alerts_cooldowns_edit") {
    const modal = buildModal(
      "modal_alerts_cooldowns",
      "Edit Cooldowns",
      "Format: YELLOW,ORANGE,RED",
      "240,120,30",
      `${settings.get("alerts.cooldowns.YELLOW")},${settings.get("alerts.cooldowns.ORANGE")},${settings.get("alerts.cooldowns.RED")}`
    );
    return interaction.showModal(modal);
  }

  if (id === "alerts_buttons_toggle") {
    settings.set("alerts.buttonsEnabled", !settings.get("alerts.buttonsEnabled"));
    return interaction.update({
      embeds: [buildAlertsEmbed()],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  // ---------------------------
  // BOOST TRACKER
  // ---------------------------
  if (id === "boosts_toggle") {
    settings.set("boosts.enabled", !settings.get("boosts.enabled"));
    return interaction.update({
      embeds: [buildBoostsEmbed()],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  if (id === "boosts_reward_edit") {
    const modal = buildModal(
      "modal_boosts_reward",
      "Edit Reward Role",
      "Role ID",
      "Enter a role ID",
      settings.get("boosts.rewardRole") || ""
    );
    return interaction.showModal(modal);
  }

  if (id === "boosts_log_edit") {
    const modal = buildModal(
      "modal_boosts_log",
      "Edit Boost Log Channel",
      "Channel ID",
      "Enter a channel ID",
      settings.get("boosts.logChannel") || ""
    );
    return interaction.showModal(modal);
  }

  // ---------------------------
  // GENERAL SETTINGS
  // ---------------------------
  if (id === "general_prefix_edit") {
    const modal = buildModal(
      "modal_general_prefix",
      "Edit Bot Prefix",
      "Prefix",
      "Enter a new prefix",
      settings.get("prefix")
    );
    return interaction.showModal(modal);
  }

  if (id === "general_staffroles_edit") {
    const modal = buildModal(
      "modal_general_staffroles",
      "Edit Staff Roles",
      "Role IDs (comma separated)",
      "123,456,789",
      settings.get("staffRoles").join(",")
    );
    return interaction.showModal(modal);
  }

  if (id === "general_logchannels_edit") {
    const modal = buildModal(
      "modal_general_logchannels",
      "Edit Log Channels",
      "Format: alerts,boosts,vouches",
      "123,456,789",
      `${settings.get("logChannels.alerts") || ""},${settings.get("logChannels.boosts") || ""},${settings.get("logChannels.vouches") || ""}`
    );
    return interaction.showModal(modal);
  }
}

// ------------------------------------------------------------
// MODAL SUBMISSION HANDLER
// ------------------------------------------------------------
export async function handleSettingsModals(interaction) {
  const id = interaction.customId;
  const value = interaction.fields.getTextInputValue("input");

  // ---------------------------
  // VOUCH
  // ---------------------------
  if (id === "modal_vouch_logchannel") {
    settings.set("vouch.logChannel", value);
    return interaction.reply({ content: "Updated vouch log channel.", ephemeral: true });
  }

  // ---------------------------
  // ANTI-RAID
  // ---------------------------
  if (id === "modal_antiraid_join") {
    settings.set("antiRaid.joinSpike", Number(value));
    return interaction.reply({ content: "Updated join spike threshold.", ephemeral: true });
  }

  if (id === "modal_antiraid_msg") {
    settings.set("antiRaid.msgSpam", Number(value));
    return interaction.reply({ content: "Updated message spam threshold.", ephemeral: true });
  }

  if (id === "modal_antiraid_ping") {
    settings.set("antiRaid.pingSpam", Number(value));
    return interaction.reply({ content: "Updated ping spam threshold.", ephemeral: true });
  }

  // ---------------------------
  // ANTI-NUKE
  // ---------------------------
  if (id === "modal_antinuke_log") {
    settings.set("antiNuke.logChannel", value);
    return interaction.reply({ content: "Updated anti-nuke log channel.", ephemeral: true });
  }

  if (id === "modal_antinuke_ping") {
    settings.set("antiNuke.escalationPing", value);
    return interaction.reply({ content: "Updated escalation ping role.", ephemeral: true });
  }

  if (id === "modal_antinuke_roles") {
    settings.set("antiNuke.protectedRoles", value.split(",").map(v => v.trim()));
    return interaction.reply({ content: "Updated protected roles.", ephemeral: true });
  }

  if (id === "modal_antinuke_channels") {
    settings.set("antiNuke.protectedChannels", value.split(",").map(v => v.trim()));
    return interaction.reply({ content: "Updated protected channels.", ephemeral: true });
  }

  // ---------------------------
  // ALERT SYSTEM
  // ---------------------------
  if (id === "modal_alerts_channel") {
    settings.set("alerts.alertChannel", value);
    return interaction.reply({ content: "Updated alert channel.", ephemeral: true });
  }

  if (id === "modal_alerts_pingroles") {
    settings.set("alerts.pingRoles", value.split(",").map(v => v.trim()));
    return interaction.reply({ content: "Updated ping roles.", ephemeral: true });
  }

  if (id === "modal_alerts_cooldowns") {
    const [y, o, r] = value.split(",").map(v => Number(v.trim()));
    settings.set("alerts.cooldowns.YELLOW", y);
    settings.set("alerts.cooldowns.ORANGE", o);
    settings.set("alerts.cooldowns.RED", r);
    return interaction.reply({ content: "Updated alert cooldowns.", ephemeral: true });
  }

  // ---------------------------
  // BOOST TRACKER
  // ---------------------------
  if (id === "modal_boosts_reward") {
    settings.set("boosts.rewardRole", value);
    return interaction.reply({ content: "Updated reward role.", ephemeral: true });
  }

  if (id === "modal_boosts_log") {
    settings.set("boosts.logChannel", value);
    return interaction.reply({ content: "Updated boost log channel.", ephemeral: true });
  }

  // ---------------------------
  // GENERAL
  // ---------------------------
  if (id === "modal_general_prefix") {
    settings.set("prefix", value);
    return interaction.reply({ content: "Updated prefix.", ephemeral: true });
  }

  if (id === "modal_general_staffroles") {
    settings.set("staffRoles", value.split(",").map(v => v.trim()));
    return interaction.reply({ content: "Updated staff roles.", ephemeral: true });
  }

  if (id === "modal_general_logchannels") {
    const [alerts, boosts, vouches] = value.split(",").map(v => v.trim());
    settings.set("logChannels.alerts", alerts || null);
    settings.set("logChannels.boosts", boosts || null);
    settings.set("logChannels.vouches", vouches || null);
    return interaction.reply({ content: "Updated log channels.", ephemeral: true });
  }
}

