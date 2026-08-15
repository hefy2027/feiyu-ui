<script setup lang="ts">
export type CheckTagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface Props {
  checked?: boolean
  disabled?: boolean
  type?: CheckTagType
  size?: 'sm' | 'md' | 'lg'
  round?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  checked: false,
  disabled: false,
  type: 'primary',
  size: 'md',
  round: false
})

const emit = defineEmits<{
  'update:checked': [value: boolean]
  change: [value: boolean]
}>()

function handleClick() {
  if (props.disabled) return
  const nextChecked = !props.checked
  emit('update:checked', nextChecked)
  emit('change', nextChecked)
}
</script>

<template>
  <span
    :class="[
      'fy-check-tag',
      `fy-check-tag--${type}`,
      `fy-check-tag--${size}`,
      {
        'is-checked': checked,
        'is-disabled': disabled,
        'is-round': round
      }
    ]"
    role="button"
    :aria-pressed="checked"
    @click="handleClick"
  >
    <slot v-if="$slots.icon" name="icon" />
    <slot />
  </span>
</template>

<style scoped lang="scss">
.fy-check-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  font-size: var(--fy-font-size-xs);
  font-weight: 600;
  line-height: 1.4;
  border-radius: var(--fy-r-md);
  cursor: pointer;
  user-select: none;
  color: var(--fy-on-surface-variant);
  background: color-mix(in srgb, var(--fy-surface-container-high) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.2s var(--fy-ease-soft);
  gap: 4px;

  &.is-round {
    border-radius: var(--fy-r-full);
  }

  &--sm {
    padding: 2px 8px;
    font-size: 11px;
  }

  &--md {
    padding: 4px 12px;
    font-size: var(--fy-font-size-xs);
  }

  &--lg {
    padding: 6px 16px;
    font-size: var(--fy-font-size-sm);
  }

  &:hover:not(.is-disabled) {
    background: color-mix(in srgb, var(--fy-surface-container-high) 75%, transparent);
    box-shadow: var(--fy-shadow-sm), inset 0 1px 0 var(--fy-glass-hi);
    color: var(--fy-on-surface);
    transform: translateY(-1px);
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Checked Type Variants */
  &.is-checked {
    color: var(--fy-on-primary);
    border-color: transparent;
  }

  &--fy-primary.is-checked {
    background: var(--fy-primary);
    box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--fy-primary) 60%, transparent);
  }

  &--fy-success.is-checked {
    background: var(--fy-theme-green);
    box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--fy-theme-green) 60%, transparent);
  }

  &--fy-warning.is-checked {
    background: var(--fy-theme-yellow);
    box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--fy-theme-yellow) 60%, transparent);
  }

  &--fy-danger.is-checked {
    background: var(--fy-error);
    box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--fy-error) 60%, transparent);
  }

  &--fy-info.is-checked {
    background: var(--fy-outline);
    box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--fy-outline) 60%, transparent);
  }
}
</style>
