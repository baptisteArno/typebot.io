import { Avatar, Flex, Textarea, Text } from '@chakra-ui/react'
import { CommentProps } from './types'

export const Comment = ({
  editComment,
  note,
  setEditComment,
  user,
  isEditing,
}: CommentProps) => {
  return (
    <>
      <Avatar src={note.avatarUrl} />
      <Flex width="100%" direction="column">
        <Text fontSize="md">{note.name}</Text>
        {note.userId === user?.id && isEditing ? (
          <Textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
          />
        ) : (
          <Text fontSize="sm" width="82%">{`${note.comment}`}</Text>
        )}
      </Flex>
    </>
  )
}
