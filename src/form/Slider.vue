<script setup lang="ts">
import { ref, computed, type CSSProperties, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface Props {
  modelValue?: number | [number, number]
  min?: number
  max?: number
  step?: number
  range?: boolean
  disabled?: boolean
  showTooltip?: boolean
  formatTooltip?: (val: number) => string | number
  marks?: Record<number, string>
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  range: false,
  disabled: false,
  showTooltip: true,
  formatTooltip: (v: number) => v,
  size: 'md',
  marks: undefined
})

const emit = defineEmits<{
  'update:modelValue': [val: number | [number, number]]
  change: [val: number | [number, number]]
}>()

const trackRef = ref<HTMLElement | null>(null)
const isDragging = ref<false | 'first' | 'second' | 'single'>(false)
const formItem = inject<FormItemContext | null>('ui-form-item', null)

const firstValue = computed<number>(() => {
  if (props.range && Array.isArray(props.modelValue)) {
    return props.modelValue[0] ?? props.min
  }
  return typeof props.modelValue === 'number' ? props.modelValue : props.min
})

const secondValue = computed<number>(() => {
  if (props.range && Array.isArray(props.modelValue)) {
    return props.modelValue[1] ?? props.max
  }
  return props.max
})

function getPercent(val: number): number {
  const rangeSpan = props.max - props.min
  if (rangeSpan <= 0) return 0
  const p = ((val - props.min) / rangeSpan) * 100
  return Math.min(100, Math.max(0, p))
}

const firstPercent = computed(() => getPercent(firstValue.value))
const secondPercent = computed(() => getPercent(secondValue.value))

const barStyle = computed<CSSProperties>(() => {
  if (props.range) {
    const left = Math.min(firstPercent.value, secondPercent.value)
    const width = Math.abs(secondPercent.value - firstPercent.value)
    return {
      left: `${left}%`,
      width: `${width}%`
    }
  }
  return {
    left: '0%',
    width: `${firstPercent.value}%`
  }
})

function valueFromPosition(clientX: number): number {
  if (!trackRef.value) return props.min
  const rect = trackRef.value.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  const rawValue = props.min + ratio * (props.max - props.min)
  const stepsCount = Math.round((rawValue - props.min) / props.step)
  const steppedValue = props.min + stepsCount * props.step
  return Math.min(props.max, Math.max(props.min, Number(steppedValue.toFixed(4))))
}

function handleTrackClick(event: MouseEvent) {
  if (props.disabled) return
  const clickVal = valueFromPosition(event.clientX)

  if (props.range && Array.isArray(props.modelValue)) {
    const dist1 = Math.abs(clickVal - firstValue.value)
    const dist2 = Math.abs(clickVal - secondValue.value)
    let newRange: [number, number]
    if (dist1 <= dist2) {
      newRange = [Math.min(clickVal, secondValue.value), Math.max(clickVal, secondValue.value)]
    } else {
      newRange = [Math.min(firstValue.value, clickVal), Math.max(firstValue.value, clickVal)]
    }
    emit('update:modelValue', newRange)
    emit('change', newRange)
    formItem?.validate('change')
  } else {
    emit('update:modelValue', clickVal)
    emit('change', clickVal)
    formItem?.validate('change')
  }
}

function startDrag(handle: 'single' | 'first' | 'second', event: MouseEvent | TouchEvent) {
  if (props.disabled) return
  event.preventDefault()
  isDragging.value = handle

  const onMove = (moveEvent: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX
    const currentVal = valueFromPosition(clientX)

    if (props.range && Array.isArray(props.modelValue)) {
      let newRange: [number, number] = [firstValue.value, secondValue.value]
      if (isDragging.value === 'first') {
        newRange = [Math.min(currentVal, secondValue.value), secondValue.value]
      } else if (isDragging.value === 'second') {
        newRange = [firstValue.value, Math.max(currentVal, firstValue.value)]
      }
      emit('update:modelValue', newRange)
    } else {
      emit('update:modelValue', currentVal)
    }
  }

  const onEnd = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onEnd)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onEnd)
    isDragging.value = false
    emit('change', props.modelValue)
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onEnd)
  window.addEventListener('touchmove', onMove)
  window.addEventListener('touchend', onEnd)
}

