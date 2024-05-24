import {
  Stack,
  Heading,
  Button,
  List,
  ListItem,
  ListIcon,
  Text,
  Link,
} from '@chakra-ui/react'
import { CheckCircleIcon } from 'assets/icons'

export const EnterprisePlanCard = () => (
  <Stack
    direction={['column', 'row']}
    align="center"
    p="10"
    rounded="lg"
    bgColor="gray.800"
    borderWidth="2px"
    spacing={10}
  >
    <Stack maxW="300px" spacing={4}>
      <Heading fontSize="xl">Enterprise</Heading>
      <Text>
        Ideal for large companies looking to generate leads and automate
        customer support at scale
      </Text>
      <Text fontSize="lg">
        <Button
          as={Link}
          href="https://typebot.io/enterprise-lead-form"
          isExternal
          variant="outline"
        >
          Get a quote
        </Button>
      </Text>
    </Stack>
    <Stack flex="1">
      <List spacing="4">
        <ListItem fontWeight="medium" display="flex" alignItems="center">
          <ListIcon fontSize="xl" as={CheckCircleIcon} marginEnd={2} />
          Custom chats limits & seats for all your team
        </ListItem>
        <ListItem fontWeight="medium" display="flex" alignItems="center">
          <ListIcon fontSize="xl" as={CheckCircleIcon} marginEnd={2} />
          SSO & Granular access rights
        </ListItem>
        <ListItem fontWeight="medium" display="flex" alignItems="center">
          <ListIcon fontSize="xl" as={CheckCircleIcon} marginEnd={2} />
          Yearly contract with dedicated support representative
        </ListItem>
      </List>
    </Stack>
  </Stack>
)
