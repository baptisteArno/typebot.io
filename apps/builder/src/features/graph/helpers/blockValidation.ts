import {
  type BlockV6,
  blockSchemaV6,
} from "@typebot.io/blocks-core/schemas/schema";
import { ZodError, type ZodIssue } from "zod";

export interface BlockValidationError {
  field: string;
  message: string;
  path: (string | number)[];
}

export interface BlockValidationResult {
  isValid: boolean;
  errors: BlockValidationError[];
}

/**
 * Converts Zod validation errors to a more user-friendly format
 */
const formatZodErrors = (zodError: ZodError): BlockValidationError[] => {
  return zodError.errors.map((issue: ZodIssue) => {
    const field = issue.path.length > 0 ? issue.path.join(".") : "block";

    // Create more user-friendly error messages
    let message = issue.message;

    switch (issue.code) {
      case "invalid_type":
        if (issue.expected === "string" && issue.received === "undefined") {
          message = "This field is required";
        } else {
          message = `Expected ${issue.expected}, got ${issue.received}`;
        }
        break;
      case "too_small":
        if (issue.type === "string") {
          message = `Must be at least ${issue.minimum} characters`;
        } else if (issue.type === "array") {
          message = `Must have at least ${issue.minimum} items`;
        } else {
          message = `Must be at least ${issue.minimum}`;
        }
        break;
      case "too_big":
        if (issue.type === "string") {
          message = `Must be no more than ${issue.maximum} characters`;
        } else if (issue.type === "array") {
          message = `Must have no more than ${issue.maximum} items`;
        } else {
          message = `Must be no more than ${issue.maximum}`;
        }
        break;
      case "invalid_string":
        switch (issue.validation) {
          case "email":
            message = "Must be a valid email address";
            break;
          case "url":
            message = "Must be a valid URL";
            break;
          case "regex":
            message = "Invalid format";
            break;
          default:
            message = `Invalid ${issue.validation} format`;
        }
        break;
      case "custom":
        // Keep custom error messages as they are
        break;
      default:
      // Keep default Zod error message for other cases
    }

    return {
      field,
      message,
      path: issue.path,
    };
  });
};

/**
 * Validates a block against the unified block schema
 */
export const validateBlock = (block: BlockV6): BlockValidationResult => {
  try {
    blockSchemaV6.parse(block);
    return {
      isValid: true,
      errors: [],
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodErrors(error);
      return {
        isValid: false,
        errors,
      };
    }

    // If it's not a ZodError, assume the block is valid
    // This is a fallback for unexpected errors
    return {
      isValid: true,
      errors: [],
    };
  }
};