function handleKeyDown(handle: 'single' | 'first' | 'second', event: KeyboardEvent) {
  if (props.disabled) return
  let delta = 0
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    delta = props.step
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    delta = -props.step
  } else {
    return
  }
  event.preventDefault()

  if (props.range && Array.isArray(props.modelValue)) {
    if (handle === 'first') {
      const nextFirst = Math.min(secondValue.value, Math.max(props.min, firstValue.value + delta))
      emit('update:modelValue', [nextFirst, secondValue.value])
      emit('change', [nextFirst, secondValue.value])
    } else {
      const nextSecond = Math.max(firstValue.value, Math.min(props.max, secondValue.value + delta))
      emit('update:modelValue', [firstValue.value, nextSecond])
      emit('change', [firstValue.value, nextSecond])
    }
  } else {
    const nextVal = Math.min(props.max, Math.max(props.min, firstValue.value + delta))
    emit('update:modelValue', nextVal)
    emit('change', nextVal)
  }
  formItem?.validate('change')
}
</script>

<template>
  <div
    :class="[
      'ui-slider',
      `ui-slider--${size}`,
      { 'ui-slider--disabled': disabled }
    ]"
  >
    <div ref="trackRef" class="ui-slider__rail" @click="handleTrackClick">
      <!-- Active Bar -->
      <div class="ui-slider__bar" :style="barStyle" />

      <!-- Single / First Handle -->
      <div
        class="ui-slider__handle"
        role="slider"
        tabindex="0"
        :aria-valuenow="firstValue"
        :aria-valuemin="min"
        :aria-valuemax="range ? secondValue : max"
        :style="{ left: `${firstPercent}%` }"
        @mousedown="startDrag(range ? 'first' : 'single', $event)"
        @touchstart="startDrag(range ? 'first' : 'single', $event)"
        @keydown="handleKeyDown(range ? 'first' : 'single', $event)"
      >
        <div
          v-if="showTooltip"
          :class="['ui-slider__tooltip', { 'is-active': isDragging !== false }]"
        >
          {{ formatTooltip(firstValue) }}
        </div>
      </div>

      <!-- Second Handle (Range mode) -->
      <div
        v-if="range"
        class="ui-slider__handle"
        role="slider"
        tabindex="0"
        :aria-valuenow="secondValue"
        :aria-valuemin="firstValue"
        :aria-valuemax="max"
        :style="{ left: `${secondPercent}%` }"
        @mousedown="startDrag('second', $event)"
        @touchstart="startDrag('second', $event)"
        @keydown="handleKeyDown('second', $event)"
      >
        <div
          v-if="showTooltip"
          :class="['ui-slider__tooltip', { 'is-active': isDragging !== false }]"
        >
          {{ formatTooltip(secondValue) }}
        </div>
      </div>

      <!-- Marks -->
      <template v-if="marks">
        <div
          v-for="(label, markVal) in marks"
          :key="markVal"
          class="ui-slider__mark"
          :style="{ left: `${getPercent(Number(markVal))}%` }"
        >
          <span class="ui-slider__mark-dot" />
          <span class="ui-slider__mark-text">{{ label }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-slider {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  user-select: none;
  touch-action: none;

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;

    .ui-slider__rail,
    .ui-slider__handle {
      cursor: not-allowed !important;
    }
  }

  &__rail {
    position: relative;
    width: 100%;
    height: 6px;
    border-radius: var(--r-full);
    background: color-mix(in srgb, var(--surface-container-high) 80%, transparent);
    cursor: pointer;
  }

  &__bar {
    position: absolute;
    top: 0;
    height: 100%;
    border-radius: var(--r-full);
    background: linear-gradient(90deg, var(--primary-container), var(--primary));
    box-shadow: 0 1px 4px color-mix(in srgb, var(--primary) 35%, transparent);
  }

  &__handle {
    position: absolute;
    top: 50%;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--surface-container-lowest);
    border: 2.5px solid var(--primary);
    box-shadow: var(--shadow-sm), 0 0 0 2px color-mix(in srgb, var(--primary) 15%, transparent);
    transform: translate(-50%, -50%);
    cursor: grab;
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &:hover,
    &:active {
      transform: translate(-50%, -50%) scale(1.15);
      box-shadow: var(--shadow-sm), 0 0 0 5px color-mix(in srgb, var(--primary) 20%, transparent);
    }

    &:active {
      cursor: grabbing;
    }
  }

  &__tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    padding: 3px 8px;
    background: var(--inverse-surface);
    color: var(--inverse-on-surface);
    font-size: 11px;
    font-weight: 700;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: var(--inverse-surface);
    }
  }

  &__handle:hover &__tooltip,
  &__tooltip.is-active {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }

  &__mark {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  &__mark-dot {
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--outline);
  }

  &__mark-text {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    color: var(--outline);
    white-space: nowrap;
    font-weight: 600;
  }
}
</style>
