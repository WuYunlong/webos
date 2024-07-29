<template>
  <OsApp>
    <template #head>
      <div class="head drag" />
    </template>
    <div class="test drag" />
  </OsApp>
</template>

<script setup lang="ts">
import OsApp from '@/components/OsApp.vue'
</script>

<style scoped lang="scss">
.head {
  width: 100%;
  height: 40px;
  background-color: rgba(255, 255, 255, 0);
}
.test {
  width: 50px;
  height: 50px;
  background-color: #f00;
}
</style>
