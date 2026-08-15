<script setup lang="ts">
import { ref, nextTick } from 'vue'
import Tag from '../display/Tag.vue'
import type { TaskTheme } from '../types'

export interface DynamicTagsProps {
  modelValue?: string[]
  max?: number
  closable?: boolean
  theme?: TaskTheme | 'default'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  inputPlaceholder?: string
  addText?: string
}

const props = withDefaults(defineProps<DynamicTagsProps>(), {
  modelValue: () => [],
  max: undefined,
  closable: true,
  theme: 'blue',
  size: 'md',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [tags: string[]]
  change: [tags: string[]]
  add: [tag: string]
  remove: [tag: string, index: number]
}>()

defineSlots<{
  tag?: (props: { tag: string; index: number; handleClose: () => void }) => any
  'add-icon'?: () => any
  'add-text'?: () => any
}>()

const isAdding = ref(false)
const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function startAdd() {
  if (props.disabled) return
  if (props.max && props.modelValue.length >= props.max) return
  isAdding.value = true
  inputValue.value = ''
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function confirmAdd() {
  const val = inputValue.value.trim()
  if (val && !props.modelValue.includes(val)) {
    const next = [...props.modelValue, val]
    emit('update:modelValue', next)
    emit('change', next)
    emit('add', val)
  }
  isAdding.value = false
  inputValue.value = ''
}

function handleClose(index: number) {
  if (props.disabled) return
  const tag = props.modelValue[index]
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
  emit('change', next)
  if (tag) emit('remove', tag, index)
}
</script>

<template>
  <div :class="['fy-dynamic-tags', `fy-dynamic-tags--${size}`, { 'fy-dynamic-tags--disabled': disabled }]">
    <template v-for="(tag, idx) in modelValue" :key="tag">
      <slot name="tag" :tag="tag" :index="idx" :handle-close="() => handleClose(idx)">
        <Tag
          :theme="theme"
          :size="size"
          :closable="closable && !disabled"
          @close="handleClose(idx)"
        >
          {{ tag }}
        </Tag>
      </slot>
    </template>

    <!-- Adding input -->
    <div v-if="isAdding" class="fy-dynamic-tags__input-wrap">
      <input
        ref="inputRef"
        v-model="inputValue"
        :placeholder="inputPlaceholder"
        class="fy-dynamic-tags__input"
        @blur="confirmAdd"
        @keydown.enter.prevent="confirmAdd"
        @keydown.esc="isAdding = false"
      />
    </div>

    <!-- Add Button -->
    <button
      v-else-if="!max || modelValue.length < max"
      type="button"
      class="fy-dynamic-tags__add-btn"
      :disabled="disabled"
      @click="startAdd"
    >
      <slot name="add-icon">
        <span class="material-symbols-outlined">add</span>
      </slot>
      <slot name="add-text">
        <span>{{ addText }}</span>
      </slot>
    </button>
  </div>
</template>
<style scoped lang="scss">
.fy-dynamic-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  user-select: none;

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &__input-wrap {
    display: inline-flex;
  }

  &__input {
    height: 28px;
    padding: 0 10px;
    border-radius: var(--fy-r-full);
    border: 1px solid var(--fy-primary);
    background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
    color: var(--fy-on-surface);
    font: inherit;
    font-size: var(--fy-font-size-xs);
    font-weight: 600;
    width: 80px;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fy-primary) 15%, transparent);
    }
  }

  &__add-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 10px;
    border-radius: var(--fy-r-full);
    border: 1px dashed color-mix(in srgb, var(--fy-outline-variant) 55%, transparent);
    background: color-mix(in srgb, var(--fy-surface-container-high) 35%, transparent);
    color: var(--fy-outline);
    font-size: var(--fy-font-size-xs);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s var(--fy-ease-soft);

    &:hover:not(:disabled) {
      border-color: var(--fy-primary);
      color: var(--fy-primary);
      background: color-mix(in srgb, var(--fy-primary) 10%, transparent);
    }

    .material-symbols-outlined {
      font-size: 16px;
    }
  }

  /* Sizes */
  &--sm {
    .fy-dynamic-tags__input,
    .fy-dynamic-tags__add-btn {
      height: 22px;
      padding: 0 8px;
      font-size: 10.5px;
    }
  }

  &--lg {
    .fy-dynamic-tags__input,
    .fy-dynamic-tags__add-btn {
      height: 34px;
      padding: 0 12px;
      font-size: var(--fy-font-size-sm);
    }
  }
}
</style>
