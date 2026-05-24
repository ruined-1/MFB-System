// suggestions/suggestionSystem.js
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ThreadAutoArchiveDuration
} from "discord.js";

const SUGGESTION_CHANNEL = "YOUR_CHANNEL_ID_HERE"; // Replace this

// Active DM sessions
const suggestionSessions = new Map();

// ===============================
// SUGGESTION PANEL
// ===============================
export function getSuggestionPanel() {
  const embed = new EmbedBuilder()
    .setColor("#00b4ff")
    .setTitle("💡 Got a Suggestion?")
    .setDescription(
      "Click the button below to submit a suggestion.\n\n" +
      "The bot will DM you a short form to fill out."
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("suggest_start")
      .setLabel("Submit Suggestion")
      .setStyle(ButtonStyle.Primary)
  );

  return { embeds: [embed], components: [row] };
}

// ===============================
// BUTTON HANDLER
// ===============================
export async function handleSuggestionButton(interaction) {
  if (interaction.customId !== "suggest_start") return;

  try {
    const dm = await interaction.user.send(
      "💡 **Suggestion Form**\nLet's begin!\n\n" +
      "First question:\n**What is your suggestion?**"
    );

    suggestionSessions.set(interaction.user.id, {
      step: 1,
      answers: {},
      dmChannel: dm.channel
    });

    await interaction.reply({
      content: "📬 I’ve sent you a DM to begin your suggestion.",
      ephemeral: true
    });

  } catch {
    return interaction.reply({
      content: "❌ I couldn't DM you. Please enable DMs and try again.",
      ephemeral: true
    });
  }
}

// ===============================
// DM HANDLER
// ===============================
export async function handleSuggestionDM(message, client) {
  const session = suggestionSessions.get(message.author.id);
  if (!session) return;

  const content = message.content.trim();

  switch (session.step) {
    case 1:
      session.answers.suggestion = content;
      session.step = 2;
      return message.channel.send("🎯 **Why should this be added?**");

    case 2:
      session.answers.reason = content;
      session.step = 3;
      return message.channel.send("📎 **Optional media link:**\nSend a link or type `none`.");

    case 3:
      session.answers.media = content === "none" ? "No media provided." : content;

      await postSuggestion(message.author, session.answers, client);

      suggestionSessions.delete(message.author.id);
      return message.channel.send("✅ Your suggestion has been submitted. Thank you!");
  }
}

// ===============================
// POST SUGGESTION (NO DEV BUTTONS)
// ===============================
async function postSuggestion(user, data, client) {
  const channel = await client.channels.fetch(SUGGESTION_CHANNEL);

  const embed = new EmbedBuilder()
    .setColor("#00b4ff")
    .setTitle("💡 New Suggestion")
    .addFields(
      { name: "User", value: `${user}`, inline: false },
      { name: "Suggestion", value: data.suggestion, inline: false },
      { name: "Reason", value: data.reason, inline: false },
      { name: "Media", value: data.media, inline: false }
    )
    .setTimestamp();

  // No buttons — clean community suggestion post
  const msg = await channel.send({ embeds: [embed] });

  await msg.startThread({
    name: `suggestion-${msg.id}`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek
  });
}
