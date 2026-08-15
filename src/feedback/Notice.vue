<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

export type NoticeType = 'info' | 'success' | 'warning' | 'error'

interface Props {
  title: string
  description?: string
  type?: NoticeType
  duration?: number // ms, 0 means persist
  closable?: boolean
  showIcon?: boolean
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  type: 'info',
  duration: 4500,
  closable: true,
  showIcon: true,
  visible: true
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

const isShow = ref(props.visible)
let timer: number | null = null

const iconMap: Record<NoticeType, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'cancel'
}

function close() {
  isShow.value = false
  emit('update:visible', false)
  emit('close')
}

function startTimer() {
  if (props.duration > 0) {
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

watch(() => props.visible, (val) => {
  isShow.value = val
  if (val) {
    startTimer()
  } else {
    clearTimer()
  }
})

onMounted(() => {
  if (isShow.value) {
    startTimer()
  }
})

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<template>
  <Transition name="notice-fade">
    <div
      v-if="isShow"
      :class="['ui-notice', `ui-notice--${type}`]"
      role="alert"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <span v-if="showIcon" class="material-symbols-outlined ui-notice__icon">
        <slot name="icon">{{ iconMap[type] }}</slot>
      </span>

      <div class="ui-notice__content">
        <div class="ui-notice__title">{{ title }}</div>
        <div v-if="description || $slots.default" class="ui-notice__desc">
          <slot>{{ description }}</slot>
        </div>
        <div v-if="$slots.action" class="ui-notice__action">
          <slot name="action" />
        </div>
      </div>

      <button
        v-if="closable"
        type="button"
        class="ui-notice__close-btn"
        aria-label="关闭通知"
        @click="close"
      >
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.ui-notice {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 360px;
  max-width: calc(100vw - 32px);
  padding: 16px;
  border-radius: var(--r-lg);
  background: color-mix(in srgb, var(--surface-container-high) 85%, transparent);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg), 0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 var(--glass-hi);
  margin-bottom: 12px;
  user-select: none;

  &__icon {
    font-size: 22px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  &--info {
    .ui-notice__icon { color: var(--primary); }
    border-left: 3px solid var(--primary);
  }
  &--success {
    .ui-notice__icon { color: var(--theme-green, #10b981); }
    border-left: 3px solid var(--theme-green, #10b981);
  }
  &--warning {
    .ui-notice__icon { color: var(--theme-yellow, #f59e0b); }
    border-left: 3px solid var(--theme-yellow, #f59e0b);
  }
  &--error {
    .ui-notice__icon { color: var(--error, #ba1a1a); }
    border-left: 3px solid var(--error, #ba1a1a);
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: var(--on-surface);
    line-height: 1.4;
  }

  &__desc {
    margin-top: 4px;
    font-size: var(--font-size-xs);
    color: var(--on-surface-variant);
    line-height: 1.5;
    word-break: break-word;
  }

  &__action {
    margin-top: 10px;
  }

  &__close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    border: none;
    background: transparent;
    color: var(--outline);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease;

    &:hover {
      color: var(--on-surface);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }
}

/* Transition */
.notice-fade-enter-active,
.notice-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notice-fade-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.notice-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
</style>
