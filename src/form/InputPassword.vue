<script setup lang="ts">
import { ref } from 'vue'
import Input from './Input.vue'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  prefixIcon?: string
  clearable?: boolean
  showPassword?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入密码...',
  disabled: false,
  readonly: false,
  size: 'md',
  block: false,
  prefixIcon: 'lock',
  clearable: false,
  showPassword: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  input: [value: string, event: Event]
  change: [value: string]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
  enter: [event: KeyboardEvent]
}>()

const isPasswordVisible = ref(false)

function togglePasswordVisibility() {
  if (props.disabled || props.readonly) return
  isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<template>
  <div class="ui-input-password-wrap" :class="{ 'ui-input-password-wrap--block': block }">
    <Input
      :model-value="modelValue"
      :type="isPasswordVisible ? 'text' : 'password'"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :size="size"
      :block="block"
      :prefix-icon="prefixIcon"
      :clearable="clearable"
      @update:model-value="emit('update:modelValue', String($event))"
      @input="emit('input', $event, $event as any)"
      @change="emit('change', String($event))"
      @clear="emit('clear')"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
      @keydown="emit('keydown', $event)"
      @enter="emit('enter', $event)"
    >
      <template v-if="showPassword" #suffix>
        <button
          type="button"
          class="ui-input-password__toggle"
          :class="`ui-input-password__toggle--${size}`"
          :disabled="disabled"
          aria-label="切换密码可见性"
          @click.stop="togglePasswordVisibility"
        >
          <span class="material-symbols-outlined">
            {{ isPasswordVisible ? 'visibility_off' : 'visibility' }}
          </span>
        </button>
      </template>
    </Input>
  </div>
</template>

<style scoped lang="scss">
.ui-input-password-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;

  &--block {
    display: flex;
    width: 100%;
  }
}

.ui-input-password__toggle {
  border: none;
  background: none;
  color: var(--outline);
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;

  &:hover:not(:disabled) {
    color: var(--on-surface);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }

  &--sm {
    .material-symbols-outlined {
      font-size: 16px;
    }
  }

  &--lg {
    .material-symbols-outlined {
      font-size: 20px;
    }
  }
}
</style>
