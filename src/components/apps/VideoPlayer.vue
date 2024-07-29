<template>
  <OsApp>
    <div class="inner">
      <div class="head drag" />
      <div ref="video" class="video" />
    </div>
  </OsApp>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Artplayer from 'artplayer'
import OsApp from '@/components/OsApp.vue'

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
.inner {
  position: relative;
  width: 100%;
  height: 100%;
}
.head {
  width: 100%;
  height: 40px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0);
}
.video {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 0;
}
</style>
