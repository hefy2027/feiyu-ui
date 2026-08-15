<script setup lang="ts">
interface Props {
  active?: boolean
  count?: number | string
  dotColor?: string
  clickable?: boolean
  icon?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  count: undefined,
  dotColor: undefined,
  clickable: true,
  icon: undefined,
  size: 'md',
  disabled: false,
  closable: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  close: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  if (props.clickable) {
    emit('click', event)
  }
}

function handleClose(event: MouseEvent) {
  if (props.disabled) return
  emit('close', event)
}
</script>

<template>
  <button
    :type="clickable ? 'button' : undefined"
    :class="[
      'fy-chip',
      `fy-chip--${size}`,
      {
        'is-active': active,
        'is-static': !clickable,
        'is-disabled': disabled
      }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot v-if="$slots.icon || icon" name="icon">
      <span class="material-symbols-outlined fy-chip__icon">{{ icon }}</span>
    </slot>
    <span
      v-else-if="dotColor"
      class="fy-chip__dot"
      :style="{ backgroundColor: dotColor }"
    />
    <span class="fy-chip__label">
      <slot />
    </span>
    <span v-if="count !== undefined || $slots.count" class="fy-chip__count">
      <slot name="count">{{ count }}</slot>
    </span>
    <button
      v-if="closable"
      type="button"
      class="fy-chip__close"
      aria-label="关闭"
      @click.stop="handleClose"
    >
      <span class="material-symbols-outlined">close</span>
    </button>
  </button>
</template>

<style scoped lang="scss">
.fy-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--fy-r-full);
  font-weight: 700;
  font-size: var(--fy-font-size-sm);
  color: var(--fy-on-surface-variant);
  border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
  background: color-mix(in srgb, var(--fy-surface-container-high) 40%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  user-select: none;
  transition:
    color 0.2s var(--fy-ease-soft),
    background 0.2s var(--fy-ease-soft),
    border-color 0.2s var(--fy-ease-soft),
    transform 0.12s var(--fy-ease-soft),
    box-shadow 0.2s var(--fy-ease-soft);

  &--sm {
    padding: 4px 10px;
    font-size: var(--fy-font-size-xs);
    gap: 4px;
  }

  &--md {
    padding: 7px 14px;
  }

  &--lg {
    padding: 9px 18px;
    font-size: var(--fy-font-size-base);
  }

  &:hover:not(.is-static) {
    color: var(--fy-on-surface);
    transform: translateY(-1px);
  }

  &.is-active {
    color: var(--fy-on-primary);
    background: var(--fy-primary);
    border-color: transparent;
    box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--fy-primary) 70%, transparent);

    .fy-chip__count {
      background: color-mix(in srgb, var(--fy-on-primary) 22%, transparent);
      color: var(--fy-on-primary);
    }

    .fy-chip__dot {
      background-color: var(--fy-on-primary) !important;
    }
  }

  &.is-static {
    cursor: default;
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__icon {
    font-size: 16px;
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
    opacity: 0.7;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 1;
    }

    .material-symbols-outlined {
      font-size: 14px;
    }
  }

  &__count {
    font-size: 11px;
    font-weight: 800;
    padding: 1px 6px;
    border-radius: var(--fy-r-full);
    background: color-mix(in srgb, var(--fy-surface-container-highest) 80%, transparent);
    color: var(--fy-on-surface-variant);
  }
}
</style>
