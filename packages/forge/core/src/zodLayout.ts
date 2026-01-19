import type { z } from "zod";

export type ZodLayoutMetadata<TDefaultValue = unknown> = {
  accordion?: string;
  label?: string;
  inputType?: "variableDropdown" | "textarea" | "password" | "code";
  lang?: "javascript" | "html" | "css" | "json";
  defaultValue?: TDefaultValue;
  placeholder?: string;
  helperText?: string;
  direction?: "row" | "column";
  isRequired?: boolean;
  withVariableButton?: boolean;
  fetcher?: string;
  itemLabel?: string;
  isOrdered?: boolean;
  moreInfoTooltip?: string;
  isHidden?: boolean | ((currentObj: Record<string, unknown>) => boolean);
  isDebounceDisabled?: boolean;
  hiddenItems?: string[] | readonly string[];
  mergeWithLastField?: boolean;
  /** Useful for string options with fetcher when we also want to allow for custom text */
  toLabels?: (val?: string) => string | undefined;
  autoCompleteItems?: string[];
};

declare module "zod" {
  interface GlobalMeta {
    layout?: ZodLayoutMetadata<z.$input | z.$output>;
  }
}
