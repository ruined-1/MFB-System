// severity.js

export function getSeverityLabel(amountOwned) {
    if (amountOwned >= 100) return "RED";
    if (amountOwned >= 50) return "ORANGE";
    if (amountOwned >= 20) return "YELLOW";
    return "LOW";
}

export function getSeverityColor(severity) {
    switch (severity) {
        case "RED":
            return 0xff0000;
        case "ORANGE":
            return 0xffa500;
        case "YELLOW":
            return 0xffff00;
        default:
            return 0x00ff00;
    }
}
