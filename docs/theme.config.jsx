const React = require("react");

const themeConfig = {
  logo: <span>Athletic Academics Hub</span>,
  project: {
    link: "https://github.com/your-org/athletic-academics-hub",
  },
  docsRepositoryBase:
    "https://github.com/your-org/athletic-academics-hub/tree/main/docs",
  footer: {
    text: "Built with Nextra",
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    backToTop: true,
    extraContent: (
      <div style={{ fontSize: "12px", marginTop: "24px" }}>
        Built with Next.js & Vercel
      </div>
    ),
  },
  editLink: {
    text: "Edit this page on GitHub →",
  },
  feedback: {
    content: "Question? Give us feedback →",
    labels: "feedback",
  },
};

module.exports = themeConfig;
