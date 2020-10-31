import { ASTOptions, token2ast } from './token2ast';
import { tokenize } from './tokenize';
/**
 * Convert source code into AST nodes
 */
export const parse = (source: string, options?: ASTOptions) => (
    token2ast(tokenize(source, options), options)
);
