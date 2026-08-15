<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  height?: number
}

withDefaults(defineProps<Props>(), {
  height: 3
})

const percent = ref(0)
const isVisible = ref(false)
const status = ref<'loading' | 'success' | 'error'>('loading')
let timer: number | null = null

function start() {
  if (timer) clearInterval(timer)
  status.value = 'loading'
  percent.value = 10
  isVisible.value = true

  timer = window.setInterval(() => {
    if (percent.value < 85) {
      percent.value += Math.random() * 12
    }
  }, 200)
}

function finish() {
  if (timer) clearInterval(timer)
  percent.value = 100
  status.value = 'success'
  setTimeout(() => {
    isVisible.value = false
    setTimeout(() => {
      percent.value = 0
    }, 250)
  }, 300)
}

function error() {
  if (timer) clearInterval(timer)
  percent.value = 100
  status.value = 'error'
  setTimeout(() => {
    isVisible.value = false
    setTimeout(() => {
      percent.value = 0
    }, 250)
  }, 400)
}

defineExpose({
  start,
  finish,
  error
})
</script>

<template>
  <div
    v-show="isVisible"
    :class="['fy-loading-bar', `fy-loading-bar--${status}`]"
    :style="{ height: `${height}px` }"
  >
    <div class="fy-loading-bar__progress" :style="{ width: `${percent}%` }" />
  </div>
</template>

<style scoped lang="scss">
.fy-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none;
  background: transparent;

  &__progress {
    height: 100%;
    transition: width 0.2s ease, opacity 0.3s ease;
    border-radius: 0 2px 2px 0;
  }

  &--loading &__progress {
    background: linear-gradient(90deg, var(--fy-primary), var(--fy-primary-container));
    box-shadow: 0 0 10px var(--fy-primary);
  }

  &--fy-success &__progress {
    background: var(--fy-theme-green, #10b981);
    box-shadow: 0 0 10px var(--fy-theme-green, #10b981);
  }

  &--fy-error &__progress {
    background: var(--fy-error, #ba1a1a);
    box-shadow: 0 0 10px var(--fy-error, #ba1a1a);
  }
}
</style>
