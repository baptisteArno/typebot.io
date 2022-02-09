const loadLandbot = (): Promise<void> =>
  new Promise((resolve) => {
    const existingScript = document.getElementById('landbot-lib')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://static.landbot.io/landbot-3/landbot-3.0.0.js'
      script.id = 'landbot-lib'
      document.body.appendChild(script)
      script.onload = () => {
        resolve()
      }
    }
    if (existingScript) resolve()
  })

export default loadLandbot
