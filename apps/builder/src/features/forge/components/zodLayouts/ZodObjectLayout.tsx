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
import { ZodLayoutMetadata } from '@typebot.io/forge/zod'
import { ReactNode } from 'react'
import { ZodTypeAny } from 'zod'
import { ZodFieldLayout } from './ZodFieldLayout'
import { ForgedBlockDefinition, ForgedBlock } from '@typebot.io/forge-schemas'

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
}) => {
  return Object.keys(schema.shape).reduce<{
    nodes: ReactNode[]
    accordionsCreated: string[]
  }>(
    (nodes, key, index) => {
      if (ignoreKeys?.includes(key)) return nodes
      const keySchema = schema.shape[key]
      const layout = keySchema._def.layout as
        | ZodLayoutMetadata<ZodTypeAny>
        | undefined
      if (
        layout &&
        layout.accordion &&
        !isInAccordion &&
        keySchema._def.innerType._def.typeName !== 'ZodArray'
      ) {
        if (nodes.accordionsCreated.includes(layout.accordion)) return nodes
        const accordionKeys = getObjectKeysWithSameAccordionAttr(
          layout.accordion,
          schema
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
                      schema={schema.shape[accordionKey]}
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
            onDataChange={(val) => onDataChange({ ...data, [key]: val })}
          />,
        ],
        accordionsCreated: nodes.accordionsCreated,
      }
    },
    { nodes: [], accordionsCreated: [] }
  ).nodes
}

const getObjectKeysWithSameAccordionAttr = (
  accordion: string,
  schema: z.ZodObject<any>
) =>
  Object.keys(schema.shape).reduce<string[]>((keys, currentKey) => {
    const l = schema.shape[currentKey]._def.layout as
      | ZodLayoutMetadata<ZodTypeAny>
      | undefined
    return !l?.accordion || l.accordion !== accordion
      ? keys
      : [...keys, currentKey]
  }, [])
