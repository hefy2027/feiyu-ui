<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  content?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  disabled?: boolean
  delay?: number
  showArrow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  placement: 'top',
  disabled: false,
  delay: 150,
  showArrow: false
})

const visible = ref(false)
let timer: number | null = null

function handleMouseEnter() {
  if (props.disabled) return
  if (timer) clearTimeout(timer)
  timer = window.setTimeout(() => {
    visible.value = true
  }, props.delay)
}

function handleMouseLeave() {
  if (timer) clearTimeout(timer)
  visible.value = false
}
</script>

<template>
  <div
    class="fy-tooltip"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleMouseEnter"
    @focusout="handleMouseLeave"
  >
    <slot />

    <transition name="fy-tooltip-fade">
      <div
        v-if="visible && (content || $slots.content)"
        :class="[
          'fy-tooltip__bubble',
          `fy-tooltip__bubble--${placement}`
        ]"
        role="tooltip"
      >
        <slot name="content">{{ content }}</slot>
        <div v-if="showArrow" class="fy-tooltip__arrow" />
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.fy-tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;

  &__bubble {
    position: absolute;
    z-index: 100;
    padding: 5px 10px;
    border-radius: var(--fy-r-sm);
    background: color-mix(in srgb, var(--fy-inverse-surface) 96%, transparent);
    color: var(--fy-inverse-on-surface);
    backdrop-filter: blur(16px) saturate(1.4);
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    border: 1px solid color-mix(in srgb, var(--fy-inverse-on-surface) 12%, transparent);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22), 0 1px 3px rgba(0, 0, 0, 0.15);
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    pointer-events: none;

    &--top {
      bottom: calc(100% + 7px);
      left: 50%;
      transform: translateX(-50%);

      .fy-tooltip__arrow {
        bottom: -4px;
        left: 50%;
        border-right: 1px solid color-mix(in srgb, var(--fy-inverse-on-surface) 12%, transparent);
        border-bottom: 1px solid color-mix(in srgb, var(--fy-inverse-on-surface) 12%, transparent);
        transform: translateX(-50%) rotate(45deg);
      }
    }

    &--bottom {
      top: calc(100% + 7px);
      left: 50%;
      transform: translateX(-50%);

      .fy-tooltip__arrow {
        top: -4px;
        left: 50%;
        border-left: 1px solid color-mix(in srgb, var(--fy-inverse-on-surface) 12%, transparent);
        border-top: 1px solid color-mix(in srgb, var(--fy-inverse-on-surface) 12%, transparent);
        transform: translateX(-50%) rotate(45deg);
      }
    }

    &--left {
      right: calc(100% + 7px);
      top: 50%;
      transform: translateY(-50%);

      .fy-tooltip__arrow {
        right: -4px;
        top: 50%;
        border-top: 1px solid color-mix(in srgb, var(--fy-inverse-on-surface) 12%, transparent);
        border-right: 1px solid color-mix(in srgb, var(--fy-inverse-on-surface) 12%, transparent);
        transform: translateY(-50%) rotate(45deg);
      }
    }

    &--right {
      left: calc(100% + 7px);
      top: 50%;
      transform: translateY(-50%);

      .fy-tooltip__arrow {
        left: -4px;
        top: 50%;
        border-left: 1px solid color-mix(in srgb, var(--fy-inverse-on-surface) 12%, transparent);
        border-bottom: 1px solid color-mix(in srgb, var(--fy-inverse-on-surface) 12%, transparent);
        transform: translateY(-50%) rotate(45deg);
      }
    }
  }

  &__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: color-mix(in srgb, var(--fy-inverse-surface) 96%, transparent);
    pointer-events: none;
  }
}

/* Fade transitions */
.fy-tooltip-fade-enter-active,
.fy-tooltip-fade-leave-active {
  transition: opacity 0.15s var(--fy-ease-soft), transform 0.15s var(--fy-ease-out);
}

.fy-tooltip-fade-enter-from,
.fy-tooltip-fade-leave-to {
  opacity: 0;
}
</style>
