/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Typebot docs",
  tagline: "Get to Typebot next level with its documentation",
  url: "https://docs.typebot.io",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.png",
  organizationName: "Typebot_io", // Usually your GitHub org/user name.
  themeConfig: {
    navbar: {
      title: "Typebot",
      logo: {
        alt: "Typebot Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          href: "https://github.com/typebot-io/docs",
          label: "Contribute",
          position: "right",
        },
      ],
    },
    algolia: {
      apiKey: "d2e121d4ad4e5346ac2c3329424981a1",
      indexName: "typebot",
      appId: "DXYNLHZTGJ",
    },
    footer: {
      links: [
        {
          title: "Product",
          items: [
            {
              label: "Homepage",
              to: "https://www.typebot.io",
            },
            {
              label: "Roadmap",
              to: "https://feedback.typebot.io",
            },
            {
              label: "Blog",
              to: "https://www.typebot.io/blog",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Facebook Group",
              href: "https://www.facebook.com/groups/typebot",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/Typebot_io",
            },
          ],
        },
        {
          title: "Company",
          items: [
            {
              label: "About",
              to: "https://www.typebot.io/about",
            },
            {
              label: "Terms of Service",
              href: "https://www.typebot.io/terms-of-service",
            },
            {
              label: "Privacy Policy",
              href: "https://www.typebot.io/privacy-policies",
            },
          ],
        },
      ],
    },
    colorMode: {
      disableSwitch: true,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
  scripts: ["https://unpkg.com/typebot-js", "/scripts/typebot.js"],
};
