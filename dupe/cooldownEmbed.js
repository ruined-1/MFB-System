import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";
import { getRemaining } from "./cooldowns.js";
import { getSeverityColor, getSeverityLabel } from "./severity.js";

export default function buildCooldownMessage(userId) {
    const remaining = getRemaining(userId);
    const seconds = Math.ceil(remaining);

    const embed = new EmbedBuilder()
        .setTitle("⏳ User Cooldown Active")
        .setDescription(`<@${userId}> is currently on cooldown.`)
        .addFields(
            { name: "Time Remaining", value: `**${seconds}s**`, inline: true },
            { name: "Severity", value: getSeverityLabel(seconds), inline: true }
        )
        .setColor(getSeverityColor(seconds))
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`reset_${userId}`)
            .setLabel("Reset Cooldown")
            .setStyle(ButtonStyle.Danger)
    );

    return {
        embed,
        components: [row]
    };
}
