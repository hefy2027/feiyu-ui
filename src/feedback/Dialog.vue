<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export interface DialogProps {
  modelValue: boolean
  title?: string
  width?: string | number
  fullscreen?: boolean
  top?: string | number
  center?: boolean
  draggable?: boolean
  maskClosable?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  closable?: boolean
  showClose?: boolean
  beforeClose?: (done: () => void) => void
  zIndex?: number
  customClass?: string
}

const props = withDefaults(defineProps<DialogProps>(), {
  title: '',
  width: '560px',
  fullscreen: false,
  top: '15vh',
  center: false,
  draggable: false,
  maskClosable: true,
  closeOnClickModal: undefined,
  closeOnPressEscape: true,
  closable: true,
  showClose: undefined,
  beforeClose: undefined,
  zIndex: 80,
  customClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  opened: []
  close: []
  closed: []
}>()

const isShow = computed(() => props.modelValue)

const isModalClosable = computed(() => {
  if (props.closeOnClickModal !== undefined) return props.closeOnClickModal
  return props.maskClosable
})

const isShowClose = computed(() => {
  if (props.showClose !== undefined) return props.showClose
  return props.closable
})

const dialogWidth = computed(() => {
  if (props.fullscreen) return '100vw'
  if (typeof props.width === 'number') return `${props.width}px`
  return props.width
})

const dialogTop = computed(() => {
  if (props.fullscreen || props.center) return '0'
  if (typeof props.top === 'number') return `${props.top}px`
  return props.top
})

const dragOffset = ref({ x: 0, y: 0 })
let isDragging = false
let startX = 0
let startY = 0

function handleMouseDown(e: MouseEvent) {
  if (!props.draggable || props.fullscreen) return
  isDragging = true
  startX = e.clientX - dragOffset.value.x
  startY = e.clientY - dragOffset.value.y
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging) return
  dragOffset.value = {
    x: e.clientX - startX,
    y: e.clientY - startY
  }
}

function handleMouseUp() {
  isDragging = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

function doClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleClose() {
  if (props.beforeClose) {
    props.beforeClose(doClose)
  } else {
    doClose()
  }
}

function handleOverlayClick(event: MouseEvent) {
  if (isModalClosable.value && event.target === event.currentTarget) {
    handleClose()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (props.closeOnPressEscape && event.key === 'Escape' && props.modelValue) {
    handleClose()
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    dragOffset.value = { x: 0, y: 0 }
    emit('open')
    setTimeout(() => emit('opened'), 250)
  } else {
    setTimeout(() => emit('closed'), 250)
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fy-dialog-fade">
      <div
        v-if="isShow"
        :class="[
          'fy-dialog-overlay',
          { 'is-centered': center && !fullscreen }
        ]"
        :style="{ zIndex }"
        @click="handleOverlayClick"
      >
        <div
          :class="[
            'fy-dialog',
            customClass,
            {
              'is-fullscreen': fullscreen,
              'is-draggable': draggable && !fullscreen,
              'is-center': center
            }
          ]"
          :style="{
            width: dialogWidth,
            marginTop: !center && !fullscreen ? dialogTop : undefined,
            transform: (dragOffset.x || dragOffset.y) ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : undefined
          }"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="fy-dialog__header"
            :class="{ 'is-draggable-handle': draggable && !fullscreen }"
            @mousedown="handleMouseDown"
          >
            <slot name="header">
              <div class="fy-dialog__title">
                <slot name="title">{{ title }}</slot>
              </div>
            </slot>

            <button
              v-if="isShowClose"
              type="button"
              class="fy-dialog__close-btn"
              aria-label="关闭对话框"
              @click.stop="handleClose"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="fy-dialog__body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="fy-dialog__footer" :class="{ 'is-center': center }">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.fy-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(15, 17, 20, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;

  &.is-centered {
    align-items: center;
  }
}

.fy-dialog {
  position: relative;
  border-radius: var(--fy-r-xl);
  padding: 24px;
  background: color-mix(in srgb, var(--fy-surface-container-lowest) 90%, transparent);
  backdrop-filter: blur(32px) saturate(1.6);
  -webkit-backdrop-filter: blur(32px) saturate(1.6);
  border: 1px solid var(--fy-glass-border);
  box-shadow: var(--fy-shadow-pop), 0 20px 48px rgba(0, 0, 0, 0.16), inset 0 1px 0 var(--fy-glass-hi);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-width: 100%;
  animation: fy-dialog-pop 0.28s var(--fy-ease-out);

  &.is-fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0;
    margin: 0 !important;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    &.is-draggable-handle {
      cursor: move;
      user-select: none;
    }
  }

  &__title {
    font-family: var(--fy-font-display);
    font-size: 20px;
    font-weight: 800;
    color: var(--fy-on-surface);
    letter-spacing: -0.02em;
  }

  &__close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--fy-on-surface-variant);
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--fy-surface-container-high) 80%, transparent);
      color: var(--fy-on-surface);
    }

    .material-symbols-outlined {
      font-size: 20px;
    }
  }

  &__body {
    flex: 1;
    min-height: 0;
    font-size: var(--fy-font-size-base);
    color: var(--fy-on-surface-variant);
    line-height: 1.6;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    margin-top: 24px;

    &.is-center {
      justify-content: center;
    }
  }
}

.fy-dialog-fade-enter-active,
.fy-dialog-fade-leave-active {
  transition: opacity 0.24s var(--fy-ease-soft);
}

.fy-dialog-fade-enter-from,
.fy-dialog-fade-leave-to {
  opacity: 0;
}

@keyframes fy-dialog-pop {
  0% {
    transform: scale(0.93) translateY(12px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
