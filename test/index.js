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
            HA.tokenize('{ \'"``"\', `abc`, "`" }'),
            [
                '{', ' ', '\'"``"\'', ',', ' ',
                '`abc`', ',', ' ', '"`"', ' ', '}',
            ]
        );
    },

    token2ast(context) {
        const ast = HA.token2ast([
            'max', '{', 'a', ' ', '+', ' ',
            '`b`', ',', ' ', '3.14D', '}', ';',
        ]);
        // @ts-ignore
        const { body } = ast[1];
        context.assertStrictEqual(ast.length, 3);
        context.assertShallowEqual(ast[0], { type: 'word', value: 'max', offset: 0 });
        context.assertStrictEqual(ast[1].type, 'span');
        context.assertStrictEqual(ast[1].offset, 3);
        context.assertStrictEqual(body.length, 5);
        context.assertShallowEqual(body[0], { type: 'word', value: 'a', offset: 4 });
        context.assertShallowEqual(body[1], { type: 'symbol', value: '+', offset: 6 });
        context.assertShallowEqual(body[2], { type: 'glob', value: '`b`', offset: 8 });
        context.assertShallowEqual(body[3], { type: 'symbol', value: ',', offset: 11 });
        context.assertShallowEqual(body[4], { type: 'number', value: '3.14', suffix: 'D', offset: 13 });
        context.assertShallowEqual(ast[2], { type: 'symbol', value: ';', offset: 19 });
    },

}).catch(console.error);
