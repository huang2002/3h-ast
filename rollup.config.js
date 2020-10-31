import babel from "@rollup/plugin-babel";

const input = './js/index.js';

export default [
    {
        input,
        plugins: [
            babel({
                babelHelpers: 'bundled'
            })
        ],
        output: {
            format: 'umd',
            name: 'HA',
            file: './dist/3h-ast.umd.js'
        }
    },
    {
        input,
        output: {
            format: 'esm',
            file: './dist/3h-ast.js'
        }
    }
];
