<script setup lang="ts">
import { computed, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface RadioGroupContext {
  modelValue: { value: string | number | boolean | undefined }
  disabled: { value: boolean }
  name: { value: string | undefined }
  size?: { value: 'sm' | 'md' | 'lg' | undefined }
  updateValue: (value: string | number | boolean) => void
}

interface Props {
  modelValue?: string | number | boolean
  value: string | number | boolean
  label?: string
  disabled?: boolean
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  label: '',
  disabled: false,
  name: undefined,
  size: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  change: [value: string | number | boolean]
}>()

const groupContext = inject<RadioGroupContext | null>('ui-radio-group', null)
const formItem = inject<FormItemContext | null>('ui-form-item', null)

const isChecked = computed(() => {
  if (groupContext) {
    return groupContext.modelValue.value === props.value
  }
  return props.modelValue === props.value
})

const isDisabled = computed(() => {
  return props.disabled || (groupContext?.disabled.value ?? false)
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
      'ui-radio-button',
      `ui-radio-button--${currentSize}`,
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
      class="ui-radio-button__input"
      @change="handleChange"
    />

    <span class="ui-radio-button__inner">
      <slot>{{ label || value }}</slot>
    </span>
  </label>
</template>

<style scoped lang="scss">
.ui-radio-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  outline: none;
  font-size: var(--font-size-sm);
  font-weight: 600;
  line-height: 1;
  padding: 8px 16px;
  border-radius: var(--r-md);
  background: color-mix(in srgb, var(--surface-container-high) 45%, transparent);
  border: 1px solid color-mix(in srgb, var(--outline-variant) 45%, transparent);
  color: var(--on-surface-variant);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.2s var(--ease-soft);

  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
    pointer-events: none;
  }

  &__inner {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  &:hover:not(.is-disabled) {
    background: color-mix(in srgb, var(--surface-container-high) 75%, transparent);
    box-shadow: var(--shadow-sm), inset 0 1px 0 var(--glass-hi);
    color: var(--on-surface);
    transform: translateY(-1px);
  }

  &.is-checked {
    background: var(--primary);
    color: var(--on-primary);
    border-color: transparent;
    box-shadow: 0 4px 14px -3px color-mix(in srgb, var(--primary) 70%, transparent);
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &--sm {
    padding: 5px 10px;
    font-size: var(--font-size-xs);
  }

  &--lg {
    padding: 10px 20px;
    font-size: var(--font-size-md);
  }
}
</style>
