export const breakpoints = {
  md: 768,
};

export const currentBaseUrl = "https://typebot.com";
export const signinUrl = "https://app.typebot.com/signin";
export const registerUrl = "https://app.typebot.com/register";
export const dashboardUrl = "https://app.typebot.com/typebots";
export const githubRepoUrl = "https://github.com/baptisteArno/typebot.io";
export const blueskyUrl = "https://bsky.app/profile/typebot.io";
export const linkedInUrl = "https://www.linkedin.com/company/typebot";
export const discordUrl = "https://typebot.com/discord";
export const docsUrl = "https://docs.typebot.com";
export const howToGetHelpUrl = `${docsUrl}/guides/how-to-get-help`;
export const stripeClimateUrl = "https://climate.stripe.com/5VCRAq";
export const enterpriseLeadTypebotUrl =
  "https://typebot.io/enterprise-lead-form";

export const legacyRedirects = {
  "/typebot-lib": "https://unpkg.com/typebot-js@2.0.21/dist/index.umd.min.js",
  "/typebot-lib/v2": "https://unpkg.com/typebot-js@2.1.3/dist/index.umd.min.js",
} as const;
