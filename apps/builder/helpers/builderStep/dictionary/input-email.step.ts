import { WritableDraft } from "immer/dist/internal";
import { BubbleStepType, DraggableStep, InputStepType, Typebot } from "models";
import { parseNewStep } from "services/typebots";

const templateMailBot = (typebot: WritableDraft<Typebot>, blockId: string): Array<DraggableStep> => {
  const EmailStep = [
    {
      id: typebot.id,
      blockId: blockId,
      type: BubbleStepType.TEXT,
      content: {
        html: "<div>Por favor, {{Nome}} nos informe o seu e-mail</div>",
        richText: [{
          children: new Array(0),
          type: "p"
        }],
        plainText: "Por favor, {{Nome}} nos informe o seu e-mail"
      }
      } as DraggableStep,
      parseNewStep(InputStepType.EMAIL, blockId)
  ];

  console.log("Email => Steps: ", EmailStep);
  

  return EmailStep.reverse();
}

export { templateMailBot };