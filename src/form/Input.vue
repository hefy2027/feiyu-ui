<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface Props {
  modelValue?: string | number
  type?: string
  placeholder?: string
  prefixIcon?: string
  suffixIcon?: string
  clearable?: boolean
  kbd?: string
  maxlength?: number
  showCount?: boolean
  autofocus?: boolean
  disabled?: boolean
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  clearable: false,
  disabled: false,
  readonly: false,
  autofocus: false,
  showCount: false,
  maxlength: undefined,
  size: 'md',
  block: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  input: [value: string, event: Event]
  change: [value: string | number]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
  enter: [event: KeyboardEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const formItem = inject<FormItemContext | null>('ui-form-item', null)

const currentLength = computed(() => String(props.modelValue ?? '').length)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', target.value, event)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('change', '')
  emit('clear')
  inputRef.value?.focus()
  formItem?.validate('change')
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('change', target.value)
  formItem?.validate('change')
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
  formItem?.validate('blur')
}

function handleKeyDown(event: KeyboardEvent) {
  emit('keydown', event)
  if (event.key === 'Enter') {
    emit('enter', event)
  }
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
  inputRef
})
</script>

<template>
  <div
    :class="[
      'ui-input-wrap',
      `ui-input-wrap--${size}`,
      {
        'ui-input-wrap--focused': isFocused,
        'ui-input-wrap--disabled': disabled,
        'ui-input-wrap--block': block
      }
    ]"
  >
    <div v-if="$slots.prepend" class="ui-input__prepend">
      <slot name="prepend" />
    </div>

    <span
      v-if="prefixIcon"
      class="material-symbols-outlined ui-input__icon ui-input__icon--prefix"
    >
      {{ prefixIcon }}
    </span>

    <input
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :autofocus="autofocus"
      class="ui-input"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeyDown"
    />

    <button
      v-if="clearable && modelValue && !disabled && !readonly"
      type="button"
      class="ui-input__clear"
      aria-label="清空"
      @click.stop="handleClear"
    >
      <span class="material-symbols-outlined">cancel</span>
    </button>

    <div v-if="showCount" class="ui-input__count">
      <span>{{ currentLength }}</span>
      <span v-if="maxlength">/{{ maxlength }}</span>
    </div>

    <span
      v-else-if="suffixIcon"
      class="material-symbols-outlined ui-input__icon ui-input__icon--suffix"
    >
      {{ suffixIcon }}
    </span>

    <div v-if="kbd" class="ui-input__kbd">
      <span>{{ kbd }}</span>
    </div>

    <div v-if="$slots.append" class="ui-input__append">
      <slot name="append" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-input-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  font-family: inherit;
  border-radius: var(--r-md);
  background: color-mix(in srgb, var(--surface-container-high) 42%, transparent);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  border: 1px solid color-mix(in srgb, var(--outline-variant) 45%, transparent);
  transition:
    border-color 0.2s var(--ease-soft),
    box-shadow 0.2s var(--ease-soft),
    background 0.2s var(--ease-soft);

  &--focused {
    border-color: color-mix(in srgb, var(--primary) 55%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent);
  }

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;
    background: color-mix(in srgb, var(--surface-container-low) 50%, transparent);

    .ui-input {
      cursor: not-allowed;
    }
  }

  &--block {
    display: flex;
    width: 100%;
  }

  /* Sizes */
  &--sm {
    height: 32px;
    padding: 0 10px;
    font-size: var(--font-size-xs);
    border-radius: var(--r-sm);
  }

  &--md {
    height: 40px;
    padding: 0 14px;
    font-size: var(--font-size-base);
    border-radius: var(--r-md);
  }

  &--lg {
    height: 46px;
    padding: 0 16px;
    font-size: var(--font-size-md);
    border-radius: var(--r-lg);
  }
}

.ui-input {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  font: inherit;
  color: var(--on-surface);
  font-weight: 500;
  padding: 0;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--outline);
  }
}

.ui-input__icon {
  color: var(--outline);
  font-size: 20px;
  user-select: none;
  flex-shrink: 0;

  &--prefix {
    margin-right: 8px;
  }

  &--suffix {
    margin-left: 8px;
  }
}

.ui-input__prepend,
.ui-input__append {
  display: flex;
  align-items: center;
  font-size: inherit;
  color: var(--outline);
  flex-shrink: 0;
  padding: 0 4px;
}

.ui-input__slot {
  display: inline-flex;
  align-items: center;
  color: var(--outline);
  flex-shrink: 0;

  &--prefix {
    margin-right: 8px;
  }

  &--suffix {
    margin-left: 8px;
  }
}

.ui-input__clear {
  border: none;
  background: none;
  color: var(--outline);
  cursor: pointer;
  padding: 0;
  margin-left: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: color 0.15s ease;

  &:hover {
    color: var(--on-surface);
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
}

  .ui-input__count {
    margin-left: 6px;
    font-size: 11px;
    color: var(--outline);
    user-select: none;
    font-weight: 600;
    flex-shrink: 0;
  }

  .ui-input__kbd {
  margin-left: 8px;
  display: flex;
  align-items: center;
  gap: 2px;
  background: color-mix(in srgb, var(--surface) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--outline-variant) 45%, transparent);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 800;
  color: var(--outline);
  user-select: none;
}
</style>
