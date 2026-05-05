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
// MAIN DASHBOARD EMBED
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
// CATEGORY SELECT MENU
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
// NAVIGATION BUTTONS
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
// CATEGORY EMBEDS
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
    );
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

  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: "❌ Administrator only.", ephemeral: true });
  }

  // CATEGORY SELECT
  if (interaction.isStringSelectMenu() && interaction.customId === "settings_category_select") {
    const value = interaction.values[0];

    const embeds = {
      main: buildMainEmbed(),
      vouch: buildVouchEmbed(),
      antiraid: buildAntiRaidEmbed(),
      antinuke: buildAntiNukeEmbed(),
      alerts: buildAlertsEmbed(),
      boosts: buildBoostsEmbed(),
      general: buildGeneralEmbed()
    };

    return interaction.update({
      embeds: [embeds[value]],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  // HOME BUTTON
  if (interaction.customId === "settings_home") {
    return interaction.update({
      embeds: [buildMainEmbed()],
      components: [buildCategoryMenu(), buildNavButtons()]
    });
  }

  // REFRESH BUTTON
  if (interaction.customId === "settings_refresh") {
    const title = interaction.message.embeds[0]?.title || "";

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

  // CLOSE BUTTON
  if (interaction.customId === "settings_close") {
    return interaction.message.delete().catch(() => {});
  }

  // ------------------------------------------------------------
  // BUTTON HANDLER
  // ------------------------------------------------------------
  if (interaction.isButton()) {
    const id = interaction.customId;

    // VOUCH
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
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId("modal_vouch_logchannel")
          .setTitle("Edit Vouch Log Channel")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("input")
                .setLabel("Channel ID")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Enter channel ID")
                .setValue(settings.get("vouch.logChannel") || "")
                .setRequired(true)
            )
          )
      );
    }

    // ANTI-RAID
    if (id === "antiraid_toggle") {
      settings.set("antiRaid.enabled", !settings.get("antiRaid.enabled"));
      return interaction.update({
        embeds: [buildAntiRaidEmbed()],
        components: [buildCategoryMenu(), buildNavButtons()]
      });
    }

    if (id === "antiraid_join_edit") {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId("modal_antiraid_join")
          .setTitle("Edit Join Spike Threshold")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("input")
                .setLabel("Number")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Enter number")
                .setValue(String(settings.get("antiRaid.joinSpike")))
                .setRequired(true)
            )
          )
      );
    }

    if (id === "antiraid_msg_edit") {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId("modal_antiraid_msg")
          .setTitle("Edit Message Spam Threshold")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("input")
                .setLabel("Number")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Enter number")
                .setValue(String(settings.get("antiRaid.msgSpam")))
                .setRequired(true)
            )
          )
      );
    }

    if (id === "antiraid_ping_edit") {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId("modal_antiraid_ping")
          .setTitle("Edit Ping Spam Threshold")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("input")
                .setLabel("Number")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Enter number")
                .setValue(String(settings.get("antiRaid.pingSpam")))
                .setRequired(true)
            )
          )
      );
    }

    if (id === "antiraid_lockdown_toggle") {
      settings.set("antiRaid.autoLockdown", !settings.get("antiRaid.autoLockdown"));
      return interaction.update({
        embeds: [buildAntiRaidEmbed()],
        components: [buildCategoryMenu(), buildNavButtons()]
      });
    }

    // ANTI-NUKE
    if (id === "antinuke_toggle") {
      settings.set("antiNuke.enabled", !settings.get("antiNuke.enabled"));
      return interaction.update({
        embeds: [buildAntiNukeEmbed()],
        components: [buildCategoryMenu(), buildNavButtons()]
      });
    }

    if (id === "antinuke_log_edit") {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId("modal_antinuke_log")
          .setTitle("Edit Anti-Nuke Log Channel")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("input")
                .setLabel("Channel ID")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Enter channel ID")
                .setValue(settings.get("antiNuke.logChannel") || "")
                .setRequired(true)
            )
          )
      );
    }

    if (id === "antinuke_ping_edit") {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId("modal_antinuke_ping")
          .setTitle("Edit Escalation Ping Role")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("input")
                .setLabel("Role ID")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Enter role ID")
                .setValue(settings.get("antiNuke.escalationPing") || "")
                .setRequired(true)
            )
          )
      );
    }

    if (id === "antinuke_protected_roles") {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId("modal_antinuke_roles")
          .setTitle("Protected Roles")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("input")
                .setLabel("Role IDs (comma separated)")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("123,456")
                .setValue(settings.get("antiNuke.protectedRoles").join(","))
                .setRequired(true)
            )
          )
      );
    }

    if (id === "antinuke_protected_channels") {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId("modal_antinuke_channels")
          .setTitle("Protected Channels")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("input")
                .setLabel("Channel IDs (comma separated)")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("123,456")
                .setValue(settings.get("antiNuke.protectedChannels").join(","))
                .setRequired(true)
            )
          )
      );
    }

    // ALERTS
    if (id === "alerts_toggle") {
      settings.set("alerts.enabled", !settings.get("alerts.enabled"));
      return interaction.update({
        embeds: [buildAlertsEmbed()],
        components: [buildCategoryMenu(), buildNavButtons()]
      });
    }

    if (id === "alerts_channel_edit") {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId("modal_alerts_channel")
          .setTitle("Edit Alert Channel")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("input")
                .setLabel("Channel ID")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Enter channel ID")
                .setValue(settings.get("alerts.alertChannel") || "")
                .setRequired(true)
            )
          )
      );
    }

    if (id === "alerts_pingroles_edit") {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId("modal_alerts_pingroles")
          .setTitle("Edit Ping Roles")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("input")
                .setLabel("Role IDs (comma separated)")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("123,456")
                .setValue(settings.get("alerts.pingRoles").join(","))
                .setRequired(true)
            )
          )
      );
    }

    if (id === "alerts_cooldowns_edit") {
      return interaction.showModal(
        new ModalBuilder()
          .setCustomId("modal_alerts_cooldowns")
          .setTitle("Edit Cooldowns")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("input")
                .setLabel("Format: YELLOW,ORANGE,RED")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("240,120,30")
                .setValue(
        `${settings.get("alerts.cooldowns.YELLOW")},${settings.get("alerts.cooldowns.ORANGE")},${settings.get("alerts.cooldowns.RED")}`
      )
                .setRequired(true)
  )
)
);
}
if (id === "alerts_buttons_toggle") {
  settings.set("alerts.buttonsEnabled", !settings.get("alerts.buttonsEnabled"));
  return interaction.update({
    embeds: [buildAlertsEmbed()],
    components: [buildCategoryMenu(), buildNavButtons()]
  });
}

// BOOSTS
if (id === "boosts_toggle") {
  settings.set("boosts.enabled", !settings.get("boosts.enabled"));
  return interaction.update({
    embeds: [buildBoostsEmbed()],
    components: [buildCategoryMenu(), buildNavButtons()]
  });
}

if (id === "boosts_reward_edit") {
  return interaction.showModal(
    new ModalBuilder()
      .setCustomId("modal_boosts_reward")
      .setTitle("Edit Reward Role")
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("input")
            .setLabel("Role ID")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter role ID")
            .setValue(settings.get("boosts.rewardRole") || "")
            .setRequired(true)
        )
      )
  );
}

if (id === "boosts_log_edit") {
  return interaction.showModal(
    new ModalBuilder()
      .setCustomId("modal_boosts_log")
      .setTitle("Edit Boost Log Channel")
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("input")
            .setLabel("Channel ID")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter channel ID")
            .setValue(settings.get("boosts.logChannel") || "")
            .setRequired(true)
        )
      )
  );
}
