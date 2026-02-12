import { evaluateIsHidden } from "@typebot.io/forge/helpers/evaluateIsHidden";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import type { JSX, ReactNode } from "react";
import type { z } from "zod";
import { getZodInnerSchema } from "../../helpers/getZodInnerSchema";
import { getZodLayoutMetadata } from "../../helpers/getZodLayoutMetadata";
import { ZodFieldLayout } from "./ZodFieldLayout";

export const ZodObjectLayout = ({
  schema,
  data,
  isInAccordion,
  ignoreKeys,
  blockDef,
  blockOptions,
  onDataChange,
}: {
  schema: z.ZodObject<any>;
  data: any;
  isInAccordion?: boolean;
  ignoreKeys?: string[];
  blockDef?: ForgedBlockDefinition;
  blockOptions?: ForgedBlock["options"];
  onDataChange: (value: any) => void;
}): JSX.Element | null => {
  const innerSchema = getZodInnerSchema(schema);
  if (!isZodObject(innerSchema)) return null;
  const shape = innerSchema.shape;
  const layout = getZodLayoutMetadata(innerSchema);
  if (evaluateIsHidden(layout?.isHidden, blockOptions)) return null;
  const nodes = Object.keys(shape).reduce<{
    nodes: ReactNode[];
    accordionsCreated: string[];
  }>(
    (nodes, key) => {
      if (ignoreKeys?.includes(key)) return nodes;
      const rawSchema = shape[key];
      if (!isZodType(rawSchema)) return nodes;
      const keySchema = getZodInnerSchema(rawSchema);
      const layout = getZodLayoutMetadata(keySchema);

      if (evaluateIsHidden(layout?.isHidden, blockOptions)) return nodes;
      if (layout && layout.accordion && !isInAccordion) {
        if (nodes.accordionsCreated.includes(layout.accordion)) return nodes;
        const accordionKeys = getObjectKeysWithSameAccordionAttr(
          layout.accordion,
          shape,
        );
        return {
          nodes: [
            ...nodes.nodes,
            <Accordion.Root key={layout.accordion}>
              <Accordion.Item>
                <Accordion.Trigger>{layout.accordion}</Accordion.Trigger>
                <Accordion.Panel>
                  {accordionKeys.map((accordionKey, _idx) => {
                    const accordionSchema = shape[accordionKey];
                    if (!isZodType(accordionSchema)) return null;
                    return (
                      <ZodFieldLayout
                        key={accordionKey}
                        schema={accordionSchema}
                        data={data?.[accordionKey]}
                        onDataChange={(val) =>
                          onDataChange({ ...data, [accordionKey]: val })
                        }
                        blockDef={blockDef}
                        blockOptions={blockOptions}
                        isInAccordion
                      />
                    );
                  })}
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion.Root>,
          ],
          accordionsCreated: [
            ...nodes.accordionsCreated,
            layout.accordion as string,
          ],
        };
      }

      return {
        nodes: [
          ...nodes.nodes,
          <ZodFieldLayout
            schema={keySchema}
            key={key}
            data={data?.[key]}
            blockDef={blockDef}
            blockOptions={blockOptions}
            propName={key}
            onDataChange={(val) => onDataChange({ ...data, [key]: val })}
          />,
        ],
        accordionsCreated: nodes.accordionsCreated,
      };
    },
    { nodes: [], accordionsCreated: [] },
  ).nodes;

  return <>{nodes}</>;
};

const getObjectKeysWithSameAccordionAttr = (accordion: string, shape: any) =>
  Object.keys(shape).reduce<string[]>((keys, currentKey) => {
    const rawSchema = shape[currentKey];
    if (!isZodType(rawSchema)) return keys;
    const innerSchema = getZodInnerSchema(rawSchema);
    const l = getZodLayoutMetadata(innerSchema);
    if (!l?.accordion || l.accordion !== accordion) return keys;
    keys.push(currentKey);
    return keys;
  }, []);

const isZodObject = (
  schema: z.ZodTypeAny,
): schema is z.ZodObject<z.ZodRawShape> => schema.type === "object";

const isZodType = (value: unknown): value is z.ZodTypeAny =>
  typeof value === "object" &&
  value !== null &&
  "def" in value &&
  "type" in value;
