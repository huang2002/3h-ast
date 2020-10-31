import { ASTOptions, token2ast } from './token2ast';
import { tokenize } from './tokenize';

export const parse = (source: string, options?: ASTOptions) => (
    token2ast(tokenize(source, options), options)
);
