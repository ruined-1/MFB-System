export function getSeverityColor(seconds) {
    if (seconds > 10) return 0xFF0000;   // red
    if (seconds > 5) return 0xFFA500;    // orange
    return 0x00FF00;                     // green
}

export function getSeverityLabel(seconds) {
    if (seconds > 10) return "🔴 High Severity";
    if (seconds > 5) return "🟠 Medium Severity";
    return "🟢 Low Severity";
}
