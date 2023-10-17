import {
  ListProps,
  UnorderedList,
  Flex,
  ListItem,
  ListIcon,
} from '@chakra-ui/react'
import { CheckIcon } from '@/components/icons'

type FeaturesListProps = { features: (string | JSX.Element)[] } & ListProps

export const FeaturesList = ({ features, ...props }: FeaturesListProps) => (
  <UnorderedList listStyleType="none" spacing={2} {...props}>
    {features.map((feat, idx) => (
      <Flex as={ListItem} key={idx}>
        <ListIcon as={CheckIcon} mt="1.5" />
        {feat}
      </Flex>
    ))}
  </UnorderedList>
)
