import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import prisma from '@typebot.io/lib/prisma'
import { importTypebotInDatabase } from '@typebot.io/playwright/databaseActions'
import { StartChatInput, StartPreviewChatInput } from '@typebot.io/schemas'

test.describe.configure({ mode: 'parallel' })

test.beforeEach(async () => {
  try {
    await importTypebotInDatabase(
      getTestAsset('typebots/chat/linkedBot.json'),
      {
        id: 'chat-sub-bot',
        publicId: 'chat-sub-bot-public',
      }
    )
    await importTypebotInDatabase(
      getTestAsset('typebots/chat/startingWithInput.json'),
      {
        id: 'starting-with-input',
        publicId: 'starting-with-input-public',
      }
    )
  } catch {
    /* empty */
  }
})

test('API chat execution should work on preview bot', async ({ request }) => {
  const typebotId = createId()
  const publicId = `${typebotId}-public`
  await importTypebotInDatabase(getTestAsset('typebots/chat/main.json'), {
    id: typebotId,
    publicId,
  })

  let chatSessionId: string

  await test.step('Can start and continue chat', async () => {
    const { sessionId, messages, input, resultId } = await (
      await request.post(`/api/v1/typebots/${typebotId}/preview/startChat`, {
        data: {
          isOnlyRegistering: false,
          isStreamEnabled: false,
          textBubbleContentFormat: 'richText',
        } satisfies Omit<StartPreviewChatInput, 'typebotId'>,
      })
    ).json()
    chatSessionId = sessionId
    expect(resultId).toBeUndefined()
    expect(sessionId).toBeDefined()
    expect(messages[0].content.richText).toStrictEqual([
      { children: [{ text: 'Hi there! 👋' }], type: 'p' },
    ])
    expect(messages[1].content.richText).toStrictEqual([
      { children: [{ text: "Welcome. What's your name?" }], type: 'p' },
    ])
    expect(input.type).toBe('text input')
  })

  await test.step('Can answer Name question', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: {
          message: 'John',
        },
      })
    ).json()
    expect(messages[0].content.richText).toStrictEqual([
      {
        children: [
          { text: 'Nice to meet you ' },
          {
            type: 'inline-variable',
            children: [
              {
                type: 'p',
                children: [
                  {
                    text: 'John',
                  },
                ],
              },
            ],
          },
        ],
        type: 'p',
      },
    ])
    expect(input.type).toBe('number input')
  })
})

