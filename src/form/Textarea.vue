<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

export interface AutoSizeType {
  minRows?: number
  maxRows?: number
}

interface Props {
  modelValue?: string
  placeholder?: string
  rows?: number
  maxlength?: number
  showCount?: boolean
  autoSize?: boolean | AutoSizeType
  autosize?: boolean | AutoSizeType
  clearable?: boolean
  disabled?: boolean
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  rows: 3,
  maxlength: undefined,
  showCount: false,
  autoSize: false,
  autosize: false,
  clearable: false,
  disabled: false,
  readonly: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
  enter: [event: KeyboardEvent]
  input: [event: Event]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isFocused = ref(false)
const formItem = inject<FormItemContext | null>('ui-form-item', null)

const currentLength = computed(() => props.modelValue?.length || 0)

function adjustHeight() {
  if (!props.autoSize || !textareaRef.value) return
  const element = textareaRef.value
  element.style.height = 'auto'
  
  let minHeight = 0
  let maxHeight = Infinity
  const lineHeight = 22
  const paddingOffset = 18

  if (typeof props.autoSize === 'object') {
    if (props.autoSize.minRows) {
      minHeight = props.autoSize.minRows * lineHeight + paddingOffset
    }
    if (props.autoSize.maxRows) {
      maxHeight = props.autoSize.maxRows * lineHeight + paddingOffset
    }
  }

  const targetHeight = Math.min(Math.max(element.scrollHeight, minHeight), maxHeight)
  element.style.height = `${targetHeight}px`
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  emit('input', event)
  formItem?.validate('change')
  adjustHeight()
}

function handleChange(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('change', target.value)
  adjustHeight()
}

function handleClear() {
  emit('update:modelValue', '')
  emit('change', '')
  emit('clear')
  textareaRef.value?.focus()
  formItem?.validate('change')
  nextTick(adjustHeight)
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

watch(() => props.modelValue, () => {
  nextTick(adjustHeight)
})

onMounted(() => {
  adjustHeight()
})

defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
  select: () => textareaRef.value?.select(),
  textareaRef
})
</script>

<template>
  <div
    :class="[
      'ui-textarea-wrap',
      `ui-textarea-wrap--${size}`,
      { 'ui-textarea-wrap--block': block },
      {
        'ui-textarea-wrap--focused': isFocused,
        'ui-textarea-wrap--disabled': disabled
      }
    ]"
  >
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :maxlength="maxlength"
      :disabled="disabled"
      :readonly="readonly"
      class="ui-textarea"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeyDown"
    />

    <button
      v-if="clearable && modelValue && !disabled && !readonly"
      type="button"
      class="ui-textarea__clear"
      aria-label="清空"
      @click.stop="handleClear"
    >
      <span class="material-symbols-outlined">cancel</span>
    </button>

    <div v-if="showCount" class="ui-textarea__count">
      <span>{{ currentLength }}</span>
      <span v-if="maxlength"> / {{ maxlength }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-textarea-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: var(--r-md);
  background: color-mix(in srgb, var(--surface-container-high) 42%, transparent);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  border: 1px solid color-mix(in srgb, var(--outline-variant) 45%, transparent);
  transition:
    border-color 0.2s var(--ease-soft),
    box-shadow 0.2s var(--ease-soft),
    background 0.2s var(--ease-soft);
  padding: 10px 14px;

  &--focused {
    border-color: color-mix(in srgb, var(--primary) 55%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent);
  }

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;
    background: color-mix(in srgb, var(--surface-container-low) 50%, transparent);

    .ui-textarea {
      cursor: not-allowed;
    }
  }

  &--sm {
    padding: 8px 10px;
    font-size: var(--font-size-xs);
    border-radius: var(--r-sm);
  }

  &--lg {
    padding: 14px 18px;
    font-size: var(--font-size-md);
    border-radius: var(--r-lg);
  }
}

.ui-textarea {
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;
  color: var(--on-surface);
  font-size: inherit;
  line-height: 1.6;
  resize: vertical;
  padding: 0;
  outline: none;

  &::placeholder {
    color: var(--outline);
  }
}

.ui-textarea__clear {
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  background: none;
  color: var(--outline);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;

  &:hover {
    color: var(--on-surface);
  }

  .material-symbols-outlined {
    font-size: 16px;
  }
}

.ui-textarea__count {
  margin-top: 6px;
  text-align: right;
  font-size: var(--font-size-xs);
  color: var(--outline);
  user-select: none;
  font-weight: 500;
}
</style>
