module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2021: true,
        jest: true,
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: "latest",
    },
    rules: {
        indent: ["error", 4, { SwitchCase: 1 }],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        "no-unused-vars": ["error", { args: "none" }],
        "no-constant-condition": ["error", { checkLoops: false }],
        "no-async-promise-executor": "off",
    },
};
