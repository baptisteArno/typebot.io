export type TemplateUseCase =
  | "Lead Generation"
  | "Customer Support"
  | "AI Chat"
  | "Quiz & Survey"
  | "E-commerce"
  | "Lead Magnets"
  | "Onboarding"
  | "Entertainment";

export type TemplateFeature =
  | "AI-powered"
  | "Payment integration"
  | "File upload";

export type Template = {
  id: string;
  name: string;
  description: string;
  useCase: TemplateUseCase;
  features: TemplateFeature[];
  emoji: string;
  fileName: string;
};

const templateDefinitions: Omit<Template, "id">[] = [
  {
    name: "Lead Generation",
    emoji: "🤝",
    fileName: "lead-gen.json",
    useCase: "Lead Generation",
    features: [],
    description:
      "Capture and qualify leads with this conversational form template.",
  },
  {
    name: "Customer Support",
    emoji: "😍",
    fileName: "customer-support.json",
    useCase: "Customer Support",
    features: [],
    description:
      "Answer common questions automatically and route complex issues to your team.",
  },
  {
    name: "Quiz",
    emoji: "🕹️",
    fileName: "quiz.json",
    useCase: "Quiz & Survey",
    features: [],
    description:
      "Create engaging quizzes for education, marketing, or entertainment.",
  },
  {
    name: "Lead Scoring",
    emoji: "🏆",
    fileName: "lead-scoring.json",
    useCase: "Lead Generation",
    features: [],
    description:
      "Qualify leads automatically based on their responses and assign scores.",
  },
  {
    name: "Lead Magnet",
    emoji: "🧲",
    fileName: "lead-magnet.json",
    useCase: "Lead Magnets",
    features: [],
    description:
      "Deliver valuable content in exchange for contact information.",
  },
  {
    name: "Product Recommendation",
    emoji: "🍫",
    fileName: "product-recommendation.json",
    useCase: "E-commerce",
    features: [],
    description:
      "Guide customers to the right product based on their needs and preferences.",
  },
  {
    name: "NPS Survey",
    emoji: "⭐",
    fileName: "nps.json",
    useCase: "Quiz & Survey",
    features: [],
    description: "Measure customer loyalty with Net Promoter Score surveys.",
  },
  {
    name: "User Onboarding",
    emoji: "🧑‍🚀",
    fileName: "onboarding.json",
    useCase: "Onboarding",
    features: [],
    description:
      "Streamline the onboarding process with interactive checklists and resources.",
  },
  {
    name: "Digital Product Payment",
    emoji: "🖼️",
    fileName: "digital-product-payment.json",
    useCase: "E-commerce",
    features: ["Payment integration"],
    description: "Sell digital products with an integrated payment flow.",
  },
  {
    name: "FAQ",
    emoji: "💬",
    fileName: "faq.json",
    useCase: "Customer Support",
    features: [],
    description:
      "Answer frequently asked questions automatically with a conversational interface.",
  },
  {
    name: "Movie Recommendation",
    emoji: "🍿",
    fileName: "movie-recommendation.json",
    useCase: "Entertainment",
    features: [],
    description:
      "Recommend movies based on user preferences and viewing history.",
  },
  {
    name: "Basic ChatGPT",
    emoji: "🤖",
    fileName: "basic-chat-gpt.json",
    useCase: "AI Chat",
    features: ["AI-powered"],
    description: "A simple ChatGPT-powered bot for general conversations.",
  },
  {
    name: "Audio ChatGPT",
    emoji: "🤖",
    fileName: "audio-chat-gpt.json",
    useCase: "AI Chat",
    features: ["AI-powered", "File upload"],
    description:
      "ChatGPT-powered bot with audio input and output capabilities.",
  },
  {
    name: "ChatGPT Personas",
    emoji: "🎭",
    fileName: "chat-gpt-personas.json",
    useCase: "AI Chat",
    features: ["AI-powered"],
    description:
      "Create different AI personas with distinct personalities and expertise.",
  },
  {
    name: "Lead Gen with AI",
    emoji: "🦾",
    fileName: "lead-gen-ai.json",
    useCase: "Lead Generation",
    features: ["AI-powered"],
    description:
      "AI-powered lead generation with intelligent qualification and follow-up.",
  },
  {
    name: "Insurance Offer",
    emoji: "🐶",
    fileName: "dog-insurance-offer.json",
    useCase: "E-commerce",
    features: [],
    description:
      "Present insurance offers based on customer needs and profile.",
  },
  {
    name: "OpenAI Conditions",
    emoji: "🧠",
    fileName: "openai-conditions.json",
    useCase: "AI Chat",
    features: ["AI-powered"],
    description:
      "Use OpenAI to create dynamic conditional logic in your chatbot.",
  },
  {
    name: "High Ticket Lead Follow-up",
    emoji: "📞",
    fileName: "high-ticket-lead-follow-up.json",
    useCase: "Lead Generation",
    features: ["AI-powered"],
    description:
      "AI-powered follow-up for high-value leads with personalized engagement.",
  },
  {
    name: "Quick Carb Calculator",
    emoji: "🏃‍♂️",
    fileName: "quick-carb-calculator.json",
    useCase: "Entertainment",
    features: [],
    description: "Calculate carbohydrate intake recommendations for athletes.",
  },
  {
    name: "Skin Typology",
    emoji: "💆‍♀️",
    fileName: "skin-typology.json",
    useCase: "E-commerce",
    features: ["AI-powered"],
    description:
      "AI-powered skin type analysis with personalized skincare recommendations.",
  },
  {
    name: "OpenAI Assistant Chat",
    emoji: "🤖",
    fileName: "openai-assistant-chat.json",
    useCase: "AI Chat",
    features: ["AI-powered"],
    description: "A simple conversation with your OpenAI assistant.",
  },
  {
    name: "Savings Estimator",
    emoji: "💰",
    fileName: "savings-estimator.json",
    useCase: "E-commerce",
    features: [],
    description:
      "Help users estimate their potential savings with your product or service.",
  },
];

export const templates: Template[] = templateDefinitions.map(
  (template, index) => ({
    ...template,
    id: `template-${index + 1}`,
  }),
);

export const useCases: TemplateUseCase[] = [
  "Lead Generation",
  "Customer Support",
  "AI Chat",
  "Quiz & Survey",
  "E-commerce",
  "Lead Magnets",
  "Onboarding",
  "Entertainment",
];

export const features: TemplateFeature[] = [
  "AI-powered",
  "Payment integration",
  "File upload",
];
