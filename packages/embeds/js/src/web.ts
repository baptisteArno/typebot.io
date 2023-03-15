import { registerWebComponents } from './register'
import { parseTypebot, injectTypebotInWindow } from './window'

registerWebComponents()

const typebot = parseTypebot()

injectTypebotInWindow(typebot)

export default typebot
