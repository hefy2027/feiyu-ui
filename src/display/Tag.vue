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
      'ui-tag',
      `ui-tag--${variant}`,
      `ui-tag--theme-${theme}`,
      `ui-tag--${size}`,
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
      <span class="material-symbols-outlined ui-tag__icon">{{ icon }}</span>
    </slot>
    <slot />
    <button
      v-if="closable"
      type="button"
      class="ui-tag__close"
      aria-label="关闭标签"
      @click.stop="handleClose"
    >
      <span class="material-symbols-outlined">close</span>
    </button>
  </span>
</template>

<style scoped lang="scss">
.ui-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  border-radius: var(--r-full);
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
    background: color-mix(in srgb, var(--surface-container-high) 70%, transparent);
    color: var(--on-surface-variant);
  }

  &--primary {
    background: color-mix(in srgb, var(--primary) 14%, transparent);
    color: var(--primary);
  }

  &--success {
    background: color-mix(in srgb, var(--status-done) 14%, transparent);
    color: var(--status-done);
  }

  &--warning {
    background: color-mix(in srgb, var(--status-review) 14%, transparent);
    color: var(--status-review);
  }

  &--danger {
    background: color-mix(in srgb, var(--error) 14%, transparent);
    color: var(--error);
  }

  &--info {
    background: color-mix(in srgb, var(--theme-blue, #3b82f6) 14%, transparent);
    color: var(--theme-blue, #3b82f6);
  }

  /* Task themes */
  &--theme-blue { background: color-mix(in srgb, var(--theme-blue) 14%, transparent); color: var(--theme-blue); }
  &--theme-purple { background: color-mix(in srgb, var(--theme-purple) 14%, transparent); color: var(--theme-purple); }
  &--theme-red { background: color-mix(in srgb, var(--theme-red) 14%, transparent); color: var(--theme-red); }
  &--theme-yellow { background: color-mix(in srgb, var(--theme-yellow) 14%, transparent); color: var(--theme-yellow); }
  &--theme-green { background: color-mix(in srgb, var(--theme-green) 14%, transparent); color: var(--theme-green); }
  &--theme-pink { background: color-mix(in srgb, var(--theme-pink) 14%, transparent); color: var(--theme-pink); }
  &--theme-cyan { background: color-mix(in srgb, var(--theme-cyan) 14%, transparent); color: var(--theme-cyan); }

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
      background: color-mix(in srgb, var(--on-surface) 10%, transparent);
    }

    .material-symbols-outlined {
      font-size: 14px;
    }
  }
}
</style>
