const sessionStorageKey = 'resultId'

export const getExistingResultIdFromSession = () => {
  try {
    return sessionStorage.getItem(sessionStorageKey) ?? undefined
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
