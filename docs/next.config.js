const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
  staticImage: true,
  flexsearch: true,
  defaultShowCopyCode: true,
  readingTime: true,
});

module.exports = withNextra({
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
});
