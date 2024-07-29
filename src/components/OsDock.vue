<template>
  <div class="os-dock">
    <div class="inner">
      <div class="left" />
      <div class="center">
        <button class="item">
          <img src="/icon/Windows.svg" alt="">
        </button>
        <button class="item">
          <img src="/icon/SearchDark.svg" alt="">
        </button>
        <button class="item">
          <img src="/icon/DesktopManiger.svg" alt="">
        </button>
        <button class="item active">
          <img src="/icon/FileExplorer.svg" alt="">
          <span class="dot" />
        </button>
        <button class="item">
          <img src="/icon/MicrosoftEdge.svg" alt="">
        </button>
      </div>
      <div class="right" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.os-dock {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  z-index: 20;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(30px);
  }
}
.inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  z-index: 10;
  .left {
    width: 200px;
  }
  .center {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .right {
    width: 200px;
  }
  .item {
    width: 38px;
    height: 38px;
    box-sizing: border-box;
    margin: 0 4px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    user-select: none;
    position: relative;
    border: 0;
    background-color: rgba(255, 255, 255, 0);

    &:before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 10;
    }

    img {
      position: relative;
      width: 26px;
      height: 26px;
      user-select: none;
      will-change: scale;
      transform: scale(1);
      transition: all 0.3s;
      z-index: 0;
    }
    &.active .dot {
      display: block;
      width: 16px;
      height: 3px;
      background-color: #0067c0;
      position: absolute;
      left: 50%;
      bottom: 0;
      margin-left: -8px;
      border-radius: 2px;
    }
    &.active,
    &:hover,
    &:active {
      background-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.04);
    }
    &:active img {
      transform: scale(0.8);
    }
  }
}
</style>
