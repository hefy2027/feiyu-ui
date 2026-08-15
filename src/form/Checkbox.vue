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
  indeterminate?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  value: true,
  label: '',
  indeterminate: false,
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
      'ui-checkbox',
      `ui-checkbox--${currentSize}`,
      {
        'is-checked': isChecked,
        'is-indeterminate': indeterminate,
        'is-disabled': isDisabled
      }
    ]"
  >
    <input
      type="checkbox"
      :checked="isChecked"
      :disabled="isDisabled"
      class="ui-checkbox__input"
      @change="handleChange"
    />

    <span class="ui-checkbox__box">
      <span v-if="indeterminate" class="material-symbols-outlined ui-checkbox__icon">
        remove
      </span>
      <span v-else-if="isChecked" class="material-symbols-outlined ui-checkbox__icon">
        check
      </span>
    </span>

    <span v-if="label || $slots.default" class="ui-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style scoped lang="scss">
.ui-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: var(--font-size-base);
  color: var(--on-surface);
  font-weight: 500;
  transition: all 0.18s var(--ease-soft);

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

  &__box {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    border: 1.5px solid color-mix(in srgb, var(--outline) 60%, transparent);
    background: color-mix(in srgb, var(--surface-container-high) 40%, transparent);
    display: grid;
    place-items: center;
    transition: all 0.2s var(--ease-soft);
  }

  &__icon {
    font-size: 14px;
    font-weight: 800;
    color: var(--on-primary);
    line-height: 1;
    user-select: none;
  }

  &.is-checked .ui-checkbox__box,
  &.is-indeterminate .ui-checkbox__box {
    border-color: var(--primary);
    background: var(--primary);
    box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--primary) 60%, transparent);
  }

  &:hover:not(.is-disabled) .ui-checkbox__box {
    border-color: var(--primary);
  }
}
</style>
