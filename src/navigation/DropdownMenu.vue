<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface DropdownMenuItem {
  key?: string | number
  label?: string
  icon?: string
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

interface Props {
  items?: DropdownMenuItem[]
  placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  width?: string
  trigger?: 'click' | 'hover'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: undefined,
  placement: 'bottom-right',
  width: '180px',
  trigger: 'click',
  disabled: false
})

const emit = defineEmits<{
  select: [item: DropdownMenuItem]
  open: []
  close: []
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
let hoverTimer: number | null = null

function open() {
  if (isOpen.value) return
  isOpen.value = true
  emit('open')
}

function toggle() {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

function close() {
  if (!isOpen.value) return
  isOpen.value = false
  emit('close')
}

function handleMouseEnter() {
  if (props.disabled) return
  if (props.trigger === 'hover') {
    if (hoverTimer) clearTimeout(hoverTimer)
    open()
  }
}

function handleMouseLeave() {
  if (props.trigger === 'hover') {
    hoverTimer = window.setTimeout(() => {
      close()
    }, 150)
  }
}

function handleItemClick(item: DropdownMenuItem) {
  if (item.disabled || item.divider) return
  emit('select', item)
  close()
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside, true)
})

defineExpose({
  open: () => { isOpen.value = true },
  close,
  toggle
})
</script>

<template>
  <div ref="dropdownRef" :class="['ui-dropdown', { 'ui-dropdown--open': isOpen }]">
    <div class="ui-dropdown__trigger" @click.stop="toggle">
      <slot name="trigger" :is-open="isOpen">
        <slot :is-open="isOpen" />
      </slot>
    </div>

    <transition name="ui-dropdown-fade">
      <div
        v-if="isOpen"
        :class="[
          'ui-dropdown__menu',
          `ui-dropdown__menu--${placement}`
        ]"
        :style="{ minWidth: width }"
        @click.stop
      >
        <slot :close="close">
          <template v-if="items">
            <template v-for="(item, idx) in items" :key="item.key ?? idx">
              <div v-if="item.divider" class="ui-dropdown-divider" />
              <div
                v-else
                :class="[
                  'ui-dropdown-item',
                  {
                    'is-disabled': item.disabled,
                    'is-danger': item.danger
                  }
                ]"
                @click="handleItemClick(item)"
              >
                <span v-if="item.icon" class="material-symbols-outlined ui-dropdown-item__icon">
                  {{ item.icon }}
                </span>
                <span class="ui-dropdown-item__label">{{ item.label }}</span>
              </div>
            </template>
          </template>
        </slot>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.ui-dropdown {
  position: relative;
  display: inline-flex;

  &--open,
  &:has(.ui-dropdown__menu) {
    z-index: 50;
  }

  &__trigger {
    display: inline-flex;
    cursor: pointer;
  }

  &__menu {
    position: absolute;
    z-index: 150;
    padding: 6px;
    border-radius: var(--r-md);
    background: color-mix(in srgb, var(--surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(24px) saturate(1.6);
    -webkit-backdrop-filter: blur(24px) saturate(1.6);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-hi);
    display: flex;
    flex-direction: column;

    &--bottom-right {
      top: calc(100% + 6px);
      right: 0;
    }

    &--bottom-left {
      top: calc(100% + 6px);
      left: 0;
    }

    &--top-right {
      bottom: calc(100% + 6px);
      right: 0;
    }

    &--top-left {
      bottom: calc(100% + 6px);
      left: 0;
    }
  }
}

.ui-dropdown-divider {
  height: 1px;
  margin: 4px 0;
  background: color-mix(in srgb, var(--outline-variant) 25%, transparent);
}

.ui-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--r-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--on-surface);
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover:not(.is-disabled) {
    background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
  }

  &.is-danger {
    color: var(--error);

    &:hover:not(.is-disabled) {
      background: color-mix(in srgb, var(--error) 12%, transparent);
    }
  }

  &.is-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &__icon {
    font-size: 18px;
    color: inherit;
  }

  &__label {
    flex: 1;
  }
}

/* Transitions */
.ui-dropdown-fade-enter-active,
.ui-dropdown-fade-leave-active {
  transition: opacity 0.18s var(--ease-soft), transform 0.18s var(--ease-out);
}

.ui-dropdown-fade-enter-from,
.ui-dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
</style>
