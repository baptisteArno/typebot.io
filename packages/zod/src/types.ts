import type {
  ZodArray,
  ZodDate,
  ZodOptional,
  ZodString,
  ZodTypeAny,
  z,
} from "zod";

type OptionableZodType<T extends ZodTypeAny> = T | ZodOptional<T>;

export interface ZodLayoutMetadata<
  T extends ZodTypeAny,
  TInferred = z.input<T> | z.output<T>,
> {
  accordion?: string;
  label?: string;
  inputType?: "variableDropdown" | "textarea" | "password" | "code";
  lang?: "javascript" | "html" | "css" | "json";
  defaultValue?: T extends ZodDate ? string : TInferred;
  placeholder?: string;
  helperText?: string;
  direction?: "row" | "column";
  isRequired?: boolean;
  withVariableButton?: boolean;
  fetcher?: T extends OptionableZodType<ZodString> ? string : never;
  itemLabel?: T extends OptionableZodType<ZodArray<any>> ? string : never;
  isOrdered?: T extends OptionableZodType<ZodArray<any>> ? boolean : never;
  moreInfoTooltip?: string;
  isHidden?: boolean | ((currentObj: Record<string, any>) => boolean);
  isDebounceDisabled?: boolean;
  hiddenItems?: string[];
  mergeWithLastField?: boolean;
  toLabels?: (val?: string) => string | undefined;
}

export type ZodWithLayout = typeof z & {
  ZodType: {
    prototype: {
      layout?: (layout: ZodLayoutMetadata<z.ZodTypeAny>) => z.ZodTypeAny;
    };
  };
};

export type ZodWithOpenApi = typeof z & {
  ZodType: {
    prototype: {
      openapi?: (options: ZodOpenApiOptions) => z.ZodTypeAny;
    };
  };
  output: <T extends z.ZodTypeAny>(schema: T) => z.output<T>;
  input: <T extends z.ZodTypeAny>(schema: T) => z.input<T>;
};

export type ZodOpenApiOptions = {
  title?: string;
  description?: string;
  version?: string;
  license?: {
    name: string;
    url: string;
  };
  contact?: {
    name: string;
    email: string;
    url: string;
  };
};
