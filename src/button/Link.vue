<script setup lang="ts">
import { computed } from 'vue'

export type LinkType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface Props {
  type?: LinkType
  underline?: boolean
  disabled?: boolean
  href?: string
  target?: '_blank' | '_parent' | '_self' | '_top' | string
  icon?: string
  iconPlacement?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  underline: true,
  disabled: false,
  href: undefined,
  target: '_self',
  icon: undefined,
  iconPlacement: 'left'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <a
    :class="[
      'ui-link',
      `ui-link--${type}`,
      {
        'is-underline': underline,
        'is-disabled': disabled
      }
    ]"
    :href="disabled ? undefined : href"
    :target="disabled ? undefined : target"
    :aria-disabled="disabled"
    :role="href ? undefined : 'button'"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
  >
    <slot v-if="iconPlacement === 'left'" name="icon">
      <span v-if="icon" class="material-symbols-outlined ui-link__icon">
        {{ icon }}
      </span>
    </slot>

    <span class="ui-link__inner">
      <slot />
    </span>

    <slot v-if="iconPlacement === 'right'" name="icon">
      <span v-if="icon" class="material-symbols-outlined ui-link__icon ui-link__icon--right">
        {{ icon }}
      </span>
    </slot>
  </a>
</template>

<style scoped lang="scss">
.ui-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: var(--font-size-base);
  font-weight: 500;
  line-height: 1.5;
  text-decoration: none;
  cursor: pointer;
  outline: none;
  user-select: none;
  transition: color 0.18s var(--ease-soft), opacity 0.18s var(--ease-soft);

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: var(--r-sm);
  }

  &__icon {
    font-size: 16px;
    line-height: 1;
  }

  &__inner {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  /* Underline */
  &.is-underline:not(.is-disabled):hover &__inner::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 1.5px;
    background-color: currentColor;
    border-radius: 1px;
  }

  /* Disabled */
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }

  /* Variants */
  &--default {
    color: var(--on-surface);
    &:hover:not(.is-disabled) {
      color: var(--primary);
    }
  }

  &--primary {
    color: var(--primary);
    &:hover:not(.is-disabled) {
      filter: brightness(1.15);
    }
  }

  &--success {
    color: var(--theme-green, #10b981);
    &:hover:not(.is-disabled) {
      filter: brightness(1.15);
    }
  }

  &--warning {
    color: var(--theme-yellow, #f59e0b);
    &:hover:not(.is-disabled) {
      filter: brightness(1.15);
    }
  }

  &--danger {
    color: var(--error);
    &:hover:not(.is-disabled) {
      filter: brightness(1.15);
    }
  }

  &--info {
    color: var(--theme-blue, #3b82f6);
    &:hover:not(.is-disabled) {
      filter: brightness(1.15);
    }
  }
}
</style>
