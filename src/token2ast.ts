import { TokenizeOptions, tokenizeDefaults } from './tokenize';

export type ASTNodeBase<T, U> = {
    type: T;
    offset: number;
    line: number;
} & U;
/** dts2md break */
export type GlobNode = ASTNodeBase<'glob', {
    value: string;
}>;
/** dts2md break */
export type NumberNode = ASTNodeBase<'number', {
    value: string;
    suffix: string;
}>;
/** dts2md break */
export type WordNode = ASTNodeBase<'word', {
    value: string;
}>;
/** dts2md break */
export type SymbolNode = ASTNodeBase<'symbol', {
    value: string;
}>;
/** dts2md break */
export type SpanNode = ASTNodeBase<'span', {
    start: string;
    stop: string;
    body: readonly ASTNode[];
}>;
/** dts2md break */
export type ASTNode = GlobNode | NumberNode | WordNode | SymbolNode | SpanNode;
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
export interface ASTResult {
    /**
     * The result of the AST parsing
     */
    ast: readonly ASTNode[];
    /**
     * The character offset of the upcoming character
     */
    stopOffset: number;
    /**
     * The line number of the last line
     */
    stopLine: number;
}
/** dts2md break */
/**
 * Convert tokens to AST nodes
 */
export const token2ast = (
    tokens: string[],
    options?: Partial<ASTOptions>,
    initOffset = 0,
    initLine = 1,
    cursorStart = 0,
    cursorStop = tokens.length,
): ASTResult => {

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
    let line = initLine;

    for (let mainCursor = cursorStart; mainCursor < cursorStop; mainCursor++) {

        const token = tokens[mainCursor];

        if (spanSymbols.has(token)) {

            const spanStopSymbol = spanSymbols.get(token)!;
            let nested = 0;

            let spanStopPosition = mainCursor + 1;
            for (; spanStopPosition < tokens.length; spanStopPosition++) {
                if (tokens[spanStopPosition] === token) {
                    nested++;
                    continue;
                }
                if (tokens[spanStopPosition] === spanStopSymbol) {
                    if (!nested) {
                        break;
                    }
                    nested--;
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
                    line,
                });

                offset += 1; // stop symbol

            } else {

                const ast = token2ast(
                    tokens,
                    config,
                    offset + 1,
                    line,
                    mainCursor + 1,
                    spanStopPosition,
                );

                const body = ast.ast;

                result.push({
                    type: 'span',
                    start: token,
                    stop: spanStopSymbol,
                    body,
                    offset,
                    line,
                });

                offset = ast.stopOffset;
                line = ast.stopLine;

            }

            mainCursor = spanStopPosition;
            // mainCursor++ automatically goes here

        } else if (normalSymbols.has(token)) {

            result.push({
                type: 'symbol',
                value: token,
                offset,
                line,
            });

        } else if (globSymbols.has(token[0])) {

            result.push({
                type: 'glob',
                value: token,
                offset,
                line,
            });

        } else if (numberCharacters.has(token[0])) {

            let suffixOffset = token.length - 1;
            for (; suffixOffset >= 0; suffixOffset--) {
                if (!numberSuffixes.has(token[suffixOffset])) {
                    break;
                }
            }
            suffixOffset++;

            result.push({
                type: 'number',
                value: token.slice(0, suffixOffset),
                suffix: token.slice(suffixOffset),
                offset,
                line,
            });

        } else if (!spaceCharacters.has(token[0])) {

            result.push({
                type: 'word',
                value: token,
                offset,
                line,
            });

        }

        offset += token.length;

        for (let i = 0; i < token.length; i++) {
            if (token[i] === '\n') {
                line++;
            }
        }

    }

    return {
        ast: result,
        stopOffset: offset,
        stopLine: line,
    };

};
