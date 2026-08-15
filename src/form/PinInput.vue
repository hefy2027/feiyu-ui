<script setup lang="ts">
import { ref, watch, onMounted, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface Props {
  modelValue?: string
  length?: number
  type?: 'text' | 'number' | 'password'
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  autoFocus?: boolean
  mask?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  length: 4,
  type: 'text',
  disabled: false,
  size: 'md',
  autoFocus: false,
  mask: false,
  placeholder: '○'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent, index: number]
  blur: [event: FocusEvent, index: number]
  complete: [value: string]
  change: [value: string]
}>()

const digits = ref<string[]>(Array(props.length).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])
const formItem = inject<FormItemContext | null>('ui-form-item', null)

function syncFromValue(val: string) {
  const chars = (val || '').split('').slice(0, props.length)
  digits.value = Array(props.length)
    .fill('')
    .map((_, i) => chars[i] || '')
}

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
  emit('change', full)
  formItem?.validate('change')
  if (full.length === props.length && digits.value.every((d) => d !== '')) {
    emit('complete', full)
  }
}

function handleInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  let val = target.value
  if (props.type === 'number') {
    val = val.replace(/\D/g, '')
  }
  
  if (val.length > 1) {
    // pasted or multiple chars
    val = val[val.length - 1]
  }

  digits.value[index] = val
  emitCurrentValue()

  if (val && index < props.length - 1) {
    inputRefs.value[index + 1]?.focus()
    inputRefs.value[index + 1]?.select()
  }
}

function handleKeyDown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    if (!digits.value[index] && index > 0) {
      digits.value[index - 1] = ''
      emitCurrentValue()
      inputRefs.value[index - 1]?.focus()
    } else {
      digits.value[index] = ''
      emitCurrentValue()
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    inputRefs.value[index - 1]?.focus()
  } else if (event.key === 'ArrowRight' && index < props.length - 1) {
    event.preventDefault()
    inputRefs.value[index + 1]?.focus()
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasteData = event.clipboardData?.getData('text') || ''
  const clean = props.type === 'number' ? pasteData.replace(/\D/g, '') : pasteData
  const chars = clean.slice(0, props.length).split('')
  if (!chars.length) return
  chars.forEach((c, idx) => {
    digits.value[idx] = c
  })
  emitCurrentValue()
  
  const nextFocusIndex = Math.min(chars.length, props.length - 1)
  inputRefs.value[nextFocusIndex]?.focus()
}

function handleCellFocus(index: number, event: FocusEvent) {
  emit('focus', event, index)
  ;(event.target as HTMLInputElement)?.select()
}

function handleCellBlur(index: number, event: FocusEvent) {
  emit('blur', event, index)
  formItem?.validate('blur')
}

onMounted(() => {
  if (props.autoFocus && !props.disabled) {
    inputRefs.value[0]?.focus()
  }
})
</script>

<template>
  <div :class="['ui-pin-input', `ui-pin-input--${size}`, { 'is-disabled': disabled }]">
    <input
      v-for="(_, index) in length"
      :key="index"
      :ref="(el) => (inputRefs[index] = el as HTMLInputElement)"
      :type="type === 'password' || mask ? 'password' : 'text'"
      :value="digits[index]"
      :placeholder="placeholder"
      :disabled="disabled"
      maxlength="1"
      inputmode="numeric"
      autocomplete="one-time-code"
      class="ui-pin-input__cell"
      @input="handleInput(index, $event)"
      @keydown="handleKeyDown(index, $event)"
      @paste="handlePaste"
      @focus="handleCellFocus(index, $event)"
      @blur="handleCellBlur(index, $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.ui-pin-input {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  user-select: none;

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;

    .ui-pin-input__cell {
      cursor: not-allowed;
    }
  }

  &__cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-family: inherit;
    font-weight: 700;
    color: var(--on-surface);
    border-radius: var(--r-md);
    background: color-mix(in srgb, var(--surface-container-high) 45%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border: 1.5px solid color-mix(in srgb, var(--outline-variant) 45%, transparent);
    outline: none;
    transition:
      border-color 0.2s var(--ease-soft),
      box-shadow 0.2s var(--ease-soft),
      background 0.2s var(--ease-soft),
      transform 0.15s ease;

    &:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 18%, transparent);
      transform: translateY(-1px);
      background: color-mix(in srgb, var(--surface-container-highest) 75%, transparent);
    }

    &::placeholder {
      color: color-mix(in srgb, var(--outline) 40%, transparent);
      font-size: 10px;
    }
  }

  &--sm &__cell {
    width: 32px;
    height: 36px;
    font-size: var(--font-size-base);
    border-radius: var(--r-sm);
  }

  &--md &__cell {
    width: 44px;
    height: 48px;
    font-size: var(--font-size-lg);
    border-radius: var(--r-md);
  }

  &--lg &__cell {
    width: 54px;
    height: 60px;
    font-size: 22px;
    border-radius: var(--r-lg);
  }
}
</style>
