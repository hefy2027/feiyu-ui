<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type { TaskTheme } from '../types'

interface Props {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  theme?: TaskTheme | 'default'
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
  disabled?: boolean
  round?: boolean
  bordered?: boolean
  color?: string
  textColor?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  theme: 'default',
  size: 'md',
  closable: false,
  disabled: false,
  round: true,
  bordered: false,
  color: undefined,
  textColor: undefined,
  icon: undefined
})

const emit = defineEmits<{
  close: [event: MouseEvent]
  click: [event: MouseEvent]
}>()

const customStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  if (props.color) {
    style.backgroundColor = props.color
    style.borderColor = props.color
  }
  if (props.textColor) {
    style.color = props.textColor
  }
  return style
})

function handleClose(event: MouseEvent) {
  if (props.disabled) return
  emit('close', event)
}

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <span
    :class="[
      'fy-tag',
      `fy-tag--${variant}`,
      `fy-tag--theme-${theme}`,
      `fy-tag--${size}`,
      {
        'is-closable': closable,
        'is-disabled': disabled,
        'is-round': round,
        'is-bordered': bordered
      }
    ]"
    :style="customStyle"
    @click="handleClick"
  >
    <slot v-if="$slots.icon || icon" name="icon">
      <span class="material-symbols-outlined fy-tag__icon">{{ icon }}</span>
    </slot>
    <slot />
    <button
      v-if="closable"
      type="button"
      class="fy-tag__close"
      aria-label="关闭标签"
      @click.stop="handleClose"
    >
      <span class="material-symbols-outlined">close</span>
    </button>
  </span>
</template>

<style scoped lang="scss">
.fy-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  border-radius: var(--fy-r-full);
  user-select: none;
  white-space: nowrap;

  &--sm {
    font-size: 10.5px;
    padding: 2px 7px;
  }

  &--md {
    font-size: 11.5px;
    padding: 3px 9px;
  }

  &--lg {
    font-size: 12.5px;
    padding: 4px 12px;
  }

  &--default {
    background: color-mix(in srgb, var(--fy-surface-container-high) 70%, transparent);
    color: var(--fy-on-surface-variant);
  }

  &--fy-primary {
    background: color-mix(in srgb, var(--fy-primary) 14%, transparent);
    color: var(--fy-primary);
  }

  &--fy-success {
    background: color-mix(in srgb, var(--fy-status-done) 14%, transparent);
    color: var(--fy-status-done);
  }

  &--fy-warning {
    background: color-mix(in srgb, var(--fy-status-review) 14%, transparent);
    color: var(--fy-status-review);
  }

  &--fy-danger {
    background: color-mix(in srgb, var(--fy-error) 14%, transparent);
    color: var(--fy-error);
  }

  &--fy-info {
    background: color-mix(in srgb, var(--fy-theme-blue, #3b82f6) 14%, transparent);
    color: var(--fy-theme-blue, #3b82f6);
  }

  /* Task themes */
  &--fy-theme-blue { background: color-mix(in srgb, var(--fy-theme-blue) 14%, transparent); color: var(--fy-theme-blue); }
  &--fy-theme-purple { background: color-mix(in srgb, var(--fy-theme-purple) 14%, transparent); color: var(--fy-theme-purple); }
  &--fy-theme-red { background: color-mix(in srgb, var(--fy-theme-red) 14%, transparent); color: var(--fy-theme-red); }
  &--fy-theme-yellow { background: color-mix(in srgb, var(--fy-theme-yellow) 14%, transparent); color: var(--fy-theme-yellow); }
  &--fy-theme-green { background: color-mix(in srgb, var(--fy-theme-green) 14%, transparent); color: var(--fy-theme-green); }
  &--fy-theme-pink { background: color-mix(in srgb, var(--fy-theme-pink) 14%, transparent); color: var(--fy-theme-pink); }
  &--fy-theme-cyan { background: color-mix(in srgb, var(--fy-theme-cyan) 14%, transparent); color: var(--fy-theme-cyan); }

  &__icon {
    font-size: 1.15em;
    line-height: 1;
  }

  &__close {
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    padding: 0;
    margin-left: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    opacity: 0.65;
    transition: opacity 0.15s ease, background 0.15s ease;

    &:hover {
      opacity: 1;
      background: color-mix(in srgb, var(--fy-on-surface) 10%, transparent);
    }

    .material-symbols-outlined {
      font-size: 14px;
    }
  }
}
</style>
