import * as Sniper from '../../src'

describe('initBubble', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('should initialize a bubble embed', () => {
    expect.assertions(2)
    Sniper.initBubble({ url: 'https://sniper.io/sniper-id' })
    const bubbleElement = document.getElementById('sniper-bubble')
    const frame = document.getElementsByTagName('iframe')[0]
    expect(frame).toBeDefined()
    expect(bubbleElement).toBeDefined()
  })

  it('should overwrite bubble if exists', () => {
    expect.assertions(2)
    Sniper.initBubble({
      url: 'https://sniper.io/sniper-id',
      hiddenVariables: { var1: 'test' },
    })
    Sniper.initBubble({ url: 'https://sniper.io/sniper-id2' })
    const frames = document.getElementsByTagName('iframe')
    expect(frames).toHaveLength(1)
    expect(frames[0].dataset.src).toBe('https://sniper.io/sniper-id2')
  })

  it('show open after the corresponding delay', async () => {
    expect.assertions(3)
    Sniper.initBubble({
      autoOpenDelay: 1000,
      url: 'https://sniper.io/sniper-id',
    })
    const bubble = document.querySelector('#sniper-bubble') as HTMLDivElement
    expect(bubble.classList.contains('iframe-opened')).toBe(false)
    await new Promise((r) => setTimeout(r, 1100))
    expect(bubble.classList.contains('iframe-opened')).toBe(true)
    const rememberCloseDecisionFromStorage = localStorage.getItem(
      Sniper.localStorageKeys.rememberClose
    )
    expect(rememberCloseDecisionFromStorage).toBe('true')
  })

  it('should remember close decision if set to true', async () => {
    expect.assertions(1)
    localStorage.setItem(Sniper.localStorageKeys.rememberClose, 'true')
    Sniper.initBubble({
      autoOpenDelay: 1000,
      url: 'https://sniper.io/sniper-id',
    })
    const bubble = document.querySelector('#sniper-bubble') as HTMLDivElement
    await new Promise((r) => setTimeout(r, 1500))
    expect(bubble.classList.contains('iframe-opened')).toBe(false)
  })
})
