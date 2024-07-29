<template>
  <OsDesktop>
    <OsDock />
    <OsApps>
      <OsWindow />
    </OsApps>
    <OsWallpaper />
  </OsDesktop>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import OsDesktop from './components/OsDesktop.vue'
import OsWallpaper from './components/OsWallpaper.vue'
import OsWindow from './components/OsWindow.vue'
import OsDock from './components/OsDock.vue'
import OsApps from './components/OsApps.vue'

onMounted(() => {
  document.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
    },
    { passive: false }
  )
})
</script>

<style scoped lang="scss">
.test {
  width: 200px;
  height: 200px;
  background-color: #f00;
}
</style>
