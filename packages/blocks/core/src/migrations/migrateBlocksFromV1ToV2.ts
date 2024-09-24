import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { GoogleSheetsAction } from "@typebot.io/blocks-integrations/googleSheets/constants";
import type {
  GoogleSheetsBlockV5,
  GoogleSheetsBlockV6,
} from "@typebot.io/blocks-integrations/googleSheets/schema";
import { ComparisonOperators } from "@typebot.io/conditions/constants";
import { createId } from "@typebot.io/lib/createId";
import type { BlockV5, BlockV6 } from "../schemas/schema";

export const migrateBlocksFromV1ToV2 = (blocks: BlockV5[]): BlockV6[] =>
  (
    blocks.filter((block) => block.type !== "start") as Exclude<
      BlockV5,
      { type: "start" }
    >[]
  ).map((block) => {
    if (block.type === IntegrationBlockType.GOOGLE_SHEETS) {
      return {
        ...block,
        options: migrateGoogleSheetsOptions(block.options),
      };
    }
    return block;
  });

const migrateGoogleSheetsOptions = (
  options: GoogleSheetsBlockV5["options"],
): GoogleSheetsBlockV6["options"] => {
  if (!options) return;
  if (options.action === GoogleSheetsAction.GET) {
    if (options.filter || !options.referenceCell) return options;
    return {
      ...options,
      filter: {
        comparisons: [
          {
            id: createId(),
            column: options.referenceCell?.column,
            comparisonOperator: ComparisonOperators.EQUAL,
            value: options.referenceCell?.value,
          },
        ],
      },
    };
  }
  if (options.action === GoogleSheetsAction.INSERT_ROW) {
    return options;
  }
  if (options.action === GoogleSheetsAction.UPDATE_ROW) {
    if (options.filter || !options.referenceCell) return options;
    return {
      ...options,
      filter: {
        comparisons: [
          {
            id: createId(),
            column: options.referenceCell?.column,
            comparisonOperator: ComparisonOperators.EQUAL,
            value: options.referenceCell?.value,
          },
        ],
      },
    };
  }
  return options;
};
