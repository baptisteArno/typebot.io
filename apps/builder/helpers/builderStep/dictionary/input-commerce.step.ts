import { WritableDraft } from "immer/dist/internal";
import { BubbleStepType, DraggableStep, InputStepType, OctaStepType, Typebot } from "models";
import { parseNewStep } from "services/typebots";

const templateCommerceStep = (typebot: WritableDraft<Typebot>, blockId: string, placeholder: string): Array<DraggableStep> => {
  const CommerceStep = [
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
    parseNewStep(OctaStepType.COMMERCE, blockId),
  ];

  return CommerceStep.reverse();
}

export { templateCommerceStep };
