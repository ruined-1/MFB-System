import { resetCooldown } from "./cooldowns.js";

export default function handleReset(interaction) {
    const userId = interaction.customId.replace("reset_", "");
    resetCooldown(userId);

    interaction.reply({
        content: `Cooldown reset for <@${userId}>.`,
        ephemeral: true
    });
}
