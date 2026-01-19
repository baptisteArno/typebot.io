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

export type TemplateCategory = "marketing" | "product";

export type TemplateHighlight = {
  title: string;
  description: string;
};

export type TemplateDefinition = {
  name: string;
  summary: string;
  description: string;
  emoji: string;
  fileName: string;
  category?: TemplateCategory;
  useCase: TemplateUseCase;
  features: TemplateFeature[];
  highlights: TemplateHighlight[];
  bestFor: string[];
  collects?: string[];
  backgroundColor?: string;
  isComingSoon?: boolean;
  isNew?: boolean;
  updatedAt: string;
};

export type Template = TemplateDefinition & {
  id: string;
  slug: string;
};

const templateUpdatedAt = "2026-01-05";

const templateDefinitions = [
  {
    name: "Lead Generation",
    emoji: "🤝",
    fileName: "lead-gen.json",
    updatedAt: templateUpdatedAt,
    category: "marketing",
    useCase: "Lead Generation",
    features: [],
    summary:
      "A lead generation chatbot template that captures contact details and qualifies prospects fast.",
    description:
      "Use this chatbot to greet new visitors and ask short, friendly questions. It collects the right contact details and intent so your sales team can follow up. The flow is short, clear, and easy to customize.",
    highlights: [
      {
        title: "Goal",
        description: "Turn visitors into qualified leads.",
      },
      {
        title: "Flow",
        description: "Warm welcome, quick questions, then contact details.",
      },
      {
        title: "Result",
        description: "Cleaner lead data for faster follow up.",
      },
    ],
    bestFor: ["B2B websites", "Agency inquiry pages", "Service businesses"],
    collects: ["Name", "Email", "Company or role", "Project needs"],
  },
  {
    name: "Customer Support",
    emoji: "😍",
    fileName: "customer-support.json",
    updatedAt: templateUpdatedAt,
    category: "product",
    useCase: "Customer Support",
    features: [],
    summary:
      "A customer support chatbot template that answers common questions and routes issues.",
    description:
      "Handle repeat questions before they reach your inbox. This chatbot shares clear answers and guides people to the right help path. When needed, it routes complex issues to a human.",
    highlights: [
      {
        title: "Goal",
        description: "Reduce support load while helping users faster.",
      },
      {
        title: "Flow",
        description:
          "Pick a topic, get a clear answer, then escalate if needed.",
      },
      {
        title: "Result",
        description: "Fewer tickets and happier customers.",
      },
    ],
    bestFor: ["SaaS help centers", "E-commerce support", "Internal IT"],
    collects: ["Issue type", "Order or account info", "Contact email"],
  },
  {
    name: "Quiz",
    emoji: "🕹️",
    fileName: "quiz.json",
    updatedAt: templateUpdatedAt,
    category: "marketing",
    useCase: "Quiz & Survey",
    features: [],
    summary:
      "A quiz chatbot template that asks fun questions and shows a clear result.",
    description:
      "Run a short quiz that keeps people engaged from start to finish. The chatbot asks one question at a time and shows a result at the end. Use it for education, marketing, or entertainment.",
    highlights: [
      {
        title: "Goal",
        description: "Engage visitors with a short, friendly quiz.",
      },
      {
        title: "Flow",
        description: "One question at a time, then a result page.",
      },
      {
        title: "Result",
        description: "Higher completion rates and clear outcomes.",
      },
    ],
    bestFor: ["Marketing campaigns", "Course creators", "Communities"],
    collects: ["Quiz answers", "Score or result", "Optional email"],
  },
  {
    name: "Lead Scoring",
    emoji: "🏆",
    fileName: "lead-scoring.json",
    updatedAt: templateUpdatedAt,
    category: "marketing",
    useCase: "Lead Generation",
    features: [],
    summary:
      "A lead scoring chatbot template that qualifies prospects with a simple score.",
    description:
      "Ask the right questions to learn fit, budget, and timing. The chatbot scores each lead so your team knows who to call first. It keeps the experience short and clear for visitors.",
    highlights: [
      {
        title: "Goal",
        description: "Score leads so sales can focus on the best fits.",
      },
      {
        title: "Flow",
        description: "Short qualification questions, then a clear score.",
      },
      {
        title: "Result",
        description: "Better prioritization and faster response time.",
      },
    ],
    bestFor: ["Sales teams", "High intent products", "Agencies"],
    collects: ["Use case", "Budget range", "Timeline", "Contact info"],
  },
  {
    name: "Lead Magnet",
    emoji: "🧲",
    fileName: "lead-magnet.json",
    updatedAt: templateUpdatedAt,
    category: "marketing",
    useCase: "Lead Magnets",
    features: [],
    summary:
      "A lead magnet chatbot template that delivers a download in exchange for contact info.",
    description:
      "Offer a guide, checklist, or template with a friendly chat. The chatbot asks for an email and delivers the asset right away. It also tags interest so you can follow up with the right message.",
    highlights: [
      {
        title: "Goal",
        description: "Grow your list with a useful asset.",
      },
      {
        title: "Flow",
        description: "Offer value, collect email, deliver the file.",
      },
      {
        title: "Result",
        description: "More signups with clear intent data.",
      },
    ],
    bestFor: ["Content marketers", "Creators", "Newsletter growth"],
    collects: ["Email", "Interest topic"],
  },
  {
    name: "Product Recommendation",
    emoji: "🍫",
    fileName: "product-recommendation.json",
    updatedAt: templateUpdatedAt,
    category: "marketing",
    useCase: "E-commerce",
    features: [],
    backgroundColor: "#010000",
    summary:
      "A product recommendation chatbot template that matches shoppers to the right item.",
    description:
      "Help shoppers choose by asking a few simple preference questions. The chatbot narrows options and recommends a product that fits. It can also link straight to a product page.",
    highlights: [
      {
        title: "Goal",
        description: "Guide shoppers to the best product faster.",
      },
      {
        title: "Flow",
        description: "Ask preferences, then recommend a match.",
      },
      {
        title: "Result",
        description: "Higher conversion and fewer drop offs.",
      },
    ],
    bestFor: ["E-commerce stores", "Subscription boxes", "Retail catalogs"],
    collects: ["Preferences", "Budget", "Use case"],
  },
  {
    name: "NPS Survey",
    emoji: "⭐",
    fileName: "nps.json",
    updatedAt: templateUpdatedAt,
    category: "product",
    useCase: "Quiz & Survey",
    features: [],
    summary:
      "An NPS survey chatbot template that measures loyalty in under a minute.",
    description:
      "Ask the classic NPS question in a friendly, lightweight flow. The chatbot collects a score and a short reason. Use it to track customer sentiment and spot issues early.",
    highlights: [
      {
        title: "Goal",
        description: "Measure loyalty with a quick NPS flow.",
      },
      {
        title: "Flow",
        description: "Score first, then ask for a short reason.",
      },
      {
        title: "Result",
        description: "Clear feedback you can act on fast.",
      },
    ],
    bestFor: ["SaaS teams", "Customer success", "Product feedback"],
    collects: ["NPS score", "Reason", "Optional contact"],
  },
  {
    name: "User Onboarding",
    emoji: "🧑‍🚀",
    fileName: "onboarding.json",
    updatedAt: templateUpdatedAt,
    category: "product",
    useCase: "Onboarding",
    features: [],
    summary:
      "A user onboarding chatbot template that guides new users through first steps.",
    description:
      "Welcome new users and show them the key actions to take. The chatbot shares resources and checks progress step by step. It reduces drop off and helps users succeed faster.",
    highlights: [
      {
        title: "Goal",
        description: "Help new users reach their first win.",
      },
      {
        title: "Flow",
        description: "Short checklist, links, and progress prompts.",
      },
      {
        title: "Result",
        description: "Better activation and lower churn.",
      },
    ],
    bestFor: ["SaaS products", "New customer training", "Internal tools"],
    collects: ["Role", "Goal", "Progress status"],
  },
  {
    name: "Digital Product Payment",
    emoji: "🖼️",
    fileName: "digital-product-payment.json",
    updatedAt: templateUpdatedAt,
    useCase: "E-commerce",
    features: ["Payment integration"],
    summary:
      "A digital product payment chatbot template that sells a download inside chat.",
    description:
      "Sell a digital product in a short chat flow. The chatbot explains the offer, collects an email, and takes payment. It is built for a smooth, focused checkout.",
    highlights: [
      {
        title: "Goal",
        description: "Convert interest into a paid download.",
      },
      {
        title: "Flow",
        description: "Pitch, collect email, then take payment.",
      },
      {
        title: "Result",
        description: "A fast checkout that feels personal.",
      },
    ],
    bestFor: ["Creators", "Courses", "Digital downloads"],
    collects: ["Email", "Payment", "Receipt preference"],
  },
  {
    name: "FAQ",
    emoji: "💬",
    fileName: "faq.json",
    updatedAt: templateUpdatedAt,
    category: "product",
    useCase: "Customer Support",
    features: [],
    summary: "An FAQ chatbot template that surfaces the right answer fast.",
    description:
      "Turn your top questions into a fast self serve experience. The chatbot guides users to the right topic and shares clear answers. It keeps support tickets low and satisfaction high.",
    highlights: [
      {
        title: "Goal",
        description: "Answer common questions in seconds.",
      },
      {
        title: "Flow",
        description: "Choose a topic, read a clear answer, then continue.",
      },
      {
        title: "Result",
        description: "Less support load and faster help.",
      },
    ],
    bestFor: ["Help centers", "Product teams", "Service businesses"],
    collects: ["Question topic", "Was this helpful"],
  },
  {
    name: "Movie Recommendation",
    emoji: "🍿",
    fileName: "movie-recommendation.json",
    updatedAt: templateUpdatedAt,
    useCase: "Entertainment",
    features: [],
    summary:
      "A movie recommendation chatbot template that suggests films based on taste.",
    description:
      "Ask about mood, genre, and favorites, then suggest a movie. The chatbot keeps it light and fun. Great for demos or entertainment flows.",
    highlights: [
      {
        title: "Goal",
        description: "Deliver a fun, fast recommendation.",
      },
      {
        title: "Flow",
        description: "Collect preferences, then suggest a pick.",
      },
      {
        title: "Result",
        description: "A playful experience users can share.",
      },
    ],
    bestFor: ["Community sites", "Demos", "Entertainment brands"],
    collects: ["Genre", "Mood", "Favorite movie"],
  },
  {
    name: "Basic ChatGPT",
    emoji: "🤖",
    fileName: "basic-chat-gpt.json",
    updatedAt: templateUpdatedAt,
    useCase: "AI Chat",
    features: ["AI-powered"],
    summary:
      "A basic AI chatbot template for open ended questions and quick answers.",
    description:
      "Start with a simple AI chat experience powered by ChatGPT. The chatbot answers questions and keeps the conversation open. Use it as a base for more advanced AI flows.",
    highlights: [
      {
        title: "Goal",
        description: "Launch a fast, flexible AI chat experience.",
      },
      {
        title: "Flow",
        description: "User asks, AI responds, repeat.",
      },
      {
        title: "Result",
        description: "A clean baseline you can extend.",
      },
    ],
    bestFor: ["AI demos", "Internal helpers", "FAQ experiments"],
    collects: ["User question"],
  },
  {
    name: "Audio ChatGPT",
    emoji: "🤖",
    fileName: "audio-chat-gpt.json",
    updatedAt: templateUpdatedAt,
    useCase: "AI Chat",
    features: ["AI-powered", "File upload"],
    summary:
      "An audio AI chatbot template that lets users talk and hear replies.",
    description:
      "Let users send voice input and get spoken output. The chatbot handles audio upload and response in one flow. It is great for hands free or accessibility use cases.",
    highlights: [
      {
        title: "Goal",
        description: "Make AI chat work with voice.",
      },
      {
        title: "Flow",
        description: "Record audio, upload, then hear a reply.",
      },
      {
        title: "Result",
        description: "A friendly voice experience that feels modern.",
      },
    ],
    bestFor: ["Voice experiences", "Accessibility", "Mobile demos"],
    collects: ["Audio message", "Optional text"],
  },
  {
    name: "ChatGPT Personas",
    emoji: "🎭",
    fileName: "chat-gpt-personas.json",
    updatedAt: templateUpdatedAt,
    useCase: "AI Chat",
    features: ["AI-powered"],
    summary:
      "An AI persona chatbot template that lets users pick a personality.",
    description:
      "Offer multiple AI personas with clear styles or roles. The chatbot asks who the user wants to talk to and sets the tone. It is a fun way to explore AI behavior.",
    highlights: [
      {
        title: "Goal",
        description: "Show how AI tone can change by role.",
      },
      {
        title: "Flow",
        description: "Pick a persona, then start the chat.",
      },
      {
        title: "Result",
        description: "A playful, memorable AI demo.",
      },
    ],
    bestFor: ["Demos", "Education", "Brand voices"],
    collects: ["Persona choice", "User question"],
  },
  {
    name: "Lead Gen with AI",
    emoji: "🦾",
    fileName: "lead-gen-ai.json",
    updatedAt: templateUpdatedAt,
    category: "marketing",
    useCase: "Lead Generation",
    features: ["AI-powered"],
    summary:
      "An AI lead generation chatbot template that qualifies leads with smart follow ups.",
    description:
      "Use AI to ask better follow up questions during lead capture. The chatbot adapts based on responses and keeps the flow short. It delivers richer lead context to your team.",
    highlights: [
      {
        title: "Goal",
        description: "Collect leads with more useful context.",
      },
      {
        title: "Flow",
        description: "Short questions with AI follow ups.",
      },
      {
        title: "Result",
        description: "Higher quality leads and cleaner handoff.",
      },
    ],
    bestFor: ["Sales teams", "B2B products", "Agencies"],
    collects: ["Goal", "Budget", "Timeline", "Contact info"],
  },
  {
    name: "Insurance Offer",
    emoji: "🐶",
    fileName: "dog-insurance-offer.json",
    updatedAt: templateUpdatedAt,
    category: "marketing",
    useCase: "E-commerce",
    features: [],
    summary:
      "An insurance offer chatbot template that matches users to the right plan.",
    description:
      "Gather basic details and recommend the best option. The chatbot keeps questions simple and clear. It works well for quote requests and policy comparisons.",
    highlights: [
      {
        title: "Goal",
        description: "Guide users to the right coverage option.",
      },
      {
        title: "Flow",
        description: "Ask key details, then present an offer.",
      },
      {
        title: "Result",
        description: "More qualified quote requests.",
      },
    ],
    bestFor: ["Insurance brokers", "Quote funnels", "Lead capture"],
    collects: ["Coverage needs", "Household details", "Contact info"],
  },
  {
    name: "OpenAI Conditions",
    emoji: "🧠",
    fileName: "openai-conditions.json",
    updatedAt: templateUpdatedAt,
    useCase: "AI Chat",
    features: ["AI-powered"],
    summary:
      "An AI conditional logic chatbot template that routes users based on intent.",
    description:
      "Use AI to detect intent and trigger the right path. The chatbot can branch based on natural language instead of rigid rules. It is a good starting point for smart routing.",
    highlights: [
      {
        title: "Goal",
        description: "Route users based on what they ask.",
      },
      {
        title: "Flow",
        description: "Capture intent, then send to the right branch.",
      },
      {
        title: "Result",
        description: "Smarter flows with less manual logic.",
      },
    ],
    bestFor: ["Support triage", "Lead routing", "Product discovery"],
    collects: ["User message", "Detected intent"],
  },
  {
    name: "High Ticket Lead Follow-up",
    emoji: "📞",
    fileName: "high-ticket-lead-follow-up.json",
    updatedAt: templateUpdatedAt,
    category: "marketing",
    useCase: "Lead Generation",
    features: ["AI-powered"],
    summary:
      "A high ticket lead follow up chatbot template that qualifies serious prospects.",
    description:
      "Follow up after a lead magnet or demo request. The chatbot asks deeper questions about budget, needs, and decision process. It filters out low fit leads and saves time.",
    highlights: [
      {
        title: "Goal",
        description: "Focus on high fit prospects.",
      },
      {
        title: "Flow",
        description: "Ask budget, needs, and decision timing.",
      },
      {
        title: "Result",
        description: "Better qualification with fewer calls.",
      },
    ],
    bestFor: ["High price services", "Agencies", "Consultants"],
    collects: ["Budget", "Decision timeline", "Pain points", "Contact info"],
  },
  {
    name: "Quick Carb Calculator",
    emoji: "🏃‍♂️",
    fileName: "quick-carb-calculator.json",
    updatedAt: templateUpdatedAt,
    category: "marketing",
    useCase: "Entertainment",
    features: [],
    summary:
      "A carb calculator chatbot template that gives quick fueling guidance.",
    description:
      "Ask a few questions, then share a simple carb intake estimate. The chatbot makes the math feel easy and instant. Great for sports or nutrition brands.",
    highlights: [
      {
        title: "Goal",
        description: "Give a quick, useful calculation.",
      },
      {
        title: "Flow",
        description: "Collect basics, then share the estimate.",
      },
      {
        title: "Result",
        description: "A helpful tool users can finish fast.",
      },
    ],
    bestFor: ["Sports brands", "Coaches", "Health content"],
    collects: ["Weight", "Activity level", "Training duration"],
  },
  {
    name: "Skin Typology",
    emoji: "💆‍♀️",
    fileName: "skin-typology.json",
    updatedAt: templateUpdatedAt,
    category: "marketing",
    useCase: "E-commerce",
    features: ["AI-powered"],
    summary:
      "A skin typology chatbot template that recommends a routine based on answers.",
    description:
      "Ask about skin type, concerns, and goals, then give a tailored recommendation. The chatbot feels like a quick consultation. It is ideal for beauty and skincare brands.",
    highlights: [
      {
        title: "Goal",
        description: "Match users to the right routine.",
      },
      {
        title: "Flow",
        description: "Ask skin questions, then recommend products.",
      },
      {
        title: "Result",
        description: "More confident shoppers and higher intent.",
      },
    ],
    bestFor: ["Skincare brands", "Beauty retailers", "Lead magnets"],
    collects: ["Skin type", "Concerns", "Routine goals"],
  },
  {
    name: "OpenAI Assistant Chat",
    emoji: "🤖",
    fileName: "openai-assistant-chat.json",
    updatedAt: templateUpdatedAt,
    useCase: "AI Chat",
    features: ["AI-powered"],
    summary:
      "An OpenAI assistant chatbot template for task focused AI conversations.",
    description:
      "Start a direct chat with your OpenAI assistant. The chatbot focuses on quick tasks and clear answers. Use it as a base for a smarter helper.",
    highlights: [
      {
        title: "Goal",
        description: "Build a focused AI helper fast.",
      },
      {
        title: "Flow",
        description: "User asks, assistant replies with a task first answer.",
      },
      {
        title: "Result",
        description: "A clean base for AI workflows.",
      },
    ],
    bestFor: ["Internal tools", "AI assistants", "Prototypes"],
    collects: ["Task request"],
  },
  {
    name: "Savings Estimator",
    emoji: "💰",
    fileName: "savings-estimator.json",
    updatedAt: templateUpdatedAt,
    category: "marketing",
    useCase: "E-commerce",
    features: [],
    summary:
      "A savings estimator chatbot template that shows users what they can save.",
    description:
      "Ask a few short questions and calculate a simple savings estimate. The chatbot highlights the value of your product in a clear way. It is great for e-commerce or subscriptions.",
    highlights: [
      {
        title: "Goal",
        description: "Show value with a quick estimate.",
      },
      {
        title: "Flow",
        description: "Collect usage data, then show savings.",
      },
      {
        title: "Result",
        description: "Stronger value perception and intent.",
      },
    ],
    bestFor: ["E-commerce brands", "Subscription products", "Value pages"],
    collects: ["Current spend", "Usage frequency", "Contact info"],
  },
] satisfies TemplateDefinition[];

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

export const templates: Template[] = templateDefinitions.map(
  (template, index) => {
    const slug = template.fileName.replace(".json", "");
    return {
      ...template,
      id: `template-${index + 1}`,
      slug,
    };
  },
);

export const getTemplateBySlug = (slug: string) =>
  templates.find((template) => template.slug === slug);
