<script setup lang="ts">
import { computed, inject } from 'vue'
import type { MenuContext } from './Menu.vue'

interface Props {
  index?: string | number
  name?: string | number
  value?: string | number
  to?: string | object
  icon?: string
  disabled?: boolean
  badge?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  index: undefined,
  name: undefined,
  value: undefined,
  to: undefined,
  icon: undefined,
  disabled: false,
  badge: undefined
})

const emit = defineEmits<{
  click: [index: string | number]
}>()

const menuContext = inject<MenuContext | null>('fy-menu', null)

const itemKey = computed(() => props.index ?? props.name ?? props.value ?? '')

const isActive = computed(() => {
  return menuContext?.activeKey.value === itemKey.value
})

const isCollapsed = computed(() => {
  return menuContext?.collapsed.value ?? false
})

function handleClick() {
  if (props.disabled) return
  if (menuContext) {
    menuContext.selectItem(itemKey.value)
  }
  emit('click', itemKey.value)
}
</script>

<template>
  <component
    :is="to ? 'RouterLink' : 'div'"
    :to="to"
    :class="[
      'fy-menu-item',
      {
        'is-active': isActive,
        'is-disabled': disabled,
        'is-collapsed': isCollapsed
      }
    ]"
    :title="isCollapsed ? String($slots.default?.()[0]?.children || '') : undefined"
    role="menuitem"
    @click="handleClick"
  >
    <slot name="icon">
    <span v-if="icon" class="material-symbols-outlined fy-menu-item__icon">
      {{ icon }}
    </span>
    </slot>

    <span v-if="!isCollapsed" class="fy-menu-item__label">
      <slot />
    </span>

    <span
      v-if="!isCollapsed && (badge !== undefined || $slots.badge)"
      class="fy-menu-item__badge"
    >
      <slot name="badge">
        {{ badge }}
      </slot>
    </span>
  </component>
</template>

<style scoped lang="scss">
.fy-menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 14px;
  border-radius: var(--fy-r-md);
  color: var(--fy-on-surface-variant);
  font-weight: 600;
  font-size: var(--fy-font-size-base);
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.2s var(--fy-ease-soft),
    color 0.2s var(--fy-ease-soft),
    transform 0.15s var(--fy-ease-soft);

  &:hover:not(.is-disabled) {
    background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
    color: var(--fy-on-surface);
  }

  &.is-active {
    color: var(--fy-primary);
    background: color-mix(in srgb, var(--fy-primary) 12%, transparent);

    .fy-menu-item__icon {
      font-variation-settings: "opsz" 24, "FILL" 1;
    }
  }

  &.is-disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &.is-collapsed {
    justify-content: center;
    padding: 12px;
    gap: 0;
  }

  &__icon {
    font-size: 22px;
    flex-shrink: 0;
    line-height: 1;
  }

  &__label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__badge {
    font-size: 11px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: var(--fy-r-full);
    background: color-mix(in srgb, var(--fy-primary) 15%, transparent);
    color: var(--fy-primary);
  }
}
</style>
