<script setup lang="ts">
export interface ToastItem {
  id: string | number
  text: string
}

interface Props {
  toasts?: ToastItem[]
}

withDefaults(defineProps<Props>(), { toasts: () => [] })
</script>

<template>
  <div class="toast-wrap">
    <transition-group name="fade">
      <div class="toast" v-for="t in toasts" :key="t.id">{{ t.text }}</div>
    </transition-group>
  </div>
</template>
