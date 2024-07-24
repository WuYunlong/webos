import { h, render } from 'vue'
import ContextMenu from './ContextMenu.vue'

import type { MenuOptions } from './type'

let div: HTMLElement | null = null

export const showMenu = (options: MenuOptions) => {
  if (!div) {
    div = document.createElement('div')
    div.setAttribute('class', 'os-context-menu-list')
    document.body.appendChild(div)
  }

  const item = document.createElement('div')
  item.setAttribute('class', 'os-context-menu-item')
  div.appendChild(item)

  options.onClose = () => {
    setTimeout(() => {
      render(null, item)
      item.remove()
    }, 1)
  }
  const vNode = h(ContextMenu, options)
  render(vNode, item)
}
