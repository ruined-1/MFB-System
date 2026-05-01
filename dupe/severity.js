export function getSeverityLabel(amountOwned, playtime, cash) {
    if (amountOwned > 5000000) return "RED";
    if (amountOwned > 1000000) return "ORANGE";
    return "YELLOW";
}

export function getSeverityColor(label) {
    switch (label) {
        case "RED": return 0xff0000;
        case "ORANGE": return 0xff6600;
        default: return 0xffff00;
    }
}
