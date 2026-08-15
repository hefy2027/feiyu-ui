<script setup lang="ts">
import { computed, inject, provide, toRef } from 'vue'
import type { FormItemContext } from './FormItem.vue'
import Radio from './Radio.vue'

export interface RadioOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

interface Props {
  modelValue?: string | number | boolean
  options?: (RadioOption | string | number)[]
  disabled?: boolean
  name?: string
  direction?: 'horizontal' | 'vertical'
  variant?: 'classic' | 'button' | 'card'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  options: undefined,
  disabled: false,
  direction: 'horizontal',
  size: 'md',
  variant: 'classic'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  change: [value: string | number | boolean]
}>()

const randomName = 'fy-radio-group-' + Math.random().toString(36).substring(2, 9)
const groupName = computed(() => props.name || randomName)
const formItem = inject<FormItemContext | null>('fy-form-item', null)

provide('fy-radio-group', {
  modelValue: toRef(props, 'modelValue'),
  disabled: toRef(props, 'disabled'),
  name: groupName,
  variant: toRef(props, 'variant'),
  size: toRef(props, 'size'),
  updateValue: (value: string | number | boolean) => {
    emit('update:modelValue', value)
    emit('change', value)
    formItem?.validate('change')
  }
})

const normalizedOptions = computed<RadioOption[] | undefined>(() => {
  if (!props.options) return undefined
  return props.options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return opt as RadioOption
    }
    return { label: String(opt), value: opt }
  })
})
</script>

<template>
  <div
    :class="[
      'fy-radio-group',
      `fy-radio-group--${size}`,
      `fy-radio-group--${direction}`,
      `fy-radio-group--${variant}`
    ]"
    role="radiogroup"
  >
    <template v-if="normalizedOptions">
      <Radio
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
.fy-radio-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  &--vertical {
    flex-direction: column;
    gap: 10px;
  }

  &--button {
    gap: 8px;
  }

  &--card {
    gap: 12px;
  }
}
</style>
