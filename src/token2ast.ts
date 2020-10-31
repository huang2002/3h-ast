import { TokenizeOptions, tokenizeDefaults } from './tokenize';

export type ASTNode =
    | { type: 'glob'; value: string; offset: number; }
    | { type: 'number'; value: string; suffix: string; offset: number; }
    | { type: 'word'; value: string; offset: number; }
    | { type: 'symbol'; value: string; offset: number; }
    | { type: 'span'; start: string; stop: string; body: ASTNode[]; offset: number; };
/** dts2md break */
export interface ASTOptions extends TokenizeOptions {
    spanSymbols: Map<string, string>;
}
/** dts2md break */
/**
 * Default span symbols:
 * '(' -> ')'
 * '[' -> ']'
 * '{' -> '}'
 */
export const astDefaults = Object.assign({}, tokenizeDefaults, {
    spanSymbols: new Map([
        ['(', ')'],
        ['[', ']'],
        ['{', '}'],
    ]),
}) as ASTOptions;
/** dts2md break */
/**
 * Convert tokens to AST nodes
 */
export const token2ast = (
    tokens: string[],
    options?: Partial<ASTOptions>,
    initOffset = 0,
    cursorStart = 0,
    cursorStop = tokens.length,
) => {

    const config = Object.assign({}, astDefaults, options);
    const {
        normalSymbols,
        globSymbols,
        numberCharacters,
        numberSuffixes,
        spaceCharacters,
        spanSymbols,
    } = config;

    const result = new Array<ASTNode>();
    let offset = initOffset;

    for (let mainCursor = cursorStart; mainCursor < cursorStop; mainCursor++) {

        const token = tokens[mainCursor];

        if (spanSymbols.has(token)) {

            const spanStopSymbol = spanSymbols.get(token)!;

            let spanStopPosition = mainCursor + 1;
            for (; spanStopPosition < tokens.length; spanStopPosition++) {
                if (tokens[spanStopPosition] === spanStopSymbol) {
                    break;
                }
            }

            if (spanStopPosition === tokens.length) {
                throw `missing ${spanStopSymbol} for ${token} at ${offset}`;
            }

            if (spanStopPosition === mainCursor + 1) {
                result.push({
                    type: 'span',
                    start: token,
                    stop: spanStopSymbol,
                    body: [],
                    offset,
                });
                offset += 1; // stop symbol
            } else {
                const body = token2ast(
                    tokens,
                    config,
                    offset + 1,
                    mainCursor + 1,
                    spanStopPosition,
                );
                result.push({
                    type: 'span',
                    start: token,
                    stop: spanStopSymbol,
                    body,
                    offset,
                });
                offset = body[body.length - 1].offset // last token offset
                    + tokens[spanStopPosition - 1].length; // last token length
                // the final offset modification will
                // solve the width of the stop symbol
            }

            mainCursor = spanStopPosition;
            // mainCursor++ automatically goes here

        } else if (normalSymbols.has(token)) {

            result.push({
                type: 'symbol',
                value: token,
                offset,
            });

        } else if (globSymbols.has(token[0])) {

            result.push({
                type: 'glob',
                value: token,
                offset,
            });

        } else if (numberCharacters.has(token[0])) {

            let suffixOffset = 0;
            for (; suffixOffset < token.length; suffixOffset++) {
                if (numberSuffixes.has(token[suffixOffset])) {
                    break;
                }
            }

            result.push({
                type: 'number',
                value: token.slice(0, suffixOffset),
                suffix: token.slice(suffixOffset),
                offset,
            });

        } else if (!spaceCharacters.has(token[0])) {

            result.push({
                type: 'word',
                value: token,
                offset,
            });

        }

        offset += token.length;

    }

    return result;

};
