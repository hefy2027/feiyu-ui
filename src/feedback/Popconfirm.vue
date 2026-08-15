<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Button from '../button/Button.vue'

export type PopconfirmPlacement = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'

interface Props {
  title?: string
  positiveText?: string
  confirmText?: string
  negativeText?: string
  cancelText?: string
  positiveButtonProps?: Record<string, any>
  negativeButtonProps?: Record<string, any>
  icon?: string
  iconColor?: string
  placement?: PopconfirmPlacement
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '确定执行此操作吗？',
  positiveText: '确定',
  negativeText: '取消',
  positiveButtonProps: undefined,
  negativeButtonProps: undefined,
  icon: 'help',
  iconColor: 'var(--fy-theme-yellow, #f59e0b)',
  placement: 'top',
  disabled: false
})

const emit = defineEmits<{
  positiveClick: [event: MouseEvent]
  negativeClick: [event: MouseEvent]
  confirm: [event: MouseEvent]
  cancel: [event: MouseEvent]
}>()

const effectivePositiveText = computed(() => {
  return props.positiveText ?? props.confirmText ?? '确定'
})

const effectiveNegativeText = computed(() => {
  return props.negativeText ?? props.cancelText ?? '取消'
})

const isOpen = ref(false)
const popconfirmRef = ref<HTMLElement | null>(null)

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function handlePositive(event: MouseEvent) {
  emit('positiveClick', event)
  emit('confirm', event)
  isOpen.value = false
}

function handleNegative(event: MouseEvent) {
  emit('negativeClick', event)
  emit('cancel', event)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (popconfirmRef.value && !popconfirmRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div ref="popconfirmRef" class="fy-popconfirm">
    <div class="fy-popconfirm__trigger" @click.stop="toggle">
      <slot />
    </div>

    <transition name="fy-popconfirm-fade">
      <div
        v-if="isOpen"
        :class="[
          'fy-popconfirm__popover',
          `fy-popconfirm__popover--${placement}`
        ]"
        @click.stop
      >
        <div class="fy-popconfirm__main">
          <span
            v-if="icon"
            class="material-symbols-outlined fy-popconfirm__icon"
            :style="{ color: iconColor }"
          >
            {{ icon }}
          </span>
          <div class="fy-popconfirm__message">
            <slot name="title">{{ title }}</slot>
          </div>
        </div>

        <div class="fy-popconfirm__actions">
          <slot name="actions" :confirm="handlePositive" :cancel="handleNegative">
          <Button
            size="sm"
            variant="ghost"
            v-bind="negativeButtonProps"
            @click="handleNegative"
          >
            {{ effectiveNegativeText }}
          </Button>
          <Button
            size="sm"
            variant="primary"
            v-bind="positiveButtonProps"
            @click="handlePositive"
          >
            {{ effectivePositiveText }}
          </Button>
          </slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.fy-popconfirm {
  position: relative;
  display: inline-flex;
  vertical-align: middle;

  &__trigger {
    display: inline-flex;
    cursor: pointer;
  }

  &__popover {
    position: absolute;
    z-index: 100;
    padding: 12px 14px;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 94%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--fy-glass-border);
    box-shadow: var(--fy-shadow-pop), inset 0 1px 0 var(--fy-glass-hi);
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 12px;

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
  }

  &__main {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  &__icon {
    font-size: 20px;
    line-height: 1.2;
    flex-shrink: 0;
  }

  &__message {
    font-size: var(--fy-font-size-sm);
    font-weight: 600;
    color: var(--fy-on-surface);
    line-height: 1.4;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
}

.fy-popconfirm-fade-enter-active,
.fy-popconfirm-fade-leave-active {
  transition: opacity 0.18s var(--fy-ease-soft), transform 0.18s var(--fy-ease-out);
}
.fy-popconfirm-fade-enter-from,
.fy-popconfirm-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.96);
}
</style>
