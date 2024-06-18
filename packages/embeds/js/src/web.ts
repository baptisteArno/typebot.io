import { registerWebComponents } from './register'
import { parseSniper, injectSniperInWindow } from './window'

registerWebComponents()

const sniper = parseSniper()

injectSniperInWindow(sniper)

export default sniper
