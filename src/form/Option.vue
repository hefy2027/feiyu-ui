<script setup lang="ts">
import { inject, computed, onMounted, onUnmounted } from 'vue'

export interface SelectContext {
  modelValue: any
  multiple: boolean
  size: string
  searchQuery?: string
  handleSelect: (value: string | number | boolean, label?: string) => void
  isSelected: (value: string | number | boolean) => boolean
  registerOption?: (value: string | number | boolean, label: string) => void
  unregisterOption?: (value: string | number | boolean) => void
}

interface Props {
  value: string | number | boolean
  label?: string | number
  disabled?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false,
  icon: undefined
})

const selectContext = inject<SelectContext | null>('fy-select-context', null)

const displayLabel = computed(() => {
  if (props.label !== undefined && props.label !== '') {
    return String(props.label)
  }
  return String(props.value)
})

const isSelected = computed(() => {
  if (!selectContext) return false
  return selectContext.isSelected(props.value)
})

const isVisible = computed(() => {
  if (!selectContext?.searchQuery) return true
  const query = selectContext.searchQuery.toLowerCase().trim()
  if (!query) return true
  return displayLabel.value.toLowerCase().includes(query)
})

function handleClick(event: MouseEvent) {
  event.stopPropagation()
  if (props.disabled) return
  selectContext?.handleSelect(props.value, displayLabel.value)
}

onMounted(() => {
  selectContext?.registerOption?.(props.value, displayLabel.value)
})

onUnmounted(() => {
  selectContext?.unregisterOption?.(props.value)
})
</script>

<template>
  <div
    v-show="isVisible"
    :class="[
      'fy-option',
      {
        'is-selected': isSelected,
        'is-disabled': disabled
      }
    ]"
    @click="handleClick"
  >
    <span v-if="icon" class="material-symbols-outlined fy-option__icon">
      {{ icon }}
    </span>
    <span class="fy-option__label">
      <slot>{{ displayLabel }}</slot>
    </span>
    <span v-if="isSelected" class="material-symbols-outlined fy-option__check">
      check
    </span>
  </div>
</template>

<style scoped lang="scss">
.fy-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--fy-r-sm);
  font-size: var(--fy-font-size-sm);
  color: var(--fy-on-surface);
  cursor: pointer;
  user-select: none;
  transition: background 0.15s var(--fy-ease-soft), color 0.15s var(--fy-ease-soft);

  &:hover:not(.is-disabled) {
    background: color-mix(in srgb, var(--fy-primary) 10%, transparent);
    color: var(--fy-primary);
  }

  &.is-selected {
    background: color-mix(in srgb, var(--fy-primary) 14%, transparent);
    color: var(--fy-primary);
    font-weight: 600;
  }

  &.is-disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &__icon {
    font-size: 18px;
    color: inherit;
    flex-shrink: 0;
  }

  &__label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__check {
    font-size: 18px;
    color: var(--fy-primary);
    flex-shrink: 0;
    margin-left: 4px;
  }
}
</style>
