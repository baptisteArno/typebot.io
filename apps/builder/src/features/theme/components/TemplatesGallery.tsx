import { SimpleGrid, Stack } from '@chakra-ui/react'
import { ThemeTemplate } from '@typebot.io/schemas'
import { galleryTemplates } from '../galleryTemplates'
import { ThemeTemplateCard } from './ThemeTemplateCard'

type Props = {
  selectedTemplateId: string | undefined
  currentTheme: ThemeTemplate['theme']
  workspaceId: string
  onTemplateSelect: (
    template: Partial<Pick<ThemeTemplate, 'id' | 'theme'>>
  ) => void
}

export const TemplatesGallery = ({
  selectedTemplateId,
  workspaceId,
  onTemplateSelect,
}: Props) => (
  <Stack spacing={4}>
    <SimpleGrid columns={2} spacing={4}>
      {galleryTemplates.map((themeTemplate) => (
        <ThemeTemplateCard
          key={themeTemplate.id}
          workspaceId={workspaceId}
          themeTemplate={themeTemplate}
          isSelected={themeTemplate.id === selectedTemplateId}
          onClick={() => onTemplateSelect(themeTemplate)}
        />
      ))}
    </SimpleGrid>
  </Stack>
)
