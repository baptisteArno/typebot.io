const sessionStorageKey = 'resultId'

export const getExistingResultFromSession = () => {
  try {
    return sessionStorage.getItem(sessionStorageKey)
  } catch {
    /* empty */
  }
}

export const setResultInSession = (resultId: string) => {
  try {
    return sessionStorage.setItem(sessionStorageKey, resultId)
  } catch {
    /* empty */
  }
}
