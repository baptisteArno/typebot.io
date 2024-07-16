/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Stack,
  Text,
} from '@chakra-ui/react'
import { z } from '@typebot.io/forge/zod'
import React from 'react'
import { ZodLayoutMetadata } from '@typebot.io/forge/zod'
import { ReactNode } from 'react'
import { ZodTypeAny } from 'zod'
import { ZodFieldLayout } from './ZodFieldLayout'
import {
  ForgedBlockDefinition,
  ForgedBlock,
} from '@typebot.io/forge-repository/types'
import { getZodInnerSchema } from '../../helpers/getZodInnerSchema'
import { evaluateIsHidden } from '@typebot.io/forge/zod/helpers/evaluateIsHidden'

export const ZodObjectLayout = ({
  schema,
  data,
  isInAccordion,
  ignoreKeys,
  blockDef,
  blockOptions,
  onDataChange,
}: {
  schema: z.ZodObject<any>
  data: any
  isInAccordion?: boolean
  ignoreKeys?: string[]
  blockDef?: ForgedBlockDefinition
  blockOptions?: ForgedBlock['options']
  onDataChange: (value: any) => void
}): ReactNode[] => {
  const innerSchema = getZodInnerSchema(schema)
  const shape =
    'shape' in innerSchema ? innerSchema.shape : innerSchema._def.shape()
  const layout = innerSchema._def.layout
  if (evaluateIsHidden(layout?.isHidden, blockOptions)) return []
  return Object.keys(shape).reduce<{
    nodes: ReactNode[]
    accordionsCreated: string[]
  }>(
    (nodes, key, index) => {
      if (ignoreKeys?.includes(key)) return nodes
      const keySchema = getZodInnerSchema(shape[key])
      const layout = keySchema._def.layout as
        | ZodLayoutMetadata<ZodTypeAny>
        | undefined

      if (evaluateIsHidden(layout?.isHidden, blockOptions)) return nodes
      if (
        layout &&
        layout.accordion &&
        !isInAccordion &&
        keySchema._def.typeName !== 'ZodArray'
      ) {
        if (nodes.accordionsCreated.includes(layout.accordion)) return nodes
        const accordionKeys = getObjectKeysWithSameAccordionAttr(
          layout.accordion,
          shape
        )
        return {
          nodes: [
            ...nodes.nodes,
            <Accordion allowToggle key={layout.accordion}>
              <AccordionItem>
                <AccordionButton>
                  <Text w="full" textAlign="left">
                    {layout.accordion}
                  </Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel as={Stack} spacing={4}>
                  {accordionKeys.map((accordionKey, idx) => (
                    <ZodFieldLayout
                      key={accordionKey + idx}
                      schema={shape[accordionKey]}
                      data={data?.[accordionKey]}
                      onDataChange={(val) =>
                        onDataChange({ ...data, [accordionKey]: val })
                      }
                      blockDef={blockDef}
                      blockOptions={blockOptions}
                      isInAccordion
                    />
                  ))}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>,
          ],
          accordionsCreated: [
            ...nodes.accordionsCreated,
            layout.accordion as string,
          ],
        }
      }

      return {
        nodes: [
          ...nodes.nodes,
          <ZodFieldLayout
            schema={keySchema}
            key={index}
            data={data?.[key]}
            blockDef={blockDef}
            blockOptions={blockOptions}
            propName={key}
            onDataChange={(val) => onDataChange({ ...data, [key]: val })}
          />,
        ],
        accordionsCreated: nodes.accordionsCreated,
      }
    },
    { nodes: [], accordionsCreated: [] }
  ).nodes
}

const getObjectKeysWithSameAccordionAttr = (accordion: string, shape: any) =>
  Object.keys(shape).reduce<string[]>((keys, currentKey) => {
    const l = shape[currentKey]._def.layout as
      | ZodLayoutMetadata<ZodTypeAny>
      | undefined
    return !l?.accordion || l.accordion !== accordion
      ? keys
      : [...keys, currentKey]
  }, [])
