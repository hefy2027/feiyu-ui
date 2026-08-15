<script setup lang="ts">
import { computed, inject, ref, provide, onMounted, onUnmounted, nextTick } from 'vue'
import type { FormItemContext } from './FormItem.vue'
import type { SelectContext } from './Option.vue'
import Tag from '../display/Tag.vue'

export interface SelectOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
  icon?: string
}

interface Props {
  modelValue?: string | number | boolean | (string | number | boolean)[]
  options?: (SelectOption | string | number)[]
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  filterable?: boolean
  multiple?: boolean
  maxTagCount?: number
  prefixIcon?: string
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  placeholder: '请选择',
  clearable: false,
  disabled: false,
  filterable: false,
  multiple: false,
  maxTagCount: undefined,
  prefixIcon: undefined,
  size: 'md',
  block: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  change: [value: any, option?: SelectOption | SelectOption[]]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  'visible-change': [visible: boolean]
}>()

const isOpen = ref(false)
const selectWrapRef = ref<HTMLElement | null>(null)
const dropdownListRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const formItem = inject<FormItemContext | null>('ui-form-item', null)

const slotOptionsMap = ref<Map<string | number | boolean, string>>(new Map())

function registerOption(value: string | number | boolean, label: string) {
  slotOptionsMap.value.set(value, label)
}

function unregisterOption(value: string | number | boolean) {
  slotOptionsMap.value.delete(value)
}

const normalizedOptions = computed<SelectOption[]>(() => {
  if (!props.options) return []
  return props.options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return opt
    }
    return { label: String(opt), value: opt }
  })
})

const filteredOptions = computed<SelectOption[]>(() => {
  if (!searchQuery.value) return normalizedOptions.value
  const query = searchQuery.value.toLowerCase().trim()
  return normalizedOptions.value.filter((opt) => opt.label.toLowerCase().includes(query))
})

function isSelected(val: string | number | boolean): boolean {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(val)
  }
  return props.modelValue === val
}

function getOptionLabel(val: string | number | boolean): string {
  const foundProp = normalizedOptions.value.find((opt) => opt.value === val)
  if (foundProp) return foundProp.label
  if (slotOptionsMap.value.has(val)) {
    return slotOptionsMap.value.get(val)!
  }
  return String(val)
}

const displayLabel = computed<string>(() => {
  if (props.multiple) return ''
  if (props.modelValue === '' || props.modelValue === null || props.modelValue === undefined) {
    return ''
  }
  return getOptionLabel(props.modelValue as string | number | boolean)
})

const selectedMultipleItems = computed<{ value: string | number | boolean; label: string }[]>(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return []
  return props.modelValue.map((val) => ({
    value: val,
    label: getOptionLabel(val)
  }))
})

const visibleMultipleTags = computed(() => {
  if (props.maxTagCount && props.maxTagCount > 0) {
    return selectedMultipleItems.value.slice(0, props.maxTagCount)
  }
  return selectedMultipleItems.value
})

function handleSelect(val: string | number | boolean, optLabel?: string) {
  if (props.multiple) {
    const currentArr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const idx = currentArr.indexOf(val)
    if (idx > -1) {
      currentArr.splice(idx, 1)
    } else {
      currentArr.push(val)
    }
    emit('update:modelValue', currentArr)
    emit('change', currentArr)
    formItem?.validate('change')
  } else {
    emit('update:modelValue', val)
    const foundOption = normalizedOptions.value.find((o) => o.value === val) || {
      label: optLabel || String(val),
      value: val
    }
    emit('change', val, foundOption)
    formItem?.validate('change')
    closeDropdown()
  }
}

function removeTag(val: string | number | boolean, event?: MouseEvent) {
  event?.stopPropagation()
  if (props.disabled) return
  if (Array.isArray(props.modelValue)) {
    const updated = props.modelValue.filter((item) => item !== val)
    emit('update:modelValue', updated)
    emit('change', updated)
    formItem?.validate('change')
  }
}

