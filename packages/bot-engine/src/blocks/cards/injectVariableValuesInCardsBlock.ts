import type {
  CardsBlock,
  CardsItem,
} from "@typebot.io/blocks-inputs/cards/schema";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariable";
import type { Variable } from "@typebot.io/variables/schemas";
import { filterCardsItems } from "./filterCardItems";

type DynamicProps = {
  pictureSrcs: Variable["value"];
  titles: Variable["value"];
  descriptions: Variable["value"];
  internalValues: Variable["value"];
};

export const injectVariableValuesInCardsBlock = (
  block: CardsBlock,
  {
    sessionStore,
    variables,
  }: { sessionStore: SessionStore; variables: Variable[] },
): CardsBlock => {
  const dynamicProps = getDynamicProps(variables)(block);
  if (!dynamicProps)
    return deepParseVariables(
      filterCardsItems(block, { variables, sessionStore }),
      {
        variables,
        sessionStore,
      },
    );
  return deepParseVariables(
    {
      ...block,
      items: createDynamicCards(block.items[0], dynamicProps),
    },
    {
      variables,
      sessionStore,
    },
  );
};

const getDynamicProps =
  (variables: Variable[]) =>
  (block: CardsBlock): DynamicProps | undefined => {
    if (block.items.length !== 1) return;
    const item = block.items[0];
    const pictureSrcsVariable = findUniqueVariable(variables)(item.imageUrl);
    const titlesVariable = findUniqueVariable(variables)(item.title);
    const descriptionsVariable = findUniqueVariable(variables)(
      item.description,
    );
    const internalValuesVariable = findUniqueVariable(variables)(
      item.options?.internalValue,
    );
    const dynamicItems = {
      pictureSrcs: pictureSrcsVariable?.value,
      titles: titlesVariable?.value,
      descriptions: descriptionsVariable?.value,
      internalValues: internalValuesVariable?.value,
    };
    if (
      !Array.isArray(dynamicItems.pictureSrcs) &&
      !Array.isArray(dynamicItems.titles) &&
      !Array.isArray(dynamicItems.descriptions)
    )
      return;
    return dynamicItems;
  };

const createDynamicCards = (
  item: CardsItem,
  dynamicProps: DynamicProps,
): CardsItem[] => {
  let drivingArray: Variable["value"] | undefined;
  let arrayLength = 0;

  if (Array.isArray(dynamicProps.titles)) {
    drivingArray = dynamicProps.titles;
  } else if (Array.isArray(dynamicProps.pictureSrcs)) {
    drivingArray = dynamicProps.pictureSrcs;
  } else if (Array.isArray(dynamicProps.descriptions)) {
    drivingArray = dynamicProps.descriptions;
  } else if (Array.isArray(dynamicProps.internalValues)) {
    drivingArray = dynamicProps.internalValues;
  }

  if (!drivingArray || !Array.isArray(drivingArray)) {
    return [];
  }
  arrayLength = drivingArray.length;

  const cards: CardsItem[] = [];
  for (let idx = 0; idx < arrayLength; idx++) {
    cards.push({
      ...item,
      title: getDynamicValue(dynamicProps.titles, idx),
      description: getDynamicValue(dynamicProps.descriptions, idx),
      imageUrl: getDynamicValue(dynamicProps.pictureSrcs, idx),
      paths: item.paths?.map((path, index) => ({
        ...path,
        id: `dynamic-card-${idx}-path-${index}`,
      })),
      options: {
        ...item.options,
        internalValue: getDynamicValue(dynamicProps.internalValues, idx),
      },
    });
  }

  return cards;
};

const getDynamicValue = <T>(prop: T | T[], index: number): T | undefined =>
  Array.isArray(prop) ? prop[index] : prop;
