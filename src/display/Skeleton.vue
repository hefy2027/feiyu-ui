<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

interface Props {
  text?: boolean
  round?: boolean
  circle?: boolean
  height?: string | number
  width?: string | number
  repeat?: number
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: false,
  round: false,
  circle: false,
  height: undefined,
  width: undefined,
  repeat: 1,
  animated: true
})

const itemStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {}
  if (props.width !== undefined) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height !== undefined) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return styles
})
</script>

<template>
  <div class="ui-skeleton-group">
    <div
      v-for="i in repeat"
      :key="i"
      :class="[
        'ui-skeleton',
        {
          'is-text': text,
          'is-round': round,
          'is-circle': circle,
          'is-animated': animated
        }
      ]"
      :style="itemStyle"
    />
  </div>
</template>

<style scoped lang="scss">
.ui-skeleton-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.ui-skeleton {
  display: block;
  width: 100%;
  height: 20px;
  border-radius: var(--r-sm);
  background: color-mix(in srgb, var(--surface-container-high) 80%, transparent);
  position: relative;
  overflow: hidden;

  &.is-text {
    height: 14px;
    border-radius: 4px;
    margin-bottom: 4px;

    &:last-child:not(:only-child) {
      width: 60%;
    }
  }

  &.is-round {
    border-radius: var(--r-full);
  }

  &.is-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &.is-animated::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--surface-container-lowest) 45%, transparent) 50%,
      transparent 100%
    );
    animation: ui-skeleton-shimmer 1.8s infinite cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@keyframes ui-skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
