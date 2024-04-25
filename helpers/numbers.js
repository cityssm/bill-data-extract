import { trimTextFromEndUntil, trimTextFromStartUntil } from './trimmers.js';
export function trimToNumber(rawText) {
    let text = rawText.trim();
    text = trimTextFromStartUntil(text, /\d/);
    text = trimTextFromEndUntil(text, /\d/);
    return cleanNumberText(text);
}
export function cleanNumberText(numberText) {
    const text = numberText.replace(',', '');
    try {
        return Number.parseFloat(text);
    }
    catch {
        return undefined;
    }
}
