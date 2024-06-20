import { TemplateProps } from '../types'
import { useTranslate } from '@tolgee/react'

export const useTemplates = (): TemplateProps[] => {
  const { t } = useTranslate()

  return [
    {
      name: t('templates.modal.marketing.leadGeneration.name'),
      emoji: '🤝',
      fileName: 'lead-gen.json',
      category: 'marketing',
      description: t('templates.modal.marketing.leadGeneration.description'),
    },
    {
      name: t('templates.modal.product.customerSupport.name'),
      emoji: '😍',
      fileName: 'customer-support.json',
      category: 'product',
      description: t('templates.modal.product.customerSupport.description'),
    },
    {
      name: t('templates.modal.marketing.quiz.name'),
      emoji: '🕹️',
      fileName: 'quiz.json',
      category: 'marketing',
      description: t('templates.modal.marketing.quiz.description'),
    },
    {
      name: t('templates.modal.marketing.leadScoring.name'),
      emoji: '🏆',
      fileName: 'lead-scoring.json',
      category: 'marketing',
      description: t('templates.modal.marketing.leadScoring.description'),
    },
    {
      name: t('templates.modal.marketing.leadMagnet.name'),
      emoji: '🧲',
      fileName: 'lead-magnet.json',
      category: 'marketing',
      description: t('templates.modal.marketing.leadMagnet.description'),
    },
    {
      name: t('templates.modal.marketing.productRecommendation.name'),
      emoji: '🍫',
      fileName: 'product-recommendation.json',
      category: 'marketing',
      description: t(
        'templates.modal.marketing.productRecommendation.description'
      ),
      backgroundColor: '#010000',
    },
    {
      name: t('templates.modal.product.npsSurvey.name'),
      emoji: '⭐',
      fileName: 'nps.json',
      category: 'product',
      description: t('templates.modal.product.npsSurvey.description'),
    },
    {
      name: t('templates.modal.product.userOnboarding.name'),
      emoji: '🧑‍🚀',
      fileName: 'onboarding.json',
      category: 'product',
      description: t('templates.modal.product.userOnboarding.description'),
    },
    {
      name: t('templates.modal.other.digitalProductPayment.name'),
      emoji: '🖼️',
      fileName: 'digital-product-payment.json',
      description: t('templates.modal.other.digitalProductPayment.description'),
    },
    {
      name: t('templates.modal.product.faq.name'),
      emoji: '💬',
      fileName: 'faq.json',
      category: 'product',
      description: t('templates.modal.product.faq.description'),
    },
    {
      name: t('templates.modal.other.movieRecommendation.name'),
      emoji: '🍿',
      fileName: 'movie-recommendation.json',
      description: t('templates.modal.other.movieRecommendation.description'),
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
      name: t('templates.modal.marketing.leadGenWithAi.name'),
      emoji: '🦾',
      fileName: 'lead-gen-ai.json',
      category: 'marketing',
      description: t('templates.modal.marketing.leadGenWithAi.description'),
    },
    {
      name: t('templates.modal.marketing.insuranceOffer.name'),
      emoji: '🐶',
      fileName: 'dog-insurance-offer.json',
      category: 'marketing',
      description: t('templates.modal.marketing.insuranceOffer.description'),
    },
    {
      name: t('templates.modal.other.openAiConditions.name'),
      emoji: '🧠',
      fileName: 'openai-conditions.json',
      description: t('templates.modal.other.openAiConditions.description'),
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
      name: 'Quick Carb Calculator',
      emoji: '🏃‍♂️',
      isNew: true,
      fileName: 'quick-carb-calculator.json',
      category: 'marketing',
      description:
        'Designed specifically for athlete fueling brands looking to attract and engage active audiences, this chatbot serves as an effective lead magnet by providing instant, customized carbohydrate intake recommendations based on user input.',
    },
    {
      name: 'Skin Typology',
      emoji: '💆‍♀️',
      isNew: true,
      fileName: 'skin-typology.json',
      category: 'marketing',
      description:
        "A skin typology expert chatbot! Designed as a lead magnet for Typology, this bot asks a series of personalized questions to determine the user's unique skin type. He then receives a detailed diagnosis and tailored skincare AI-based recommendations.",
    },
    {
      name: 'OpenAI Assistant Chat',
      emoji: '🤖',
      fileName: 'openai-assistant-chat.json',
      description: 'A simple conversation with your OpenAI assistant.',
    },
    {
      name: 'Savings Estimator',
      emoji: '💰',
      fileName: 'savings-estimator.json',
      isNew: true,
      category: 'marketing',
      description:
        "This bot works for INGA, a commerce that sells reusable sponges and paper towels. It asks simple question to estimate the user's potential savings if he decides to buy INGA products.",
    },
  ]
}
