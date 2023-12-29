import { Button, HStack, Stack } from '@chakra-ui/react'
import { ThemeTemplate } from '@typebot.io/schemas'
import { useState } from 'react'
import { MyTemplates } from './MyTemplates'
import { TemplatesGallery } from './TemplatesGallery'
import { useTranslate } from '@tolgee/react'

type Tab = 'my-templates' | 'gallery'

type Props = {
  workspaceId: string
  selectedTemplateId: string | undefined
  currentTheme: ThemeTemplate['theme']
  onTemplateSelect: (
    template: Partial<Pick<ThemeTemplate, 'id' | 'theme'>>
  ) => void
}

export const ThemeTemplates = ({
  workspaceId,
  selectedTemplateId,
  currentTheme,
  onTemplateSelect,
}: Props) => {
  const { t } = useTranslate()

  const [selectedTab, setSelectedTab] = useState<Tab>('my-templates')

  return (
    <Stack spacing={4}>
      <HStack>
        <Button
          flex="1"
          variant="outline"
          colorScheme={selectedTab === 'my-templates' ? 'blue' : 'gray'}
          onClick={() => setSelectedTab('my-templates')}
        >
          {t('theme.sideMenu.template.myTemplates')}
        </Button>
        <Button
          flex="1"
          variant="outline"
          colorScheme={selectedTab === 'gallery' ? 'blue' : 'gray'}
          onClick={() => setSelectedTab('gallery')}
        >
          {t('theme.sideMenu.template.gallery')}
        </Button>
      </HStack>
      <ThemeTemplatesBody
        tab={selectedTab}
        currentTheme={currentTheme}
        workspaceId={workspaceId}
        selectedTemplateId={selectedTemplateId}
        onTemplateSelect={onTemplateSelect}
      />
    </Stack>
  )
}

const ThemeTemplatesBody = ({
  tab,
  workspaceId,
  selectedTemplateId,
  currentTheme,
  onTemplateSelect,
}: {
  tab: Tab
} & Props) => {
  switch (tab) {
    case 'my-templates':
      return (
        <MyTemplates
          onTemplateSelect={onTemplateSelect}
          currentTheme={currentTheme}
          selectedTemplateId={selectedTemplateId}
          workspaceId={workspaceId}
        />
      )
    case 'gallery':
      return (
        <TemplatesGallery
          onTemplateSelect={onTemplateSelect}
          currentTheme={currentTheme}
          selectedTemplateId={selectedTemplateId}
          workspaceId={workspaceId}
        />
      )
  }
}
