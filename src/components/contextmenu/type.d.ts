export interface MenuItem {
  label?: string
  icon?: string
  type?: string
  click?: () => Promise<boolean> | boolean | void
  children?: MenuItem[]
}

export interface MenuOptions {
  e: MouseEvent
  items: MenuItem[]
  onClose?: () => void
}
