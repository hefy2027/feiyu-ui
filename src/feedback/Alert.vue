<script setup lang="ts">
import { ref, computed } from 'vue'

export type AlertType = 'info' | 'success' | 'warning' | 'error'

interface Props {
  type?: AlertType
  title?: string
  description?: string
  closable?: boolean
  showIcon?: boolean
  icon?: string
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: '',
  description: '',
  closable: false,
  showIcon: true,
  icon: undefined,
  bordered: true
})

const emit = defineEmits<{
  close: [event: MouseEvent]
}>()

const isVisible = ref(true)

const defaultIcon = computed(() => {
  if (props.icon) return props.icon
  switch (props.type) {
    case 'success':
      return 'check_circle'
    case 'warning':
      return 'warning'
    case 'error':
      return 'error'
    default:
      return 'info'
  }
})

function handleClose(event: MouseEvent) {
  isVisible.value = false
  emit('close', event)
}
</script>

<template>
  <transition name="fy-alert-fade">
    <div
      v-if="isVisible"
      :class="[
        'fy-alert',
        `fy-alert--${type}`,
        { 'fy-alert--bordered': bordered }
      ]"
      role="alert"
    >
      <slot name="icon">
      <span
        v-if="showIcon"
        class="material-symbols-outlined fy-alert__icon"
      >
        {{ defaultIcon }}
      </span>
      </slot>

      <div class="fy-alert__content">
        <div v-if="title || $slots.header" class="fy-alert__title">
          <slot name="header">{{ title }}</slot>
        </div>
        <div v-if="$slots.default" class="fy-alert__description">
          <slot />
        </div>
      </div>

      <button
        v-if="closable"
        type="button"
        class="fy-alert__close"
        aria-label="关闭"
        @click="handleClose"
      >
        <span class="material-symbols-outlined">close</span>
      </button>

      <div v-if="$slots.extra || $slots.action" class="fy-alert__extra">
        <slot name="extra"><slot name="action" /></slot>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.fy-alert {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--fy-r-md);
  font-size: var(--fy-font-size-sm);
  line-height: 1.5;
  box-sizing: border-box;
  transition: all 0.25s var(--fy-ease-soft);
  backdrop-filter: blur(16px) saturate(1.35);
  -webkit-backdrop-filter: blur(16px) saturate(1.35);
  box-shadow: inset 0 1px 0 var(--fy-glass-hi);

  &__icon {
    font-size: 20px;
    line-height: 1.3;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    font-weight: 700;
    font-size: var(--fy-font-size-base);
    color: inherit;
  }

  &__description {
    font-weight: 500;
    opacity: 0.9;
  }

  &__extra {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  &__close {
    border: none;
    background: transparent;
    color: inherit;
    opacity: 0.6;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: opacity 0.15s ease, background 0.15s ease;

    &:hover {
      opacity: 1;
      background: color-mix(in srgb, var(--fy-on-surface) 8%, transparent);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }

  /* Alert Types */
  &--fy-info {
    background: color-mix(in srgb, var(--fy-primary) 10%, transparent);
    color: var(--fy-primary);
    &.fy-alert--bordered {
      border: 1px solid color-mix(in srgb, var(--fy-primary) 30%, transparent);
    }
  }

  &--fy-success {
    background: color-mix(in srgb, var(--fy-theme-green, #10b981) 12%, transparent);
    color: var(--fy-theme-green, #10b981);
    &.fy-alert--bordered {
      border: 1px solid color-mix(in srgb, var(--fy-theme-green, #10b981) 32%, transparent);
    }
  }

  &--fy-warning {
    background: color-mix(in srgb, var(--fy-theme-yellow, #f59e0b) 12%, transparent);
    color: var(--fy-theme-yellow, #f59e0b);
    &.fy-alert--bordered {
      border: 1px solid color-mix(in srgb, var(--fy-theme-yellow, #f59e0b) 32%, transparent);
    }
  }

  &--fy-error {
    background: color-mix(in srgb, var(--fy-error) 10%, transparent);
    color: var(--fy-error);
    &.fy-alert--bordered {
      border: 1px solid color-mix(in srgb, var(--fy-error) 30%, transparent);
    }
  }
}

.fy-alert-fade-enter-active,
.fy-alert-fade-leave-active {
  transition: opacity 0.22s var(--fy-ease-soft), transform 0.22s var(--fy-ease-out);
}
.fy-alert-fade-enter-from,
.fy-alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
