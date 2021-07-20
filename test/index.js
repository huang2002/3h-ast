// @ts-check
const { test } = require('3h-test');
const HA = require('..');

test(null, {

    tokenize(context) {
        context.assertShallowEqual(
            HA.tokenize('a += fun(1011B, [c1 + 3.1415 > 1.AH]);'),
            [
                'a', ' ', '+=', ' ', 'fun', '(',
                '1011B', ',', ' ', '[', 'c1',
                ' ', '+', ' ', '3.1415', ' ',
                '>', ' ', '1.AH', ']', ')', ';',
            ]
        );
        context.assertShallowEqual(
            HA.tokenize('{ \'"``"\', `\\Hi\\t\\r\\n\\\n`, "\\`" }'),
            [
                '{', ' ', '\'"``"\'', ',', ' ',
                '`\\Hi\t\r\n\n`', ',', ' ',
                '"`"', ' ', '}',
            ]
        );
        context.assertShallowEqual(
            HA.tokenize("import('math').E |> print"),
            ['import', '(', "'math'", ')', '.', 'E', ' ', '|>', ' ', 'print']
        );
        context.assertShallowEqual(
            HA.tokenize("if (a ** 2 >= b && c):\n    d << 1"),
            [
                'if', ' ', '(', 'a', ' ', '**', ' ', '2', ' ', '>=', ' ', 'b', ' ',
                '&&', ' ', 'c', ')', ':', '\n    ', 'd', ' ', '<<', ' ', '1',
            ]
        );
    },

    token2ast(context) {

        context.expectThrow(HA.token2ast, SyntaxError, [['"']]);

        const ast1 = HA.token2ast(['{', '}']);
        context.assertStrictEqual(ast1.stopOffset, 2);
        context.assertStrictEqual(ast1.stopLine, 1);
        context.assertStrictEqual(ast1.stopColumn, 2);
        context.assertStrictEqual(ast1.ast.length, 1);
        context.assertStrictEqual(ast1.ast[0].type, 'span');
        context.assertStrictEqual(/** @type {HA.SpanNode} */(ast1.ast[0]).start, '{');
        context.assertStrictEqual(/** @type {HA.SpanNode} */(ast1.ast[0]).stop, '}');
        context.assertStrictEqual(/** @type {HA.SpanNode} */(ast1.ast[0]).body.length, 0);
        context.assertStrictEqual(ast1.ast[0].offset, 0);
        context.assertStrictEqual(ast1.ast[0].line, 1);
        context.assertStrictEqual(ast1.ast[0].column, 1);

        const ast2 = HA.token2ast([
            'max', '{',
            '\n\t', '(', '(', 'a', ' ', '+', ' ', '`b`', ')', ')', ',',
            '\n\t', '3.14D', ' ', '**', ' ', '2', '\n',
            '}', ';',
        ]);
        const { body } = /** @type {HA.SpanNode} */(ast2.ast[1]);
        context.assertStrictEqual(ast2.stopOffset, 33);
        context.assertStrictEqual(ast2.stopLine, 4);
        context.assertStrictEqual(ast2.stopColumn, 3);
        context.assertStrictEqual(ast2.ast.length, 3);
        context.assertShallowEqual(ast2.ast[0], {
            type: 'word',
            value: 'max',
            offset: 0,
            line: 1,
            column: 1,
        });
        context.assertStrictEqual(ast2.ast[1].type, 'span');
        context.assertStrictEqual(ast2.ast[1].offset, 3);
        context.assertStrictEqual(ast2.ast[1].line, 1);
        context.assertStrictEqual(ast2.ast[1].column, 4);
        context.assertStrictEqual(/** @type {HA.SpanNode} */(ast2.ast[1]).start, '{');
        context.assertStrictEqual(/** @type {HA.SpanNode} */(ast2.ast[1]).stop, '}');
        context.assertStrictEqual(body.length, 5);
        context.assertDeepEqual(body[0], {
            type: 'span',
            start: '(',
            stop: ')',
            offset: 6,
            line: 2,
            column: 2,
            body: [{
                type: 'span',
                start: '(',
                stop: ')',
                offset: 7,
                line: 2,
                column: 3,
                body: [{
                    type: 'word',
                    value: 'a',
                    offset: 8,
                    line: 2,
                    column: 4,
                }, {
                    type: 'symbol',
                    value: '+',
                    offset: 10,
                    line: 2,
                    column: 6,
                }, {
                    type: 'glob',
                    value: '`b`',
                    offset: 12,
                    line: 2,
                    column: 8,
                }],
            }],
        });
        context.assertShallowEqual(body[1], {
            type: 'symbol',
            value: ',',
            offset: 17,
            line: 2,
            column: 13,
        });
        context.assertShallowEqual(body[2], {
            type: 'number',
            value: '3.14',
            suffix: 'D',
            offset: 20,
            line: 3,
            column: 2,
        });
        context.assertShallowEqual(body[3], {
            type: 'symbol',
            value: '**',
            offset: 26,
            line: 3,
            column: 8,
        });
        context.assertShallowEqual(body[4], {
            type: 'number',
            value: '2',
            suffix: '',
            offset: 29,
            line: 3,
            column: 11,
        });
        context.assertShallowEqual(ast2.ast[2], {
            type: 'symbol',
            value: ';',
            offset: 32,
            line: 4,
            column: 2,
        });
    },

});
