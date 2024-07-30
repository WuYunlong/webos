<template>
  <span class="svg-icon-wrap">
    <svg :class="svgClass" aria-hidden="true">
      <use :xlink:href="iconName" />
    </svg>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    require: true,
    default: ''
  },
  className: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  }
})

const iconName = computed(() => {
  return `#icon-${props.name}`
})

const svgClass = computed(() => {
  return `svg-icon ${props.className}`
})
</script>

<style scoped lang="scss">
.svg-icon-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: inherit;
  color: inherit;
}

.svg-icon {
  width: 1em;
  height: 1em;
  max-width: 100%;
  max-height: 100%;
  fill: currentColor;
}
</style>
