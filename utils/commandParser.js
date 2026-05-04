const wordToNumber = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50
};

function normalizeInput(input) {
    let normalized = input.toLowerCase();
    normalized = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    Object.entries(wordToNumber).forEach(([word, num]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        normalized = normalized.replace(regex, num.toString());
    });
    return normalized;
}

export function parseCommand(input) {
    const trimmed = normalizeInput(input).trim();
    const parts = trimmed.split(' ');
    const command = parts[0];

    if (command === 'start' || command === 's') {
        return { type: 'START' };
    }

    if (command === 'add' || command === 'a') {
        if (parts.length < 4) return { type: 'ERROR', message: 'Format: add [item] [v/f/o] [price]' };
        const cost = parseFloat(parts[parts.length - 1]);
        const typeShort = parts[parts.length - 2];
        const name = parts.slice(1, parts.length - 2).join(' ');

        let type = 'other';
        if (typeShort.startsWith('v')) type = 'vegetable';
        else if (typeShort.startsWith('f')) type = 'fruit';
        else if (typeShort.startsWith('o')) type = 'other';
        else return { type: 'ERROR', message: 'Type must be v, f or o' };

        if (isNaN(cost)) return { type: 'ERROR', message: 'Invalid price' };
        return { type: 'ADD', payload: { name, type, cost } };
    }

    if (command === 'delete' || command === 'd') {
        if (parts.length < 2) return { type: 'ERROR', message: 'Format: delete [item]' };
        return { type: 'DELETE', payload: { name: parts.slice(1).join(' ') } };
    }

    if (command === 'total' || command === 't') return { type: 'TOTAL' };
    if (command === 'close' || command === 'c') return { type: 'CLOSE' };

    return { type: 'ERROR', message: 'Unknown command' };
}
