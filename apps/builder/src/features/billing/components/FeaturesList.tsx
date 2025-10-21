import {
  Flex,
  ListIcon,
  ListItem,
  type ListProps,
  UnorderedList,
} from "@chakra-ui/react";
import { TickIcon } from "@typebot.io/ui/icons/TickIcon";

type FeaturesListProps = { features: (string | JSX.Element)[] } & ListProps;

export const FeaturesList = ({ features, ...props }: FeaturesListProps) => (
  <UnorderedList listStyleType="none" spacing={2} {...props}>
    {features.map((feat, idx) => (
      <Flex as={ListItem} key={idx}>
        <ListIcon as={TickIcon} mt="1.5" />
        {feat}
      </Flex>
    ))}
  </UnorderedList>
);
