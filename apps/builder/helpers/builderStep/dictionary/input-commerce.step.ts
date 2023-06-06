import { WritableDraft } from "immer/dist/internal";
import { BubbleStepType, DraggableStep, InputStepType, OctaStepType, Typebot, WabaStep, OctaWabaStepType } from "models";
import { parseNewStep } from "services/typebots";

const templateCommerceStep = (typebot: WritableDraft<Typebot>, blockId: string, placeholder: string): Array<DraggableStep> => {
  const CommerceStep = [
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
    // parseNewStep(OctaWabaStepType.COMMERCE, blockId),
  ];

  return CommerceStep.reverse();
}

export { templateCommerceStep };
