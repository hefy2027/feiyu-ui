<script setup lang="ts">
import { ref, computed, watch, onMounted, inject, type StyleValue } from 'vue'
import type { FormItemContext } from './FormItem.vue'

export type PinInputSize = 'sm' | 'md' | 'lg'
export type PinInputType = 'text' | 'number' | 'password' | 'alphanumeric'
export type PinInputStatus = 'error' | 'warning' | 'success'

export interface PinInputProps {
  modelValue?: string
  length?: number
  type?: PinInputType
  inputmode?: 'text' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
  disabled?: boolean
  readonly?: boolean
  size?: PinInputSize
  autoFocus?: boolean
  autofocus?: boolean
  mask?: boolean | string
  placeholder?: string
  uppercase?: boolean
  separator?: string
  groupSize?: number
  separatorIndex?: number | number[]
  gap?: number | string
  status?: PinInputStatus
  block?: boolean
}

const props = withDefaults(defineProps<PinInputProps>(), {
  modelValue: '',
  length: 6,
  type: 'number',
  inputmode: undefined,
  disabled: false,
  readonly: false,
  size: 'md',
  autoFocus: false,
  autofocus: false,
  mask: false,
  placeholder: '○',
  uppercase: false,
  separator: '',
  groupSize: undefined,
  separatorIndex: undefined,
  gap: undefined,
  status: undefined,
  block: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent, index: number]
  blur: [event: FocusEvent, index: number]
  complete: [value: string]
  change: [value: string]
  input: [value: string]
  keydown: [event: KeyboardEvent, index: number]
  clear: []
}>()

const digits = ref<string[]>(Array.from({ length: props.length }, () => ''))
const inputRefs = ref<HTMLInputElement[]>([])
const formItem = inject<FormItemContext | null>('fy-form-item', null)

const effectiveInputMode = computed(() => {
  if (props.inputmode) return props.inputmode
  if (props.type === 'number') return 'numeric'
  return 'text'
})

function sanitizeValue(val: string): string {
  let sanitized = val || ''
  if (props.type === 'number') {
    sanitized = sanitized.replace(/\D/g, '')
  } else if (props.type === 'alphanumeric') {
    sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, '')
  }
  if (props.uppercase) {
    sanitized = sanitized.toUpperCase()
  }
  return sanitized
}

function syncFromValue(val: string) {
  const cleaned = sanitizeValue(val)
  const chars = cleaned.split('').slice(0, props.length)
  digits.value = Array(props.length)
    .fill('')
    .map((_, i) => chars[i] || '')
}

watch(
  () => props.length,
  (newLen) => {
    digits.value = Array.from({ length: newLen }, (_, i) => digits.value[i] || '')
  }
)

watch(
  () => props.modelValue,
  (next) => {
    const currentStr = digits.value.join('')
    if (next !== currentStr) {
      syncFromValue(next || '')
    }
  },
  { immediate: true }
)

function emitCurrentValue() {
  const full = digits.value.join('')
  emit('update:modelValue', full)
  emit('input', full)
  emit('change', full)
  formItem?.validate('change')
  if (full.length === props.length && digits.value.every((d) => d !== '')) {
    emit('complete', full)
  }
}

function getDisplayChar(index: number): string {
  const val = digits.value[index] || ''
  if (!val) return ''
  if (typeof props.mask === 'string' && props.mask) {
    return props.mask
  }
  return val
}

function shouldShowSeparator(index: number): boolean {
  if (index >= props.length - 1) return false

  if (props.separatorIndex !== undefined) {
    if (Array.isArray(props.separatorIndex)) {
      return props.separatorIndex.includes(index)
    }
    return props.separatorIndex === index
  }

  if (props.groupSize && props.groupSize > 0) {
    return (index + 1) % props.groupSize === 0
  }

  return false
}

function handleInput(index: number, event: Event) {
  if (props.readonly || props.disabled) return
  const target = event.target as HTMLInputElement
  let val = sanitizeValue(target.value)
  
  if (val.length > 1) {
    // If multiple characters typed or auto-filled
    const chars = val.split('')
    let curIndex = index
    chars.forEach((c) => {
      if (curIndex < props.length) {
        digits.value[curIndex] = c
        curIndex++
      }
    })
    emitCurrentValue()
    const nextIdx = Math.min(curIndex, props.length - 1)
    inputRefs.value[nextIdx]?.focus()
    inputRefs.value[nextIdx]?.select()
    return
  }

  digits.value[index] = val
  emitCurrentValue()

  if (val && index < props.length - 1) {
    inputRefs.value[index + 1]?.focus()
    inputRefs.value[index + 1]?.select()
  }
}

function handleKeyDown(index: number, event: KeyboardEvent) {
  emit('keydown', event, index)
  if (props.readonly || props.disabled) return

  if (event.key === 'Backspace') {
    if (!digits.value[index] && index > 0) {
      digits.value[index - 1] = ''
      emitCurrentValue()
      inputRefs.value[index - 1]?.focus()
      inputRefs.value[index - 1]?.select()
    } else {
      digits.value[index] = ''
      emitCurrentValue()
    }
  } else if (event.key === 'Delete') {
    digits.value[index] = ''
    emitCurrentValue()
  } else if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    inputRefs.value[index - 1]?.focus()
    inputRefs.value[index - 1]?.select()
  } else if (event.key === 'ArrowRight' && index < props.length - 1) {
    event.preventDefault()
    inputRefs.value[index + 1]?.focus()
    inputRefs.value[index + 1]?.select()
  }
}

