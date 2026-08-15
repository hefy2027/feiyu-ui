<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
export type PopoverTrigger = 'click' | 'hover' | 'manual' | 'focus'

interface Props {
  modelValue?: boolean
  visible?: boolean
  show?: boolean
  trigger?: PopoverTrigger
  placement?: PopoverPlacement
  title?: string
  showArrow?: boolean
  width?: string | number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  visible: undefined,
  show: undefined,
  trigger: 'click',
  placement: 'bottom',
  title: '',
  showArrow: true,
  width: undefined,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:visible': [value: boolean]
  'update:show': [value: boolean]
  open: []
  close: []
}>()

const innerVisible = ref(props.modelValue ?? props.visible ?? props.show ?? false)
const popoverRef = ref<HTMLElement | null>(null)
let hoverTimer: number | null = null

const isVisible = computed(() => {
  if (props.modelValue !== undefined) return props.modelValue
  if (props.visible !== undefined) return props.visible
  if (props.show !== undefined) return props.show
  return innerVisible.value
})

watch(
  () => props.modelValue ?? props.visible ?? props.show,
  (val) => {
    if (val !== undefined) {
      innerVisible.value = val
    }
  }
)

function updateVisibility(val: boolean) {
  innerVisible.value = val
  emit('update:modelValue', val)
  emit('update:visible', val)
  emit('update:show', val)
  if (val) emit('open')
  else emit('close')
}

function toggle() {
  if (props.disabled) return
  if (props.trigger === 'click') {
    updateVisibility(!isVisible.value)
  }
}

function open() {
  if (props.disabled) return
  if (hoverTimer) clearTimeout(hoverTimer)
  updateVisibility(true)
}

function close() {
  if (hoverTimer) clearTimeout(hoverTimer)
  updateVisibility(false)
}

function handleMouseEnter() {
  if (props.trigger === 'hover') {
    open()
  }
}

function handleMouseLeave() {
  if (props.trigger === 'hover') {
    hoverTimer = window.setTimeout(() => {
      close()
    }, 150)
  }
}

function handleFocusIn() {
  if (props.trigger === 'focus') {
    open()
  }
}

function handleFocusOut() {
  if (props.trigger === 'focus') {
    close()
  }
}

function handleClickOutside(event: MouseEvent) {
  if (props.trigger === 'click' && popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside, true)
})

defineExpose({
  open,
  close,
  toggle
})
</script>

<template>
  <div
    ref="popoverRef"
    :class="['ui-popover', { 'ui-popover--open': isVisible }]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
  >
    <div class="ui-popover__trigger" @click.stop="toggle">
      <slot :is-open="isVisible" />
    </div>

    <transition name="ui-popover-fade">
      <div
        v-if="isVisible"
        :class="[
          'ui-popover__content',
          `ui-popover__content--${placement}`,
          { 'has-arrow': showArrow }
        ]"
        :style="{ width: typeof width === 'number' ? `${width}px` : width }"
        @click.stop
      >
        <div v-if="title || $slots.header" class="ui-popover__header">
          <slot name="header">{{ title }}</slot>
        </div>
        <div class="ui-popover__body">
          <slot name="content" />
        </div>
        <div v-if="showArrow" class="ui-popover__arrow" />
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.ui-popover {
  position: relative;
  display: inline-flex;

  &--open,
  &:has(.ui-popover__content) {
    z-index: 50;
  }

  &__trigger {
    display: inline-flex;
    cursor: pointer;
  }

  &__content {
    position: absolute;
    z-index: 150;
    padding: 12px 14px;
    border-radius: var(--r-md);
    background: color-mix(in srgb, var(--surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-hi);
    font-size: var(--font-size-sm);
    color: var(--on-surface);
    min-width: 140px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    /* Placement positions */
    &--top {
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
    }
    &--top-start {
      bottom: calc(100% + 8px);
      left: 0;
    }
    &--top-end {
      bottom: calc(100% + 8px);
      right: 0;
    }
    &--bottom {
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
    }
    &--bottom-start {
      top: calc(100% + 8px);
      left: 0;
    }
    &--bottom-end {
      top: calc(100% + 8px);
      right: 0;
    }
    &--left {
      right: calc(100% + 8px);
      top: 50%;
      transform: translateY(-50%);
    }
    &--right {
      left: calc(100% + 8px);
      top: 50%;
      transform: translateY(-50%);
    }
  }

  &__header {
    font-weight: 700;
    font-size: var(--font-size-sm);
    color: var(--on-surface);
    border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
    padding-bottom: 6px;
    margin-bottom: 2px;
  }

  &__body {
    font-weight: 500;
    color: var(--on-surface-variant);
    line-height: 1.5;
  }

  &__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: color-mix(in srgb, var(--surface-container-lowest) 92%, transparent);
    border: 1px solid var(--glass-border);
    transform: rotate(45deg);
    pointer-events: none;
  }

  &__content--top &__arrow,
  &__content--top-start &__arrow,
  &__content--top-end &__arrow {
    bottom: -4px;
    border-top: none;
    border-left: none;
  }
  &__content--top &__arrow { left: calc(50% - 4px); }
  &__content--top-start &__arrow { left: 16px; }
  &__content--top-end &__arrow { right: 16px; }

  &__content--bottom &__arrow,
  &__content--bottom-start &__arrow,
  &__content--bottom-end &__arrow {
    top: -4px;
    border-bottom: none;
    border-right: none;
  }
  &__content--bottom &__arrow { left: calc(50% - 4px); }
  &__content--bottom-start &__arrow { left: 16px; }
  &__content--bottom-end &__arrow { right: 16px; }

  &__content--left &__arrow {
    right: -4px;
    top: calc(50% - 4px);
    border-left: none;
    border-bottom: none;
  }
  &__content--right &__arrow {
    left: -4px;
    top: calc(50% - 4px);
    border-right: none;
    border-top: none;
  }
}

.ui-popover-fade-enter-active,
.ui-popover-fade-leave-active {
  transition: opacity 0.18s var(--ease-soft), transform 0.18s var(--ease-out);
}
.ui-popover-fade-enter-from,
.ui-popover-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.96);
}
</style>
