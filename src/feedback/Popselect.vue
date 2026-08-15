<script setup lang="ts">
import { ref, computed } from 'vue'
import Popover from './Popover.vue'
import Input from '../form/Input.vue'
import type { PopoverPlacement, PopoverTrigger } from './Popover.vue'

export interface PopselectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue?: string | number | (string | number)[]
  options: Array<string | number | PopselectOption>
  multiple?: boolean
  filterable?: boolean
  trigger?: PopoverTrigger
  placement?: PopoverPlacement
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  multiple: false,
  filterable: false,
  trigger: 'click',
  placement: 'bottom',
  disabled: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]]
  change: [value: string | number | (string | number)[]]
}>()

const searchQuery = ref('')
const isPopoverOpen = ref(false)

const normalizedOptions = computed<PopselectOption[]>(() => {
  return props.options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { label: String(opt), value: opt }
    }
    return opt
  })
})

const filteredOptions = computed<PopselectOption[]>(() => {
  if (!searchQuery.value) return normalizedOptions.value
  const q = searchQuery.value.toLowerCase()
  return normalizedOptions.value.filter((o) => o.label.toLowerCase().includes(q))
})

function isSelected(val: string | number): boolean {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(val)
  }
  return props.modelValue === val
}

function handleSelect(opt: PopselectOption) {
  if (opt.disabled || props.disabled) return
  if (props.multiple) {
    const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = arr.indexOf(opt.value)
    if (index > -1) {
      arr.splice(index, 1)
    } else {
      arr.push(opt.value)
    }
    emit('update:modelValue', arr)
    emit('change', arr)
  } else {
    emit('update:modelValue', opt.value)
    emit('change', opt.value)
    isPopoverOpen.value = false
  }
}
</script>

<template>
  <Popover
    v-model:visible="isPopoverOpen"
    :trigger="trigger"
    :placement="placement"
    :disabled="disabled"
    class="fy-popselect-popover"
  >
    <template #default>
      <slot />
    </template>

    <template #content>
      <div :class="['fy-popselect-menu', `fy-popselect-menu--${size}`]">
        <div v-if="filterable" class="fy-popselect-menu__filter">
          <Input
            v-model="searchQuery"
            placeholder="搜索选项..."
            prefix-icon="search"
            size="sm"
            clearable
            block
          />
        </div>

        <div class="fy-popselect-menu__list">
          <div
            v-for="opt in filteredOptions"
            :key="opt.value"
            :class="[
              'fy-popselect-menu__item',
              {
                'is-active': isSelected(opt.value),
                'is-disabled': opt.disabled
              }
            ]"
            @click="handleSelect(opt)"
          >
            <slot name="option" :option="opt" :selected="isSelected(opt.value)">
            <span class="fy-popselect-menu__label">{{ opt.label }}</span>
            <span
              v-if="isSelected(opt.value)"
              class="material-symbols-outlined fy-popselect-menu__check"
            >
              check
            </span>
            </slot>
          </div>
          <div v-if="filteredOptions.length === 0" class="fy-popselect-menu__empty">
            <slot name="empty">
            无匹配选项
            </slot>
          </div>
        </div>
      </div>
    </template>
  </Popover>
</template>

<style scoped lang="scss">
.fy-popselect-menu {
  min-width: 150px;
  max-width: 260px;
  font-family: inherit;
  user-select: none;

  &__filter {
    margin-bottom: 6px;
  }

  &__list {
    max-height: 220px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
      border-radius: 4px;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-radius: var(--fy-r-sm);
    cursor: pointer;
    font-size: var(--fy-font-size-xs);
    font-weight: 500;
    color: var(--fy-on-surface);
    transition: background 0.15s ease, color 0.15s ease;

    &:hover:not(.is-disabled) {
      background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
      color: var(--fy-primary);
    }

    &.is-active {
      color: var(--fy-primary);
      font-weight: 700;
      background: color-mix(in srgb, var(--fy-primary) 14%, transparent);
    }

    &.is-disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__check {
    font-size: 16px;
    color: var(--fy-primary);
    margin-left: 6px;
  }

  &__empty {
    padding: 12px 8px;
    text-align: center;
    font-size: var(--fy-font-size-xs);
    color: var(--fy-outline);
  }

  &--sm {
    .fy-popselect-menu__item {
      padding: 4px 8px;
      font-size: 11px;
    }
  }

  &--lg {
    .fy-popselect-menu__item {
      padding: 8px 12px;
      font-size: var(--fy-font-size-sm);
    }
  }
}
</style>
