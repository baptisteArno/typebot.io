import { NumberInput, TextInput, Textarea } from '@/components/inputs'
import { z } from '@typebot.io/forge/zod'
import { ZodLayoutMetadata } from '@typebot.io/forge/zod'
import Markdown, { Components } from 'react-markdown'
import { ZodTypeAny } from 'zod'
import { ForgeSelectInput } from '../ForgeSelectInput'
import { ZodObjectLayout } from './ZodObjectLayout'
import { TableList } from '@/components/TableList'
import { ZodDiscriminatedUnionLayout } from './ZodDiscriminatedUnionLayout'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  FormLabel,
  Stack,
  Text,
} from '@chakra-ui/react'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { DropdownList } from '@/components/DropdownList'
import { ForgedBlockDefinition, ForgedBlock } from '@typebot.io/forge-schemas'
import { PrimitiveList } from '@/components/PrimitiveList'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { CodeEditor } from '@/components/inputs/CodeEditor'

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
} satisfies Components

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  data: any
  schema: z.ZodTypeAny
  isInAccordion?: boolean
  blockDef?: ForgedBlockDefinition
  blockOptions?: ForgedBlock['options']
  width?: 'full'
  propName?: string
  onDataChange: (val: any) => void
}) => {
  const layout = schema._def.layout as ZodLayoutMetadata<ZodTypeAny> | undefined
  const type = schema._def.innerType
    ? schema._def.innerType._def.typeName
    : schema._def.typeName

  switch (type) {
    case 'ZodObject':
      return (
        <ZodObjectLayout
          schema={schema as z.ZodObject<any>}
          data={data}
          onDataChange={onDataChange}
          isInAccordion={isInAccordion}
          blockDef={blockDef}
          blockOptions={blockOptions}
        />
      )
    case 'ZodDiscriminatedUnion': {
      return (
        <ZodDiscriminatedUnionLayout
          discriminant={schema._def.discriminator}
          data={data}
          schema={schema as z.ZodDiscriminatedUnion<string, z.ZodObject<any>[]>}
          dropdownPlaceholder={`Select a ${schema._def.discriminator}`}
          onDataChange={onDataChange}
        />
      )
    }
    case 'ZodArray': {
      if (layout?.accordion)
        return (
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Text w="full" textAlign="left">
                  {layout?.accordion}
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel as={Stack} pt="4">
                <ZodArrayContent
                  data={data}
                  schema={schema}
                  blockDef={blockDef}
                  blockOptions={blockOptions}
                  layout={layout}
                  onDataChange={onDataChange}
                  isInAccordion
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )
      return (
        <ZodArrayContent
          data={data}
          schema={schema}
          blockDef={blockDef}
          blockOptions={blockOptions}
          layout={layout}
          onDataChange={onDataChange}
        />
      )
    }
    case 'ZodEnum': {
      return (
        <DropdownList
          currentItem={data ?? layout?.defaultValue}
          onItemSelect={onDataChange}
          items={schema._def.innerType._def.values}
          label={layout?.label}
          helperText={
            layout?.helperText ? (
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            ) : undefined
          }
          moreInfoTooltip={layout?.moreInfoTooltip}
          placeholder={layout?.placeholder}
          direction={layout?.direction}
          width={width}
        />
      )
    }
    case 'ZodNumber':
    case 'ZodUnion': {
      return (
        <NumberInput
          defaultValue={data ?? layout?.defaultValue}
          label={layout?.label}
          placeholder={layout?.placeholder}
          helperText={
            layout?.helperText ? (
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            ) : undefined
          }
          isRequired={layout?.isRequired}
          moreInfoTooltip={layout?.moreInfoTooltip}
          onValueChange={onDataChange}
          direction={layout?.direction}
          width={width}
        />
      )
    }
    case 'ZodBoolean': {
      return (
        <SwitchWithLabel
          label={layout?.label ?? propName ?? ''}
          initialValue={data ?? layout?.defaultValue}
          onCheckChange={onDataChange}
          moreInfoContent={layout?.moreInfoTooltip}
        />
      )
    }
    case 'ZodString': {
      if (layout?.fetcher) {
        if (!blockDef) return null
        return (
          <ForgeSelectInput
            defaultValue={data ?? layout.defaultValue}
            placeholder={layout.placeholder}
            fetcherId={layout.fetcher}
            options={blockOptions}
            blockDef={blockDef}
            label={layout.label}
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
          />
        )
      }
      if (layout?.inputType === 'variableDropdown') {
        return (
          <VariableSearchInput
            initialVariableId={data}
            onSelectVariable={(variable) => onDataChange(variable?.id)}
            placeholder={layout?.placeholder}
            label={layout?.label}
            moreInfoTooltip={layout.moreInfoTooltip}
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              ) : undefined
            }
            width={width}
          />
        )
      }
      if (layout?.inputType === 'textarea') {
        return (
          <Textarea
            defaultValue={data ?? layout?.defaultValue}
            label={layout?.label}
            placeholder={layout?.placeholder}
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              ) : undefined
            }
            isRequired={layout?.isRequired}
            withVariableButton={layout?.withVariableButton}
            moreInfoTooltip={layout.moreInfoTooltip}
            onChange={onDataChange}
            width={width}
          />
        )
      }

      if (layout?.inputType === 'code')
        return (
          <CodeEditor
            defaultValue={data ?? layout?.defaultValue}
            lang={layout.lang ?? 'javascript'}
            label={layout?.label}
            placeholder={layout?.placeholder}
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>
                  {layout.helperText}
                </Markdown>
              ) : undefined
            }
            isRequired={layout?.isRequired}
            withVariableButton={layout?.withVariableButton}
            moreInfoTooltip={layout.moreInfoTooltip}
            onChange={onDataChange}
            width={width}
          />
        )
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
          type={layout?.inputType === 'password' ? 'password' : undefined}
          isRequired={layout?.isRequired}
          withVariableButton={layout?.withVariableButton}
          moreInfoTooltip={layout?.moreInfoTooltip}
          onChange={onDataChange}
          width={width}
        />
      )
    }
  }
}

