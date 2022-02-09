import * as React from 'react'
import { Box } from '@chakra-ui/react'
import { List } from './List'
import { ListItem } from './ListItem'

export type VerticalListItem = {
  title: string
  isActivated?: boolean
  subTitle?: string
  icon?: React.ReactElement
  content: React.ReactNode
}

type Props = {
  items: VerticalListItem[]
}

export const ListWithVerticalLines = ({ items }: Props) => {
  return (
    <Box as="section">
      <Box maxW="2xl" mx="auto" p={{ base: '4', md: '8' }}>
        <List spacing="12">
          {items.map((item, idx) => (
            <ListItem
              key={idx}
              title={item.title}
              subTitle={item.subTitle}
              icon={item.icon}
              circleActivated={item.isActivated}
            >
              {item.content}
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}
