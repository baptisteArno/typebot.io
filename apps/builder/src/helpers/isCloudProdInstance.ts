export const isCloudProdInstance =
  typeof window !== 'undefined' && window.location.hostname === 'app.typebot.io'
