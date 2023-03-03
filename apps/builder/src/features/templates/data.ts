import { TemplateProps } from './types'

export const templates: TemplateProps[] = [
  { name: 'Lead Generation', emoji: '🤝', fileName: 'lead-gen.json' },
  { name: 'Customer Support', emoji: '😍', fileName: 'customer-support.json' },
  { name: 'Quiz', emoji: '🕹️', fileName: 'quiz.json' },
  { name: 'Lead Scoring', emoji: '🏆', fileName: 'lead-scoring.json' },
  {
    name: 'NPS Survey',
    emoji: '⭐',
    fileName: 'nps.json',
    isNew: true,
  },
  {
    name: 'User Onboarding',
    emoji: '🧑‍🚀',
    fileName: 'onboarding.json',
    isNew: true,
  },
  {
    name: 'Digital Product Payment',
    emoji: '🖼️',
    fileName: 'digital-product-payment.json',
  },
  {
    name: 'FAQ',
    emoji: '💬',
    fileName: 'faq.json',
  },
]