test('API chat execution should work on published bot', async ({ request }) => {
  const typebotId = createId()
  const publicId = `${typebotId}-public`
  await importTypebotInDatabase(getTestAsset('typebots/chat/main.json'), {
    id: typebotId,
    publicId,
  })

  let chatSessionId: string

  await test.step('Start the chat', async () => {
    const { sessionId, messages, input, resultId } = await (
      await request.post(`/api/v1/typebots/${publicId}/startChat`, {
        data: {
          isOnlyRegistering: false,
          isStreamEnabled: false,
          textBubbleContentFormat: 'richText',
        } satisfies Omit<StartChatInput, 'publicId'>,
      })
    ).json()
    chatSessionId = sessionId
    expect(resultId).toBeDefined()
    const result = await prisma.result.findUnique({
      where: {
        id: resultId,
      },
    })
    expect(result).toBeDefined()
    expect(sessionId).toBeDefined()
    expect(messages[0].content.richText).toStrictEqual([
      { children: [{ text: 'Hi there! 👋' }], type: 'p' },
    ])
    expect(messages[1].content.richText).toStrictEqual([
      { children: [{ text: "Welcome. What's your name?" }], type: 'p' },
    ])
    expect(input.type).toBe('text input')
  })

  await test.step('Answer Name question', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: 'John' },
      })
    ).json()
    expect(messages[0].content.richText).toStrictEqual([
      {
        type: 'p',
        children: [
          { text: 'Nice to meet you ' },
          {
            type: 'inline-variable',
            children: [
              {
                type: 'p',
                children: [
                  {
                    text: 'John',
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
    expect(messages[1].content.url).toMatch(new RegExp('giphy.com', 'gm'))
    expect(input.type).toBe('number input')
  })

  await test.step('Answer Age question', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: '24' },
      })
    ).json()
    expect(messages[0].content.richText).toStrictEqual([
      { children: [{ text: 'Ok, you are an adult then 😁' }], type: 'p' },
    ])
    expect(messages[1].content.richText).toStrictEqual([
      {
        children: [
          { text: 'My magic number is ' },
          {
            type: 'inline-variable',
            children: [
              {
                type: 'p',
                children: [
                  {
                    text: '42',
                  },
                ],
              },
            ],
          },
        ],
        type: 'p',
      },
    ])
    expect(messages[2].content.richText).toStrictEqual([
      {
        children: [{ text: 'How would you rate the experience so far?' }],
        type: 'p',
      },
    ])
    expect(input.type).toBe('rating input')
  })

  await test.step('Answer Rating question', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: '8' },
      })
    ).json()
    expect(messages[0].content.richText).toStrictEqual([
      {
        children: [{ text: "I'm gonna shoot multiple inputs now..." }],
        type: 'p',
      },
    ])
    expect(input.type).toBe('email input')
  })

  await test.step('Answer Email question with wrong input', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: 'invalid email' },
      })
    ).json()
    expect(messages[0].content.richText).toStrictEqual([
      {
        children: [
          {
            text: "This email doesn't seem to be valid. Can you type it again?",
          },
        ],
        type: 'p',
      },
    ])
    expect(input.type).toBe('email input')
  })

  await test.step('Answer Email question with valid input', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: 'typebot@email.com' },
      })
    ).json()
    expect(messages.length).toBe(0)
    expect(input.type).toBe('url input')
  })

  await test.step('Answer URL question', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: 'https://typebot.io' },
      })
    ).json()
    expect(messages.length).toBe(0)
    expect(input.type).toBe('choice input')
  })

  await test.step('Answer Buttons question with invalid choice', async () => {
    const { messages } = await (
      await request.post(`/api/v1/sessions/${chatSessionId}/continueChat`, {
        data: { message: 'Yes' },
      })
    ).json()
    expect(messages[0].content.richText).toStrictEqual([
      {
        children: [
          {
            text: 'Ok, you are solid 👏',
          },
        ],
        type: 'p',
      },
    ])
    expect(messages[1].content.richText).toStrictEqual([
      {
        children: [
          {
            text: "Let's trigger a webhook...",
          },
        ],
        type: 'p',
      },
    ])
    expect(messages[2].content.richText.length).toBeGreaterThan(0)
  })
  await test.step('Starting with a message when typebot starts with input should proceed', async () => {
    const response = await (
      await request.post(
        `/api/v1/typebots/starting-with-input-public/startChat`,
        {
          data: {
            //@ts-expect-error We want to test if message is correctly preprocessed by zod
            message: 'Hey',
            isStreamEnabled: false,
            isOnlyRegistering: false,
            textBubbleContentFormat: 'richText',
          } satisfies Omit<StartChatInput, 'publicId'>,
        }
      )
    ).json()
    expect(response.messages[0].content.richText).toStrictEqual([
      {
        children: [
          {
            text: "That's nice!",
          },
        ],
        type: 'p',
      },
    ])
  })
  await test.step('Markdown text bubble format should work', async () => {
    const { messages } = await (
      await request.post(`/api/v1/typebots/${typebotId}/preview/startChat`, {
        data: {
          isOnlyRegistering: false,
          isStreamEnabled: false,
          textBubbleContentFormat: 'markdown',
        } satisfies Omit<StartPreviewChatInput, 'typebotId'>,
      })
    ).json()
    expect(messages[0].content.markdown).toStrictEqual('Hi there! 👋')
    expect(messages[1].content.markdown).toStrictEqual(
      'Welcome. What&#39;s your name?'
    )
  })
})
