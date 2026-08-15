<script setup lang="ts">
import { inject, computed } from 'vue'
import type { StepsContext, StepsStatus } from './Steps.vue'

interface Props {
  stepIndex?: number
  index?: number
  title?: string
  description?: string
  icon?: string
  status?: StepsStatus
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  stepIndex: undefined,
  index: undefined,
  title: '',
  description: '',
  icon: undefined,
  status: undefined,
  disabled: false
})

const stepsContext = inject<StepsContext | null>('fy-steps', null)

const effectiveIndex = computed(() => props.stepIndex ?? props.index ?? 1)

const isVertical = computed(() => stepsContext?.vertical.value ?? false)
const isClickable = computed(() => stepsContext?.clickable.value && !props.disabled)

const currentStep = computed(() => stepsContext?.current.value ?? 1)
const currentStatus = computed(() => stepsContext?.status.value ?? 'process')

const stepStatus = computed<StepsStatus>(() => {
  if (props.status) return props.status
  if (effectiveIndex.value < currentStep.value) return 'finish'
  if (effectiveIndex.value === currentStep.value) return currentStatus.value
  return 'wait'
})

function handleClick() {
  if (!isClickable.value) return
  stepsContext?.onStepClick(effectiveIndex.value)
}
</script>

<template>
  <div
    :class="[
      'fy-step',
      `fy-step--${stepStatus}`,
      {
        'is-clickable': isClickable,
        'is-disabled': disabled,
        'is-vertical': isVertical
      }
    ]"
    @click="handleClick"
  >
    <div class="fy-step__indicator">
      <div class="fy-step__icon-box">
        <span v-if="icon" class="material-symbols-outlined fy-step__icon">{{ icon }}</span>
        <span v-else-if="stepStatus === 'finish'" class="material-symbols-outlined fy-step__icon">check</span>
        <span v-else-if="stepStatus === 'error'" class="material-symbols-outlined fy-step__icon">close</span>
        <span v-else class="fy-step__number">{{ effectiveIndex }}</span>
      </div>
      <div class="fy-step__line" />
    </div>

    <div class="fy-step__content">
      <div class="fy-step__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="description || $slots.description" class="fy-step__description">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-step {
  position: relative;
  display: flex;
  flex: 1;
  user-select: none;

  &.is-clickable {
    cursor: pointer;

    &:hover .fy-step__title {
      color: var(--fy-primary);
    }
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__indicator {
    display: flex;
    align-items: center;
    position: relative;
  }

  &__icon-box {
    width: 32px;
    height: 32px;
    border-radius: var(--fy-r-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 35%, transparent);
    color: var(--fy-outline);
    transition: all 0.25s var(--fy-ease-soft);
    z-index: 2;
    flex-shrink: 0;
  }

  &__icon {
    font-size: 18px;
    line-height: 1;
  }

  &__line {
    position: absolute;
    top: 50%;
    left: 32px;
    right: 0;
    height: 2px;
    background: color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
    transform: translateY(-50%);
    transition: background 0.25s ease;
  }

  &:last-child &__line {
    display: none;
  }

  &__content {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
    margin-right: 16px;
    gap: 2px;
  }

  &__title {
    font-size: var(--fy-font-size-base);
    font-weight: 700;
    color: var(--fy-outline);
    line-height: 32px;
    transition: color 0.2s ease;
    white-space: nowrap;
  }

  &__description {
    font-size: var(--fy-font-size-xs);
    color: var(--fy-on-surface-variant);
    line-height: 1.4;
  }

  /* Status styles */
  &--process {
    .fy-step__icon-box {
      background: var(--fy-primary);
      color: var(--fy-on-primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--fy-primary) 20%, transparent);
      border-color: var(--fy-primary);
    }
    .fy-step__title {
      color: var(--fy-on-surface);
      font-weight: 800;
    }
  }

  &--finish {
    .fy-step__icon-box {
      background: color-mix(in srgb, var(--fy-primary) 15%, transparent);
      color: var(--fy-primary);
      border-color: var(--fy-primary);
    }
    .fy-step__title {
      color: var(--fy-on-surface);
    }
    .fy-step__line {
      background: var(--fy-primary);
    }
  }

  &--fy-error {
    .fy-step__icon-box {
      background: var(--fy-error);
      color: var(--fy-on-error);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--fy-error) 20%, transparent);
      border-color: var(--fy-error);
    }
    .fy-step__title {
      color: var(--fy-error);
    }
  }

  /* Vertical layout */
  &.is-vertical {
    flex-direction: row;
    padding-bottom: 24px;

    &:last-child {
      padding-bottom: 0;
    }

    .fy-step__line {
      top: 32px;
      bottom: 0;
      left: 16px;
      right: auto;
      width: 2px;
      height: auto;
      transform: translateX(-50%);
    }

    .fy-step__content {
      margin-left: 14px;
      margin-right: 0;
    }
  }
}
</style>
