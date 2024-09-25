import type { Group } from "@typebot.io/groups/schemas";
import type { Prisma } from "@typebot.io/prisma/types";
import type {
  Log,
  ResultValuesInput,
} from "@typebot.io/results/schemas/results";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type {
  Variable,
  VariableWithUnknowValue,
} from "@typebot.io/variables/schemas";
import type { TypebotViewerProps } from "./components/TypebotViewer";
import type { LinkedTypebot } from "./providers/TypebotProvider";

export type InputSubmitContent = {
  label?: string;
  value: string;
  itemId?: string;
};

export type EdgeId = string;

export type LogicState = {
  isPreview: boolean;
  apiHost: string;
  typebot: TypebotViewerProps["typebot"];
  linkedTypebots: LinkedTypebot[];
  currentTypebotId: string;
  pushParentTypebotId: (id: string) => void;
  pushEdgeIdInLinkedTypebotQueue: (bot: {
    edgeId: string;
    typebotId: string;
  }) => void;
  setCurrentTypebotId: (id: string) => void;
  updateVariableValue: (variableId: string, value: unknown) => void;
  updateVariables: (variables: VariableWithUnknowValue[]) => void;
  injectLinkedTypebot: (typebot: Typebot | PublicTypebot) => LinkedTypebot;
  onNewLog: (log: Omit<Log, "id" | "createdAt" | "resultId">) => void;
  createEdge: (edge: Edge) => void;
};

export type IntegrationState = {
  apiHost: string;
  typebotId: string;
  groupId: string;
  blockId: string;
  isPreview: boolean;
  variables: Variable[];
  resultValues: ResultValuesInput;
  groups: Group[];
  resultId?: string;
  parentTypebotIds: string[];
  updateVariables: (variables: VariableWithUnknowValue[]) => void;
  updateVariableValue: (variableId: string, value: unknown) => void;
  onNewLog: (log: Omit<Log, "id" | "createdAt" | "resultId">) => void;
};
