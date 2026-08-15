<script setup lang="ts">
import { provide, ref, toRef, type Ref } from 'vue'

export interface FormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: FormRule, value: any, callback?: (error?: string | Error) => void) => boolean | Promise<boolean> | string | Promise<string> | void | Promise<void>
}

export interface FormContext {
  model: Ref<Record<string, any>>
  rules?: Ref<Record<string, FormRule[]> | undefined>
  layout: Ref<'vertical' | 'horizontal' | 'inline'>
  labelWidth?: Ref<string | undefined>
  size?: Ref<'sm' | 'md' | 'lg' | undefined>
  disabled: Ref<boolean>
  registerField: (field: FormItemInstance) => void
  unregisterField: (field: FormItemInstance) => void
  validateField: (prop: string) => Promise<boolean>
}

export interface FormItemInstance {
  prop?: string
  validate: () => Promise<boolean>
  resetField: () => void
  clearValidate: () => void
}

interface Props {
  model?: Record<string, any>
  rules?: Record<string, FormRule[]>
  layout?: 'vertical' | 'horizontal' | 'inline'
  labelWidth?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  model: () => ({}),
  rules: undefined,
  layout: 'vertical',
  labelWidth: undefined,
  size: undefined,
  disabled: false
})

const emit = defineEmits<{
  submit: [event: Event]
}>()

const fields: FormItemInstance[] = []

function registerField(field: FormItemInstance) {
  fields.push(field)
}

function unregisterField(field: FormItemInstance) {
  const idx = fields.indexOf(field)
  if (idx !== -1) fields.splice(idx, 1)
}

async function validateField(prop: string): Promise<boolean> {
  const field = fields.find((f) => f.prop === prop)
  if (field) {
    return await field.validate()
  }
  return true
}

async function validate(callback?: (valid: boolean, invalidFields?: Record<string, string>) => void): Promise<boolean> {
  const results = await Promise.all(fields.map((f) => f.validate()))
  const valid = results.every(Boolean)
  if (typeof callback === 'function') {
    callback(valid)
  }
  return valid
}

function resetFields() {
  fields.forEach((f) => f.resetField())
}

function clearValidate() {
  fields.forEach((f) => f.clearValidate())
}

provide('ui-form', {
  model: toRef(props, 'model'),
  rules: toRef(props, 'rules'),
  layout: toRef(props, 'layout'),
  labelWidth: toRef(props, 'labelWidth'),
  size: toRef(props, 'size'),
  disabled: toRef(props, 'disabled'),
  registerField,
  unregisterField,
  validateField
})

defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate
})
</script>

<template>
  <form
    :class="[
      'ui-form',
      `ui-form--${layout}`,
      { 'is-disabled': disabled }
    ]"
    @submit.prevent="emit('submit', $event)"
  >
    <slot />
  </form>
</template>

<style scoped lang="scss">
.ui-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  &--inline {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 16px;
  }

  &--horizontal {
    gap: 18px;
  }
}
</style>
