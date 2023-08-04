import { Step } from "models"
import { isBubbleStepType, isInputStep, isMediaBubbleStep, isOctaBubbleStep, isTextBubbleStep } from "utils"

export enum VALIDATION_MESSAGE_TYPE {
    WARNING = 'WARNING',
    ERROR = 'ERROR',
}

export type ValidationMessage = {
    type: VALIDATION_MESSAGE_TYPE
    message: Array<string>
}

export const getValidationMessages = (step: Step): Array<ValidationMessage> => {
    if (isInputStep(step)) {
        if (!step?.options?.message?.plainText?.length) return [{
            type: VALIDATION_MESSAGE_TYPE.WARNING,
            message: ['Texto da pergunta vazio. Preencha com a pergunta para que o cliente saiba que deve responder. O bot ficará travado até que o cliente mande outra mensagem']
        }]

    }

    return []
}