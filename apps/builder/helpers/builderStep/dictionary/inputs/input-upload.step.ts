import { WritableDraft } from 'immer/dist/internal'
import { BubbleStepType, DraggableStep, Typebot } from 'models'
import { parseNewStep } from 'services/typebots'
const templateUploadBot = (
  typebot: WritableDraft<Typebot>,
  blockId: string,
  message: string
): Array<DraggableStep> => {
  const UploadStep = [
    {
      ...parseNewStep(BubbleStepType.TEXT, blockId),
      content: {
        html: `<div>${message}</div>`,
        richText: [
          {
            children: [
              {
                text: `${message}`,
              },
            ],
            type: 'p',
          },
        ],
        plainText: `${message}`,
      },
    } as DraggableStep,
    parseNewStep(BubbleStepType.MEDIA, blockId),
  ]
  return UploadStep.reverse()
}
export { templateUploadBot }
