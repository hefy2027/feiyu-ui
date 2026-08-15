<script setup lang="ts">
interface Props {
  icon?: string
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  disabled: false,
  danger: false,
  divider: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (props.disabled || props.divider) return
  emit('click', event)
}
</script>

<template>
  <div v-if="divider" class="ui-dropdown-divider" />
  <div
    v-else
    :class="[
      'ui-dropdown-item',
      {
        'is-disabled': disabled,
        'is-danger': danger
      }
    ]"
    role="menuitem"
    @click="handleClick"
  >
    <span v-if="icon" class="material-symbols-outlined ui-dropdown-item__icon">
      {{ icon }}
    </span>
    <span class="ui-dropdown-item__label">
      <slot />
    </span>
  </div>
</template>

<style scoped lang="scss">
.ui-dropdown-divider {
  height: 1px;
  margin: 6px 0;
  background: color-mix(in srgb, var(--outline-variant) 30%, transparent);
}

.ui-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--on-surface);
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover:not(.is-disabled) {
    background: color-mix(in srgb, var(--surface-container-high) 70%, transparent);
  }

  &.is-danger {
    color: var(--error);

    &:hover:not(.is-disabled) {
      background: color-mix(in srgb, var(--error) 12%, transparent);
    }
  }

  &.is-disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &__icon {
    font-size: 18px;
    color: inherit;
    line-height: 1;
  }

  &__label {
    flex: 1;
  }
}
</style>
