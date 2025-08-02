/**
 * Logic block types that should be excluded from localization.
 * These blocks contain technical configuration and programming logic,
 * not user-facing content that should be translated.
 */
export const LOGIC_BLOCK_TYPES = [
  "Set variable",
  "Condition",
  "Redirect",
  "Code",
  "Typebot link",
  "Wait",
  "AB test",
  "webhook",
  "Jump",
  "Return",
] as const;

/**
 * Check if a block type is a logic block that should be excluded from localization
 */
export const isLogicBlock = (blockType: string): boolean => {
  return LOGIC_BLOCK_TYPES.includes(blockType as any);
};
