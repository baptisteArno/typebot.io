// Bubbles to be disabled
const disabledBubbles = [
  // 'text',
  'image',
  'video',
  'embed',
  'audio',
] as string[]

// Inputs to be disabled
const disabledInputs = [
  // 'text input',
  // 'number input',
  // 'email input',
  // 'url input',
  'date input',
  // 'phone number input',
  'choice input',
  'picture choice input',
  'payment input',
  // 'rating input',
  'file input',
] as string[]

// Logic to be disabled
const disabledLogic = [
  // 'Set variable',
  // 'Condition',
  // 'Redirect',
  // 'Code',
  // 'Typebot link',
  // 'Wait',
  // 'Jump',
  // 'AB test',
] as string[]

// Integrations to be disabled
const disabledIntegrations = [
  'Google Sheets',
  // 'OpenAI',
  'Google Analytics',
  // 'Webhook',
  'Email',
  'Zapier',
  'Make.com',
  'Pabbly',
  'Chatwoot',
  'Pixel',
  'Zemantic AI',
]
// TODO: remove from here to enable blocks
export const disabledBlocks = [
  ...disabledBubbles,
  ...disabledInputs,
  ...disabledLogic,
  ...disabledIntegrations,
]

export const isEnabledBlock = (type: any) => !disabledBlocks.includes(type)
