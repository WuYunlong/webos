import type { Directive, DirectiveBinding } from 'vue'

export const vClickOut: Directive<HTMLElement, () => void> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<() => void>) {
    const { value } = binding
    console.log(el, value)
  }
}
