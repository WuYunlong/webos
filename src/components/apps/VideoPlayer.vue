<template>
  <div ref="video" class="video" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Artplayer from 'artplayer'

const video = ref<HTMLDivElement>()
onMounted(() => {
  console.log(`on mounted ...`)
  const player = new Artplayer({
    container: video.value!,
    url: 'https://artplayer.org/assets/sample/video.mp4',
    autoplay: true,
    miniProgressBar: true,
    theme: '#23ade5',
    cssVar: {
      '--art-indicator-scale': 1,
      '--art-indicator-size': '8px',
      '--art-progress-height': '3px'
    }
    // autoSize: true
  })
  console.log(player)
})
</script>

<style scoped lang="scss">
.video {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 0;
}
</style>
