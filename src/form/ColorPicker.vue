<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface Props {
  modelValue?: string
  swatches?: string[]
  presetColors?: string[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  showAlpha?: boolean
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '#3b82f6',
  swatches: () => [
    '#6366f1', // indigo
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ef4444', // red
    '#f59e0b', // yellow
    '#10b981', // green
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#64748b', // slate
    '#441ce7', // primary
    '#191c1e'  // dark
  ],
  presetColors: undefined,
  disabled: false,
  size: 'md',
  clearable: false,
  showAlpha: false
})

const emit = defineEmits<{
  clear: []
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const isOpen = ref(false)
const pickerContainerRef = ref<HTMLElement | null>(null)
const formItem = inject<FormItemContext | null>('ui-form-item', null)

const effectiveSwatches = computed(() => {
  return props.presetColors || props.swatches || []
})

function selectColor(color: string) {
  emit('update:modelValue', color)
  emit('change', color)
  formItem?.validate('change')
}

function handleCustomInput(event: Event) {
  const target = event.target as HTMLInputElement
  const val = target.value
  emit('update:modelValue', val)
  emit('change', val)
  formItem?.validate('change')
}

function handleClear(event: MouseEvent) {
  event.stopPropagation()
  emit('update:modelValue', '')
  emit('change', '')
  emit('clear')
  formItem?.validate('change')
}

function handleClickOutside(event: MouseEvent) {
  if (pickerContainerRef.value && !pickerContainerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div
    ref="pickerContainerRef"
    :class="[
      'ui-color-picker',
      `ui-color-picker--${size}`,
      {
        'ui-color-picker--open': isOpen,
        'ui-color-picker--disabled': disabled
      }
    ]"
  >
    <!-- Trigger button -->
    <button
      type="button"
      class="ui-color-picker__trigger"
      :disabled="disabled"
      @click="!disabled && (isOpen = !isOpen)"
    >
      <span class="ui-color-picker__preview" :style="{ backgroundColor: modelValue }" />
      <span class="ui-color-picker__text">{{ modelValue }}</span>
      <span class="material-symbols-outlined ui-color-picker__arrow">expand_more</span>
    </button>

    <!-- Popover -->
    <transition name="ui-color-fade">
      <div v-if="isOpen" class="ui-color-picker__popover" @click.stop>
        <div class="ui-color-picker__header">推荐色板</div>
        <div class="ui-color-picker__swatches">
          <button
            v-for="c in effectiveSwatches"
            :key="c"
            type="button"
            :class="['ui-color-picker__swatch', { 'is-active': c.toLowerCase() === modelValue.toLowerCase() }]"
            :style="{ backgroundColor: c }"
            :title="c"
            @click="selectColor(c)"
          />
        </div>

        <!-- Custom Hex input -->
        <div class="ui-color-picker__custom">
          <input
            type="color"
            :value="modelValue"
            class="ui-color-picker__native-input"
            @input="handleCustomInput"
          />
          <input
            type="text"
            :value="modelValue"
            class="ui-color-picker__text-input"
            @input="handleCustomInput"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.ui-color-picker {
  position: relative;
  display: inline-flex;
  font-family: inherit;
  user-select: none;

  &--open {
    z-index: 50;
  }

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: var(--r-md);
    background: color-mix(in srgb, var(--surface-container-high) 42%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border: 1px solid color-mix(in srgb, var(--outline-variant) 45%, transparent);
    cursor: pointer;
    color: var(--on-surface);
    font-weight: 600;
    transition:
      border-color 0.2s var(--ease-soft),
      box-shadow 0.2s var(--ease-soft),
      background 0.2s var(--ease-soft);

    &:focus-visible {
      outline: none;
      border-color: color-mix(in srgb, var(--primary) 55%, transparent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent);
    }
  }

  &--open &__trigger {
    border-color: color-mix(in srgb, var(--primary) 55%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent);
  }

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;

    .ui-color-picker__trigger {
      cursor: not-allowed;
      background: color-mix(in srgb, var(--surface-container-low) 50%, transparent);
    }
  }

  /* Sizes */
  &--sm &__trigger {
    height: 32px;
    padding: 0 8px;
    font-size: var(--font-size-xs);
    border-radius: var(--r-sm);
  }

  &--md &__trigger {
    height: 40px;
    padding: 0 12px;
    font-size: var(--font-size-base);
    border-radius: var(--r-md);
  }

  &--lg &__trigger {
    height: 46px;
    padding: 0 14px;
    font-size: var(--font-size-md);
    border-radius: var(--r-lg);
  }

  &__preview {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  &__text {
    font-family: monospace;
    font-size: 0.95em;
    text-transform: uppercase;
  }

  &__arrow {
    font-size: 18px;
    color: var(--outline);
    transition: transform 0.2s var(--ease-soft);
  }

  &--open &__arrow {
    transform: rotate(180deg);
  }

  /* Popover */
  &__popover {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 150;
    width: 200px;
    padding: 12px;
    border-radius: var(--r-lg);
    background: color-mix(in srgb, var(--surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-hi);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__header {
    font-size: var(--font-size-xs);
    font-weight: 700;
    color: var(--outline);
    letter-spacing: 0.04em;
  }

  &__swatches {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }

  &__swatch {
    width: 100%;
    aspect-ratio: 1;
    border-radius: var(--r-sm);
    border: 1.5px solid transparent;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &:hover {
      transform: scale(1.15);
      box-shadow: var(--shadow-sm);
    }

    &.is-active {
      border-color: var(--on-surface);
      box-shadow: 0 0 0 2px var(--surface-container-lowest), 0 0 0 3px var(--primary);
    }
  }

  &__custom {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
  }

  &__native-input {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }
    &::-webkit-color-swatch {
      border: 1px solid var(--outline-variant);
      border-radius: var(--r-sm);
    }
  }

  &__text-input {
    flex: 1;
    height: 28px;
    padding: 0 8px;
    border-radius: var(--r-sm);
    border: 1px solid color-mix(in srgb, var(--outline-variant) 45%, transparent);
    background: color-mix(in srgb, var(--surface-container-high) 50%, transparent);
    color: var(--on-surface);
    font-family: monospace;
    font-size: var(--font-size-xs);
    font-weight: 600;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }
}

.ui-color-fade-enter-active,
.ui-color-fade-leave-active {
  transition: opacity 0.18s var(--ease-soft), transform 0.18s var(--ease-out);
}
.ui-color-fade-enter-from,
.ui-color-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
