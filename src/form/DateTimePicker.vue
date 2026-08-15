<script setup lang="ts">
import DatePicker, { type DatePreset } from './DatePicker.vue'

export interface DateTimePreset {
  label: string
  value: string | [string, string] | (() => string | [string, string])
}

interface Props {
  modelValue?: string | [string, string] | null
  type?: 'datetime' | 'datetimerange'
  placeholder?: string
  startPlaceholder?: string
  endPlaceholder?: string
  clearable?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  presets?: DateTimePreset[]
  format?: string
  showSeconds?: boolean
  disabledDate?: (date: Date) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'datetime',
  placeholder: '选择日期与时间',
  startPlaceholder: '开始时间',
  endPlaceholder: '结束时间',
  format: 'YYYY-MM-DD HH:mm:ss',
  clearable: true,
  disabled: false,
  size: 'md',
  block: false,
  presets: undefined,
  showSeconds: true,
  disabledDate: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string | [string, string]]
  change: [value: string | [string, string]]
  clear: []
  confirm: [value: string | [string, string]]
}>()
</script>

<template>
  <DatePicker
    :model-value="props.modelValue"
    :type="props.type"
    :placeholder="props.placeholder"
    :start-placeholder="props.startPlaceholder"
    :end-placeholder="props.endPlaceholder"
    :clearable="props.clearable"
    :disabled="props.disabled"
    :size="props.size"
    :block="props.block"
    :presets="props.presets"
    :format="props.format"
    :show-seconds="props.showSeconds"
    :disabled-date="props.disabledDate"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @change="(val) => emit('change', val)"
    @clear="() => emit('clear')"
    @confirm="(val) => emit('confirm', val)"
  />
</template>
