import { getTemplateBySlug } from ".";
import audioChatGptTypebot from "./typebots/audio-chat-gpt.json";
import basicChatGptTypebot from "./typebots/basic-chat-gpt.json";
import chatGptPersonasTypebot from "./typebots/chat-gpt-personas.json";
import customerSupportTypebot from "./typebots/customer-support.json";
import digitalProductPaymentTypebot from "./typebots/digital-product-payment.json";
import dogInsuranceOfferTypebot from "./typebots/dog-insurance-offer.json";
import faqTypebot from "./typebots/faq.json";
import highTicketLeadFollowUpTypebot from "./typebots/high-ticket-lead-follow-up.json";
import leadGenTypebot from "./typebots/lead-gen.json";
import leadGenAiTypebot from "./typebots/lead-gen-ai.json";
import leadMagnetTypebot from "./typebots/lead-magnet.json";
import leadScoringTypebot from "./typebots/lead-scoring.json";
import movieRecommendationTypebot from "./typebots/movie-recommendation.json";
import npsTypebot from "./typebots/nps.json";
import onboardingTypebot from "./typebots/onboarding.json";
import openaiAssistantChatTypebot from "./typebots/openai-assistant-chat.json";
import openaiConditionsTypebot from "./typebots/openai-conditions.json";
import productRecommendationTypebot from "./typebots/product-recommendation.json";
import quickCarbCalculatorTypebot from "./typebots/quick-carb-calculator.json";
import quizTypebot from "./typebots/quiz.json";
import savingsEstimatorTypebot from "./typebots/savings-estimator.json";
import skinTypologyTypebot from "./typebots/skin-typology.json";

const defaultTemplateWorkspaceId = "proWorkspace";

const typebotBySlug = new Map<string, unknown>([
  ["audio-chat-gpt", audioChatGptTypebot],
  ["basic-chat-gpt", basicChatGptTypebot],
  ["chat-gpt-personas", chatGptPersonasTypebot],
  ["customer-support", customerSupportTypebot],
  ["digital-product-payment", digitalProductPaymentTypebot],
  ["dog-insurance-offer", dogInsuranceOfferTypebot],
  ["faq", faqTypebot],
  ["high-ticket-lead-follow-up", highTicketLeadFollowUpTypebot],
  ["lead-gen-ai", leadGenAiTypebot],
  ["lead-gen", leadGenTypebot],
  ["lead-magnet", leadMagnetTypebot],
  ["lead-scoring", leadScoringTypebot],
  ["movie-recommendation", movieRecommendationTypebot],
  ["nps", npsTypebot],
  ["onboarding", onboardingTypebot],
  ["openai-assistant-chat", openaiAssistantChatTypebot],
  ["openai-conditions", openaiConditionsTypebot],
  ["product-recommendation", productRecommendationTypebot],
  ["quick-carb-calculator", quickCarbCalculatorTypebot],
  ["quiz", quizTypebot],
  ["savings-estimator", savingsEstimatorTypebot],
  ["skin-typology", skinTypologyTypebot],
]);

export const getTemplateWithTypebotBySlug = (slug: string) => {
  const template = getTemplateBySlug(slug);
  if (!template) return;

  const typebot = cloneTemplateTypebot(typebotBySlug.get(slug));
  if (!typebot) return;

  return { template, typebot };
};

const cloneTemplateTypebot = (typebot: unknown) => {
  if (!isRecord(typebot)) return;

  const clonedTypebot = structuredClone(typebot);
  if (!isRecord(clonedTypebot)) return;

  return {
    ...clonedTypebot,
    workspaceId:
      typeof clonedTypebot.workspaceId === "string"
        ? clonedTypebot.workspaceId
        : defaultTemplateWorkspaceId,
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
