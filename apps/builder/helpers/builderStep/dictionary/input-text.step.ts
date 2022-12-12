import { WritableDraft } from "immer/dist/internal";
import { BubbleStepType, DraggableStep, InputStepType, Typebot } from "models";
import { parseNewStep } from "services/typebots";

const templateTextBot = (typebot: WritableDraft<Typebot>, blockId: string, placeholder: string): Array<DraggableStep> => {
  const TextStep = [
    {
      ...parseNewStep(BubbleStepType.TEXT, blockId),
        content: {
        html: `<div>${placeholder}</div>`,
        richText: [{
          children: [{
            text: `${placeholder}`,
          }],
          type: "p"
        }],
        plainText: `${placeholder}`,
      }
    } as DraggableStep,
    parseNewStep(InputStepType.TEXT, blockId)
  ];

  return TextStep.reverse();
}

export { templateTextBot };
