import { evaluateIsHidden } from "@typebot.io/forge/helpers/evaluateIsHidden";
import type { ZodLayoutMetadata } from "@typebot.io/forge/zodLayout";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { cx } from "@typebot.io/ui/lib/cva";
import Markdown, { type Components } from "react-markdown";
import { z } from "zod";
import { BasicAutocompleteInputWithVariableButton } from "@/components/inputs/BasicAutocompleteInput";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import {
  DebouncedTextarea,
  DebouncedTextareaWithVariablesButton,
} from "@/components/inputs/DebouncedTextarea";
import {
  DebouncedTextInput,
  DebouncedTextInputWithVariablesButton,
} from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import { PrimitiveList } from "@/components/PrimitiveList";
import { TableList } from "@/components/TableList";
import { TagsInput } from "@/components/TagsInput";
import { getZodInnerSchema } from "../../helpers/getZodInnerSchema";
import { getZodLayoutMetadata } from "../../helpers/getZodLayoutMetadata";
import { ForgeSelectInput } from "../ForgeSelectInput";
import { ZodDiscriminatedUnionLayout } from "./ZodDiscriminatedUnionLayout";
import { ZodObjectLayout } from "./ZodObjectLayout";

const parseEnumItems = (schema: z.ZodTypeAny, layout?: ZodLayoutMetadata) => {
  if (!isZodEnum(schema)) return [];
  const rawValues = schema.options.filter(isString);
  const values = layout?.hiddenItems
    ? rawValues.filter((value) => !layout.hiddenItems?.includes(value))
    : rawValues;
  if (layout?.toLabels)
    return values.map((value) => ({
      label: layout.toLabels!(value),
      value,
    }));
  return values;
};

const mdComponents = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="md-link"
    >
      {children}
    </a>
  ),
} satisfies Components;

