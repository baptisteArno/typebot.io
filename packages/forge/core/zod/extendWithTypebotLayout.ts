import { ZodArray, ZodDate, ZodOptional, ZodString, ZodTypeAny, z } from 'zod'

type OptionableZodType<T extends ZodTypeAny> = T | ZodOptional<T>

export interface ZodLayoutMetadata<
  T extends ZodTypeAny,
  TInferred = z.input<T> | z.output<T>
> {
  accordion?: string
  label?: string
  input?: 'variableDropdown' | 'textarea' | 'password'
  defaultValue?: T extends ZodDate ? string : TInferred
  placeholder?: string
  helperText?: string
  direction?: 'row' | 'column'
  isRequired?: boolean
  withVariableButton?: boolean
  fetcher?: T extends OptionableZodType<ZodString> ? string : never
  itemLabel?: T extends OptionableZodType<ZodArray<any>> ? string : never
  isOrdered?: T extends OptionableZodType<ZodArray<any>> ? boolean : never
  isHidden?: boolean
  moreInfoTooltip?: string
}

declare module 'zod' {
  interface ZodType<Output, Def extends ZodTypeDef, Input = Output> {
    layout<T extends ZodTypeAny>(this: T, metadata: ZodLayoutMetadata<T>): T
  }

  interface ZodTypeDef {
    layout?: ZodLayoutMetadata<ZodTypeAny>
  }
}

export const extendWithTypebotLayout = (zod: typeof z) => {
  if (typeof zod.ZodType.prototype.layout !== 'undefined') {
    return
  }

  zod.ZodType.prototype.layout = function (layout) {
    const result = new (this as any).constructor({
      ...this._def,
      layout,
    })

    return result
  }
}
