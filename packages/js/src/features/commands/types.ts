import { PreviewMessageParams } from '../bubble/types'

export type CommandData = {
  isFromTypebot: boolean
} & (
  | {
      command: 'open' | 'toggle' | 'close' | 'hidePreviewMessage'
    }
  | ShowMessageCommandData
  | SetPrefilledVariablesCommandData
)

export type ShowMessageCommandData = {
  command: 'showPreviewMessage'
  message?: Pick<PreviewMessageParams, 'avatarUrl' | 'message'>
}

export type SetPrefilledVariablesCommandData = {
  command: 'setPrefilledVariables'
  variables: Record<string, string | number | boolean>
}
