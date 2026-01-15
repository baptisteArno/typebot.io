export type TemplateCategory =
  | "Marketing"
  | "Support"
  | "Sales"
  | "AI"
  | "Education";

export type TemplateComplexity = "Simple" | "Intermediate" | "Advanced";

export type Template = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  complexity: TemplateComplexity;
  emoji: string;
  fileName: string;
};

const templateDefinitions: Omit<Template, "id">[] = [
  {
    name: "Lead Generation",
    emoji: "🤝",
    fileName: "lead-gen.json",
    category: "Marketing",
    complexity: "Simple",
    description:
      "Capture and qualify leads with this conversational form template.",
  },
  {
    name: "Customer Support",
    emoji: "😍",
    fileName: "customer-support.json",
    category: "Support",
    complexity: "Intermediate",
    description:
      "Answer common questions automatically and route complex issues to your team.",
  },
  {
    name: "Quiz",
    emoji: "🕹️",
    fileName: "quiz.json",
    category: "Marketing",
    complexity: "Intermediate",
    description:
      "Create engaging quizzes for education, marketing, or entertainment.",
  },
  {
    name: "Lead Scoring",
    emoji: "🏆",
    fileName: "lead-scoring.json",
    category: "Marketing",
    complexity: "Intermediate",
    description:
      "Qualify leads automatically based on their responses and assign scores.",
  },
  {
    name: "Lead Magnet",
    emoji: "🧲",
    fileName: "lead-magnet.json",
    category: "Marketing",
    complexity: "Simple",
    description:
      "Deliver valuable content in exchange for contact information.",
  },
  {
    name: "Product Recommendation",
    emoji: "🍫",
    fileName: "product-recommendation.json",
    category: "Sales",
    complexity: "Intermediate",
    description:
      "Guide customers to the right product based on their needs and preferences.",
  },
  {
    name: "NPS Survey",
    emoji: "⭐",
    fileName: "nps.json",
    category: "Support",
    complexity: "Simple",
    description: "Measure customer loyalty with Net Promoter Score surveys.",
  },
  {
    name: "User Onboarding",
    emoji: "🧑‍🚀",
    fileName: "onboarding.json",
    category: "Support",
    complexity: "Intermediate",
    description:
      "Streamline the onboarding process with interactive checklists and resources.",
  },
  {
    name: "Digital Product Payment",
    emoji: "🖼️",
    fileName: "digital-product-payment.json",
    category: "Sales",
    complexity: "Intermediate",
    description: "Sell digital products with an integrated payment flow.",
  },
  {
    name: "FAQ",
    emoji: "💬",
    fileName: "faq.json",
    category: "Support",
    complexity: "Simple",
    description:
      "Answer frequently asked questions automatically with a conversational interface.",
  },
  {
    name: "Movie Recommendation",
    emoji: "🍿",
    fileName: "movie-recommendation.json",
    category: "Education",
    complexity: "Intermediate",
    description:
      "Recommend movies based on user preferences and viewing history.",
  },
  {
    name: "Basic ChatGPT",
    emoji: "🤖",
    fileName: "basic-chat-gpt.json",
    category: "AI",
    complexity: "Simple",
    description: "A simple ChatGPT-powered bot for general conversations.",
  },
  {
    name: "Audio ChatGPT",
    emoji: "🤖",
    fileName: "audio-chat-gpt.json",
    category: "AI",
    complexity: "Intermediate",
    description:
      "ChatGPT-powered bot with audio input and output capabilities.",
  },
  {
    name: "ChatGPT Personas",
    emoji: "🎭",
    fileName: "chat-gpt-personas.json",
    category: "AI",
    complexity: "Intermediate",
    description:
      "Create different AI personas with distinct personalities and expertise.",
  },
  {
    name: "Lead Gen with AI",
    emoji: "🦾",
    fileName: "lead-gen-ai.json",
    category: "Marketing",
    complexity: "Advanced",
    description:
      "AI-powered lead generation with intelligent qualification and follow-up.",
  },
  {
    name: "Insurance Offer",
    emoji: "🐶",
    fileName: "dog-insurance-offer.json",
    category: "Sales",
    complexity: "Intermediate",
    description:
      "Present insurance offers based on customer needs and profile.",
  },
  {
    name: "OpenAI Conditions",
    emoji: "🧠",
    fileName: "openai-conditions.json",
    category: "AI",
    complexity: "Advanced",
    description:
      "Use OpenAI to create dynamic conditional logic in your chatbot.",
  },
  {
    name: "High Ticket Lead Follow-up",
    emoji: "📞",
    fileName: "high-ticket-lead-follow-up.json",
    category: "Marketing",
    complexity: "Advanced",
    description:
      "AI-powered follow-up for high-value leads with personalized engagement.",
  },
  {
    name: "Quick Carb Calculator",
    emoji: "🏃‍♂️",
    fileName: "quick-carb-calculator.json",
    category: "Education",
    complexity: "Simple",
    description: "Calculate carbohydrate intake recommendations for athletes.",
  },
  {
    name: "Skin Typology",
    emoji: "💆‍♀️",
    fileName: "skin-typology.json",
    category: "Sales",
    complexity: "Advanced",
    description:
      "AI-powered skin type analysis with personalized skincare recommendations.",
  },
  {
    name: "OpenAI Assistant Chat",
    emoji: "🤖",
    fileName: "openai-assistant-chat.json",
    category: "AI",
    complexity: "Intermediate",
    description: "A simple conversation with your OpenAI assistant.",
  },
  {
    name: "Savings Estimator",
    emoji: "💰",
    fileName: "savings-estimator.json",
    category: "Sales",
    complexity: "Simple",
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

export const categories: TemplateCategory[] = [
  "Marketing",
  "Support",
  "Sales",
  "AI",
  "Education",
];

export const complexities: TemplateComplexity[] = [
  "Simple",
  "Intermediate",
  "Advanced",
];
