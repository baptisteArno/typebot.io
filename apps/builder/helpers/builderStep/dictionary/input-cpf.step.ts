import { WritableDraft } from "immer/dist/internal";
import { BubbleStepType, DraggableStep, InputStepType, Typebot } from "models";
import { parseNewStep } from "services/typebots";

const templateCpfBot = (typebot: WritableDraft<Typebot>, blockId: string): Array<DraggableStep> => {
  const CpfStep = [
    {
      ...parseNewStep(BubbleStepType.TEXT, blockId),
        content: {
        html: "<div>Antes, quero saber qual seu CPF :)</div>",
        richText: [{
          children: [{
            text: "Antes, quero saber qual seu CPF :)",
          }],
          type: "p"
        }],
        plainText: "Antes, quero saber qual seu CPF :)",
      }
    } as DraggableStep,
    parseNewStep(InputStepType.CPF, blockId)
  ];

  return CpfStep.reverse();
}

export { templateCpfBot };