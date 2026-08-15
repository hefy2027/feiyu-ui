<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

export interface MentionOption {
  label: string
  value: string
  avatar?: string
  disabled?: boolean
}

interface Props {
  modelValue?: string
  options: MentionOption[]
  prefix?: string | string[]
  placeholder?: string
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  prefix: '@',
  placeholder: '输入 @ 提及成员...',
  disabled: false,
  readonly: false,
  size: 'md',
  rows: 3
})

const emit = defineEmits<{
  'update:modelValue': [val: string]
  change: [val: string]
  search: [query: string, prefix: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  select: [option: MentionOption, prefix: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isDropdownOpen = ref(false)
const currentQuery = ref('')
const activePrefix = ref('@')
const activeIndex = ref(0)
const formItem = inject<FormItemContext | null>('fy-form-item', null)

const prefixes = computed(() => {
  return Array.isArray(props.prefix) ? props.prefix : [props.prefix]
})

const filteredOptions = computed(() => {
  if (!currentQuery.value) return props.options
  const q = currentQuery.value.toLowerCase()
  return props.options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
})

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  const val = target.value
  emit('update:modelValue', val)

  const cursorPos = target.selectionStart || 0
  const textBeforeCursor = val.slice(0, cursorPos)

  // Check if cursor is right after one of the prefixes
  let matchedPrefix: string | null = null
  let matchIndex = -1

  for (const p of prefixes.value) {
    const lastIdx = textBeforeCursor.lastIndexOf(p)
    if (lastIdx > matchIndex && (lastIdx === 0 || /\s/.test(textBeforeCursor[lastIdx - 1]))) {
      matchedPrefix = p
      matchIndex = lastIdx
    }
  }

  if (matchedPrefix !== null && matchIndex !== -1) {
    const query = textBeforeCursor.slice(matchIndex + matchedPrefix.length)
    if (!/\s/.test(query)) {
      activePrefix.value = matchedPrefix
      currentQuery.value = query
      emit('search', query, matchedPrefix)
      isDropdownOpen.value = true
      activeIndex.value = 0
      return
    }
  }
  isDropdownOpen.value = false
}

function selectOption(option: MentionOption) {
  if (option.disabled || !textareaRef.value) return
  const el = textareaRef.value
  const val = props.modelValue
  const cursorPos = el.selectionStart || 0
  const textBeforeCursor = val.slice(0, cursorPos)
  const textAfterCursor = val.slice(cursorPos)
  const lastPrefixIdx = textBeforeCursor.lastIndexOf(activePrefix.value)

  const insertText = `${activePrefix.value}${option.value} `
  const newVal = textBeforeCursor.slice(0, lastPrefixIdx) + insertText + textAfterCursor

  emit('update:modelValue', newVal)
  emit('change', newVal)
  formItem?.validate('change')
  emit('select', option, activePrefix.value)
  isDropdownOpen.value = false

  setTimeout(() => {
    el.focus()
    const newCursor = lastPrefixIdx + insertText.length
    el.setSelectionRange(newCursor, newCursor)
  }, 0)
}

function handleKeyDown(event: KeyboardEvent) {
  if (!isDropdownOpen.value || filteredOptions.value.length === 0) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % filteredOptions.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length
  } else if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault()
    const opt = filteredOptions.value[activeIndex.value]
    if (opt) selectOption(opt)
  } else if (event.key === 'Escape') {
    isDropdownOpen.value = false
  }
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
  formItem?.validate('blur')
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

</script>

<template>
  <div :class="[
    'fy-mentions',
    `fy-mentions--${size}`,
    { 'is-disabled': disabled, 'fy-mentions--open': isDropdownOpen && filteredOptions.length > 0 }
  ]">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      class="fy-mentions__textarea"
      @input="handleInput"
      @keydown="handleKeyDown"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <transition name="fy-mentions-fade">
      <div v-if="isDropdownOpen && filteredOptions.length > 0" class="fy-mentions__dropdown">
        <div
          v-for="(opt, idx) in filteredOptions"
          :key="opt.value"
          :class="[
            'fy-mentions__item',
            {
              'is-active': idx === activeIndex,
              'is-disabled': opt.disabled
            }
          ]"
          @click="selectOption(opt)"
        >
          <img v-if="opt.avatar" :src="opt.avatar" class="fy-mentions__avatar" />
          <span class="fy-mentions__label">{{ opt.label }}</span>
          <span class="fy-mentions__value">{{ activePrefix }}{{ opt.value }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.fy-mentions {
  position: relative;
  display: flex;
  width: 100%;

  &--open {
    z-index: 50;
  }

  &__textarea {
    width: 100%;
    font: inherit;
    color: var(--fy-on-surface);
    font-size: var(--fy-font-size-sm);
    line-height: 1.5;
    padding: 10px 14px;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-high) 42%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
    resize: vertical;
    box-sizing: border-box;
    transition:
      border-color 0.2s var(--fy-ease-soft),
      box-shadow 0.2s var(--fy-ease-soft);

    &:focus {
      outline: none;
      border-color: color-mix(in srgb, var(--fy-primary) 55%, transparent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--fy-primary) 14%, transparent);
    }

    &::placeholder {
      color: var(--fy-outline);
    }
  }

  &__dropdown {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 0;
    z-index: 150;
    min-width: 180px;
    max-height: 200px;
    overflow-y: auto;
    padding: 6px;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--fy-glass-border);
    box-shadow: var(--fy-shadow-pop), inset 0 1px 0 var(--fy-glass-hi);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: var(--fy-r-sm);
    cursor: pointer;
    font-size: var(--fy-font-size-sm);
    transition: background 0.15s ease, color 0.15s ease;

    &:hover:not(.is-disabled),
    &.is-active {
      background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
      color: var(--fy-primary);
    }

    &.is-disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__label {
    font-weight: 700;
  }

  &__value {
    font-size: 11px;
    color: var(--fy-outline);
    margin-left: auto;
  }
}

.fy-mentions-fade-enter-active,
.fy-mentions-fade-leave-active {
  transition: opacity 0.18s var(--fy-ease-soft), transform 0.18s var(--fy-ease-out);
}
.fy-mentions-fade-enter-from,
.fy-mentions-fade-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.97);
}
</style>
