import { WritableDraft } from 'immer/dist/types/types-external'
import { DraggableStepType, Typebot } from "models";

export type BuilderStepType = {
  apply: (type: DraggableStepType, bot: WritableDraft<Typebot>, blockId: string) => void;
}