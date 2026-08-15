<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

export interface SegmentedOption {
  label: string
  value: string | number
  icon?: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options: Array<string | SegmentedOption>
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  size: 'md',
  block: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

const normalizedOptions = computed<SegmentedOption[]>(() => {
  return props.options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { label: String(opt), value: opt }
    }
    return opt
  })
})

const containerRef = ref<HTMLElement | null>(null)
const thumbStyle = ref({
  width: '0px',
  transform: 'translateX(0px)',
  opacity: 0
})

function updateThumb() {
  if (!containerRef.value) return
  const activeElement = containerRef.value.querySelector<HTMLElement>('.fy-segmented__item.is-active')
  if (activeElement) {
    thumbStyle.value = {
      width: `${activeElement.offsetWidth}px`,
      transform: `translateX(${activeElement.offsetLeft}px)`,
      opacity: 1
    }
  } else {
    thumbStyle.value.opacity = 0
  }
}

function handleSelect(option: SegmentedOption) {
  if (props.disabled || option.disabled || option.value === props.modelValue) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
}

watch(() => props.modelValue, () => {
  nextTick(updateThumb)
})

watch(() => props.options, () => {
  nextTick(updateThumb)
}, { deep: true })

onMounted(() => {
  nextTick(updateThumb)
})
</script>

<template>
  <div
    ref="containerRef"
    :class="[
      'fy-segmented',
      `fy-segmented--${size}`,
      {
        'fy-segmented--block': block,
        'is-disabled': disabled
      }
    ]"
  >
    <div class="fy-segmented__thumb" :style="thumbStyle" />
    <button
      v-for="(opt, idx) in normalizedOptions"
      :key="opt.value"
      type="button"
      :class="[
        'fy-segmented__item',
        {
          'is-active': opt.value === modelValue,
          'is-disabled': opt.disabled || disabled
        }
      ]"
      :disabled="opt.disabled || disabled"
      @click="handleSelect(opt)"
    >
      <slot name="icon" :option="opt" :index="idx">
        <span v-if="opt.icon" class="material-symbols-outlined fy-segmented__icon">
          {{ opt.icon }}
        </span>
      </slot>
      <slot name="label" :option="opt" :index="idx">
        <span class="fy-segmented__label">{{ opt.label }}</span>
      </slot>
    </button>
  </div>
</template>

<style scoped lang="scss">
.fy-segmented {
  position: relative;
  display: inline-flex;
  align-items: center;
  background: color-mix(in srgb, var(--fy-surface-container-high) 45%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
  border-radius: var(--fy-r-full);
  padding: 3px;
  user-select: none;

  &--block {
    display: flex;
    width: 100%;

    .fy-segmented__item {
      flex: 1;
    }
  }

  &.is-disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &__thumb {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 0;
    background: var(--fy-surface);
    border-radius: var(--fy-r-full);
    box-shadow: var(--fy-shadow-sm), 0 0 12px color-mix(in srgb, var(--fy-primary) 12%, transparent);
    transition:
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
      width 0.25s ease,
      opacity 0.2s ease;
    pointer-events: none;
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
  }

  &__item {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-weight: 600;
    color: var(--fy-on-surface-variant);
    cursor: pointer;
    border-radius: var(--fy-r-full);
    transition: color 0.2s ease;
    white-space: nowrap;

    &:hover:not(.is-disabled) {
      color: var(--fy-on-surface);
    }

    &.is-active {
      color: var(--fy-primary);
    }

    &.is-disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__icon {
    font-size: 16px;
  }

  /* Sizes */
  &--sm {
    padding: 2px;
    .fy-segmented__thumb {
      top: 2px;
      bottom: 2px;
    }
    .fy-segmented__item {
      height: 26px;
      padding: 0 10px;
      font-size: var(--fy-font-size-xs);
    }
    .fy-segmented__icon {
      font-size: 14px;
    }
  }

  &--md {
    .fy-segmented__item {
      height: 32px;
      padding: 0 14px;
      font-size: var(--fy-font-size-sm);
    }
  }

  &--lg {
    padding: 4px;
    .fy-segmented__thumb {
      top: 4px;
      bottom: 4px;
    }
    .fy-segmented__item {
      height: 38px;
      padding: 0 18px;
      font-size: var(--fy-font-size-base);
    }
    .fy-segmented__icon {
      font-size: 18px;
    }
  }
}
</style>
