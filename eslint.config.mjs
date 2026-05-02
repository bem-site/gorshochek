import js from '@eslint/js';
import globals from 'globals';

export default [
    {
        ignores: [
            '.builder/**',
            'coverage/**',
            'data/**',
            'lib/**',
            'node_modules/**'
        ]
    },
    js.configs.recommended,
    {
        files: [
            '**/*.js'
        ],
        languageOptions: {
            ecmaVersion: 2024,
            globals: {
                ...globals.node,
                ...globals.mocha
            },
            sourceType: 'commonjs'
        }
    }
];
