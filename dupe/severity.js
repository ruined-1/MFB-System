// severity.js

export const severityLevels = {
    YELLOW: 20,
    ORANGE: 50,
    RED: 100
};

export function setSeverityLevel(level, value) {
    severityLevels[level] = value;
}

export function getSeverityLabel(amountOwned) {
    if (amountOwned >= severityLevels.RED) return "RED";
    if (amountOwned >= severityLevels.ORANGE) return "ORANGE";
    if (amountOwned >= severityLevels.YELLOW) return "YELLOW";
    return "LOW";
}

export function getSeverityColor(severity) {
    switch (severity) {
        case "RED": return 0xff0000;
        case "ORANGE": return 0xffa500;
        case "YELLOW": return 0xf5e342;   // ⭐ your exact yellow
        default: return 0xf5e342;         // LOW (yellow)
    }
}
