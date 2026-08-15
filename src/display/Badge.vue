<script setup lang="ts">
import { computed, type StyleValue } from 'vue'

export type BadgeType = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default'

interface Props {
  value?: string | number
  max?: number
  dot?: boolean
  showZero?: boolean
  type?: BadgeType
  color?: string
  processing?: boolean
  offset?: [number, number]
  hidden?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  max: 99,
  dot: false,
  showZero: false,
  type: 'error',
  color: undefined,
  processing: false,
  offset: undefined,
  hidden: false
})

const isHidden = computed(() => {
  if (props.hidden) return true
  if (props.dot) return false
  if (props.value === undefined || props.value === null || props.value === '') return true
  if (props.value === 0 && !props.showZero) return true
  return false
})

const displayValue = computed(() => {
  if (props.dot) return ''
  if (typeof props.value === 'number' && props.value > props.max) {
    return `${props.max}+`
  }
  return String(props.value ?? '')
})

const badgeStyle = computed<StyleValue>(() => {
  const styles: Record<string, string> = {}
  if (props.color) {
    styles.backgroundColor = props.color
  }
  if (props.offset) {
    styles.top = `${props.offset[1]}px`
    styles.right = `${props.offset[0]}px`
  }
  return styles
})
</script>

<template>
  <div class="fy-badge">
    <slot />

    <transition name="fy-badge-zoom">
      <sup
        v-if="!isHidden"
        :class="[
          'fy-badge__content',
          `fy-badge__content--${type}`,
          {
            'is-dot': dot,
            'is-processing': processing,
            'is-fixed': !!$slots.default
          }
        ]"
        :style="badgeStyle"
      >
        <slot name="value">
          <slot name="content">{{ displayValue }}</slot>
        </slot>
      </sup>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.fy-badge {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
  flex-shrink: 0;

  &__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    min-width: 18px;
    padding: 0 5px;
    border-radius: var(--fy-r-full);
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 0 0 2px var(--fy-surface-container-lowest);
    user-select: none;

    &.is-fixed {
      position: absolute;
      top: 0;
      right: 0;
      transform: translate(50%, -50%);
    }

    &.is-dot {
      height: 8px;
      min-width: 8px;
      width: 8px;
      padding: 0;
      border-radius: 50%;
    }

    /* Types */
    &--fy-error {
      background: var(--fy-error);
      color: var(--fy-on-error);
    }

    &--fy-primary {
      background: var(--fy-primary);
      color: var(--fy-on-primary);
    }

    &--fy-success {
      background: var(--fy-theme-green, #10b981);
      color: #ffffff;
    }

    &--fy-warning {
      background: var(--fy-theme-yellow, #f59e0b);
      color: #ffffff;
    }

    &--fy-info {
      background: var(--fy-theme-blue, #3b82f6);
      color: #ffffff;
    }

    &--default {
      background: var(--fy-outline);
      color: #ffffff;
    }

    /* Processing ripple effect */
    &.is-processing::after {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      border: 1px solid currentColor;
      animation: fy-badge-ripple 1.4s ease-in-out infinite;
    }
  }
}

@keyframes fy-badge-ripple {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.fy-badge-zoom-enter-active,
.fy-badge-zoom-leave-active {
  transition: transform 0.2s var(--fy-ease-soft), opacity 0.2s var(--fy-ease-soft);
}

.fy-badge-zoom-enter-from,
.fy-badge-zoom-leave-to {
  transform: translate(50%, -50%) scale(0.5);
  opacity: 0;
}
</style>
