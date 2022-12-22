export const injectHeadCode = (headCode: string) => {
  document.head.innerHTML = document.head.innerHTML + headCode
}
