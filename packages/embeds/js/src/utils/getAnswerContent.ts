import { InputSubmitContent } from '@/types'

export const getAnswerContent = (answer: InputSubmitContent): string => {
  if (answer.type === 'text') return answer.label ?? answer.value
  return answer.url
}
