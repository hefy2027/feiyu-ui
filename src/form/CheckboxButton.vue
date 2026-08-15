<script setup lang="ts">
import { computed, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface CheckboxGroupContext {
  modelValue: { value: (string | number)[] | undefined }
  disabled: { value: boolean }
  min?: { value: number | undefined }
  max?: { value: number | undefined }
  size?: { value: 'sm' | 'md' | 'lg' | undefined }
  updateValue: (value: string | number, checked: boolean) => void
}

interface Props {
  modelValue?: boolean | (string | number)[]
  value?: string | number | boolean
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  value: true,
  label: '',
  disabled: false,
  size: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | (string | number)[]]
  change: [checked: boolean, event: Event]
}>()

const groupContext = inject<CheckboxGroupContext | null>('ui-checkbox-group', null)
const formItem = inject<FormItemContext | null>('ui-form-item', null)

const isChecked = computed(() => {
  if (groupContext && groupContext.modelValue.value) {
    return groupContext.modelValue.value.includes(props.value as string | number)
  }
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value as string | number)
  }
  return Boolean(props.modelValue)
})

const isDisabled = computed(() => {
  if (props.disabled || (groupContext?.disabled.value ?? false)) return true
  if (groupContext) {
    const checkedList = groupContext.modelValue.value || []
    const checked = isChecked.value
    const max = groupContext.max?.value
    const min = groupContext.min?.value
    if (max !== undefined && checkedList.length >= max && !checked) {
      return true
    }
    if (min !== undefined && checkedList.length <= min && checked) {
      return true
    }
  }
  return false
})

const currentSize = computed(() => {
  return props.size || groupContext?.size?.value || 'md'
})

function handleChange(event: Event) {
  if (isDisabled.value) return
  const target = event.target as HTMLInputElement
  const checked = target.checked

  if (groupContext) {
    groupContext.updateValue(props.value as string | number, checked)
  } else if (Array.isArray(props.modelValue)) {
    const next = [...props.modelValue]
    if (checked) {
      next.push(props.value as string | number)
    } else {
      const idx = next.indexOf(props.value as string | number)
      if (idx >= 0) next.splice(idx, 1)
    }
    emit('update:modelValue', next)
  } else {
    emit('update:modelValue', checked)
  }

  emit('change', checked, event)
  formItem?.validate('change')
}
</script>

<template>
  <label
    :class="[
      'ui-checkbox-button',
      `ui-checkbox-button--${currentSize}`,
      {
        'is-checked': isChecked,
        'is-disabled': isDisabled
      }
    ]"
  >
    <input
      type="checkbox"
      :checked="isChecked"
      :disabled="isDisabled"
      class="ui-checkbox-button__input"
      @change="handleChange"
    />

    <span class="ui-checkbox-button__inner">
      <slot>{{ label || value }}</slot>
    </span>
  </label>
</template>

<style scoped lang="scss">
.ui-checkbox-button {
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