export const ZodFieldLayout = ({
  data,
  schema,
  isInAccordion,
  blockDef,
  blockOptions,
  width,
  propName,
  onDataChange,
}: {
  data: any;
  schema: z.ZodTypeAny;
  isInAccordion?: boolean;
  blockDef?: ForgedBlockDefinition;
  blockOptions?: ForgedBlock["options"];
  width?: "full";
  propName?: string;
  onDataChange: (val: any) => void;
}) => {
  const innerSchema = getZodInnerSchema(schema);
  const layout = getZodLayoutMetadata(innerSchema);

  if (evaluateIsHidden(layout?.isHidden, blockOptions)) return null;

  if (layout?.inputType === "variableDropdown") {
    return (
      <Field.Root>
        {layout.label && (
          <Field.Label>
            {layout.label}
            {layout.moreInfoTooltip && (
              <MoreInfoTooltip>{layout.moreInfoTooltip}</MoreInfoTooltip>
            )}
          </Field.Label>
        )}
        <VariablesCombobox
          initialVariableId={data}
          onSelectVariable={(variable) => onDataChange(variable?.id)}
          placeholder={layout?.placeholder}
        />
        {layout?.helperText && (
          <Field.Description>
            <Markdown components={mdComponents}>{layout.helperText}</Markdown>
          </Field.Description>
        )}
      </Field.Root>
    );
  }

  const defType = innerSchema.type;
  const isDiscriminatedUnion = isZodDiscriminatedUnion(innerSchema);

  switch (defType) {
    case "object": {
      if (!isZodObject(innerSchema)) return null;
      return (
        <ZodObjectLayout
          schema={innerSchema}
          data={data}
          onDataChange={onDataChange}
          isInAccordion={isInAccordion}
          blockDef={blockDef}
          blockOptions={blockOptions}
        />
      );
    }
    case "union": {
      if (isDiscriminatedUnion) {
        return (
          <ZodDiscriminatedUnionLayout
            discriminant={innerSchema.def.discriminator}
            data={data}
            schema={innerSchema}
            dropdownPlaceholder={
              layout?.placeholder ?? `Select a ${innerSchema.def.discriminator}`
            }
            onDataChange={onDataChange}
          />
        );
      }
      return (
        <Field.Root>
          {layout?.label && (
            <Field.Label>
              {layout.label}
              {layout.moreInfoTooltip && (
                <MoreInfoTooltip>{layout.moreInfoTooltip}</MoreInfoTooltip>
              )}
            </Field.Label>
          )}
          <BasicNumberInput
            defaultValue={data ?? layout?.defaultValue}
            onValueChange={onDataChange}
            placeholder={layout?.placeholder}
          />
          {layout?.helperText && (
            <Field.Description>
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            </Field.Description>
          )}
        </Field.Root>
      );
    }
    case "array": {
      if (!isZodArray(innerSchema)) return null;
      return (
        <ZodArrayContent
          data={data}
          schema={innerSchema}
          blockDef={blockDef}
          blockOptions={blockOptions}
          layout={layout}
          onDataChange={onDataChange}
        />
      );
    }
    case "enum": {
      const enumDefaultValue = isString(layout?.defaultValue)
        ? layout.defaultValue
        : undefined;
      return (
        <Field.Root>
          {layout?.label && (
            <Field.Label>
              {layout.label}
              {layout.moreInfoTooltip && (
                <MoreInfoTooltip>{layout.moreInfoTooltip}</MoreInfoTooltip>
              )}
            </Field.Label>
          )}
          <BasicSelect
            value={data}
            defaultValue={enumDefaultValue}
            onChange={onDataChange}
            items={parseEnumItems(innerSchema, layout)}
            placeholder={layout?.placeholder}
          />
          {layout?.helperText && (
            <Field.Description>
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            </Field.Description>
          )}
        </Field.Root>
      );
    }
    case "number": {
      return (
        <Field.Root>
          {layout?.label && (
            <Field.Label>
              {layout.label}
              {layout.moreInfoTooltip && (
                <MoreInfoTooltip>{layout.moreInfoTooltip}</MoreInfoTooltip>
              )}
            </Field.Label>
          )}
          <BasicNumberInput
            defaultValue={data ?? layout?.defaultValue}
            onValueChange={onDataChange}
            placeholder={layout?.placeholder}
          />
          {layout?.helperText && (
            <Field.Description>
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            </Field.Description>
          )}
        </Field.Root>
      );
    }
    case "boolean": {
      return (
        <Field.Root className="flex-row items-center">
          <Switch
            checked={data ?? layout?.defaultValue}
            onCheckedChange={onDataChange}
          />
          <Field.Label>
            {layout?.label ?? propName ?? ""}{" "}
            {layout?.moreInfoTooltip && (
              <MoreInfoTooltip>{layout.moreInfoTooltip}</MoreInfoTooltip>
            )}
          </Field.Label>
        </Field.Root>
      );
    }
    case "string": {
      if (layout?.autoCompleteItems) {
        return (
          <Field.Root>
            {layout.label && (
              <Field.Label>
                {layout.label}
                {layout.moreInfoTooltip && (
                  <MoreInfoTooltip>{layout.moreInfoTooltip}</MoreInfoTooltip>
                )}
              </Field.Label>
            )}
            <BasicAutocompleteInputWithVariableButton
              items={layout.autoCompleteItems}
              defaultValue={data ?? layout.defaultValue}
              placeholder={layout.placeholder}
              onChange={onDataChange}
            />
            {layout?.helperText && (
              <Field.Description>
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              </Field.Description>
            )}
          </Field.Root>
        );
      }
      if (layout?.fetcher) {
        if (!blockDef) return null;
        return (
          <Field.Root>
            {layout.label && (
              <Field.Label>
                {layout.label}
                {layout.moreInfoTooltip && (
                  <MoreInfoTooltip>{layout.moreInfoTooltip}</MoreInfoTooltip>
                )}
              </Field.Label>
            )}
            <ForgeSelectInput
              defaultValue={data ?? layout.defaultValue}
              placeholder={layout.placeholder}
              fetcherId={layout.fetcher}
              options={blockOptions}
              blockDef={blockDef}
              credentialsScope="workspace"
              onChange={onDataChange}
              withVariableButton={layout.withVariableButton ?? true}
            />
            {layout?.helperText && (
              <Field.Description>
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              </Field.Description>
            )}
          </Field.Root>
        );
      }
      if (layout?.inputType === "textarea") {
        return (
          <Field.Root>
            {layout.label && (
              <Field.Label>
                {layout.label}
                {layout.moreInfoTooltip && (
                  <MoreInfoTooltip>{layout.moreInfoTooltip}</MoreInfoTooltip>
                )}
              </Field.Label>
            )}
            <Field.Control
              render={
                (layout.withVariableButton ?? true)
                  ? (props) => (
                      <DebouncedTextareaWithVariablesButton
                        {...props}
                        defaultValue={data ?? layout?.defaultValue}
                        onValueChange={onDataChange}
                        placeholder={layout?.placeholder}
                        debounceTimeout={
                          layout?.isDebounceDisabled ? 0 : undefined
                        }
                      />
                    )
                  : (props) => (
                      <DebouncedTextarea
                        {...props}
                        defaultValue={data ?? layout?.defaultValue}
                        onValueChange={onDataChange}
                        placeholder={layout?.placeholder}
                        debounceTimeout={
                          layout?.isDebounceDisabled ? 0 : undefined
                        }
                      />
                    )
              }
            />
            {layout?.helperText && (
              <Field.Description>
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              </Field.Description>
            )}
          </Field.Root>
        );
      }

      if (layout?.inputType === "code")
        return (
          <Field.Root>
            {layout.label && (
              <Field.Label>
                {layout.label}
                {layout.moreInfoTooltip && (
                  <MoreInfoTooltip>{layout.moreInfoTooltip}</MoreInfoTooltip>
                )}
              </Field.Label>
            )}
            <CodeEditor
              defaultValue={data ?? layout?.defaultValue}
              lang={layout.lang ?? "javascript"}
              placeholder={layout?.placeholder}
              withVariableButton={layout?.withVariableButton}
              onChange={onDataChange}
              debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
              withLineNumbers={true}
            />
            {layout?.helperText && (
              <Field.Description>
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              </Field.Description>
            )}
          </Field.Root>
        );
      if (layout?.label || layout?.moreInfoTooltip || layout?.helperText) {
        return (
          <Field.Root>
            {layout?.label && (
              <Field.Label>
                {layout.label}
                {layout.moreInfoTooltip && (
                  <MoreInfoTooltip>{layout.moreInfoTooltip}</MoreInfoTooltip>
                )}
              </Field.Label>
            )}
            {layout?.withVariableButton !== false ? (
              <DebouncedTextInputWithVariablesButton
                defaultValue={data ?? layout?.defaultValue}
                placeholder={layout?.placeholder}
                type={layout?.inputType === "password" ? "password" : undefined}
                onValueChange={onDataChange}
                className={width === "full" ? "w-full" : undefined}
                debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
              />
            ) : (
              <DebouncedTextInput
                defaultValue={data ?? layout?.defaultValue}
                placeholder={layout?.placeholder}
                type={layout?.inputType === "password" ? "password" : undefined}
                onValueChange={onDataChange}
                className={width === "full" ? "w-full" : undefined}
                debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
              />
            )}
            {layout?.helperText && (
              <Field.Description>
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              </Field.Description>
            )}
          </Field.Root>
        );
      }
      return layout?.withVariableButton !== false ? (
        <DebouncedTextInputWithVariablesButton
          defaultValue={data ?? layout?.defaultValue}
          placeholder={layout?.placeholder}
          type={layout?.inputType === "password" ? "password" : undefined}
          onValueChange={onDataChange}
          className={width === "full" ? "w-full" : undefined}
          debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
        />
      ) : (
        <DebouncedTextInput
          defaultValue={data ?? layout?.defaultValue}
          placeholder={layout?.placeholder}
          type={layout?.inputType === "password" ? "password" : undefined}
          onValueChange={onDataChange}
          className={width === "full" ? "w-full" : undefined}
          debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
        />
      );
    }
    default:
      return null;
  }
};

