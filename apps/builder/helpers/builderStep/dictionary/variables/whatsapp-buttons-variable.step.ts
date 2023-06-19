import { WritableDraft } from "immer/dist/internal";
import { OctaWabaStepType, DraggableStep, InputStepType, Typebot } from "models";
import { parseNewStep } from "services/typebots";

const templateVariableButtonsBot = (typebot: WritableDraft<Typebot>, blockId: string, placeholder: string): Array<DraggableStep> => {
  const VariableStep = [
    {
      ...parseNewStep(OctaWabaStepType.WHATSAPP_BUTTONS_LIST, blockId),
      content: {
        html: `<div>${placeholder}</div>`,
        richText: [
          {
            children: [
              {
                text: `${placeholder}`,
              },
            ],
            type: 'p',
          },
        ],
        plainText: `${placeholder}`,
      },
    } as DraggableStep,
    parseNewStep(InputStepType.TEXT, blockId)
  ];

  return VariableStep.reverse();
}

export { templateVariableButtonsBot };
