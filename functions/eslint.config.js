// eslint.config.js (ESM format for ESLint v9+)
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        process: "readonly",
        __dirname: "readonly",
      },
    },
    plugins: {
      // Add plugins here if needed
    },
    rules: {
      "no-restricted-globals": ["error", "name", "length"],
      "prefer-arrow-callback": "error",
      "quotes": ["error", "double", { allowTemplateLiterals: true }],
    },
  },
];