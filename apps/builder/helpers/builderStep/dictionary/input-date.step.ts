import { WritableDraft } from "immer/dist/internal";
import { BubbleStepType, DraggableStep, InputStepType, Typebot } from "models";
import { parseNewStep } from "services/typebots";

const templateDateBot = (typebot: WritableDraft<Typebot>, blockId: string, placeholder: string): Array<DraggableStep> => {
  const DateStep = [
    {
      ...parseNewStep(BubbleStepType.TEXT, blockId),
        content: {
        html: `<div style="margin-left: 8px;">${placeholder}</div>`,
        richText: [{
          children: [{
            text: `${placeholder}`,
          }],
          type: "p"
        }],
        plainText: `${placeholder}`,
      }
    } as DraggableStep,
    parseNewStep(InputStepType.DATE, blockId)
  ];

  return DateStep.reverse();
}

export { templateDateBot };
