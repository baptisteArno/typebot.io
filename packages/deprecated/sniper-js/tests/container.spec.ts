import { initContainer } from '../src/embedTypes/container'

const observe = jest.fn()
const unobserve = jest.fn()

window.IntersectionObserver = jest.fn(() => ({
  observe,
  unobserve,
})) as any

describe('initContainer', () => {
  beforeEach(() => (document.body.innerHTML = ``))

  it('should initialize a valid sniper container', () => {
    expect.assertions(3)
    const containerId = 'container-id'
    document.body.innerHTML = `<div id="${containerId}"></div>`
    const iframe = initContainer(containerId, {
      url: 'https://sniper.io/sniper-id',
    })
    const container = document.getElementById(containerId)
    expect(container?.children).toHaveLength(1)
    expect(container?.children[0].tagName).toBe('IFRAME')
    expect(iframe).toBeDefined()
  })

  it("should return undefined if container doesn't exist", () => {
    expect.assertions(1)
    const containerId = 'container-id'
    const iframe = initContainer(containerId, {
      url: 'https://sniper.io/sniper-id',
    })
    expect(iframe).toBeUndefined()
  })

  it('should return exisiting container', () => {
    expect.assertions(1)
    const containerId = 'container-id'
    document.body.innerHTML = `<div id="${containerId}"></div>`
    const iframe1 = initContainer(containerId, {
      url: 'https://sniper.io/sniper-id',
    })
    const iframe2 = initContainer(containerId, {
      url: 'https://sniper.io/sniper-id',
    })
    expect(iframe1?.id).toBe(iframe2?.id)
  })

  it('should create multiple containers correctly', () => {
    expect.assertions(5)
    const firstId = 'container-1'
    const secondId = 'container-2'
    document.body.innerHTML = `<div id="${firstId}"></div><div id="${secondId}"></div>`
    const firstIframeElement = initContainer(firstId, {
      url: 'https://sniper.io/sniper-id',
    })
    const secondIframeElement = initContainer(firstId, {
      url: 'https://sniper.io/sniper-id',
    })
    const thirdIframeElement = initContainer(secondId, {
      url: 'https://sniper.io/sniper-id',
    })
    expect(firstIframeElement).toBeDefined()
    expect(secondIframeElement).toBeDefined()
    expect(thirdIframeElement).toBeDefined()
    expect(firstIframeElement?.id).toBe(secondIframeElement?.id)
    expect(firstIframeElement?.id).not.toBe(thirdIframeElement?.id)
  })

  it('should be lazy loading by default', () => {
    expect.assertions(2)
    const containerId = 'container'
    document.body.innerHTML = `<div id="${containerId}"></div>`
    const iframe = initContainer(containerId, {
      url: 'https://sniper.io/sniper-id',
    }) as HTMLIFrameElement
    expect(iframe.dataset.src).toBeDefined()
    expect(iframe.src).toBeFalsy()
  })

  it("shouldn't be lazy if setting param to false", () => {
    expect.assertions(2)
    const containerId = 'container'
    document.body.innerHTML = `<div id="${containerId}"></div>`
    const iframe = initContainer(containerId, {
      url: 'https://sniper.io/sniper-id',
      loadWhenVisible: false,
    }) as HTMLIFrameElement
    expect(iframe.dataset.src).toBeUndefined()
    expect(iframe.src).toBeTruthy()
  })
})
