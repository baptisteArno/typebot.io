const appId = '3c2f3513-5431-4ef8-8913-ad8f39c95278'

const post = (event, payload) => {
  if (window.parent) {
    const data = Object.assign(
      {
        name: event,
        octaapp: true,
        id: appId,
      },
      payload || {}
    )

    window.parent.postMessage(data, '*')
  }
}

post('appConnected')

export const postMessage = post
