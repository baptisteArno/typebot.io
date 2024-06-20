import * as Sniper from '../../src'

beforeEach(() => {
  document.body.innerHTML = ''
})

it('should create the message', () => {
  expect.assertions(2)
  Sniper.initBubble({
    proactiveMessage: { textContent: 'Hi click here!' },
    url: 'https://sniper.io/sniper-id',
  })
  const paragraphElement = document.querySelector(
    '#sniper-bubble > .proactive-message > p'
  )
  const closeButton = document.querySelector(
    '#sniper-bubble > .proactive-message > .close-button'
  )
  expect(paragraphElement?.textContent).toBe('Hi click here!')
  expect(closeButton).toBeTruthy()
})

it('should have the corresponding avatar', () => {
  expect.assertions(1)
  Sniper.initBubble({
    proactiveMessage: {
      textContent: 'Hi click here!',
      avatarUrl: 'https://website.com/my-avatar.png',
    },
    url: 'https://sniper.io/sniper-id',
  })
  const avatarElement = document.querySelector(
    '#sniper-bubble > .proactive-message > img'
  ) as HTMLImageElement
  expect(avatarElement.src).toBe('https://website.com/my-avatar.png')
})

it("shouldn't have opened class if delay not defined", () => {
  expect.assertions(1)
  Sniper.initBubble({
    proactiveMessage: {
      textContent: 'Hi click here!',
    },
    url: 'https://sniper.io/sniper-id',
  })
  const bubble = document.querySelector('#sniper-bubble') as HTMLDivElement
  expect(bubble.classList.contains('message-opened')).toBe(false)
})

it('should show almost immediately if delay is 0', async () => {
  expect.assertions(1)
  Sniper.initBubble({
    proactiveMessage: {
      textContent: 'Hi click here!',
      delay: 0,
    },
    url: 'https://sniper.io/sniper-id',
  })
  const bubble = document.querySelector('#sniper-bubble') as HTMLDivElement
  await new Promise((r) => setTimeout(r, 1))
  expect(bubble.classList.contains('message-opened')).toBe(true)
})

it('show after the corresponding delay', async () => {
  expect.assertions(2)
  Sniper.initBubble({
    proactiveMessage: {
      textContent: 'Hi click here!',
      delay: 1000,
    },
    url: 'https://sniper.io/sniper-id',
  })
  const bubble = document.querySelector('#sniper-bubble') as HTMLDivElement
  expect(bubble.classList.contains('message-opened')).toBe(false)
  await new Promise((r) => setTimeout(r, 1000))
  expect(bubble.classList.contains('message-opened')).toBe(true)
})

it('show the chat on click', async () => {
  expect.assertions(3)
  Sniper.initBubble({
    proactiveMessage: {
      textContent: 'Hi click here!',
      delay: 1000,
    },
    url: 'https://sniper.io/sniper-id',
  })
  const bubble = document.querySelector('#sniper-bubble') as HTMLDivElement
  const iframe = document.querySelector('.sniper-iframe') as HTMLIFrameElement
  expect(bubble.classList.contains('message-opened')).toBe(false)
  await new Promise((r) => setTimeout(r, 1000))
  expect(bubble.classList.contains('message-opened')).toBe(true)
  const message = document.querySelector('.proactive-message') as HTMLDivElement
  message.click()
  expect(iframe.style.display).not.toBe('none')
})
