<script setup lang="ts">
import { computed, inject, type ComputedRef } from 'vue'

export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error' | 'danger' | 'button' | 'submit' | 'reset'
export type ButtonVariant = 'primary' | 'info' | 'success' | 'warning' | 'error' | 'danger' | 'ghost' | 'outline' | 'dashed' | 'icon' | 'secondary' | 'default'

interface Props {
  type?: ButtonType
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: string
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  round?: boolean
  circle?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  iconPosition: 'left',
  loading: false,
  disabled: false,
  block: false,
  round: false,
  circle: false,
  nativeType: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonGroupSize = inject<ComputedRef<ButtonSize | undefined> | null>('buttonGroupSize', null)

const effectiveSize = computed<ButtonSize>(() => {
  if (props.size) return props.size
  if (buttonGroupSize?.value) return buttonGroupSize.value
  return 'md'
})

const effectiveVariant = computed<ButtonVariant>(() => {
  if (props.variant && props.variant !== 'default') {
    return props.variant
  }
  if (props.type && props.type !== 'button' && props.type !== 'submit' && props.type !== 'reset' && props.type !== 'default') {
    return props.type as ButtonVariant
  }
  return props.variant || 'secondary'
})

const htmlButtonType = computed<'button' | 'submit' | 'reset'>(() => {
  if (props.nativeType) return props.nativeType
  if (props.type === 'submit' || props.type === 'reset' || props.type === 'button') {
    return props.type
  }
  return 'button'
})

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    :type="htmlButtonType"
    :class="[
      'fy-button',
      `fy-button--${effectiveVariant}`,
      `fy-button--${effectiveSize}`,
      {
        'fy-button--block': block,
        'fy-button--round': round,
        'fy-button--circle': circle,
        'fy-button--loading': loading,
        'fy-button--icon-only': effectiveVariant === 'icon' || circle || (!($slots.default) && (icon || $slots.icon))
      }
    ]"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="fy-button__spinner material-symbols-outlined">
      progress_activity
    </span>
    <template v-else>
      <slot v-if="iconPosition === 'left'" name="icon">
        <span
          v-if="icon"
          class="material-symbols-outlined fy-button__icon"
        >
          {{ icon }}
        </span>
      </slot>
      <span v-if="$slots.default" class="fy-button__content">
        <slot />
      </span>
      <slot v-if="iconPosition === 'right'" name="icon">
        <span
          v-if="icon"
          class="material-symbols-outlined fy-button__icon"
        >
          {{ icon }}
        </span>
      </slot>
    </template>
  </button>
</template>

