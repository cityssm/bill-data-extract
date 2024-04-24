export function trimTextFromStartUntil(rawText, stopCharacterRegex) {
    let text = rawText;
    while (text.length > 0 && !stopCharacterRegex.test(text.charAt(0))) {
        text = text.slice(1);
    }
    return text;
}
export function trimTextFromEndUntil(rawText, stopCharacterRegex) {
    let text = rawText;
    while (text.length > 0 && !stopCharacterRegex.test(text.at(-1) ?? '')) {
        text = text.slice(0, -1);
    }
    return text;
}
