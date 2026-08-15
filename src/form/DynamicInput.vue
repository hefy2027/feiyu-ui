<script setup lang="ts">
import { computed, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'
import Button from '../button/Button.vue'
import Input from './Input.vue'

interface Props {
  modelValue?: string[]
  placeholder?: string
  min?: number
  max?: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  createButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [''],
  placeholder: '请输入内容...',
  min: 1,
  max: Infinity,
  disabled: false,
  size: 'md',
  createButtonText: '添加一项'
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  change: [value: string[]]
  create: [index: number]
  remove: [index: number]
}>()

const formItem = inject<FormItemContext | null>('fy-form-item', null)

const list = computed(() => {
  return props.modelValue && props.modelValue.length > 0 ? props.modelValue : ['']
})

function updateItem(index: number, val: string) {
  const next = [...list.value]
  next[index] = val
  emit('update:modelValue', next)
  emit('change', next)
  formItem?.validate('change')
}

function handleAdd() {
  if (props.disabled || list.value.length >= props.max) return
  const next = [...list.value, '']
  emit('update:modelValue', next)
  emit('change', next)
  formItem?.validate('change')
  emit('create', next.length - 1)
}

function handleRemove(index: number) {
  if (props.disabled || list.value.length <= props.min) return
  const next = list.value.filter((_, i) => i !== index)
  emit('update:modelValue', next)
  emit('change', next)
  formItem?.validate('change')
  emit('remove', index)
}
</script>

<template>
  <div :class="['fy-dynamic-input', `fy-dynamic-input--${size}`, { 'is-disabled': disabled }]">
    <div class="fy-dynamic-input__list">
      <div
        v-for="(item, index) in list"
        :key="index"
        class="fy-dynamic-input__row"
      >
        <div class="fy-dynamic-input__field">
          <slot :value="item" :index="index" :update="(val: string) => updateItem(index, val)" :remove="() => handleRemove(index)">
            <Input
              :model-value="String(item)"
              :placeholder="placeholder"
              :disabled="disabled"
              :size="size"
              block
              @update:model-value="updateItem(index, String($event))"
            />
          </slot>
        </div>

        <button
          type="button"
          class="fy-dynamic-input__remove-btn"
          :disabled="disabled || list.length <= min"
          aria-label="删除此项"
          @click="handleRemove(index)"
        >
          <span class="material-symbols-outlined">remove_circle_outline</span>
        </button>
      </div>
    </div>

    <div v-if="list.length < max" class="fy-dynamic-input__action">
      <slot name="action" :add="handleAdd" :disabled="disabled || list.length >= max">
      <Button
        variant="dashed"
        icon="add"
        :size="size"
        :disabled="disabled"
        block
        @click="handleAdd"
      >
        {{ createButtonText }}
      </Button>
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-dynamic-input {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__field {
    flex: 1;
    min-width: 0;
  }

  &__remove-btn {
    border: none;
    background: transparent;
    color: var(--fy-outline);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: color 0.15s ease, background 0.15s ease;
    flex-shrink: 0;

    &:hover:not(:disabled) {
      color: var(--fy-error);
      background: color-mix(in srgb, var(--fy-error) 12%, transparent);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .material-symbols-outlined {
      font-size: 20px;
    }
  }

  &__action {
    margin-top: 2px;
  }

  &.is-disabled {
    opacity: 0.6;
  }
}
</style>
