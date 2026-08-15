<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import type { MenuContext } from './Menu.vue'

interface Props {
  index?: string | number
  name?: string | number
  title?: string
  label?: string
  icon?: string
  disabled?: boolean
  trigger?: 'click' | 'hover'
}

const props = withDefaults(defineProps<Props>(), {
  index: undefined,
  name: undefined,
  title: '',
  label: '',
  icon: undefined,
  disabled: false,
  trigger: undefined
})

const menuContext = inject<MenuContext | null>('ui-menu', null)
const parentPath = inject<(string | number)[]>('ui-submenu-path', [])
const itemKey = computed(() => props.index ?? props.name ?? '')
const effectiveTitle = computed(() => props.title || props.label || '')
const currentPath = computed(() => [...parentPath, itemKey.value])

// Provide path to deeper nested SubMenus
provide('ui-submenu-path', currentPath.value)

const isCollapsed = computed(() => {
  return menuContext?.collapsed.value ?? false
})
const isOpen = computed(() => {
  return menuContext?.openedSubMenus.value.includes(itemKey.value) ?? false
})
const effectiveTrigger = computed(() => {
  if (props.trigger) return props.trigger
  return menuContext?.trigger.value ?? 'click'
})
const isPopupOpen = computed(() => {
  if (!isCollapsed.value || !menuContext) return false
  return menuContext.activePopupKey.value === itemKey.value
})

// Provide uncollapsed context to nested sub-items so they render full label and badge
if (menuContext) {
  provide('ui-menu', {
    ...menuContext,
    collapsed: computed(() => false),
    selectItem: (key: string | number) => menuContext.selectItem(key)
  })
}

function handleToggle(event: MouseEvent) {
  event.stopPropagation()
  if (props.disabled) return
  if (isCollapsed.value) {
    if (isPopupOpen.value) {
      menuContext?.closePopup(itemKey.value)
    } else {
      menuContext?.openPopup(itemKey.value)
    }
  } else {
    menuContext?.toggleSubMenu(itemKey.value, parentPath)
  }
}

function handleMouseEnter() {
  if (props.disabled) return
  if (isCollapsed.value && effectiveTrigger.value === 'hover') {
    menuContext?.openPopup(itemKey.value)
  }
}

function handleMouseLeave() {
  if (isCollapsed.value && effectiveTrigger.value === 'hover') {
    menuContext?.closePopup(itemKey.value)
  }
}
</script>

<template>
  <div
    :class="[
      'ui-submenu',
      {
        'is-open': isOpen,
        'is-disabled': disabled,
        'is-collapsed': isCollapsed
      }
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      class="ui-submenu__title"
      role="menuitem"
      :aria-expanded="isOpen"
      :title="isCollapsed ? effectiveTitle : undefined"
      @click="handleToggle"
    >
      <span v-if="icon" class="material-symbols-outlined ui-submenu__icon">
        {{ icon }}
      </span>
      <span v-if="!isCollapsed" class="ui-submenu__label">
        <slot name="title">{{ effectiveTitle }}</slot>
      </span>
      <span
        v-if="!isCollapsed"
        class="material-symbols-outlined ui-submenu__arrow"
      >
        expand_more
      </span>
    </div>

    <!-- Expanded inline content -->
    <div v-show="isOpen && !isCollapsed" class="ui-submenu__content">
      <slot />
    </div>

    <!-- Collapsed floating flyout popup -->
    <transition name="ui-submenu-flyout">
      <div
        v-if="isCollapsed && isPopupOpen"
        class="ui-submenu__popup"
        @click.stop
      >
        <div class="ui-submenu__popup-header">
          <span v-if="icon" class="material-symbols-outlined">{{ icon }}</span>
          <span>{{ effectiveTitle }}</span>
        </div>
        <div class="ui-submenu__popup-body" @click="menuContext?.closePopup(itemKey)">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.ui-submenu {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;

  &__title {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 11px 14px;
    border-radius: var(--r-md);
    color: var(--on-surface-variant);
    font-weight: 600;
    font-size: var(--font-size-base);
    cursor: pointer;
    user-select: none;
    transition:
      background 0.2s var(--ease-soft),
      color 0.2s var(--ease-soft);

    &:hover {
      background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
      color: var(--on-surface);
    }
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

  &__arrow {
    font-size: 20px;
    color: var(--outline);
    transition: transform 0.24s var(--ease-soft);
  }

  &.is-open > &__title > &__arrow {
    transform: rotate(180deg);
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding-left: 14px;
    margin-top: 4px;
    position: relative;
    border-left: 1.5px solid color-mix(in srgb, var(--outline-variant) 35%, transparent);
    margin-left: 20px;

    :deep(.ui-submenu__title) {
      padding: 9px 12px;
      gap: 10px;
    }

    :deep(.ui-submenu__content) {
      margin-left: 14px;
      padding-left: 12px;
      border-left: 1.5px dashed color-mix(in srgb, var(--outline-variant) 35%, transparent);
    }

    :deep(.ui-menu-item) {
      padding: 9px 12px;
    }
  }

  &.is-collapsed {
    > .ui-submenu__title {
      justify-content: center;
      padding: 12px;
      border-radius: var(--r-md);

      &:hover {
        background: color-mix(in srgb, var(--surface-container-high) 80%, transparent);
        color: var(--primary);
      }
    }

    &.is-open,
    &:hover {
      > .ui-submenu__title {
        color: var(--primary);
        background: color-mix(in srgb, var(--primary) 12%, transparent);
      }
    }
  }

  /* Collapsed Flyout Popup */
  &__popup {
    position: absolute;
    left: calc(100% + 10px);
    top: 0;
    z-index: 100;
    min-width: 190px;
    padding: 8px;
    border-radius: var(--r-lg);
    background: color-mix(in srgb, var(--surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-hi);
    display: flex;
    flex-direction: column;
    animation: ui-submenu-pop 0.2s var(--ease-out);
    gap: 4px;
  }

  &__popup-header {
    padding: 6px 12px 8px;
    font-size: 11.5px;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 6px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--outline);
    border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
    margin-bottom: 4px;
  }

  &__popup-body {
    display: flex;
    flex-direction: column;
    gap: 4px;

    :deep(.ui-submenu__content) {
      margin-left: 10px;
      padding-left: 12px;
    }

    :deep(.ui-menu-item) {
      justify-content: flex-start !important;
      padding: 9px 12px !important;
    }
  }
}

.ui-submenu-flyout-enter-active,
.ui-submenu-flyout-leave-active {
  transition: opacity 0.18s var(--ease-soft), transform 0.18s var(--ease-out);
}
.ui-submenu-flyout-enter-from,
.ui-submenu-flyout-leave-to {
  opacity: 0;
  transform: translateX(-8px) scale(0.96);
}
</style>
