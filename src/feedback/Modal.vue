<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  width?: string | number
  maskClosable?: boolean
  closeOnClickOverlay?: boolean
  closable?: boolean
  showClose?: boolean
  closeOnEsc?: boolean
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '520px',
  maskClosable: undefined,
  closeOnClickOverlay: undefined,
  closable: undefined,
  showClose: undefined,
  closeOnEsc: true,
  zIndex: 80
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

const dialogWidth = computed(() => {
  if (typeof props.width === 'number') return `${props.width}px`
  return props.width
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
    if (val) {
      emit('open')
    }
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
    <transition name="fy-modal-fade">
      <div
        v-if="modelValue"
        class="fy-modal-overlay"
        :style="{ zIndex }"
        @click="handleOverlayClick"
      >
        <div
          class="fy-modal-dialog"
          :style="{ maxWidth: dialogWidth, width: '100%' }"
          role="dialog"
          aria-modal="true"
        >
          <div class="fy-modal__header">
            <slot name="header">
              <h3 v-if="title" class="fy-modal__title">{{ title }}</h3>
              <div v-else />
            </slot>

            <button
              v-if="isClosable"
              type="button"
              class="fy-modal__close-btn"
              aria-label="关闭"
              @click="handleClose"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="fy-modal__body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="fy-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.fy-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(15, 17, 20, 0.42);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.fy-modal-dialog {
  width: 100%;
  border-radius: var(--fy-r-lg);
  padding: 24px;
  background: color-mix(in srgb, var(--fy-surface-container-lowest) 88%, transparent);
  backdrop-filter: blur(28px) saturate(1.6);
  -webkit-backdrop-filter: blur(28px) saturate(1.6);
  border: 1px solid var(--fy-glass-border);
  box-shadow: var(--fy-shadow-pop), inset 0 1px 0 var(--fy-glass-hi);
  isolation: isolate;
  display: flex;
  flex-direction: column;
  animation: fy-modal-pop 0.28s var(--fy-ease-out);
}

.fy-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.fy-modal__title {
  font-family: var(--fy-font-display);
  font-size: 20px;
  font-weight: 800;
  color: var(--fy-on-surface);
  letter-spacing: -0.02em;
}

.fy-modal__close-btn {
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

.fy-modal__body {
  flex: 1;
  min-height: 0;
}

.fy-modal__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}

/* Transitions */
.fy-modal-fade-enter-active,
.fy-modal-fade-leave-active {
  transition: opacity 0.24s var(--fy-ease-soft);
}

.fy-modal-fade-enter-from,
.fy-modal-fade-leave-to {
  opacity: 0;
}

@keyframes fy-modal-pop {
  0% {
    transform: scale(0.94) translateY(8px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
