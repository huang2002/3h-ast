// @ts-check
const { test } = require('3h-test');
const HA = require('..');

test(null, {

    tokenize(context) {
        context.assertShallowEqual(
            HA.tokenize('a = fun(1011B, [c1 + 3.1415 > 1.1H]);'),
            [
                'a', ' ', '=', ' ', 'fun', '(',
                '1011B', ',', ' ', '[', 'c1',
                ' ', '+', ' ', '3.1415', ' ',
                '>', ' ', '1.1H', ']', ')', ';',
            ]
        );
        context.assertShallowEqual(
            HA.tokenize('{ \'"``"\', `\\abc\\t\\r\\n\\\n`, "\\`" }'),
            [
                '{', ' ', '\'"``"\'', ',', ' ',
                '`\\abc\t\r\n\n`', ',', ' ',
                '"`"', ' ', '}',
            ]
        );
    },

    token2ast(context) {

        const ast1 = HA.token2ast(['{', '}']);
        context.assertStrictEqual(ast1.stopOffset, 2);
        context.assertStrictEqual(ast1.stopLine, 1);
        context.assertStrictEqual(ast1.ast.length, 1);
        context.assertStrictEqual(ast1.ast[0].type, 'span');
        context.assertStrictEqual(/** @type {HA.SpanNode} */(ast1.ast[0]).start, '{');
        context.assertStrictEqual(/** @type {HA.SpanNode} */(ast1.ast[0]).stop, '}');
        context.assertStrictEqual(/** @type {HA.SpanNode} */(ast1.ast[0]).body.length, 0);
        context.assertStrictEqual(ast1.ast[0].offset, 0);
        context.assertStrictEqual(ast1.ast[0].line, 1);

        const ast2 = HA.token2ast([
            'max', '{',
            '\n\t', 'a', ' ', '+', ' ', '`b`', ',',
            '\n\t', '3.14D', '\n',
            '}', ';',
        ]);
        // @ts-ignore
        const { body } = ast2.ast[1];
        context.assertStrictEqual(ast2.stopOffset, 24);
        context.assertStrictEqual(ast2.stopLine, 4);
        context.assertStrictEqual(ast2.ast.length, 3);
        context.assertShallowEqual(ast2.ast[0], {
            type: 'word',
            value: 'max',
            offset: 0,
            line: 1,
        });
        context.assertStrictEqual(ast2.ast[1].type, 'span');
        context.assertStrictEqual(ast2.ast[1].offset, 3);
        context.assertStrictEqual(ast2.ast[1].line, 1);
        context.assertStrictEqual(/** @type {HA.SpanNode} */(ast2.ast[1]).start, '{');
        context.assertStrictEqual(/** @type {HA.SpanNode} */(ast2.ast[1]).stop, '}');
        context.assertStrictEqual(body.length, 5);
        context.assertShallowEqual(body[0], {
            type: 'word',
            value: 'a',
            offset: 6,
            line: 2,
        });
        context.assertShallowEqual(body[1], {
            type: 'symbol',
            value: '+',
            offset: 8,
            line: 2,
        });
        context.assertShallowEqual(body[2], {
            type: 'glob',
            value: '`b`',
            offset: 10,
            line: 2,
        });
        context.assertShallowEqual(body[3], {
            type: 'symbol',
            value: ',',
            offset: 13,
            line: 2,
        });
        context.assertShallowEqual(body[4], {
            type: 'number',
            value: '3.14',
            suffix: 'D',
            offset: 16,
            line: 3,
        });
        context.assertShallowEqual(ast2.ast[2], {
            type: 'symbol',
            value: ';',
            offset: 23,
            line: 4,
        });

    },

}).catch(console.error);
