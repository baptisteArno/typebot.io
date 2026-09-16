import { TemplateProps } from '../types'
import { useTranslate } from '@tolgee/react'

export const useTemplates = (): TemplateProps[] => {
  const { t } = useTranslate()

  return [
    {
      name: t('templates.modal.marketing.quiz.name'),
      emoji: '🕹️',
      fileName: 'quiz.json',
      category: 'marketing',
      description: t('templates.modal.marketing.quiz.description'),
    },
    {
      name: t('templates.modal.product.userOnboarding.name'),
      emoji: '🧑‍🚀',
      fileName: 'onboarding.json',
      category: 'product',
      description: t('templates.modal.product.userOnboarding.description'),
    },
    {
      name: t('templates.modal.product.faq.name'),
      emoji: '💬',
      fileName: 'faq.json',
      category: 'product',
      description: t('templates.modal.product.faq.description'),
    },
    {
      name: t('templates.modal.other.basicChatGpt.name'),
      emoji: '🤖',
      fileName: 'basic-chat-gpt.json',
      description: t('templates.modal.other.basicChatGpt.description'),
    },
    {
      name: t('templates.modal.other.audioChatGpt.name'),
      emoji: '🤖',
      fileName: 'audio-chat-gpt.json',
      description: t('templates.modal.other.audioChatGpt.description'),
    },
    {
      name: t('templates.modal.other.chatGptPersonas.name'),
      emoji: '🎭',
      fileName: 'chat-gpt-personas.json',
      description: t('templates.modal.other.chatGptPersonas.description'),
    },
    {
      name: 'High ticket lead follow-up',
      emoji: '📞',
      isNew: true,
      fileName: 'high-ticket-lead-follow-up.json',
      category: 'marketing',
      description:
        'Simulates a bot that could be triggered after a high ticket lead just downloaded a lead magnet. This bot asks questions about the prospect business and their needs. Every question are powered with AI blocks to make the conversation more engaging and human-like.',
    },
    {
      name: 'OpenAI Assistant Chat',
      emoji: '🤖',
      fileName: 'openai-assistant-chat.json',
      description: 'A simple conversation with your OpenAI assistant.',
    },
  ]
}
