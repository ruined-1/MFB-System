// prefix.js

import { getThreshold, setThreshold } from "./dupe/threshold.js";
import { severityLevels, setSeverityLevel } from "./dupe/severity.js";

export default async function prefixHandler(msg, client) {
    if (!msg.content.startsWith("!")) return;

    const args = msg.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ============================
    // !threshold
    // ============================
    if (command === "threshold") {
        const current = getThreshold();

        // Update threshold: !threshold 30
        if (args[0] && !isNaN(parseInt(args[0]))) {
            const newValue = parseInt(args[0]);
            setThreshold(newValue);

            return msg.author.send(
                `✅ Threshold updated.\n\n**Old:** ${current}\n**New:** ${newValue}`
            );
        }

        // Show current threshold
        return msg.author.send(
            `📊 **Current Threshold:** ${current}\n\nTo update it:\n\`!threshold <number>\``
        );
    }

    // ============================
    // !severity
    // ============================
    if (command === "severity") {
        const level = args[0]?.toUpperCase();
        const newValue = parseInt(args[1]);

        // Update severity: !severity yellow 30
        if (level && ["YELLOW", "ORANGE", "RED"].includes(level) && !isNaN(newValue)) {
            const oldValue = severityLevels[level];
            setSeverityLevel(level, newValue);

            return msg.author.send(
                `🔧 Severity updated.\n\n**${level}** changed from **${oldValue}** → **${newValue}**`
            );
        }

        // Show current severity settings
        return msg.author.send(
            `📊 **Current Severity Levels:**\n` +
            `🟡 YELLOW: ${severityLevels.YELLOW}\n` +
            `🟠 ORANGE: ${severityLevels.ORANGE}\n` +
            `🔴 RED: ${severityLevels.RED}\n\n` +
            `To update:\n\`!severity <yellow|orange|red> <number>\``
        );
    }
}
