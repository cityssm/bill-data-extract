export function replaceDateStringTypos(dateString) {
    return dateString
        .replace('Anr', 'Apr')
        .replace('Aor', 'Apr')
        .replace('Mav', 'May')
        .replace('Jim', 'Jun');
}
