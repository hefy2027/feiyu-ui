<script setup lang="ts">
import { computed, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface RadioGroupContext {
  modelValue: { value: string | number | boolean | undefined }
  disabled: { value: boolean }
  name: { value: string | undefined }
  variant: { value: 'classic' | 'button' | 'card' }
  size?: { value: 'sm' | 'md' | 'lg' | undefined }
  updateValue: (value: string | number | boolean) => void
}

interface Props {
  modelValue?: string | number | boolean
  value: string | number | boolean
  label?: string
  disabled?: boolean
  name?: string
  variant?: 'classic' | 'button' | 'card'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  label: '',
  disabled: false,
  variant: 'classic',
  size: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  change: [value: string | number | boolean]
}>()

const groupContext = inject<RadioGroupContext | null>('fy-radio-group', null)
const formItem = inject<FormItemContext | null>('fy-form-item', null)

const isChecked = computed(() => {
  if (groupContext) {
    return groupContext.modelValue.value === props.value
  }
  return props.modelValue === props.value
})

const isDisabled = computed(() => {
  return props.disabled || (groupContext?.disabled.value ?? false)
})

const currentVariant = computed(() => {
  return groupContext?.variant.value ?? props.variant
})

const currentSize = computed(() => {
  return props.size || groupContext?.size?.value || 'md'
})

const inputName = computed(() => {
  return groupContext?.name.value ?? props.name
})

function handleChange() {
  if (isDisabled.value) return
  if (groupContext) {
    groupContext.updateValue(props.value)
  } else {
    emit('update:modelValue', props.value)
  }
  emit('change', props.value)
  formItem?.validate('change')
}
</script>

<template>
  <label
    :class="[
      'fy-radio',
      `fy-radio--${currentSize}`,
      `fy-radio--${currentVariant}`,
      {
        'is-checked': isChecked,
        'is-disabled': isDisabled
      }
    ]"
  >
    <input
      type="radio"
      :name="inputName"
      :value="value"
      :checked="isChecked"
      :disabled="isDisabled"
      class="fy-radio__input"
      @change="handleChange"
    />

    <span v-if="currentVariant === 'classic'" class="fy-radio__circle">
      <i class="fy-radio__dot"></i>
    </span>

    <span class="fy-radio__label">
      <slot>{{ label || value }}</slot>
    </span>
  </label>
</template>

<style scoped lang="scss">
.fy-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: var(--fy-font-size-base);
  color: var(--fy-on-surface);
  font-weight: 500;
  transition: all 0.18s var(--fy-ease-soft);

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
    pointer-events: none;
  }

  &--sm {
    font-size: var(--fy-font-size-xs);
    gap: 6px;
  }

  &--lg {
    font-size: var(--fy-font-size-md);
    gap: 10px;
  }

  /* Classic radio style */
  &--classic {
    .fy-radio__circle {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1.5px solid color-mix(in srgb, var(--fy-outline) 60%, transparent);
      background: color-mix(in srgb, var(--fy-surface-container-high) 40%, transparent);
      display: grid;
      place-items: center;
      transition: all 0.2s var(--fy-ease-soft);

      .fy-radio__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--fy-on-primary);
        transform: scale(0);
        transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    }

    &.is-checked .fy-radio__circle {
      border-color: var(--fy-primary);
      background: var(--fy-primary);
      box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--fy-primary) 60%, transparent);

      .fy-radio__dot {
        transform: scale(1);
      }
    }

    &:hover:not(.is-disabled) .fy-radio__circle {
      border-color: var(--fy-primary);
    }
  }

  /* Button pill style */
  &--button {
    padding: 7px 14px;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-high) 40%, transparent);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font-size: var(--fy-font-size-sm);
    font-weight: 600;
    color: var(--fy-on-surface-variant);

    &:hover:not(.is-disabled) {
      background: color-mix(in srgb, var(--fy-surface-container-high) 75%, transparent);
      box-shadow: var(--fy-shadow-sm), inset 0 1px 0 var(--fy-glass-hi);
      color: var(--fy-on-surface);
      transform: translateY(-1px);
    }

    &.is-checked {
      background: var(--fy-primary);
      color: var(--fy-on-primary);
      border-color: transparent;
      box-shadow: 0 6px 16px -6px color-mix(in srgb, var(--fy-primary) 70%, transparent);
    }
  }

  /* Card style */
  &--card {
    padding: 12px 16px;
    border-radius: var(--fy-r-lg);
    background: color-mix(in srgb, var(--fy-surface-container-low) 60%, transparent);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);

    &:hover:not(.is-disabled) {
      border-color: color-mix(in srgb, var(--fy-primary) 50%, transparent);
      transform: translateY(-1px);
    }

    &.is-checked {
      border-color: var(--fy-primary);
      background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
      box-shadow: 0 4px 16px -4px color-mix(in srgb, var(--fy-primary) 30%, transparent);
    }
  }
}
</style>
