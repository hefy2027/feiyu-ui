<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, provide, ref } from 'vue'
import type { FormContext, FormItemInstance, FormRule } from './Form.vue'

interface Props {
  prop?: string
  label?: string
  required?: boolean
  rules?: FormRule | FormRule[]
  error?: string
  labelWidth?: string
  showMessage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  prop: undefined,
  label: '',
  required: false,
  rules: undefined,
  error: undefined,
  labelWidth: undefined,
  showMessage: true
})

const formContext = inject<FormContext | null>('ui-form', null)

const validateError = ref('')
const isValidating = ref(false)
let initialValue: any = undefined

export interface FormItemContext {
  validate: (trigger?: 'blur' | 'change') => Promise<boolean>
  clearValidate: () => void
  prop?: string
}

const errorMessage = computed(() => {
  return props.error || validateError.value
})

const isRequired = computed(() => {
  if (props.required) return true
  const allRules = getRules()
  return allRules.some((r) => r.required)
})

const currentLayout = computed(() => {
  return formContext?.layout.value || 'vertical'
})

const effectiveLabelWidth = computed(() => {
  return props.labelWidth || formContext?.labelWidth?.value
})

function getRules(): FormRule[] {
  let formRules: FormRule[] = []
  if (formContext?.rules?.value && props.prop) {
    const r = formContext.rules.value[props.prop]
    if (r) formRules = Array.isArray(r) ? r : [r]
  }
  const selfRules = props.rules ? (Array.isArray(props.rules) ? props.rules : [props.rules]) : []
  return [...formRules, ...selfRules]
}

function getFieldValue() {
  if (!formContext || !props.prop) return undefined
  return formContext.model.value[props.prop]
}

async function validate(trigger?: 'blur' | 'change'): Promise<boolean> {
  if (!props.prop) return true
  let rules = getRules()
  if (trigger) {
    rules = rules.filter((r) => !r.trigger || r.trigger === trigger)
  }
  if (!rules.length) {
    validateError.value = ''
    return true
  }

  const val = getFieldValue()
  isValidating.value = true

  for (const rule of rules) {
    // Required check
    if (rule.required) {
      if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
        validateError.value = rule.message || `${props.label || props.prop} 是必填项`
        isValidating.value = false
        return false
      }
    }

    // Min/Max for strings and arrays
    if (typeof val === 'string' || Array.isArray(val)) {
      if (rule.min !== undefined && val.length < rule.min) {
        validateError.value = rule.message || `长度不能少于 ${rule.min}`
        isValidating.value = false
        return false
      }
      if (rule.max !== undefined && val.length > rule.max) {
        validateError.value = rule.message || `长度不能超过 ${rule.max}`
        isValidating.value = false
        return false
      }
    }

    // Pattern check
    if (rule.pattern && typeof val === 'string') {
      if (!rule.pattern.test(val)) {
        validateError.value = rule.message || '格式不正确'
        isValidating.value = false
        return false
      }
    }

    // Custom validator
    if (rule.validator) {
      const res = await rule.validator(rule, val)
      if (typeof res === 'string' && res) {
        validateError.value = res
        isValidating.value = false
        return false
      }
      if (res === false) {
        validateError.value = rule.message || '校验未通过'
        isValidating.value = false
        return false
      }
    }
  }

  validateError.value = ''
  isValidating.value = false
  return true
}

function resetField() {
  if (props.prop && formContext) {
    formContext.model.value[props.prop] = initialValue
  }
  clearValidate()
}

function clearValidate() {
  validateError.value = ''
  isValidating.value = false
}

const instance: FormItemInstance = {
  prop: props.prop,
  validate,
  resetField,
  clearValidate
}

onMounted(() => {
  if (props.prop && formContext) {
    initialValue = formContext.model.value[props.prop]
    formContext.registerField(instance)
  }
})

onUnmounted(() => {
  if (formContext) {
    formContext.unregisterField(instance)
  }
})

provide('ui-form-item', {
  validate,
  clearValidate,
  prop: props.prop
})

defineExpose({
  validate,
  resetField,
  clearValidate
})
</script>

<template>
  <div
    :class="[
      'ui-form-item',
      `ui-form-item--${currentLayout}`,
      {
        'is-error': Boolean(errorMessage),
        'is-required': isRequired
      }
    ]"
  >
    <label
      v-if="label || $slots.label"
      class="ui-form-item__label"
      :style="{ width: effectiveLabelWidth }"
    >
      <span v-if="isRequired" class="ui-form-item__required">*</span>
      <slot name="label">{{ label }}</slot>
    </label>

    <div class="ui-form-item__content">
      <slot />

      <transition name="ui-form-error-fade">
        <div v-if="showMessage && errorMessage" class="ui-form-item__error">
          {{ errorMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-form-item {
  display: flex;
  position: relative;

  &--vertical {
    flex-direction: column;
    gap: 6px;
  }

  &--horizontal {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;

    .ui-form-item__label {
      padding-top: 8px;
      text-align: right;
    }
  }

  &--inline {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  &__label {
    font-size: var(--font-size-xs);
    font-weight: 800;
    color: var(--on-surface-variant);
    user-select: none;
    white-space: nowrap;
  }

  &__required {
    color: var(--error);
    margin-right: 3px;
    font-weight: bold;
  }

  &__content {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  &__error {
    color: var(--error);
    font-size: 11px;
    font-weight: 600;
    margin-top: 4px;
    line-height: 1.2;
  }

  &.is-error {
    :deep(.ui-input-wrap),
    :deep(.ui-textarea-wrap),
    :deep(.ui-select-wrap),
    :deep(.ui-select__trigger),
    :deep(.ui-input-number),
    :deep(.ui-color-picker__trigger),
    :deep(.ui-mentions__textarea),
    :deep(.ui-cascader__input-box),
    :deep(.ui-date-picker__input-box),
    :deep(.ui-datetime-picker__input-box),
    :deep(.ui-time-picker__input-box),
    :deep(.ui-time-select__input-box) {
      border-color: color-mix(in srgb, var(--error) 65%, transparent) !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--error) 15%, transparent) !important;
    }
  }
}

/* Error fade animation */
.ui-form-error-fade-enter-active,
.ui-form-error-fade-leave-active {
  transition: opacity 0.18s var(--ease-soft), transform 0.18s var(--ease-out);
}

.ui-form-error-fade-enter-from,
.ui-form-error-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