const ZodArrayContent = ({
  schema,
  data,
  blockDef,
  blockOptions,
  layout,
  isInAccordion,
  onDataChange,
}: {
  schema: z.ZodTypeAny
  data: any
  blockDef?: ForgedBlockDefinition
  blockOptions?: ForgedBlock['options']
  layout: ZodLayoutMetadata<ZodTypeAny> | undefined
  isInAccordion?: boolean
  onDataChange: (val: any) => void
}) => {
  const type = schema._def.innerType._def.type._def.innerType?._def.typeName
  if (type === 'ZodString' || type === 'ZodNumber' || type === 'ZodEnum')
    return (
      <Stack spacing={0}>
        {layout?.label && <FormLabel>{layout.label}</FormLabel>}
        <Stack p="4" rounded="md" flex="1" borderWidth="1px">
          <PrimitiveList
            onItemsChange={(items) => {
              onDataChange(items)
            }}
            initialItems={data}
            addLabel={`Add ${layout?.itemLabel ?? ''}`}
          >
            {({ item, onItemChange }) => (
              <ZodFieldLayout
                schema={schema._def.innerType._def.type}
                data={item}
                blockDef={blockDef}
                blockOptions={blockOptions}
                isInAccordion={isInAccordion}
                onDataChange={onItemChange}
                width="full"
              />
            )}
          </PrimitiveList>
        </Stack>
      </Stack>
    )
  return (
    <TableList
      onItemsChange={(items) => {
        onDataChange(items)
      }}
      initialItems={data}
      addLabel={`Add ${layout?.itemLabel ?? ''}`}
      isOrdered={layout?.isOrdered}
    >
      {({ item, onItemChange }) => (
        <Stack p="4" rounded="md" flex="1" borderWidth="1px" maxW="100%">
          <ZodFieldLayout
            schema={schema._def.innerType._def.type}
            blockDef={blockDef}
            blockOptions={blockOptions}
            data={item}
            isInAccordion={isInAccordion}
            onDataChange={onItemChange}
          />
        </Stack>
      )}
    </TableList>
  )
}
