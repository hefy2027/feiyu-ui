<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name?: string
  size?: number | string
  color?: string
  spin?: boolean
  rotate?: number
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  size: undefined,
  color: undefined,
  spin: false,
  rotate: 0,
  ariaLabel: undefined
})

const iconStyle = computed(() => {
  const styleObj: Record<string, string> = {}
  if (props.size) {
    const sizeStr = typeof props.size === 'number' ? `${props.size}px` : props.size
    styleObj.fontSize = sizeStr
    styleObj.width = sizeStr
    styleObj.height = sizeStr
  }
  if (props.color) {
    styleObj.color = props.color
  }
  if (props.rotate && !props.spin) {
    styleObj.transform = `rotate(${props.rotate}deg)`
  }
  return styleObj
})
</script>

<template>
  <span
    :class="[
      'material-symbols-outlined',
      'ui-icon',
      { 'ui-icon--spin': spin }
    ]"
    :style="iconStyle"
    :aria-label="ariaLabel || name"
    role="img"
  >
    <slot>{{ name }}</slot>
  </span>
</template>

<style scoped lang="scss">
.ui-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  user-select: none;
  vertical-align: middle;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  transition: transform 0.2s ease, color 0.2s ease;

  &--spin {
    animation: ui-icon-spin 1.2s infinite linear;
  }
}

@keyframes ui-icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
