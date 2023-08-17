export const isCloudProdInstance =
  (typeof window !== 'undefined' &&
    window.location.hostname === 'app.typebot.io') ||
  process.env.NEXTAUTH_URL === 'https://app.typebot.io'
