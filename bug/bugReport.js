// bugReport.js
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  ThreadAutoArchiveDuration
} from "discord.js";

const BUG_CHANNEL = "1508141164602327210"; // Your bug report channel

// Store active DM sessions
const activeSessions = new Map();

export function getBugReportPanel() {
  const embed = new EmbedBuilder()
    .setColor("#ff4444")
    .setTitle("🐞 Found a Bug?")
    .setDescription(
      "Click the button below to report a bug.\n\n" +
      "The bot will DM you a short form to fill out."
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("bug_start")
      .setLabel("Report Bug")
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

export async function handleBugButton(interaction, client) {
  if (interaction.customId !== "bug_start") return;

  // Try to DM the user
  try {
    const dm = await interaction.user.send(
      "🐞 **Bug Report Form**\nLet's get started!\n\n" +
      "First question:\n**What device are you using?** (PC / Mobile / Xbox)"
    );

    activeSessions.set(interaction.user.id, {
      step: 1,
      answers: {},
      dmChannel: dm.channel
    });

    await interaction.reply({
      content: "📬 I’ve sent you a DM with the bug report form.",
      ephemeral: true
    });

  } catch {
    return interaction.reply({
      content: "❌ I couldn't DM you. Please enable DMs and try again.",
      ephemeral: true
    });
  }
}

export async function handleDM(message, client) {
  const session = activeSessions.get(message.author.id);
  if (!session) return;

  const content = message.content.trim();

  switch (session.step) {
    case 1:
      session.answers.device = content;
      session.step = 2;
      return message.channel.send("🧭 **Steps to Reproduce:**\nExplain step-by-step how to trigger the bug.");
    case 2:
      session.answers.steps = content;
      session.step = 3;
      return message.channel.send("🎯 **Expected Behavior:**\nWhat did you expect to happen?");
    case 3:
      session.answers.expected = content;
      session.step = 4;
      return message.channel.send("💥 **Actual Behavior:**\nWhat actually happened?");
    case 4:
      session.answers.actual = content;
      session.step = 5;
      return message.channel.send("📎 **Media Link (optional):**\nYou can send a video/screenshot link, or type `none`.");
    case 5:
      session.answers.media = content === "none" ? "No media provided." : content;

      await postBugReport(message.author, session.answers, client);

      activeSessions.delete(message.author.id);
      return message.channel.send("✅ Your bug report has been submitted. Thank you!");
  }
}

async function postBugReport(user, data, client) {
  const channel = await client.channels.fetch(BUG_CHANNEL);

  const embed = new EmbedBuilder()
    .setColor("#ff4444")
    .setTitle("🐞 New Bug Report")
    .addFields(
      { name: "Reporter", value: `${user}`, inline: false },
      { name: "Device", value: data.device, inline: true },
      { name: "Steps to Reproduce", value: data.steps, inline: false },
      { name: "Expected", value: data.expected, inline: false },
      { name: "Actual", value: data.actual, inline: false },
      { name: "Media", value: data.media, inline: false },
      { name: "Status", value: "🟡 Pending Review", inline: false }
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("bug_confirm").setLabel("Confirm").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("bug_accept").setLabel("Accept").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("bug_progress").setLabel("In Progress").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("bug_fixed").setLabel("Fixed").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("bug_duplicate").setLabel("Duplicate").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("bug_close").setLabel("Close").setStyle(ButtonStyle.Secondary)
  );

  const msg = await channel.send({ embeds: [embed], components: [row] });

  await msg.startThread({
    name: `bug-${msg.id}`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek
  });
}

export async function handleBugStatus(interaction) {
  const allowed = interaction.member.permissions.has(PermissionFlagsBits.ManageGuild);
  if (!allowed)
    return interaction.reply({ content: "❌ You don't have permission to update bug reports.", ephemeral: true });

  const statusMap = {
    bug_confirm: "🟢 Confirmed",
    bug_accept: "🟢 Accepted",
    bug_progress: "🔵 In Progress",
    bug_fixed: "🟣 Fixed",
    bug_duplicate: "⚪ Duplicate",
    bug_close: "🔴 Closed"
  };

  const newStatus = statusMap[interaction.customId];
  if (!newStatus) return;

  const embed = EmbedBuilder.from(interaction.message.embeds[0]);
  embed.spliceFields(6, 1, { name: "Status", value: newStatus });

  await interaction.update({ embeds: [embed], components: interaction.message.components });

  const thread = interaction.message.thread;
  if (thread) thread.send(`${interaction.user} marked this bug as **${newStatus}**.`);
}