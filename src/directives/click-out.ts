import type { Directive, DirectiveBinding } from 'vue'

export const vClickOut: Directive<any, any> = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    console.log(el, value)
  }
}
