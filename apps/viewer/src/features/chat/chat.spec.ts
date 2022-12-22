import { getTestAsset } from '@/test/utils/playwright'
import test, { expect } from '@playwright/test'
import cuid from 'cuid'
import prisma from '@/lib/prisma'
import { HttpMethod, SendMessageInput } from 'models'
import {
  createWebhook,
  deleteTypebots,
  deleteWebhooks,
  importTypebotInDatabase,
} from 'utils/playwright/databaseActions'

test.afterEach(async () => {
  await deleteWebhooks(['chat-webhook-id'])
  await deleteTypebots(['chat-sub-bot'])
})

test('API chat execution should work on preview bot', async ({ request }) => {
  const typebotId = cuid()
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
            typebotId,
            isPreview: true,
          },
          // TODO: replace with satisfies once compatible with playwright
        } as SendMessageInput,
      })
    ).json()
    expect(resultId).toBeUndefined()
    expect(sessionId).toBeDefined()
    expect(messages[0].content.plainText).toBe('Hi there! 👋')
    expect(messages[1].content.plainText).toBe("Welcome. What's your name?")
    expect(input.type).toBe('text input')
  })
})

test('API chat execution should work on published bot', async ({ request }) => {
  const typebotId = cuid()
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
            typebotId,
          },
          // TODO: replace with satisfies once compatible with playwright
        } as SendMessageInput,
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
    expect(messages[0].content.plainText).toBe('Hi there! 👋')
    expect(messages[1].content.plainText).toBe("Welcome. What's your name?")
    expect(input.type).toBe('text input')
  })

  await test.step('Answer Name question', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sendMessage`, {
        data: { message: 'John', sessionId: chatSessionId },
      })
    ).json()
    expect(messages[0].content.plainText).toBe('Nice to meet you John')
    expect(messages[1].content.url).toMatch(new RegExp('giphy.com', 'gm'))
    expect(input.type).toBe('number input')
  })

  await test.step('Answer Age question', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sendMessage`, {
        data: { message: '24', sessionId: chatSessionId },
      })
    ).json()
    expect(messages[0].content.plainText).toBe('Ok, you are an adult then 😁')
    expect(messages[1].content.plainText).toBe('My magic number is 42')
    expect(messages[2].content.plainText).toBe(
      'How would you rate the experience so far?'
    )
    expect(input.type).toBe('rating input')
  })

  await test.step('Answer Rating question', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sendMessage`, {
        data: { message: '8', sessionId: chatSessionId },
      })
    ).json()
    expect(messages[0].content.plainText).toBe(
      "I'm gonna shoot multiple inputs now..."
    )
    expect(input.type).toBe('email input')
  })

  await test.step('Answer Email question with wrong input', async () => {
    const { messages, input } = await (
      await request.post(`/api/v1/sendMessage`, {
        data: { message: 'invalid email', sessionId: chatSessionId },
      })
    ).json()
    expect(messages[0].content.plainText).toBe(
      "This email doesn't seem to be valid. Can you type it again?"
    )
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
    const { messages, input } = await (
      await request.post(`/api/v1/sendMessage`, {
        data: { message: 'Yolo', sessionId: chatSessionId },
      })
    ).json()
    expect(messages[0].content.plainText).toBe(
      'Invalid message. Please, try again.'
    )
    expect(input.type).toBe('choice input')
  })

  await test.step('Answer Buttons question with invalid choice', async () => {
    const { messages } = await (
      await request.post(`/api/v1/sendMessage`, {
        data: { message: 'Yes', sessionId: chatSessionId },
      })
    ).json()
    expect(messages[0].content.plainText).toBe('Ok, you are solid 👏')
    expect(messages[1].content.plainText).toBe("Let's trigger a webhook...")
    expect(messages[2].content.plainText.length).toBeGreaterThan(0)
  })
})
