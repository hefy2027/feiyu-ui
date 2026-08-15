<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface AutoCompleteOption {
  label: string
  value: string
  disabled?: boolean
}

export interface AutoCompleteProps {
  modelValue?: string
  options?: (string | AutoCompleteOption)[]
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  prefixIcon?: string
  suffixIcon?: string
  filterMethod?: (query: string, option: AutoCompleteOption) => boolean
}

const props = withDefaults(defineProps<AutoCompleteProps>(), {
  modelValue: '',
  options: () => [],
  placeholder: '请输入...',
  clearable: true,
  disabled: false,
  size: 'md',
  block: false,
  prefixIcon: undefined,
  suffixIcon: undefined,
  filterMethod: undefined
})

const emit = defineEmits<{
  'update:modelValue': [val: string]
  select: [val: string, option: AutoCompleteOption]
  change: [val: string]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

defineSlots<{
  prefix?: () => any
  suffix?: () => any
  option?: (props: { option: AutoCompleteOption; index?: number; active?: boolean }) => any
  empty?: () => any
}>()

const isFocused = ref(false)
const activeIndex = ref(-1)
const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const normalizedOptions = computed<AutoCompleteOption[]>(() => {
  return props.options.map((opt) => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt }
    }
    return opt
  })
})

const filteredOptions = computed(() => {
  if (!props.modelValue) return normalizedOptions.value
  if (props.filterMethod) {
    return normalizedOptions.value.filter((o) => props.filterMethod!(props.modelValue, o))
  }
  const q = props.modelValue.toLowerCase()
  return normalizedOptions.value.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
})

const showDropdown = computed(() => {
  return isFocused.value && filteredOptions.value.length > 0 && !props.disabled
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('change', target.value)
  activeIndex.value = -1
}

function handleSelect(opt: AutoCompleteOption) {
  if (opt.disabled) return
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  emit('select', opt.value, opt)
  isFocused.value = false
  inputRef.value?.blur()
}

function handleClear() {
  emit('update:modelValue', '')
  emit('change', '')
  emit('clear')
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function handleKeyDown(event: KeyboardEvent) {
  if (!showDropdown.value) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % filteredOptions.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length
  } else if (event.key === 'Enter' && activeIndex.value > -1) {
    event.preventDefault()
    const opt = filteredOptions.value[activeIndex.value]
    if (opt) handleSelect(opt)
  } else if (event.key === 'Escape') {
    isFocused.value = false
  }
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isFocused.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div
    ref="containerRef"
    :class="[
      'fy-auto-complete',
      `fy-auto-complete--${size}`,
      {
        'fy-auto-complete--open': showDropdown,
        'fy-auto-complete--disabled': disabled,
        'fy-auto-complete--block': block
      }
    ]"
  >
    <div class="fy-auto-complete__input-box">
      <slot name="prefix">
        <span v-if="prefixIcon" class="material-symbols-outlined fy-auto-complete__prefix">
          {{ prefixIcon }}
        </span>
      </slot>

      <input
        ref="inputRef"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="fy-auto-complete__native"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeyDown"
      />

      <slot name="suffix">
        <span v-if="suffixIcon" class="material-symbols-outlined fy-auto-complete__suffix">
          {{ suffixIcon }}
        </span>
      </slot>

      <button
        v-if="clearable && modelValue && !disabled"
        type="button"
        class="fy-auto-complete__clear"
        aria-label="清空"
        @click.stop="handleClear"
      >
        <span class="material-symbols-outlined">cancel</span>
      </button>
    </div>

    <!-- Suggestions Popover -->
    <transition name="fy-auto-complete-fade">
      <div v-if="showDropdown" class="fy-auto-complete__dropdown" @click.stop>
        <div
          v-for="(opt, idx) in filteredOptions"
          :key="opt.value"
          :class="[
            'fy-auto-complete__item',
            {
              'is-active': idx === activeIndex,
              'is-disabled': opt.disabled
            }
          ]"
          @click="handleSelect(opt)"
        >
          <slot name="option" :option="opt" :index="idx" :active="idx === activeIndex">{{ opt.label }}</slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.fy-auto-complete {
  position: relative;
  display: inline-flex;
  font-family: inherit;
  user-select: none;

  &--open {
    z-index: 50;
  }

  &--block {
    display: flex;
    width: 100%;
  }

  &__input-box {
    display: flex;
    align-items: center;
    width: 100%;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-high) 42%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
    transition:
      border-color 0.2s var(--fy-ease-soft),
      box-shadow 0.2s var(--fy-ease-soft),
      background 0.2s var(--fy-ease-soft);
  }

  &--open &__input-box,
  &:focus-within &__input-box {
    border-color: color-mix(in srgb, var(--fy-primary) 55%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--fy-primary) 14%, transparent);
  }

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;

    .fy-auto-complete__input-box {
      background: color-mix(in srgb, var(--fy-surface-container-low) 50%, transparent);
    }
  }

  /* Sizes */
  &--sm &__input-box {
    height: 32px;
    padding: 0 10px;
    font-size: var(--fy-font-size-xs);
    border-radius: var(--fy-r-sm);
  }

  &--md &__input-box {
    height: 40px;
    padding: 0 14px;
    font-size: var(--fy-font-size-base);
    border-radius: var(--fy-r-md);
  }

  &--lg &__input-box {
    height: 46px;
    padding: 0 16px;
    font-size: var(--fy-font-size-md);
    border-radius: var(--fy-r-lg);
  }

  &__prefix {
    font-size: 18px;
    color: var(--fy-outline);
    margin-right: 8px;
    flex-shrink: 0;
  }

  &__suffix {
    font-size: 18px;
    color: var(--fy-outline);
    margin-left: 8px;
    flex-shrink: 0;
  }

  &__native {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    font: inherit;
    color: var(--fy-on-surface);
    font-weight: 500;
    padding: 0;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: var(--fy-outline);
    }
  }

  &__clear {
    border: none;
    background: none;
    color: var(--fy-outline);
    cursor: pointer;
    padding: 0;
    margin-left: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--fy-on-surface);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }

  /* Dropdown Popover */
  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 150;
    padding: 6px;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--fy-glass-border);
    box-shadow: var(--fy-shadow-pop), inset 0 1px 0 var(--fy-glass-hi);
    max-height: 220px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__item {
    padding: 8px 12px;
    border-radius: var(--fy-r-sm);
    font-size: var(--fy-font-size-sm);
    font-weight: 500;
    color: var(--fy-on-surface);
    cursor: pointer;
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
}

.fy-auto-complete-fade-enter-active,
.fy-auto-complete-fade-leave-active {
  transition: opacity 0.18s var(--fy-ease-soft), transform 0.18s var(--fy-ease-out);
}
.fy-auto-complete-fade-enter-from,
.fy-auto-complete-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
</style>
