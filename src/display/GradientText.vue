<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

export type GradientType = 'primary' | 'info' | 'success' | 'warning' | 'error' | 'candy' | 'sunset' | 'ocean'

interface Props {
  type?: GradientType
  gradient?: string
  size?: string | number
  weight?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  gradient: undefined,
  size: undefined,
  weight: 800
})

const gradientPresets: Record<GradientType, string> = {
  primary: 'linear-gradient(135deg, var(--primary-container) 0%, var(--primary) 100%)',
  info: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  candy: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
  sunset: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
  ocean: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)'
}

const textStyle = computed<CSSProperties>(() => {
  const bg = props.gradient || gradientPresets[props.type] || gradientPresets.primary
  return {
    backgroundImage: bg,
    fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
    fontWeight: props.weight
  }
})
</script>

<template>
  <span class="ui-gradient-text" :style="textStyle">
    <slot />
  </span>
</template>

<style scoped lang="scss">
.ui-gradient-text {
  display: inline-block;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  line-height: 1.25;
}
</style>
