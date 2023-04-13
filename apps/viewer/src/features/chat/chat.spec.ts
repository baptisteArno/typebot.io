import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import { createId } from '@paralleldrive/cuid2'
import prisma from '@/lib/prisma'
import { HttpMethod, SendMessageInput } from '@typebot.io/schemas'
import {
  createWebhook,
  deleteTypebots,
  deleteWebhooks,
  importTypebotInDatabase,
} from '@typebot.io/lib/playwright/databaseActions'

test.afterEach(async () => {
  await deleteWebhooks(['chat-webhook-id'])
  await deleteTypebots(['chat-sub-bot'])
})

test('API chat execution should work on preview bot', async ({ request }) => {
  const typebotId = createId()
  const publicId = `${typebotId}-public`
  await importTypebotInDatabase(getTestAsset('typebots/chat/main.json'), {
    id: typebotId,
    publicId,
  })
  await importTypebotInDatabase(getTestAsset('typebots/chat/linkedBot.json'), {
    id: 'chat-sub-bot',
    publicId: 'chat-sub-bot-public',
  })
  await createWebhook(typebotId, {
    id: 'chat-webhook-id',
    method: HttpMethod.GET,
    url: 'https://api.chucknorris.io/jokes/random',
  })

  await test.step('Start the chat', async () => {
    const { sessionId, messages, input, resultId } = await (
      await request.post(`/api/v1/sendMessage`, {
        data: {
          startParams: {
            typebot: typebotId,
            isPreview: true,
          },
        } satisfies SendMessageInput,
      })
    ).json()
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
})

test('API chat execution should work on published bot', async ({ request }) => {
  const typebotId = createId()
  const publicId = `${typebotId}-public`
  await importTypebotInDatabase(getTestAsset('typebots/chat/main.json'), {
    id: typebotId,
    publicId,
  })
  await importTypebotInDatabase(getTestAsset('typebots/chat/linkedBot.json'), {
    id: 'chat-sub-bot',
    publicId: 'chat-sub-bot-public',
  })
  await createWebhook(typebotId, {
    id: 'chat-webhook-id',
    method: HttpMethod.GET,
    url: 'https://api.chucknorris.io/jokes/random',
  })
  let chatSessionId: string

  await test.step('Start the chat', async () => {
    const { sessionId, messages, input, resultId } = await (
      await request.post(`/api/v1/sendMessage`, {
        data: {
          startParams: {
            typebot: publicId,
          },
        } satisfies SendMessageInput,
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
      await request.post(`/api/v1/sendMessage`, {
        data: { message: 'John', sessionId: chatSessionId },
      })
    ).json()
    expect(messages[0].content.richText).toStrictEqual([
      { children: [{ text: 'Nice to meet you John' }], type: 'p' },
    ])
    expect(messages[1].content.url).toMatch(new RegExp('giphy.com', 'gm'))
    expect(input.type).toBe('number input')
  })

  await test.step('Answer Age question', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sendMessage`, {
        data: { message: '24', sessionId: chatSessionId },
      })
    ).json()
    expect(messages[0].content.richText).toStrictEqual([
      { children: [{ text: 'Ok, you are an adult then 😁' }], type: 'p' },
    ])
    expect(messages[1].content.richText).toStrictEqual([
      { children: [{ text: 'My magic number is 42' }], type: 'p' },
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
      await request.post(`/api/v1/sendMessage`, {
        data: { message: '8', sessionId: chatSessionId },
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
      await request.post(`/api/v1/sendMessage`, {
        data: { message: 'invalid email', sessionId: chatSessionId },
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
      await request.post(`/api/v1/sendMessage`, {
        data: { message: 'typebot@email.com', sessionId: chatSessionId },
      })
    ).json()
    expect(messages.length).toBe(0)
    expect(input.type).toBe('url input')
  })

  await test.step('Answer URL question', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sendMessage`, {
        data: { message: 'https://typebot.io', sessionId: chatSessionId },
      })
    ).json()
    expect(messages.length).toBe(0)
    expect(input.type).toBe('choice input')
  })

  await test.step('Answer Buttons question with invalid choice', async () => {
    const { messages } = await (
      await request.post(`/api/v1/sendMessage`, {
        data: { message: 'Yes', sessionId: chatSessionId },
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
})
