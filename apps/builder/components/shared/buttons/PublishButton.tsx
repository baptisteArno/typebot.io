import { Button } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'

export const PublishButton = () => {
  const { isPublishing, isPublished, publishTypebot } = useTypebot()

  return (
    <Button
      ml={2}
      colorScheme="blue"
      isLoading={isPublishing}
      isDisabled={isPublished}
      onClick={publishTypebot}
    >
      {isPublished ? 'Published' : 'Publish'}
    </Button>
  )
}