const ZodArrayContent = ({
  schema,
  data,
  blockDef,
  blockOptions,
  layout,
  isInAccordion,
  onDataChange,
}: {
  schema: z.ZodArray<z.ZodTypeAny>;
  data: any;
  blockDef?: ForgedBlockDefinition;
  blockOptions?: ForgedBlock["options"];
  layout: ZodLayoutMetadata | undefined;
  isInAccordion?: boolean;
  onDataChange: (val: any) => void;
}) => {
  const elementSchema = schema.element;
  const elementType = getZodInnerSchema(elementSchema).type;
  if (
    elementType === "string" ||
    elementType === "number" ||
    elementType === "enum"
  )
    return (
      <Field.Root
        className={cx(layout?.mergeWithLastField ? "mt-[-3px]" : undefined)}
      >
        {layout?.label && <Field.Label>{layout.label}</Field.Label>}
        {elementType === "string" ? (
          <TagsInput items={data} onValueChange={onDataChange} />
        ) : (
          <div
            className={cx(
              "flex flex-col gap-2 rounded-md flex-1 border p-4",
              layout?.mergeWithLastField
                ? "border-t-0 rounded-t-none pt-5"
                : undefined,
            )}
          >
            <PrimitiveList
              onItemsChange={(items) => {
                onDataChange(items);
              }}
              initialItems={data}
              addLabel={`Add ${layout?.itemLabel ?? ""}`}
            >
              {({ item, onItemChange }) => (
                <ZodFieldLayout
                  schema={elementSchema}
                  data={item}
                  blockDef={blockDef}
                  blockOptions={blockOptions}
                  isInAccordion={isInAccordion}
                  onDataChange={onItemChange}
                  width="full"
                />
              )}
            </PrimitiveList>
          </div>
        )}
      </Field.Root>
    );
  return (
    <TableList
      onItemsChange={(items) => {
        onDataChange(items);
      }}
      initialItems={data}
      addLabel={`Add ${layout?.itemLabel ?? ""}`}
      isOrdered={layout?.isOrdered}
    >
      {({ item, onItemChange }) => (
        <div className="flex flex-col gap-2 p-4 rounded-md flex-1 border max-w-full">
          <ZodFieldLayout
            schema={elementSchema}
            blockDef={blockDef}
            blockOptions={blockOptions}
            data={item}
            isInAccordion={isInAccordion}
            onDataChange={onItemChange}
          />
        </div>
      )}
    </TableList>
  );
};

const isString = (value: unknown): value is string => typeof value === "string";

const isZodEnum = (schema: z.ZodTypeAny): schema is z.ZodEnum =>
  schema.type === "enum";

const isZodObject = (
  schema: z.ZodTypeAny,
): schema is z.ZodObject<z.ZodRawShape> => schema.type === "object";

const isZodArray = (schema: z.ZodTypeAny): schema is z.ZodArray<z.ZodTypeAny> =>
  schema.type === "array";

const isZodDiscriminatedUnion = (
  schema: z.ZodTypeAny,
): schema is z.ZodDiscriminatedUnion<readonly z.ZodObject<any>[], string> =>
  schema instanceof z.ZodDiscriminatedUnion;
