<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

interface Props {
  direction?: 'horizontal' | 'vertical'
  size?: number
  min?: number
  max?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  size: 0.5,
  min: 0.1,
  max: 0.9,
  disabled: false
})

const emit = defineEmits<{
  'update:size': [val: number]
  dragStart: []
  dragMove: [val: number]
  dragEnd: []
}>()

const containerRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const currentSize = computed(() => props.size)

let removeListeners: (() => void) | null = null

function updateRatio(clientX: number, clientY: number) {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  let ratio = 0.5
  if (props.direction === 'horizontal') {
    ratio = (clientX - rect.left) / (rect.width || 1)
  } else {
    ratio = (clientY - rect.top) / (rect.height || 1)
  }
  ratio = Math.max(props.min, Math.min(props.max, ratio))
  emit('update:size', ratio)
  emit('dragMove', ratio)
}

function handleMouseDown(event: MouseEvent) {
  if (props.disabled || !containerRef.value) return
  event.preventDefault()
  isDragging.value = true
  emit('dragStart')
  document.body.style.userSelect = 'none'

  const onMouseMove = (moveEvent: MouseEvent) => {
    updateRatio(moveEvent.clientX, moveEvent.clientY)
  }

  const onMouseUp = () => {
    isDragging.value = false
    document.body.style.userSelect = ''
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    removeListeners = null
    emit('dragEnd')
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  removeListeners = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    document.body.style.userSelect = ''
  }
}

function handleTouchStart(event: TouchEvent) {
  if (props.disabled || !containerRef.value || event.touches.length === 0) return
  isDragging.value = true
  emit('dragStart')
  document.body.style.userSelect = 'none'

  const onTouchMove = (moveEvent: TouchEvent) => {
    if (moveEvent.touches.length > 0) {
      const touch = moveEvent.touches[0]
      updateRatio(touch.clientX, touch.clientY)
    }
  }

  const onTouchEnd = () => {
    isDragging.value = false
    document.body.style.userSelect = ''
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    removeListeners = null
    emit('dragEnd')
  }

  window.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('touchend', onTouchEnd)
  removeListeners = () => {
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    document.body.style.userSelect = ''
  }
}

onUnmounted(() => {
  if (removeListeners) {
    removeListeners()
    removeListeners = null
  }
})
</script>

<template>
  <div
    ref="containerRef"
    :class="[
      'fy-split',
      `fy-split--${direction}`,
      { 'is-dragging': isDragging, 'is-disabled': disabled }
    ]"
  >
    <!-- 1st Pane -->
    <div class="fy-split__pane fy-split__pane--1" :style="{ flex: `${currentSize} 1 0%` }">
      <slot name="1">
        <slot :name="direction === 'horizontal' ? 'left' : 'top'">
          <slot />
        </slot>
      </slot>
    </div>

    <!-- Resize Bar -->
    <div
      class="fy-split__bar"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
    >
      <slot name="trigger"><slot name="handle"><div class="fy-split__bar-handle" /></slot></slot>
    </div>

    <!-- 2nd Pane -->
    <div class="fy-split__pane fy-split__pane--2" :style="{ flex: `${1 - currentSize} 1 0%` }">
      <slot name="2">
        <slot :name="direction === 'horizontal' ? 'right' : 'bottom'" />
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-split {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;

  &--horizontal {
    flex-direction: row;

    .fy-split__bar {
      width: 8px;
      cursor: col-resize;
      margin: 0 -2px;
    }
  }

  &--vertical {
    flex-direction: column;

    .fy-split__bar {
      height: 8px;
      cursor: row-resize;
      margin: -2px 0;
    }
  }

  &__pane {
    overflow: auto;
    min-width: 0;
    min-height: 0;
  }

  &__bar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    transition: background 0.15s ease;

    &:hover,
    &.is-dragging {
      background: color-mix(in srgb, var(--fy-primary) 15%, transparent);
    }
  }

  &__bar-handle {
    width: 2px;
    height: 100%;
    background: color-mix(in srgb, var(--fy-outline-variant) 50%, transparent);
    border-radius: var(--fy-r-full);
    transition: background 0.15s ease;

    .fy-split--vertical & {
      width: 100%;
      height: 2px;
    }
  }

  &__bar:hover &__bar-handle {
    background: var(--fy-primary);
  }
}
</style>
