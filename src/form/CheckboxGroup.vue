<script setup lang="ts">
import { computed, inject, provide, toRef } from 'vue'
import type { FormItemContext } from './FormItem.vue'
import Checkbox from './Checkbox.vue'

export interface CheckboxOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue?: (string | number)[]
  options?: (CheckboxOption | string | number)[]
  disabled?: boolean
  min?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  direction?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: undefined,
  disabled: false,
  min: undefined,
  max: undefined,
  size: 'md',
  direction: 'horizontal'
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  change: [value: (string | number)[]]
}>()

const formItem = inject<FormItemContext | null>('fy-form-item', null)

provide('fy-checkbox-group', {
  modelValue: toRef(props, 'modelValue'),
  disabled: toRef(props, 'disabled'),
  updateValue: (value: string | number, checked: boolean) => {
    const next = [...(props.modelValue || [])]
    if (checked) {
      if (!next.includes(value)) next.push(value)
    } else {
      const idx = next.indexOf(value)
      if (idx >= 0) next.splice(idx, 1)
    }
    emit('update:modelValue', next)
    emit('change', next)
    formItem?.validate('change')
  }
})

const normalizedOptions = computed<CheckboxOption[] | undefined>(() => {
  if (!props.options) return undefined
  return props.options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return opt as CheckboxOption
    }
    return { label: String(opt), value: opt }
  })
})
</script>

<template>
  <div
    :class="[
      'fy-checkbox-group',
      `fy-checkbox-group--${size}`,
      `fy-checkbox-group--${direction}`
    ]"
    role="group"
  >
    <template v-if="normalizedOptions">
      <Checkbox
        v-for="opt in normalizedOptions"
        :key="String(opt.value)"
        :value="opt.value"
        :label="opt.label"
        :disabled="opt.disabled"
      />
    </template>
    <slot v-else />
  </div>
</template>

<style scoped lang="scss">
.fy-checkbox-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  &--vertical {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
