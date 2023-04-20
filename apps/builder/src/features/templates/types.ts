export type TemplateProps = {
  name: string
  emoji: string
  fileName: string
  description: string
  category?: 'marketing' | 'product'
  isComingSoon?: boolean
  isNew?: boolean
}
