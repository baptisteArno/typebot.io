import { WritableDraft } from "immer/dist/internal";
import { BubbleStepType, DraggableStep, InputStepType, Typebot } from "models";
import { parseNewStep } from "services/typebots";

const templateMailBot = (typebot: WritableDraft<Typebot>, blockId: string): Array<DraggableStep> => {
  const EmailStep = [
    {
      ...parseNewStep(BubbleStepType.TEXT, blockId),
        content: {
        html: "<div>Antes, quero saber qual seu email :)</div>",
        richText: [{
          children: [{
            text: "Antes, quero saber qual seu email :)",
          }],
          type: "p"
        }],
        plainText: "Antes, quero saber qual seu email :)",
      }
    } as DraggableStep,
    parseNewStep(InputStepType.EMAIL, blockId)
  ];

  return EmailStep.reverse();
}

export { templateMailBot };