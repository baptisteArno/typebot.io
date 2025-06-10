import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import { useMemo } from "react";
import {
  type BlockValidationError,
  validateBlock,
} from "../helpers/blockValidation";

export const useBlockValidation = (block: BlockV6) => {
  const validationResult = useMemo(() => {
    return validateBlock(block);
  }, [block]);

  return {
    isValid: validationResult.isValid,
    errors: validationResult.errors,
    hasErrors: validationResult.errors.length > 0,
  };
};

export type { BlockValidationError };
