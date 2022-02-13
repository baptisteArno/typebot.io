export const sendInfoMessage = (typebotInfo: string) => {
  parent.postMessage({ typebotInfo })
}