function toggleDropdown() {
  if (props.disabled) return
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function openDropdown() {
  if (props.disabled || isOpen.value) return
  isOpen.value = true
  emit('visible-change', true)
  if (props.filterable) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

function closeDropdown() {
  if (!isOpen.value) return
  isOpen.value = false
  searchQuery.value = ''
  emit('visible-change', false)
}

function handleClear(event: MouseEvent) {
  event.stopPropagation()
  const clearedValue = props.multiple ? [] : ''
  emit('update:modelValue', clearedValue)
  emit('change', clearedValue)
  emit('clear')
  formItem?.validate('change')
}

function handleClickOutside(event: MouseEvent) {
  if (selectWrapRef.value && !selectWrapRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  if (event.key === 'Escape') {
    closeDropdown()
  } else if (event.key === 'Enter' || event.key === ' ') {
    if (!isOpen.value) {
      event.preventDefault()
      openDropdown()
    }
  }
}

provide<SelectContext>('ui-select-context', {
  get modelValue() {
    return props.modelValue
  },
  get multiple() {
    return props.multiple
  },
  get size() {
    return props.size
  },
  get searchQuery() {
    return searchQuery.value
  },
  handleSelect,
  isSelected,
  registerOption,
  unregisterOption
})

onMounted(() => {
  window.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside, true)
})

defineExpose({
  open: openDropdown,
  close: closeDropdown,
  toggle: toggleDropdown
})
</script>

<template>
  <div
    ref="selectWrapRef"
    :class="[
      'ui-select',
      `ui-select--${size}`,
      {
        'ui-select--open': isOpen,
        'ui-select--disabled': disabled,
        'ui-select--block': block,
        'has-prefix': prefixIcon || $slots.prefix
      }
    ]"
    tabindex="0"
    @keydown="handleKeydown"
  >
    <div class="ui-select__trigger" @click="toggleDropdown">
      <!-- Prefix -->
      <span v-if="prefixIcon" class="material-symbols-outlined ui-select__prefix">
        {{ prefixIcon }}
      </span>
      <span v-else-if="$slots.prefix" class="ui-select__prefix-slot">
        <slot name="prefix" />
      </span>

      <!-- Multiple Tags Display -->
      <div v-if="multiple && selectedMultipleItems.length > 0" class="ui-select__tags">
        <Tag
          v-for="item in visibleMultipleTags"
          :key="String(item.value)"
          size="sm"
          theme="blue"
          closable
          @close="removeTag(item.value, $event)"
        >
          {{ item.label }}
        </Tag>
        <Tag
          v-if="maxTagCount && selectedMultipleItems.length > maxTagCount"
          size="sm"
          theme="default"
        >
          +{{ selectedMultipleItems.length - maxTagCount }}
        </Tag>
      </div>

      <!-- Single Display Label -->
      <span v-else-if="!multiple && displayLabel" class="ui-select__display-text">
        {{ displayLabel }}
      </span>

      <!-- Placeholder -->
      <span v-else class="ui-select__placeholder">
        {{ placeholder }}
      </span>

      <!-- Actions (Clear / Arrow) -->
      <div class="ui-select__actions">
        <button
          v-if="clearable && ((!multiple && (modelValue !== '' && modelValue !== null && modelValue !== undefined)) || (multiple && Array.isArray(modelValue) && modelValue.length > 0)) && !disabled"
          type="button"
          class="ui-select__clear"
          aria-label="清空"
          @click.stop="handleClear"
        >
          <span class="material-symbols-outlined">cancel</span>
        </button>
        <span class="material-symbols-outlined ui-select__arrow">
          expand_more
        </span>
      </div>
    </div>

    <!-- Dropdown Popover Menu -->
    <transition name="ui-select-fade">
      <div v-if="isOpen" ref="dropdownListRef" class="ui-select__dropdown" @click.stop>
        <div v-if="$slots.header" class="ui-select__dropdown-header">
          <slot name="header" />
        </div>

        <!-- Search Query Box for Filterable -->
        <div v-if="filterable" class="ui-select__search">
          <span class="material-symbols-outlined ui-select__search-icon">search</span>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            placeholder="输入搜索..."
            class="ui-select__search-input"
            @keydown.stop
          />
        </div>

        <!-- Options List -->
        <div class="ui-select__list">
          <!-- Prop Options Mode -->
          <template v-if="normalizedOptions.length > 0">
            <div
              v-for="opt in filteredOptions"
              :key="String(opt.value)"
              :class="[
                'ui-select__item',
                {
                  'is-selected': isSelected(opt.value),
                  'is-disabled': opt.disabled
                }
              ]"
              @click="!opt.disabled && handleSelect(opt.value, opt.label)"
            >
              <slot name="option" :option="opt" :selected="isSelected(opt.value)">
                <span v-if="opt.icon" class="material-symbols-outlined ui-select__item-icon">
                  {{ opt.icon }}
                </span>
                <span class="ui-select__item-label">{{ opt.label }}</span>
                <span v-if="isSelected(opt.value)" class="material-symbols-outlined ui-select__item-check">
                  check
                </span>
              </slot>
            </div>

            <div v-if="filteredOptions.length === 0" class="ui-select__empty">
              <slot name="empty">
                无匹配选项
              </slot>
            </div>
          </template>

          <!-- Slot Mode (<Option> & <OptionGroup>) -->
          <slot />
        </div>

        <div v-if="$slots.footer" class="ui-select__dropdown-footer">
          <slot name="footer" />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.ui-select {
  position: relative;
  display: inline-flex;
  font-family: inherit;
  user-select: none;
  outline: none;
  min-width: 140px;
  box-sizing: border-box;

  &--open {
    z-index: 50;
  }

  &--block {
    display: flex;
    width: 100%;
  }

  &__trigger {
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
    border-radius: var(--r-md);
    background: color-mix(in srgb, var(--surface-container-high) 42%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border: 1px solid color-mix(in srgb, var(--outline-variant) 45%, transparent);
    box-sizing: border-box;
    gap: 8px;
    transition:
      border-color 0.2s var(--ease-soft),
      box-shadow 0.2s var(--ease-soft),
      background 0.2s var(--ease-soft);

    &:hover {
      border-color: color-mix(in srgb, var(--primary) 50%, transparent);
    }
  }

  &:focus-visible &__trigger,
  &--open &__trigger {
    border-color: color-mix(in srgb, var(--primary) 65%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 15%, transparent);
    background: color-mix(in srgb, var(--surface-container-high) 55%, transparent);
  }

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;

    .ui-select__trigger {
      cursor: not-allowed;
      background: color-mix(in srgb, var(--surface-container-low) 50%, transparent);
      border-color: color-mix(in srgb, var(--outline-variant) 30%, transparent);
      box-shadow: none;
    }
  }

  &__prefix,
  &__prefix-slot {
    color: var(--outline);
    font-size: 18px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__display-text {
    flex: 1;
    color: var(--on-surface);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__placeholder {
    flex: 1;
    color: var(--outline);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__tags {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    flex-shrink: 0;
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: var(--outline);
    cursor: pointer;
    padding: 0;
    transition: color 0.15s ease;

    &:hover {
      color: var(--error);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }

  &__arrow {
    font-size: 20px;
    color: var(--outline);
    transition: transform 0.2s var(--ease-soft);
    user-select: none;
  }

  &--open &__arrow {
    transform: rotate(180deg);
    color: var(--primary);
  }

  /* Sizes */
  &--sm &__trigger {
    height: 32px;
    min-height: 32px;
    font-size: var(--font-size-xs);
    border-radius: var(--r-sm);
    padding: 0 8px;
  }

  &--md &__trigger {
    height: 40px;
    min-height: 40px;
    font-size: var(--font-size-base);
    border-radius: var(--r-md);
    padding: 0 12px;
  }

  &--lg &__trigger {
    height: 46px;
    min-height: 46px;
    font-size: var(--font-size-md);
    border-radius: var(--r-lg);
    padding: 0 14px;
  }

  /* Dropdown Popover */
  &__dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 150;
    padding: 6px;
    border-radius: var(--r-lg);
    background: color-mix(in srgb, var(--surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-hi);
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 100%;
    box-sizing: border-box;
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: var(--r-sm);
    background: color-mix(in srgb, var(--surface-container-high) 50%, transparent);
    border: 1px solid color-mix(in srgb, var(--outline-variant) 40%, transparent);
    margin-bottom: 2px;
  }

  &__search-icon {
    font-size: 16px;
    color: var(--outline);
  }

  &__search-input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--on-surface);
    font: inherit;
    font-size: var(--font-size-xs);
    outline: none;
    padding: 2px 0;
  }

  &__list {
    max-height: 240px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--outline-variant) 40%, transparent);
      border-radius: 4px;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--r-sm);
    font-size: var(--font-size-sm);
    color: var(--on-surface);
    font-weight: 500;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s var(--ease-soft), color 0.15s var(--ease-soft);

    &:hover:not(.is-disabled) {
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      color: var(--primary);
    }

    &.is-selected {
      background: color-mix(in srgb, var(--primary) 14%, transparent);
      color: var(--primary);
      font-weight: 600;
    }

    &.is-disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__item-icon {
    font-size: 18px;
    color: inherit;
    flex-shrink: 0;
  }

  &__item-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__item-check {
    font-size: 18px;
    color: var(--primary);
    flex-shrink: 0;
    margin-left: 4px;
  }

  &__empty {
    padding: 16px 12px;
    text-align: center;
    font-size: var(--font-size-xs);
    color: var(--outline);
  }

  &__dropdown-header {
    padding: 4px 8px;
    border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
  }

  &__dropdown-footer {
    padding: 4px 8px;
    border-top: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
  }
}

/* Animation */
.ui-select-fade-enter-active,
.ui-select-fade-leave-active {
  transition: opacity 0.18s var(--ease-soft), transform 0.18s var(--ease-out);
}

.ui-select-fade-enter-from,
.ui-select-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
