<template>
  <div ref="el" class="context-menu" :style @contextmenu.prevent>
    <ul>
      <template v-for="(item, i) in props.items" :key="i">
        <li v-if="item.type && item.type === 'line'" class="line"></li>
        <li v-else @click.stop="handleClick(item)">
          <span class="icon" v-if="item.icon">
            <os-icon :name="item.icon"></os-icon>
          </span>
          <span class="text">{{ item.label }}</span>
          <span class="arrow">
            <os-icon name="chevron_right_fill" />
          </span>
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { PropType } from 'vue'
import type { MenuItem } from './type'
import OsIcon from '../OsIcon.vue'

const el = ref<EL>()

const props = defineProps({
  e: {
    type: Object as PropType<MouseEvent>,
    required: true
  },
  items: {
    type: Array as PropType<MenuItem[]>,
    required: true
  }
})

const emits = defineEmits(['close'])

const style = computed(() => {
  let h = 12
  props.items.forEach((item) => {
    if (item.type === 'line') {
      h += 11
    } else {
      h += 28
    }
  })
  return {
    left: `${props.e.clientX}px`,
    top: `${props.e.clientY}px`,
    height: `${h}px`
  }
})

const handleMouseDown = (e: MouseEvent) => {
  if (!el.value!.contains(e.target as Node)) {
    close()
  }
}

const handleClick = (item: MenuItem) => {
  item.click && item.click()
  close(200)
}

const close = (dely = 0) => {
  document.removeEventListener('mousedown', handleMouseDown, true)
  el.value!.style.transition = 'opacity 0.2s'
  el.value!.style.opacity = '0'
  setTimeout(() => emits('close'), dely)
}

onMounted(async () => {
  document.addEventListener('mousedown', handleMouseDown, true)
})
</script>

<style scoped lang="scss">
.context-menu {
  position: absolute;
  min-width: 152px;
  max-width: 200px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  user-select: none;
}
ul {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  padding: 6px;
  list-style: none;
}

li {
  height: 28px;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  padding: 4px;
  border-radius: 4px;
  cursor: default;
  color: #333;

  span {
    display: block;
  }
  .icon {
    width: 20px;
    height: 20px;
  }
  .text {
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    margin: 0 4px;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .arrow {
    width: 14px;
    height: 20px;
    font-size: 14px;
    color: inherit;
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

li.line {
  height: 11px;
  position: relative;
  border-radius: 0;
  &::before {
    content: '';
    position: absolute;
    left: -2px;
    right: -2px;
    top: 5px;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.05);
  }
  &:hover {
    background-color: transparent;
  }
}
</style>