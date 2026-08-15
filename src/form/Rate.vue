<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface Props {
  modelValue?: number
  count?: number
  allowHalf?: boolean
  allowClear?: boolean
  disabled?: boolean
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: string
  voidColor?: string
  icon?: string
  showText?: boolean
  texts?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  count: 5,
  allowHalf: false,
  allowClear: false,
  disabled: false,
  readonly: false,
  size: 'md',
  color: 'var(--fy-theme-yellow, #f59e0b)',
  voidColor: 'color-mix(in srgb, var(--fy-outline-variant) 70%, transparent)',
  icon: 'star'
})

const emit = defineEmits<{
  'update:modelValue': [val: number]
  change: [val: number]
  hoverChange: [val: number]
}>()

const hoverValue = ref<number | null>(null)
const formItem = inject<FormItemContext | null>('fy-form-item', null)

const activeValue = computed(() => {
  return hoverValue.value !== null ? hoverValue.value : props.modelValue
})

const defaultTexts = ['极差', '失望', '一般', '满意', '惊喜']
const currentText = computed(() => {
  if (!props.showText) return ''
  const val = Math.ceil(activeValue.value)
  const textList = props.texts && props.texts.length ? props.texts : defaultTexts
  return textList[val - 1] || ''
})

function handleMouseEnter(index: number, isHalf: boolean) {
  if (props.disabled || props.readonly) return
  const val = isHalf ? index - 0.5 : index
  hoverValue.value = val
  emit('hoverChange', val)
}

function handleMouseLeave() {
  if (props.disabled || props.readonly) return
  hoverValue.value = null
  emit('hoverChange', 0)
}

function handleClick(index: number, isHalf: boolean) {
  if (props.disabled || props.readonly) return
  let val = isHalf ? index - 0.5 : index
  if (props.allowClear && props.modelValue === val) {
    val = 0
  }
  emit('update:modelValue', val)
  emit('change', val)
  formItem?.validate('change')
}
</script>

<template>
  <div
    :class="[
      'fy-rate',
      `fy-rate--${size}`,
      {
        'fy-rate--disabled': disabled,
        'fy-rate--readonly': readonly
      }
    ]"
    role="radiogroup"
    @mouseleave="handleMouseLeave"
  >
    <div
      v-for="i in count"
      :key="i"
      class="fy-rate__item"
    >
      <!-- Left half touch zone -->
      <div
        v-if="allowHalf"
        class="fy-rate__half fy-rate__half--left"
        @mouseenter="handleMouseEnter(i, true)"
        @click="handleClick(i, true)"
      />

      <!-- Right half / full touch zone -->
      <div
        class="fy-rate__half fy-rate__half--right"
        @mouseenter="handleMouseEnter(i, false)"
        @click="handleClick(i, false)"
      />

      <!-- Star background / filled icon -->
      <span
        class="material-symbols-outlined fy-rate__icon"
        :class="{
          'is-full': activeValue >= i,
          'is-half': allowHalf && activeValue === i - 0.5
        }"
        :style="{ color: activeValue >= i - 0.5 ? color : voidColor }"
      >
        {{ activeValue >= i ? icon : (allowHalf && activeValue === i - 0.5 ? (icon === 'star' ? 'star_half' : icon) : icon) }}
      </span>
    </div>

    <span v-if="showText && currentText" class="fy-rate__text">
      {{ currentText }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.fy-rate {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  user-select: none;

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;

    .fy-rate__item,
    .fy-rate__half {
      cursor: not-allowed !important;
    }
  }

  &--readonly {
    .fy-rate__item,
    .fy-rate__half {
      cursor: default !important;
    }
  }

  &__item {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.15s var(--fy-ease-soft);

    &:hover:not(.fy-rate--readonly):not(.fy-rate--disabled) {
      transform: scale(1.18);
    }
  }

  &__half {
    position: absolute;
    top: 0;
    height: 100%;
    width: 50%;
    z-index: 2;
    cursor: pointer;

    &--left {
      left: 0;
    }

    &--right {
      right: 0;
    }
  }

  &__icon {
    line-height: 1;
    font-variation-settings: 'FILL' 0, 'wght' 400;
    transition: color 0.18s ease, font-variation-settings 0.18s ease;

    &.is-full,
    &.is-half {
      font-variation-settings: 'FILL' 1, 'wght' 400;
    }
  }

  /* Sizes */
  &--sm {
    .fy-rate__icon {
      font-size: 16px;
    }
  }

  &--md {
    .fy-rate__icon {
      font-size: 22px;
    }
  }

  &--lg {
    .fy-rate__icon {
      font-size: 28px;
    }
  }

  &__text {
    margin-left: 6px;
    font-size: var(--fy-font-size-sm);
    font-weight: 600;
    color: var(--fy-on-surface-variant);
  }
}
</style>
