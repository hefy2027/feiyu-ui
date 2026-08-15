<script setup lang="ts">
import { computed, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface Props {
  modelValue?: boolean | string | number
  activeValue?: boolean | string | number
  inactiveValue?: boolean | string | number
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  activeText?: string
  inactiveText?: string
  checkedText?: string
  uncheckedText?: string
  activeColor?: string
  inactiveColor?: string
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  activeValue: true,
  inactiveValue: false,
  disabled: false,
  loading: false,
  size: 'md',
  activeText: '',
  inactiveText: '',
  checkedText: '',
  uncheckedText: '',
  activeColor: undefined,
  inactiveColor: undefined,
  name: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | string | number]
  change: [value: boolean | string | number]
}>()

const formItem = inject<FormItemContext | null>('ui-form-item', null)

const isChecked = computed(() => {
  return props.modelValue === props.activeValue
})

const labelLeft = computed(() => props.inactiveText || props.uncheckedText)
const labelRight = computed(() => props.activeText || props.checkedText)

function handleClick() {
  if (props.disabled || props.loading) return
  const nextValue = isChecked.value ? props.inactiveValue : props.activeValue
  emit('update:modelValue', nextValue)
  emit('change', nextValue)
  formItem?.validate('change')
}
</script>

<template>
  <div
    :class="[
      'ui-switch',
      `ui-switch--${size}`,
      {
        'is-active': isChecked,
        'is-disabled': disabled,
        'is-loading': loading
      }
    ]"
    role="switch"
    tabindex="0"
    :aria-checked="isChecked"
    :aria-disabled="disabled"
    @click="handleClick"
    @keydown.space.prevent="handleClick"
    @keydown.enter.prevent="handleClick"
  >
    <input
      type="checkbox"
      :name="name"
      :checked="isChecked"
      :disabled="disabled || loading"
      class="ui-switch__input"
    />

    <span v-if="labelLeft" class="ui-switch__label ui-switch__label--left">
      {{ labelLeft }}
    </span>

    <div
      class="ui-switch__track"
      :style="{ backgroundColor: modelValue && activeColor ? activeColor : undefined }"
    >
      <div class="ui-switch__handle">
        <span
          v-if="loading"
          class="material-symbols-outlined ui-switch__spinner"
        >
          progress_activity
        </span>
        <slot v-else-if="isChecked" name="active-icon">
          <slot name="checked-icon" />
        </slot>
        <slot v-else name="inactive-icon">
          <slot name="unchecked-icon" />
        </slot>
      </div>
    </div>

    <span v-if="labelRight" class="ui-switch__label ui-switch__label--right">
      {{ labelRight }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.ui-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  transition: opacity 0.2s ease;

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.is-loading {
    cursor: wait;
  }

  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
    pointer-events: none;
  }

  &__label {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--on-surface-variant);
    transition: color 0.2s ease;

    &--left {
      color: var(--on-surface);
    }
  }

  &.is-active &__label--right {
    color: var(--on-surface);
  }

  &__track {
    position: relative;
    border-radius: var(--r-full);
    background: color-mix(in srgb, var(--outline-variant) 60%, transparent);
    border: 1.5px solid color-mix(in srgb, var(--outline-variant) 40%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition:
      background-color 0.24s var(--ease-soft),
      border-color 0.24s var(--ease-soft),
      box-shadow 0.24s var(--ease-soft);
  }

  &__handle {
    position: absolute;
    top: 50%;
    left: 2px;
    transform: translateY(-50%);
    border-radius: 50%;
    background: var(--surface-container-lowest);
    box-shadow: var(--shadow-sm);
    display: grid;
    place-items: center;
    transition:
      transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1),
      width 0.2s ease;
  }

  &__spinner {
    font-size: 13px;
    color: var(--primary);
    animation: spin 1s linear infinite;
  }

  /* Sizes */
  &--sm {
    .ui-switch__track {
      width: 34px;
      height: 18px;
    }
    .ui-switch__handle {
      width: 12px;
      height: 12px;
    }
    &.is-active .ui-switch__handle {
      transform: translate(16px, -50%);
    }
  }

  &--md {
    .ui-switch__track {
      width: 44px;
      height: 24px;
    }
    .ui-switch__handle {
      width: 18px;
      height: 18px;
    }
    &.is-active .ui-switch__handle {
      transform: translate(20px, -50%);
    }
  }

  &--lg {
    .ui-switch__track {
      width: 54px;
      height: 30px;
    }
    .ui-switch__handle {
      width: 24px;
      height: 24px;
    }
    &.is-active .ui-switch__handle {
      transform: translate(24px, -50%);
    }
  }

  /* Active state */
  &.is-active {
    .ui-switch__track {
      background-color: var(--primary);
      border-color: var(--primary);
      box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--primary) 70%, transparent);
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
