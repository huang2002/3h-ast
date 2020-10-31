export const tokenizeDefaults = {
    normalSymbols: new Set('()[]{}<>+-*/\\?`~!@#$%^&=|,.:;'),
    globSymbols: new Set(['"', "'", '`']),
    numberCharacters: new Set('0123456789.'),
    numberSuffixes: new Set(['D', 'B', 'O', 'H']),
    spaceCharacters: new Set(' \r\n\t'),
};

export type TokenizeOptions = typeof tokenizeDefaults;

const enum TOKEN_FLAGS { ANY, SPACE, NUMBER, NUMBER_SUFFIX }

export const tokenize = (
    source: string,
    options?: Partial<TokenizeOptions>,
) => {

    const config = Object.assign({}, tokenizeDefaults, options);
    const {
        normalSymbols,
        globSymbols,
        numberCharacters,
        numberSuffixes,
        spaceCharacters,
    } = config;

    const tokens = [];
    let tokenBuffer = '';
    let globFlag = '';
    let state = TOKEN_FLAGS.ANY;

    for (let i = 0; i < source.length; i++) {

        const character = source[i];

        if (globFlag) {
            tokenBuffer += character;
            if (character === globFlag) {
                tokens.push(tokenBuffer);
                tokenBuffer = '';
                globFlag = '';
                state = TOKEN_FLAGS.ANY;
            }
            continue;
        }

        if (globSymbols.has(character)) {
            if (tokenBuffer) {
                tokens.push(tokenBuffer);
            }
            tokenBuffer = character;
            globFlag = character;
            continue;
        }

        if (
            (state === TOKEN_FLAGS.NUMBER || state === TOKEN_FLAGS.NUMBER_SUFFIX)
            && numberSuffixes.has(character)
        ) {
            tokenBuffer += character;
            state = TOKEN_FLAGS.NUMBER_SUFFIX;
            continue;
        }

        let flag = TOKEN_FLAGS.ANY;
        if (spaceCharacters.has(character)) {
            flag = TOKEN_FLAGS.SPACE;
        } else if (numberCharacters.has(character)) {
            flag = TOKEN_FLAGS.NUMBER;
        } else if (numberSuffixes.has(character)) {
            flag = TOKEN_FLAGS.NUMBER_SUFFIX;
        } else if (normalSymbols.has(character)) {
            if (tokenBuffer) {
                tokens.push(tokenBuffer);
            }
            tokens.push(character);
            tokenBuffer = '';
            state = TOKEN_FLAGS.ANY;
            continue;
        }

        if (
            state === flag
            || (
                state === TOKEN_FLAGS.ANY
                && !normalSymbols.has(character)
                && (
                    flag === TOKEN_FLAGS.NUMBER
                    || flag === TOKEN_FLAGS.NUMBER_SUFFIX
                )
            )
        ) {
            tokenBuffer += character;
        } else {
            if (tokenBuffer) {
                tokens.push(tokenBuffer);
            }
            tokenBuffer = character;
        }

        state = flag;

    }

    if (tokenBuffer) {
        tokens.push(tokenBuffer);
    }

    return tokens;

};
