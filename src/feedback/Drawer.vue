<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  placement?: 'left' | 'right' | 'top' | 'bottom'
  size?: string | number
  width?: string | number
  height?: string | number
  maskClosable?: boolean
  closeOnClickOverlay?: boolean
  closable?: boolean
  showClose?: boolean
  closeOnEsc?: boolean
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  placement: 'right',
  size: undefined,
  width: undefined,
  height: undefined,
  maskClosable: undefined,
  closeOnClickOverlay: undefined,
  closable: undefined,
  showClose: undefined,
  closeOnEsc: true,
  zIndex: 75
})

const isMaskClosable = computed(() => {
  if (props.maskClosable !== undefined) return props.maskClosable
  if (props.closeOnClickOverlay !== undefined) return props.closeOnClickOverlay
  return true
})

const isClosable = computed(() => {
  if (props.closable !== undefined) return props.closable
  if (props.showClose !== undefined) return props.showClose
  return true
})

const effectiveSize = computed(() => {
  const s = (props.placement === 'top' || props.placement === 'bottom')
    ? (props.height ?? props.size ?? '380px')
    : (props.width ?? props.size ?? '400px')
  return typeof s === 'number' ? `${s}px` : s
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  open: []
}>()

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleOverlayClick(event: MouseEvent) {
  if (isMaskClosable.value && event.target === event.currentTarget) {
    handleClose()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (props.closeOnEsc && event.key === 'Escape' && props.modelValue) {
    handleClose()
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) emit('open')
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      class="fy-drawer-overlay"
      :style="{ zIndex }"
      @click="handleOverlayClick"
    >
      <div
        :class="[
          'fy-drawer',
          `fy-drawer--${placement}`
        ]"
        :style="{
          zIndex: zIndex + 1,
          [placement === 'left' || placement === 'right' ? 'width' : 'height']: effectiveSize
        }"
        role="dialog"
        aria-modal="true"
      >
        <div class="fy-drawer__header">
          <slot name="header">
            <h3 v-if="title" class="fy-drawer__title">{{ title }}</h3>
            <div v-else />
          </slot>

          <button
            v-if="isClosable"
            type="button"
            class="fy-drawer__close-btn"
            aria-label="关闭"
            @click="handleClose"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="fy-drawer__body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="fy-drawer__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.fy-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 75;
  background: rgba(15, 17, 20, 0.42);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: overlay-fade 0.25s var(--fy-ease-soft);
}

.fy-drawer {
  position: fixed;
  background: color-mix(in srgb, var(--fy-surface-container-lowest) 88%, transparent);
  backdrop-filter: blur(28px) saturate(1.6);
  -webkit-backdrop-filter: blur(28px) saturate(1.6);
  border: 1px solid var(--fy-glass-border);
  box-shadow: var(--fy-shadow-pop), inset 0 1px 0 var(--fy-glass-hi);
  display: flex;
  flex-direction: column;
  z-index: 76;
  overflow: hidden;

  &--right {
    top: 0;
    bottom: 0;
    right: 0;
    max-width: 100vw;
    animation: slide-in-right 0.3s var(--fy-ease-out);
  }

  &--left {
    top: 0;
    bottom: 0;
    left: 0;
    max-width: 100vw;
    animation: slide-in-left 0.3s var(--fy-ease-out);
  }

  &--top {
    top: 0;
    left: 0;
    right: 0;
    max-height: 100vh;
    animation: slide-in-top 0.3s var(--fy-ease-out);
  }

  &--bottom {
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 100vh;
    animation: slide-in-bottom 0.3s var(--fy-ease-out);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);
  }

  &__title {
    font-family: var(--fy-font-display);
    font-size: 19px;
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
    overflow-y: auto;
    padding: 24px;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);
    background: color-mix(in srgb, var(--fy-surface-container-low) 50%, transparent);
  }
}

@keyframes overlay-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slide-in-left {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slide-in-top {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

@keyframes slide-in-bottom {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
