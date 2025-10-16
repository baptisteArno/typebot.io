import { FormLabel, Stack } from "@chakra-ui/react";
import { evaluateIsHidden } from "@typebot.io/forge/helpers/evaluateIsHidden";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import type { ZodLayoutMetadata } from "@typebot.io/zod";
import Markdown, { type Components } from "react-markdown";
import type { ZodTypeAny, z } from "zod";
import { BasicAutocompleteInputWithVariableButton } from "@/components/inputs/BasicAutocompleteInput";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import {
  DebouncedTextarea,
  DebouncedTextareaWithVariablesButton,
} from "@/components/inputs/DebouncedTextarea";
import { TextInput } from "@/components/inputs/TextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import { PrimitiveList } from "@/components/PrimitiveList";
import { TableList } from "@/components/TableList";
import { TagsInput } from "@/components/TagsInput";
import { getZodInnerSchema } from "../../helpers/getZodInnerSchema";
import { ForgeSelectInput } from "../ForgeSelectInput";
import { ZodDiscriminatedUnionLayout } from "./ZodDiscriminatedUnionLayout";
import { ZodObjectLayout } from "./ZodObjectLayout";

const parseEnumItems = (
  schema: z.ZodTypeAny,
  layout?: ZodLayoutMetadata<ZodTypeAny>,
) => {
  const values = layout?.hiddenItems
    ? schema._def.values.filter((v: string) => !layout.hiddenItems?.includes(v))
    : schema._def.values;
  if (layout?.toLabels)
    return values.map((v: string) => ({
      label: layout.toLabels!(v),
      value: v,
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
  const layout = innerSchema._def.layout;

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

  switch (innerSchema._def.typeName) {
    case "ZodObject":
      return (
        <ZodObjectLayout
          schema={innerSchema as z.ZodObject<any>}
          data={data}
          onDataChange={onDataChange}
          isInAccordion={isInAccordion}
          blockDef={blockDef}
          blockOptions={blockOptions}
        />
      );
    case "ZodDiscriminatedUnion": {
      return (
        <ZodDiscriminatedUnionLayout
          discriminant={innerSchema._def.discriminator}
          data={data}
          schema={
            innerSchema as z.ZodDiscriminatedUnion<string, z.ZodObject<any>[]>
          }
          dropdownPlaceholder={
            layout?.placeholder ?? `Select a ${innerSchema._def.discriminator}`
          }
          onDataChange={onDataChange}
        />
      );
    }
    case "ZodArray": {
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
    case "ZodEnum": {
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
            defaultValue={layout?.defaultValue}
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
    case "ZodNumber":
    case "ZodUnion": {
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
    case "ZodBoolean": {
      return (
        <Field.Root className="flex-row items-center">
          <Switch
            checked={data ?? layout?.defaultValue}
            onCheckedChange={onDataChange}
          />
          <Field.Label>
            {layout?.label ?? propName ?? ""}{" "}
            {layout.moreInfoTooltip && (
              <MoreInfoTooltip>{layout.moreInfoTooltip}</MoreInfoTooltip>
            )}
          </Field.Label>
        </Field.Root>
      );
    }
    case "ZodString": {
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
          <ForgeSelectInput
            defaultValue={data ?? layout.defaultValue}
            placeholder={layout.placeholder}
            fetcherId={layout.fetcher}
            options={blockOptions}
            blockDef={blockDef}
            label={layout.label}
            credentialsScope="workspace"
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              ) : undefined
            }
            moreInfoTooltip={layout?.moreInfoTooltip}
            onChange={onDataChange}
            width={width}
            withVariableButton={layout.withVariableButton ?? true}
          />
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
      return (
        <TextInput
          defaultValue={data ?? layout?.defaultValue}
          label={layout?.label}
          placeholder={layout?.placeholder}
          helperText={
            layout?.helperText ? (
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            ) : undefined
          }
          type={layout?.inputType === "password" ? "password" : undefined}
          isRequired={layout?.isRequired}
          withVariableButton={layout?.withVariableButton}
          moreInfoTooltip={layout?.moreInfoTooltip}
          onChange={onDataChange}
          width={width}
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
  schema: z.ZodTypeAny;
  data: any;
  blockDef?: ForgedBlockDefinition;
  blockOptions?: ForgedBlock["options"];
  layout: ZodLayoutMetadata<ZodTypeAny> | undefined;
  isInAccordion?: boolean;
  onDataChange: (val: any) => void;
}) => {
  const type = schema._def.type._def.innerType?._def.typeName;
  if (type === "ZodString" || type === "ZodNumber" || type === "ZodEnum")
    return (
      <Stack
        spacing={0}
        marginTop={layout?.mergeWithLastField ? "-3" : undefined}
      >
        {layout?.label && <FormLabel>{layout.label}</FormLabel>}
        <Stack
          p="4"
          rounded="md"
          flex="1"
          borderWidth="1px"
          borderTopWidth={layout?.mergeWithLastField ? "0" : undefined}
          borderTopRadius={layout?.mergeWithLastField ? "0" : undefined}
          pt={layout?.mergeWithLastField ? "5" : undefined}
        >
          {type === "ZodString" ? (
            <TagsInput items={data} onChange={onDataChange} />
          ) : (
            <PrimitiveList
              onItemsChange={(items) => {
                onDataChange(items);
              }}
              initialItems={data}
              addLabel={`Add ${layout?.itemLabel ?? ""}`}
            >
              {({ item, onItemChange }) => (
                <ZodFieldLayout
                  schema={schema._def.type}
                  data={item}
                  blockDef={blockDef}
                  blockOptions={blockOptions}
                  isInAccordion={isInAccordion}
                  onDataChange={onItemChange}
                  width="full"
                />
              )}
            </PrimitiveList>
          )}
        </Stack>
      </Stack>
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
        <Stack p="4" rounded="md" flex="1" borderWidth="1px" maxW="100%">
          <ZodFieldLayout
            schema={schema._def.type}
            blockDef={blockDef}
            blockOptions={blockOptions}
            data={item}
            isInAccordion={isInAccordion}
            onDataChange={onItemChange}
          />
        </Stack>
      )}
    </TableList>
  );
};