function handlePaste(event: ClipboardEvent) {
  if (props.readonly || props.disabled) return
  event.preventDefault()
  const pasteData = event.clipboardData?.getData('text') || ''
  const clean = sanitizeValue(pasteData)
  const chars = clean.slice(0, props.length).split('')
  if (!chars.length) return
  chars.forEach((c, idx) => {
    digits.value[idx] = c
  })
  emitCurrentValue()
  
  const nextFocusIndex = Math.min(chars.length, props.length - 1)
  inputRefs.value[nextFocusIndex]?.focus()
  inputRefs.value[nextFocusIndex]?.select()
}

function handleCellFocus(index: number, event: FocusEvent) {
  emit('focus', event, index)
  ;(event.target as HTMLInputElement)?.select()
}

function handleCellBlur(index: number, event: FocusEvent) {
  emit('blur', event, index)
  formItem?.validate('blur')
}

function focus(index = 0) {
  const targetIndex = Math.max(0, Math.min(index, props.length - 1))
  inputRefs.value[targetIndex]?.focus()
  inputRefs.value[targetIndex]?.select()
}

function blur() {
  inputRefs.value.forEach((el) => el?.blur())
}

function clear() {
  digits.value = Array(props.length).fill('')
  emitCurrentValue()
  emit('clear')
}

defineExpose({
  focus,
  blur,
  clear,
  digits,
  inputRefs
})

const containerStyle = computed<StyleValue>(() => {
  const styles: Record<string, string> = {}
  if (props.gap !== undefined) {
    styles.gap = typeof props.gap === 'number' ? `${props.gap}px` : props.gap
  }
  return styles
})

onMounted(() => {
  if ((props.autoFocus || props.autofocus) && !props.disabled) {
    inputRefs.value[0]?.focus()
  }
})
</script>

<template>
  <div
    :class="[
      'fy-pin-input',
      `fy-pin-input--${size}`,
      {
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-block': block,
        [`is-status-${status}`]: !!status
      }
    ]"
    :style="containerStyle"
  >
    <template v-for="(_, index) in length" :key="index">
      <input
        :ref="(el) => (inputRefs[index] = el as HTMLInputElement)"
        :type="type === 'password' || mask === true ? 'password' : 'text'"
        :value="typeof mask === 'string' && mask ? getDisplayChar(index) : digits[index]"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        maxlength="1"
        :inputmode="effectiveInputMode"
        autocomplete="one-time-code"
        class="fy-pin-input__cell"
        @input="handleInput(index, $event)"
        @keydown="handleKeyDown(index, $event)"
        @paste="handlePaste"
        @focus="handleCellFocus(index, $event)"
        @blur="handleCellBlur(index, $event)"
      />
      <div
        v-if="shouldShowSeparator(index)"
        class="fy-pin-input__separator"
      >
        <slot name="separator" :index="index">
          {{ separator || '-' }}
        </slot>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.fy-pin-input {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  user-select: none;

  &.is-block {
    display: flex;
    width: 100%;
    justify-content: space-between;

    .fy-pin-input__cell {
      flex: 1;
      max-width: 60px;
    }
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;

    .fy-pin-input__cell {
      cursor: not-allowed;
      background: color-mix(in srgb, var(--fy-surface-container-low) 40%, transparent);
    }
  }

  &.is-readonly {
    .fy-pin-input__cell {
      cursor: default;
      user-select: all;
    }
  }

  &__separator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--fy-outline);
    font-size: var(--fy-font-size-md);
    font-weight: 600;
    user-select: none;
    flex-shrink: 0;
  }

  /* Status styles */
  &.is-status-error &__cell {
    border-color: color-mix(in srgb, var(--fy-error) 60%, transparent);
    color: var(--fy-error);

    &:focus {
      border-color: var(--fy-error);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--fy-error) 18%, transparent);
    }
  }

  &.is-status-warning &__cell {
    border-color: color-mix(in srgb, var(--fy-theme-yellow) 60%, transparent);

    &:focus {
      border-color: var(--fy-theme-yellow);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--fy-theme-yellow) 20%, transparent);
    }
  }

  &.is-status-success &__cell {
    border-color: color-mix(in srgb, var(--fy-theme-green) 60%, transparent);

    &:focus {
      border-color: var(--fy-theme-green);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--fy-theme-green) 20%, transparent);
    }
  }

  &__cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-family: inherit;
    font-weight: 700;
    color: var(--fy-on-surface);
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-high) 45%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border: 1.5px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
    outline: none;
    transition:
      border-color 0.2s var(--fy-ease-soft),
      box-shadow 0.2s var(--fy-ease-soft),
      background 0.2s var(--fy-ease-soft),
      transform 0.15s ease;

    &:focus:not(:disabled):not([readonly]) {
      border-color: var(--fy-primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--fy-primary) 18%, transparent);
      transform: translateY(-1px);
      background: color-mix(in srgb, var(--fy-surface-container-highest) 75%, transparent);
    }

    &::placeholder {
      color: color-mix(in srgb, var(--fy-outline) 40%, transparent);
      font-size: 10px;
    }
  }

  &--sm &__cell {
    width: 32px;
    height: 36px;
    font-size: var(--fy-font-size-base);
    border-radius: var(--fy-r-sm);
  }

  &--md &__cell {
    width: 44px;
    height: 48px;
    font-size: var(--fy-font-size-lg);
    border-radius: var(--fy-r-md);
  }

  &--lg &__cell {
    width: 54px;
    height: 60px;
    font-size: 22px;
    border-radius: var(--fy-r-lg);
  }
}
</style>
