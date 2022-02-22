export const sendInfoMessage = (typebotInfo: string) => {
  parent.postMessage({ typebotInfo })
}

export const sendErrorMessage = (typebotError: string) => {
  parent.postMessage({ typebotError })
}
