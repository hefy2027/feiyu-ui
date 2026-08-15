<script setup lang="ts">
import { provide, ref, computed, toRef, type Ref } from 'vue'

export interface TabItem {
  name: string | number
  label: string
  icon?: string
  disabled?: boolean
  closable?: boolean
}

interface Props {
  modelValue: string | number
  type?: 'pill' | 'line' | 'card'
  variant?: 'pill' | 'line' | 'card'
  closable?: boolean
  tabs?: TabItem[]
}

const props = withDefaults(defineProps<Props>(), {
  type: undefined,
  variant: undefined,
  closable: false,
  tabs: undefined
})

const effectiveType = computed(() => props.type ?? props.variant ?? 'pill')

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
  tabClick: [name: string | number]
  tabRemove: [name: string | number]
  close: [name: string | number]
}>()

interface TabPaneContext {
  name: string | number
  label: string
  icon?: string
  disabled?: boolean
  closable?: boolean
}

const registeredPanes: Ref<TabPaneContext[]> = ref([])

function registerPane(pane: TabPaneContext) {
  registeredPanes.value.push(pane)
}

function unregisterPane(name: string | number) {
  registeredPanes.value = registeredPanes.value.filter((p) => p.name !== name)
}

provide('fy-tabs', {
  activeName: toRef(props, 'modelValue'),
  registerPane,
  unregisterPane
})

function selectTab(tab: TabItem | TabPaneContext) {
  if (tab.disabled) return
  emit('update:modelValue', tab.name)
  emit('change', tab.name)
  emit('tabClick', tab.name)
}

function handleRemove(event: MouseEvent, name: string | number) {
  event.stopPropagation()
  emit('tabRemove', name)
  emit('close', name)
}
</script>

<template>
  <div :class="['fy-tabs', `fy-tabs--${effectiveType}`]">
    <div class="fy-tabs__header">
      <div v-if="$slots.prefix" class="fy-tabs__prefix">
        <slot name="prefix" />
      </div>
      <div class="fy-tabs__nav-wrap" role="tablist">
      <template v-if="tabs && tabs.length">
        <button
          v-for="t in tabs"
          :key="String(t.name)"
          type="button"
          :class="[
            'fy-tabs__nav-item',
            {
              'is-active': modelValue === t.name,
              'is-disabled': t.disabled
            }
          ]"
          role="tab"
          :aria-selected="modelValue === t.name"
          @click="selectTab(t)"
        >
          <span v-if="t.icon" class="material-symbols-outlined fy-tabs__icon">
            {{ t.icon }}
          </span>
          <span>{{ t.label }}</span>
          <span
            v-if="closable || t.closable"
            class="material-symbols-outlined fy-tabs__close"
            role="button"
            aria-label="关闭标签"
            @click="handleRemove($event, t.name)"
          >
            close
          </span>
        </button>
      </template>

      <template v-else>
        <button
          v-for="pane in registeredPanes"
          :key="String(pane.name)"
          type="button"
          :class="[
            'fy-tabs__nav-item',
            {
              'is-active': modelValue === pane.name,
              'is-disabled': pane.disabled
            }
          ]"
          role="tab"
          :aria-selected="modelValue === pane.name"
          @click="selectTab(pane)"
        >
          <span v-if="pane.icon" class="material-symbols-outlined fy-tabs__icon">
            {{ pane.icon }}
          </span>
          <span>{{ pane.label }}</span>
          <span
            v-if="closable || pane.closable"
            class="material-symbols-outlined fy-tabs__close"
            role="button"
            aria-label="关闭标签"
            @click="handleRemove($event, pane.name)"
          >
            close
          </span>
        </button>
      </template>
    </div>
      <div v-if="$slots.extra" class="fy-tabs__extra">
        <slot name="extra" />
      </div>
    </div>

    <div class="fy-tabs__content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__prefix,
  &__extra {
    display: flex;
    align-items: center;
  }

  &__nav-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    user-select: none;
    overflow-x: auto;
  }

  &__nav-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-family: inherit;
    border: none;
    background: transparent;
    color: var(--fy-on-surface-variant);
    font-weight: 700;
    transition: all 0.2s var(--fy-ease-soft);
    white-space: nowrap;

    &.is-disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__icon {
    font-size: 18px;
  }

  &__close {
    font-size: 14px;
    border-radius: 50%;
    padding: 2px;
    opacity: 0.6;
    transition: all 0.15s ease;

    &:hover {
      opacity: 1;
      background: color-mix(in srgb, var(--fy-surface-container-high) 80%, transparent);
      color: var(--fy-error);
    }
  }

  &__content {
    margin-top: 14px;
  }

  /* Variant: Pill */
  &--pill {
    .fy-tabs__nav-wrap {
      padding: 4px;
      border-radius: var(--fy-r-md);
      background: color-mix(in srgb, var(--fy-surface-container-high) 45%, transparent);
      backdrop-filter: blur(12px) saturate(1.5);
      -webkit-backdrop-filter: blur(12px) saturate(1.5);
      border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
      width: fit-content;
    }

    .fy-tabs__nav-item {
      padding: 6px 14px;
      border-radius: var(--fy-r-sm);
      font-size: var(--fy-font-size-sm);

      &:hover:not(.is-disabled) {
        color: var(--fy-on-surface);
      }

      &.is-active {
        background: color-mix(in srgb, var(--fy-surface-container-lowest) 82%, transparent);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: var(--fy-primary);
        box-shadow: var(--fy-shadow-sm), inset 0 1px 0 var(--fy-glass-hi);
      }
    }
  }

  /* Variant: Line */
  &--line {
    .fy-tabs__nav-wrap {
      border-bottom: 1.5px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
      gap: 18px;
    }

    .fy-tabs__nav-item {
      padding: 10px 4px;
      font-size: var(--fy-font-size-base);
      position: relative;

      &:hover:not(.is-disabled) {
        color: var(--fy-on-surface);
      }

      &.is-active {
        color: var(--fy-primary);

        &::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1.5px;
          height: 2.5px;
          background: var(--fy-primary);
          border-radius: 2px;
        }
      }
    }
  }

  /* Variant: Card */
  &--card {
    .fy-tabs__nav-wrap {
      gap: 8px;
    }

    .fy-tabs__nav-item {
      padding: 8px 16px;
      border-radius: var(--fy-r-md);
      background: color-mix(in srgb, var(--fy-surface-container-high) 35%, transparent);
      border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
      font-size: var(--fy-font-size-sm);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);

      &:hover:not(.is-disabled) {
        background: color-mix(in srgb, var(--fy-surface-container-high) 65%, transparent);
      }

      &.is-active {
        background: var(--fy-primary);
        color: var(--fy-on-primary);
        border-color: transparent;
        box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--fy-primary) 60%, transparent);
      }
    }
  }
}
</style>
