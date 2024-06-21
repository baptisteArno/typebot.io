import { createIframe } from '../src/iframe'
import * as Sniper from '../src'
import { SniperPostMessageData } from '../src'

describe('createIframe', () => {
  it('should create a valid iframe element', () => {
    expect.assertions(3)
    const iframeElement = createIframe({
      url: 'https://sniper.io/sniper-id',
    })
    expect(iframeElement.tagName).toBe('IFRAME')
    expect(iframeElement.getAttribute('data-id')).toBe(
      'https://sniper.io/sniper-id'
    )
    expect(iframeElement.getAttribute('src')).toBe(
      'https://sniper.io/sniper-id'
    )
  })

  it('should parse the right src prop if custom domain and starterVariables', () => {
    expect.assertions(1)
    const iframes = [
      createIframe({
        url: 'https://sniper.io/sniper-id',
        hiddenVariables: { var1: 'value1', var2: 'value2', var3: undefined },
      }),
    ]
    expect(iframes[0].getAttribute('src')).toBe(
      'https://sniper.io/sniper-id?var1=value1&var2=value2'
    )
  })

  it('should have a custom background color if defined', () => {
    expect.assertions(1)
    const iframeElement = createIframe({
      url: 'https://sniper.io/sniper-id',
      backgroundColor: 'green',
    })
    expect(iframeElement.style.backgroundColor).toBe('green')
  })

  it('should have a lazy loading behavior if defined', () => {
    expect.assertions(2)
    const iframeElement = createIframe({
      url: 'https://sniper.io/sniper-id',
      loadWhenVisible: true,
    })
    expect(iframeElement.getAttribute('data-src')).toBe(
      'https://sniper.io/sniper-id'
    )
    expect(iframeElement.getAttribute('src')).toBeFalsy()
  })

  it('should redirect on event', async () => {
    expect.assertions(1)
    createIframe({
      url: 'https://sniper.io/sniper-id',
    })
    window.open = jest.fn()
    window.postMessage(
      {
        from: 'sniper',
        redirectUrl: 'https://google.fr',
      },
      '*'
    )
    await new Promise((r) => setTimeout(r, 1))
    expect(window.open).toHaveBeenCalledWith('https://google.fr')
  })

  it('should trigger var callback on var event', async () => {
    expect.assertions(2)
    let n, v
    createIframe({
      url: 'https://sniper.io/sniper-id',
      onNewVariableValue: ({ name, value }) => {
        v = value
        n = name
      },
    })
    window.postMessage(
      {
        from: 'sniper',
        newVariableValue: { name: 'varName', value: 'varValue' },
      },
      '*'
    )
    await new Promise((r) => setTimeout(r, 1))
    expect(n).toBe('varName')
    expect(v).toBe('varValue')
  })

  it("shouldn't execute callbacks if event from other than sniper", async () => {
    expect.assertions(3)
    let n, v
    createIframe({
      url: 'https://sniper.io/sniper-id',
      onNewVariableValue: ({ name, value }) => {
        v = value
        n = name
      },
    })
    window.open = jest.fn()
    window.postMessage(
      {
        redirectUrl: 'https://google.fr',
        newVariableValue: { name: 'varName', value: 'varValue' },
      },
      '*'
    )
    await new Promise((r) => setTimeout(r, 1))
    expect(window.open).not.toHaveBeenCalled()
    expect(n).toBeUndefined()
    expect(v).toBeUndefined()
  })

  it('should close chat when receive close command', async () => {
    expect.assertions(2)
    const { open } = Sniper.initBubble({
      url: 'https://sniper.io/sniper-id2',
    })
    const bubble = document.getElementById('sniper-bubble')
    open()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(bubble?.classList.contains('iframe-opened')).toBe(true)
    const messageData: SniperPostMessageData = {
      closeChatBubble: true,
    }
    window.postMessage(
      {
        from: 'sniper',
        ...messageData,
      },
      '*'
    )
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(bubble?.classList.contains('iframe-opened')).toBe(false)
  })
})
