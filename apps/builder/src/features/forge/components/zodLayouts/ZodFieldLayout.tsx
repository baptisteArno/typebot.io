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
  Stack,
  Text,
} from '@chakra-ui/react'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { DropdownList } from '@/components/DropdownList'
import { ForgedBlockDefinition, ForgedBlock } from '@typebot.io/forge-schemas'

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
  onDataChange,
}: {
  data: any
  schema: z.ZodTypeAny
  isInAccordion?: boolean
  blockDef?: ForgedBlockDefinition
  blockOptions?: ForgedBlock['options']
  onDataChange: (val: any) => void
}) => {
  const layout = schema._def.layout as ZodLayoutMetadata<ZodTypeAny> | undefined
  const type = schema._def.innerType
    ? schema._def.innerType._def.typeName
    : schema._def.typeName

  if (layout?.isHidden) return null
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
          />
        )
      }
      if (layout?.input === 'variableDropdown') {
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
          />
        )
      }
      if (layout?.input === 'textarea') {
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
          />
        )
      }
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
          type={layout?.input === 'password' ? 'password' : undefined}
          isRequired={layout?.isRequired}
          withVariableButton={layout?.withVariableButton}
          moreInfoTooltip={layout?.moreInfoTooltip}
          onChange={onDataChange}
        />
      )
    }
  }
}

const ZodArrayContent = ({
  schema,
  data,
  layout,
  isInAccordion,
  onDataChange,
}: {
  schema: z.ZodTypeAny
  data: any
  layout: ZodLayoutMetadata<ZodTypeAny> | undefined
  isInAccordion?: boolean
  onDataChange: (val: any) => void
}) => (
  <TableList
    onItemsChange={(items) => {
      onDataChange(items)
    }}
    initialItems={data}
    addLabel={`Add ${layout?.itemLabel ?? ''}`}
    isOrdered={layout?.isOrdered}
  >
    {({ item, onItemChange }) => (
      <Stack p="4" rounded="md" flex="1" borderWidth="1px">
        <ZodFieldLayout
          schema={schema._def.innerType._def.type}
          data={item}
          isInAccordion={isInAccordion}
          onDataChange={onItemChange}
        />
      </Stack>
    )}
  </TableList>
)
