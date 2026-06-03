import { SlashCommandBuilder, WebhookClient } from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder()
    .setName("mb")
    .setDescription("Ban message sender")
    .addStringOption(opt =>
      opt
        .setName("roblox_id")
        .setDescription("Roblox user ID")
        .setRequired(true)
    )
    .addUserOption(opt =>
      opt
        .setName("ping")
        .setDescription("User to ping")
        .setRequired(true)
    ),

  async execute(interaction) {
    const robloxId = interaction.options.getString("roblox_id");
    const pingUser = interaction.options.getUser("ping");

    //  FETCH ROBLOX USER INFO
    let data;
    try {
      const res = await fetch(`https://users.roblox.com/v1/users/${robloxId}`);
      data = await res.json();

      if (data.errors) {
        return interaction.reply({
          content: "❌ Invalid Roblox ID.",
          ephemeral: true
        });
      }
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ Failed to fetch Roblox user.",
        ephemeral: true
      });
    }

    const displayName = data.displayName;

    //  FETCH AVATAR HEADSHOT
    let avatarUrl = null;
    try {
      const avatarRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=420x420&format=Png&isCircular=false`
      );
      const avatarData = await avatarRes.json();
      avatarUrl = avatarData.data?.[0]?.imageUrl || null;
    } catch (err) {
      console.error("Avatar fetch failed:", err);
    }

    //  YOUR WEBHOOK
    const webhook = new WebhookClient({
      url: process.env.MB_WEBHOOK_URL
    });

    //  SEND WEBHOOK MESSAGE
    await webhook.send({
      content: `<@${pingUser.id}>  ${displayName} (${robloxId}) has been banned for duping.`
    });


    // Acknowledge the slash command
    await interaction.reply({
      content: "Message sent.",
      ephemeral: true
    });
  }
};