<style scoped lang="scss">
.fy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: inherit;
  border: none;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  text-decoration: none;
  transition:
    background 0.2s var(--fy-ease-soft),
    color 0.2s var(--fy-ease-soft),
    border-color 0.2s var(--fy-ease-soft),
    box-shadow 0.2s var(--fy-ease-soft),
    transform 0.15s var(--fy-ease-soft),
    filter 0.2s ease;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  &:focus-visible {
    outline: 2px solid var(--fy-primary);
    outline-offset: 2px;
  }

  &--block {
    display: flex;
    width: 100%;
  }

  &__icon {
    font-size: 1.2em;
    line-height: 1;
  }

  &__spinner {
    font-size: 1.2em;
    animation: spin 1s linear infinite;
  }

  &--round {
    border-radius: var(--fy-r-full) !important;
  }

  &--circle {
    border-radius: 50% !important;
  }

  /* Sizes */
  &--sm {
    height: 32px;
    padding: 0 12px;
    font-size: var(--fy-font-size-xs);
    font-weight: 700;
    border-radius: var(--fy-r-sm);
    gap: 5px;

    &.fy-button--icon-only {
      width: 32px;
      padding: 0;
    }
  }

  &--md {
    height: 40px;
    padding: 0 16px;
    font-size: var(--fy-font-size-base);
    font-weight: 700;
    border-radius: var(--fy-r-md);
    gap: 7px;

    &.fy-button--icon-only {
      width: 40px;
      padding: 0;
    }
  }

  &--lg {
    height: 48px;
    padding: 0 22px;
    font-size: var(--fy-font-size-md);
    font-weight: 800;
    border-radius: var(--fy-r-lg);
    gap: 8px;

    &.fy-button--icon-only {
      width: 48px;
      padding: 0;
    }
  }

  /* Variants */
  &--fy-primary {
    background: var(--fy-primary);
    color: var(--fy-on-primary);
    box-shadow: 0 10px 24px -10px color-mix(in srgb, var(--fy-primary) 70%, transparent);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.06);
      box-shadow: 0 14px 28px -10px color-mix(in srgb, var(--fy-primary) 80%, transparent);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.98);
    }
  }

  &--fy-success,
  &--type-success {
    background: var(--fy-theme-green, #10b981);
    color: #ffffff;
    box-shadow: 0 10px 24px -10px color-mix(in srgb, var(--fy-theme-green, #10b981) 70%, transparent);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.06);
      box-shadow: 0 14px 28px -10px color-mix(in srgb, var(--fy-theme-green, #10b981) 80%, transparent);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.98);
    }
  }

  &--fy-warning,
  &--type-warning {
    background: var(--fy-theme-yellow, #f59e0b);
    color: #ffffff;
    box-shadow: 0 10px 24px -10px color-mix(in srgb, var(--fy-theme-yellow, #f59e0b) 70%, transparent);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.06);
      box-shadow: 0 14px 28px -10px color-mix(in srgb, var(--fy-theme-yellow, #f59e0b) 80%, transparent);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.98);
    }
  }

  &--fy-info,
  &--type-info {
    background: var(--fy-theme-blue, #3b82f6);
    color: #ffffff;
    box-shadow: 0 10px 24px -10px color-mix(in srgb, var(--fy-theme-blue, #3b82f6) 70%, transparent);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.06);
      box-shadow: 0 14px 28px -10px color-mix(in srgb, var(--fy-theme-blue, #3b82f6) 80%, transparent);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.98);
    }
  }

  &--ghost {
    background: color-mix(in srgb, var(--fy-surface-container-high) 40%, transparent);
    backdrop-filter: blur(12px) saturate(1.4);
    -webkit-backdrop-filter: blur(12px) saturate(1.4);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
    box-shadow: inset 0 1px 0 var(--fy-glass-hi);
    color: var(--fy-on-surface);

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--fy-surface-container-high) 70%, transparent);
      box-shadow: var(--fy-shadow-sm), inset 0 1px 0 var(--fy-glass-hi);
      color: var(--fy-on-surface);
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
    }
  }

  &--fy-secondary {
    background: color-mix(in srgb, var(--fy-surface-container-high) 65%, transparent);
    color: var(--fy-on-surface);

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--fy-surface-container-highest) 85%, transparent);
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--fy-outline {
    background: transparent;
    border: 1.5px solid color-mix(in srgb, var(--fy-outline) 40%, transparent);
    color: var(--fy-on-surface);

    &:hover:not(:disabled) {
      border-color: var(--fy-primary);
      color: var(--fy-primary);
      background: color-mix(in srgb, var(--fy-primary) 8%, transparent);
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--dashed {
    background: transparent;
    border: 1.5px dashed color-mix(in srgb, var(--fy-outline) 50%, transparent);
    color: var(--fy-on-surface);

    &:hover:not(:disabled) {
      border-color: var(--fy-primary);
      color: var(--fy-primary);
      background: color-mix(in srgb, var(--fy-primary) 8%, transparent);
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--icon {
    background: transparent;
    color: var(--fy-on-surface-variant);
    border-radius: var(--fy-r-full);
    border: none;

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--fy-surface-container-high) 70%, transparent);
      color: var(--fy-on-surface);
    }

    &:active:not(:disabled) {
      transform: scale(0.92);
    }
  }

  &--fy-danger {
    background: var(--fy-error);
    color: var(--fy-on-error);
    box-shadow: 0 8px 20px -8px color-mix(in srgb, var(--fy-error) 70%, transparent);

    &:hover:not(:disabled) {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.98);
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
