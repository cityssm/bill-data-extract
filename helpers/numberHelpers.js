import { trimTextFromEndUntil, trimTextFromStartUntil } from './trimmingHelpers.js';
export function trimToNumber(rawText, isMoneyWithTwoDecimalPlaces = true) {
    let text = rawText.trim();
    text = trimTextFromStartUntil(text, /\d/);
    text = trimTextFromEndUntil(text, /\d/);
    return cleanNumberText(text, isMoneyWithTwoDecimalPlaces);
}
export function cleanNumberText(numberText, isMoneyWithTwoDecimalPlaces) {
    const text = numberText.replaceAll(',', '').replaceAll(' ', '');
    const float = Number.parseFloat(text);
    if (Number.isNaN(float)) {
        console.log(`PARSING ERROR: ${text}`);
        return undefined;
    }
    else if (isMoneyWithTwoDecimalPlaces) {
        return Number.parseFloat(text.replaceAll('.', '')) / 100;
    }
    return float;
}
