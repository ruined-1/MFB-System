// utils/severity.js

/**
 * Convert severity score → label
 */
export function getSeverityLabel(score) {
    if (score >= 6) return "RED";
    if (score >= 3) return "ORANGE";
    return "YELLOW";
}

/**
 * Convert severity score → embed color
 */
export function getSeverityColor(score) {
    if (score >= 6) return 0xff0000; // red
    if (score >= 3) return 0xffa500; // orange
    return 0xffff00; // yellow
}
