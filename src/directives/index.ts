import type { App } from 'vue'
import { vClickOut } from './click-out'

const install = (app: App) => {
  app.directive('click-out', vClickOut)
}

export default { install }
