/**
 * ESLint configuration for Next.js apps with a11y rules
 */

const { resolve } = require("node:path");

module.exports = {
  extends: [
    "next/core-web-vitals",
    "next/typescript",
    "plugin:jsx-a11y/recommended",
  ],
  parserOptions: {
    project: true,
  },
  rules: {
    "@next/next/no-html-link-for-pages": "warn",
    "jsx-a11y/anchor-is-valid": [
      "warn",
      {
        components: ["Link"],
        specialLink: ["hrefLeft", "hrefRight"],
        aspects: ["invalidHref", "preferButton"],
      },
    ],
    "jsx-a11y/alt-text": [
      "warn",
      {
        elements: ["img", "area", 'input[type="image"]'],
        img: ["Image"],
      },
    ],
  },
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
    "import/resolver": {
      typescript: {},
    },
  },
};
