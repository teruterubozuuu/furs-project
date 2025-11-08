module.exports = {
  root: true,
  env: {
    es6: true,
    node: true, 
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module", 
  },
  // CRITICAL: Explicitly define Node.js globals to prevent 'not defined' errors
  globals: {
    'module': true,
    'exports': true,
    'process': true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    quotes: ["error", "double"],
    "no-console": "off",
  },
};