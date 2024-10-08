export type TemplateProps = {
  name: string
  emoji: string
  fileName: string
  description: string
  category?: 'marketing' | 'product' | 'instagram' | 'whatsapp'
  isComingSoon?: boolean
  isNew?: boolean
  backgroundColor?: string
}
