export const tokenizeDefaults = {
    normalSymbols: new Set('()[]{}<>+-*/\\?~!@#$%^&=|,.:;'),
    twoCharacterSymbols: new Set([
        '&&', '||', '==', '>=', '<=', '!=', '<<', '>>',
        '++', '--', '**', '+=', '-=', '*=', '/=', '&=', '^=', '|=',
    ]),
    globSymbols: new Set(['"', "'", '`']),
    numberCharacters: new Set('0123456789'),
    extendedNumberCharacters: new Set('.ABCDEF'),
    numberSuffixes: new Set(['D', 'B', 'O', 'H']),
    spaceCharacters: new Set(' \r\n\t'),
    escapeCharacters: new Map([
        ['t', '\t'],
        ['r', '\r'],
        ['n', '\n'],
        ['\n', '\n'],
        ['"', '"'],
        ["'", "'"],
        ['`', '`'],
    ]),
};
/** dts2md break */
export type TokenizeOptions = typeof tokenizeDefaults;
/** dts2md break */
const enum TOKEN_FLAGS { ANY, SPACE, NUMBER, NUMBER_SUFFIX }
/** dts2md break */
/**
 * Split source code into tokens
 */
export const tokenize = (
    source: string,
    options?: Partial<TokenizeOptions>,
) => {

    const config = Object.assign({}, tokenizeDefaults, options);
    const {
        normalSymbols,
        twoCharacterSymbols,
        globSymbols,
        numberCharacters,
        extendedNumberCharacters,
        numberSuffixes,
        spaceCharacters,
        escapeCharacters,
    } = config;

    const tokens = [];
    let tokenBuffer = '';
    let globFlag = '';
    let state = TOKEN_FLAGS.ANY;

    for (let i = 0; i < source.length; i++) {

        const character = source[i];

        if (globFlag) {
            if (
                tokenBuffer[tokenBuffer.length - 1] === '\\'
                && escapeCharacters.has(character)
            ) {
                tokenBuffer = tokenBuffer.slice(0, -1) + escapeCharacters.get(character);
            } else {
                tokenBuffer += character;
                if (character === globFlag) {
                    tokens.push(tokenBuffer);
                    tokenBuffer = '';
                    globFlag = '';
                    state = TOKEN_FLAGS.ANY;
                }
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
            state === TOKEN_FLAGS.NUMBER
            && (
                numberCharacters.has(character)
                || extendedNumberCharacters.has(character)
            )
        ) {
            tokenBuffer += character;
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

        if (
            state === TOKEN_FLAGS.ANY
            && normalSymbols.has(character)
            && tokens.length
            && tokens[tokens.length - 1].length === 1
            && twoCharacterSymbols.has(tokens[tokens.length - 1] + character)
        ) {
            tokens[tokens.length - 1] += character;
            continue;
        }

        let flag = TOKEN_FLAGS.ANY;
        if (spaceCharacters.has(character)) {
            flag = TOKEN_FLAGS.SPACE;
        } else if (numberCharacters.has(character)) {
            flag = TOKEN_FLAGS.NUMBER;
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
                && flag === TOKEN_FLAGS.NUMBER
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
