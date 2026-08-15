<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Spin from './Spin.vue'

export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading'

export interface MessageProps {
  id?: string | number
  content?: string
  type?: MessageType
  duration?: number
  closable?: boolean
  showIcon?: boolean
  icon?: string
  plain?: boolean
  zIndex?: number
  offset?: number
  onClose?: () => void
}

const props = withDefaults(defineProps<MessageProps>(), {
  id: '',
  content: '',
  type: 'info',
  duration: 3000,
  closable: false,
  showIcon: true,
  icon: undefined,
  plain: false,
  zIndex: 9999,
  offset: 20
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(true)
let timer: number | null = null

const iconMap: Record<MessageType, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'cancel',
  loading: 'progress_activity'
}

function close() {
  visible.value = false
  emit('close')
  props.onClose?.()
}

function startTimer() {
  if (props.duration > 0 && props.type !== 'loading') {
    clearTimer()
    timer = window.setTimeout(close, props.duration)
  }
}

function clearTimer() {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  clearTimer()
})

defineExpose({
  close,
  visible
})
</script>

<template>
  <Transition name="fy-message-slide">
    <div
      v-if="visible"
      :class="[
        'fy-message',
        `fy-message--${type}`,
        {
          'fy-message--plain': plain,
          'fy-message--closable': closable
        }
      ]"
      :style="{ zIndex }"
      role="alert"
      aria-live="polite"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <!-- Icon / Loading Spin -->
      <div v-if="showIcon" class="fy-message__icon-wrap">
        <slot name="icon">
          <Spin v-if="type === 'loading'" size="sm" />
          <span v-else class="material-symbols-outlined fy-message__icon">
            {{ icon || iconMap[type] }}
          </span>
        </slot>
      </div>

      <!-- Text Content -->
      <div class="fy-message__content">
        <slot>{{ content }}</slot>
      </div>

      <!-- Close Button -->
      <button
        v-if="closable"
        type="button"
        class="fy-message__close-btn"
        aria-label="关闭消息"
        @click.stop="close"
      >
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.fy-message {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: var(--fy-r-full);
  background: color-mix(in srgb, var(--fy-surface-container-high) 88%, transparent);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid var(--fy-glass-border);
  box-shadow: var(--fy-shadow-lift), inset 0 1px 0 var(--fy-glass-hi);
  font-size: var(--fy-font-size-sm);
  font-weight: 600;
  color: var(--fy-on-surface);
  line-height: 1.4;
  pointer-events: auto;
  user-select: none;
  transition: transform 0.25s var(--fy-ease-soft), opacity 0.25s var(--fy-ease-soft);

  &__icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__icon {
    font-size: 18px;
    font-variation-settings: 'FILL' 1;
  }

  /* Types */
  &--fy-info {
    .fy-message__icon { color: var(--fy-theme-blue, #3b82f6); }
  }
  &--fy-success {
    .fy-message__icon { color: var(--fy-theme-green, #10b981); }
  }
  &--fy-warning {
    .fy-message__icon { color: var(--fy-theme-yellow, #f59e0b); }
  }
  &--fy-error {
    .fy-message__icon { color: var(--fy-error, #ba1a1a); }
  }
  &--loading {
    color: var(--fy-on-surface);
  }

  &__content {
    flex: 1;
    display: inline-flex;
    align-items: center;
    word-break: break-word;
  }

  &__close-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: none;
    background: transparent;
    color: var(--fy-on-surface-variant);
    cursor: pointer;
    padding: 0;
    border-radius: var(--fy-r-full);
    margin-left: 2px;
    transition: color 0.15s ease, background 0.15s ease;

    &:hover {
      color: var(--fy-on-surface);
      background: color-mix(in srgb, var(--fy-surface-container-highest) 60%, transparent);
    }

    .material-symbols-outlined {
      font-size: 15px;
    }
  }
}

/* Transition */
.fy-message-slide-enter-active,
.fy-message-slide-leave-active {
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fy-message-slide-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.92);
}

.fy-message-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
</style>
