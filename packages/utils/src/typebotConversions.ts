import { Typebot } from 'models'

export const convertTypebotToV2 = (typebot: any): Typebot => {
  const newTypebot = JSON.parse(
    JSON.stringify(typebot)
      .replace(/\"blocks\":/g, '"groups":')
      .replace(/\"steps\":/g, '"blocks":')
      .replace(/\"blockId\":/g, '"groupId":')
      .replace(/\"blockId\":/g, '"blockId":')
  )
  return {
    version: '2',
    ...newTypebot,
  }
}
