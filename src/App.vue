<template>
  <OsDesktop>
    <OsDock />
    <OsWorkspace />
    <OsWindows />
    <OsWallpaper />
  </OsDesktop>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { fromEvent, Subscription } from 'rxjs'
import OsDesktop from './components/OsDesktop.vue'
import OsWallpaper from './components/OsWallpaper.vue'
import OsDock from './components/OsDock.vue'
import OsWorkspace from './components/OsWorkspace.vue'
import OsWindows from './components/OsWindows.vue'

const subscriptions = new Subscription()

subscriptions.add(fromEvent(document, 'wheel', { passive: false }).subscribe(e => e.preventDefault()))

onBeforeUnmount(() => {
  subscriptions.unsubscribe()
})
</script>
