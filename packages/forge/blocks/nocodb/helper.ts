export const ReduceKeyValueListToRecord = (
  KeyValueList: { key?: string | undefined; value?: any | undefined }[]
) => {
  return KeyValueList.reduce((acc, record) => {
    if (!record.key) return acc

    var value = record.value || null
    const obj: Record<string, any> = { [record.key]: value }

    return { ...acc, ...obj }
  }, {})
}
