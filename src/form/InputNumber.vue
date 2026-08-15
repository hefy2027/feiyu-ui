<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface Props {
  modelValue?: number | null
  min?: number
  max?: number
  step?: number
  stepStrictly?: boolean
  precision?: number
  disabled?: boolean
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  controlsPosition?: 'both-sides' | 'right'
  block?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  min: -Infinity,
  max: Infinity,
  step: 1,
  stepStrictly: false,
  precision: undefined,
  disabled: false,
  readonly: false,
  size: 'md',
  controlsPosition: 'right',
  block: false,
  placeholder: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  change: [value: number | null]
  input: [value: number | null]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const isFocused = ref(false)
const formItem = inject<FormItemContext | null>('ui-form-item', null)

const displayValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined || isNaN(props.modelValue)) {
    return ''
  }
  if (props.precision !== undefined) {
    return props.modelValue.toFixed(props.precision)
  }
  return String(props.modelValue)
})

const isMinDisabled = computed(() => {
  if (props.disabled || props.readonly) return true
  if (props.modelValue === null) return false
  return props.modelValue <= props.min
})

const isMaxDisabled = computed(() => {
  if (props.disabled || props.readonly) return true
  if (props.modelValue === null) return false
  return props.modelValue >= props.max
})

function formatValue(val: number): number {
  let next = Math.max(props.min, Math.min(props.max, val))
  if (props.stepStrictly) {
    next = Math.round(next / props.step) * props.step
  }
  if (props.precision !== undefined) {
    next = Number(next.toFixed(props.precision))
  }
  return next
}

function stepUp() {
  if (isMaxDisabled.value) return
  const base = props.modelValue ?? (props.min > 0 ? props.min : 0)
  const next = formatValue(base + props.step)
  emit('update:modelValue', next)
  emit('change', next)
  formItem?.validate('change')
}

function stepDown() {
  if (isMinDisabled.value) return
  const base = props.modelValue ?? (props.max < 0 ? props.max : 0)
  const next = formatValue(base - props.step)
  emit('update:modelValue', next)
  emit('change', next)
  formItem?.validate('change')
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const raw = target.value.trim()
  if (!raw) {
    emit('update:modelValue', null)
    emit('change', null)
    formItem?.validate('change')
    return
  }
  const num = Number(raw)
  if (!isNaN(num)) {
    const formatted = formatValue(num)
    emit('update:modelValue', formatted)
    emit('change', formatted)
    emit('input', formatted)
    formItem?.validate('change')
  }
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
  formItem?.validate('blur')
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    stepUp()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    stepDown()
  }
}
</script>

<template>
  <div
    :class="[
      'ui-input-number',
      `ui-input-number--${size}`,
      `ui-input-number--${controlsPosition}`,
      { 'ui-input-number--block': block },
      {
        'is-focused': isFocused,
        'is-disabled': disabled
      }
    ]"
  >
    <button
      v-if="controlsPosition === 'both-sides'"
      type="button"
      class="ui-input-number__btn ui-input-number__btn--decrease"
      :disabled="isMinDisabled"
      tabindex="-1"
      @click="stepDown"
    >
      <span class="material-symbols-outlined">remove</span>
    </button>

    <input
      type="text"
      role="spinbutton"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :aria-valuenow="modelValue ?? undefined"
      :aria-valuemin="min"
      :aria-valuemax="max"
      class="ui-input-number__inner"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />

    <button
      v-if="controlsPosition === 'both-sides'"
      type="button"
      class="ui-input-number__btn ui-input-number__btn--increase"
      :disabled="isMaxDisabled"
      tabindex="-1"
      @click="stepUp"
    >
      <span class="material-symbols-outlined">add</span>
    </button>

    <div v-else class="ui-input-number__controls-stacked">
      <button
        type="button"
        class="ui-input-number__btn-stacked"
        :disabled="isMaxDisabled"
        tabindex="-1"
        @click="stepUp"
      >
        <span class="material-symbols-outlined">keyboard_arrow_up</span>
      </button>
      <button
        type="button"
        class="ui-input-number__btn-stacked"
        :disabled="isMinDisabled"
        tabindex="-1"
        @click="stepDown"
      >
        <span class="material-symbols-outlined">keyboard_arrow_down</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-input-number {
  display: inline-flex;
  align-items: center;
  position: relative;
  border-radius: var(--r-md);
  background: color-mix(in srgb, var(--surface-container-high) 42%, transparent);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  border: 1px solid color-mix(in srgb, var(--outline-variant) 45%, transparent);
  transition:
    border-color 0.2s var(--ease-soft),
    box-shadow 0.2s var(--ease-soft),
    background 0.2s var(--ease-soft);
  user-select: none;
  overflow: hidden;

  &.is-focused {
    border-color: color-mix(in srgb, var(--primary) 55%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent);
  }

  &.is-disabled {
    opacity: 0.55;
    cursor: not-allowed;
    background: color-mix(in srgb, var(--surface-container-low) 50%, transparent);

    .ui-input-number__inner {
      cursor: not-allowed;
    }
  }

  &__inner {
    flex: 1;
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    color: var(--on-surface);
    font: inherit;
    font-weight: 600;
    text-align: center;
    padding: 0 8px;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: var(--outline);
    }
  }

  &--block {
    display: flex;
    width: 100%;
  }

  /* Sizes */
  &--sm {
    height: 32px;
    width: 110px;
    font-size: var(--font-size-xs);
    border-radius: var(--r-sm);
  }

  &--md {
    height: 40px;
    width: 130px;
    font-size: var(--font-size-base);
    border-radius: var(--r-md);
  }

  &--lg {
    height: 46px;
    width: 150px;
    font-size: var(--font-size-md);
    border-radius: var(--r-lg);
  }

  /* Both sides controls */
  &__btn {
    display: grid;
    place-items: center;
    height: 100%;
    width: 34px;
    border: none;
    background: transparent;
    color: var(--on-surface-variant);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--surface-container-high) 80%, transparent);
      color: var(--primary);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .material-symbols-outlined {
      font-size: 16px;
    }
  }

  /* Stacked controls on the right */
  &__controls-stacked {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 26px;
    border-left: 1px solid color-mix(in srgb, var(--outline-variant) 35%, transparent);
  }

  &__btn-stacked {
    flex: 1;
    display: grid;
    place-items: center;
    border: none;
    background: transparent;
    color: var(--on-surface-variant);
    cursor: pointer;
    padding: 0;
    transition: background 0.15s ease, color 0.15s ease;

    &:first-child {
      border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 30%, transparent);
    }

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--surface-container-high) 80%, transparent);
      color: var(--primary);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .material-symbols-outlined {
      font-size: 16px;
      line-height: 1;
    }
  }
}
</style>
