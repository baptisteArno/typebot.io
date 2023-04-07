import { TemplateProps } from './types'

export const templates: TemplateProps[] = [
  { name: 'Lead Generation', emoji: '🤝', fileName: 'lead-gen.json' },
  { name: 'Customer Support', emoji: '😍', fileName: 'customer-support.json' },
  { name: 'Quiz', emoji: '🕹️', fileName: 'quiz.json' },
  { name: 'Lead Scoring', emoji: '🏆', fileName: 'lead-scoring.json' },
  {
    name: 'Lead magnet',
    emoji: '🧲',
    fileName: 'lead-magnet.json',
    isNew: true,
  },
  {
    name: 'NPS Survey',
    emoji: '⭐',
    fileName: 'nps.json',
  },
  {
    name: 'User Onboarding',
    emoji: '🧑‍🚀',
    fileName: 'onboarding.json',
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
  {
    name: 'Movie Recommendation',
    emoji: '🍿',
    fileName: 'movie-recommendation.json',
  },
  {
    name: 'Basic ChatGPT',
    emoji: '🤖',
    fileName: 'basic-chat-gpt.json',
  },
  {
    name: 'ChatGPT personas',
    emoji: '🎭',
    fileName: 'chat-gpt-personas.json',
    isNew: true,
  },
]
