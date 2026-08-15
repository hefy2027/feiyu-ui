<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

export type ProgressBarStatus = 'default' | 'primary' | 'success' | 'warning' | 'error'

interface Props {
  progress?: number
  percentage?: number
  showText?: boolean
  height?: number | string
  color?: string
  trackColor?: string
  status?: ProgressBarStatus
  striped?: boolean
  animated?: boolean
  indeterminate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  progress: undefined,
  percentage: undefined,
  showText: true,
  height: 6,
  color: undefined,
  trackColor: undefined,
  status: 'primary',
  striped: false,
  animated: false,
  indeterminate: false
})

const clampedProgress = computed(() => {
  const val = props.percentage !== undefined ? props.percentage : (props.progress ?? 0)
  return Math.min(100, Math.max(0, Math.round(val)))
})

const trackStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    height: typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  if (props.trackColor) {
    style.backgroundColor = props.trackColor
  }
  return style
})
</script>

<template>
  <div :class="['fy-progress-bar', `fy-progress-bar--${status}`]">
    <div
      class="fy-progress-bar__track"
      :style="trackStyle"
      role="progressbar"
      :aria-valuenow="clampedProgress"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        :class="[
          'fy-progress-bar__fill',
          {
            'is-striped': striped,
            'is-animated': animated || striped,
            'is-indeterminate': indeterminate
          }
        ]"
        :style="{
          width: indeterminate ? undefined : `${clampedProgress}%`,
          backgroundColor: color
        }"
      />
    </div>
    <span v-if="showText && !indeterminate" class="fy-progress-bar__text">
      <slot :percentage="clampedProgress">{{ clampedProgress }}%</slot>
    </span>
  </div>
</template>

<style scoped lang="scss">
.fy-progress-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  &__track {
    flex: 1;
    background: color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
    border-radius: var(--fy-r-full);
    overflow: hidden;
    position: relative;
  }

  &__fill {
    height: 100%;
    border-radius: var(--fy-r-full);
    background: var(--fy-primary);
    transition: width 0.3s var(--fy-ease-out);

    &.is-striped {
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.18) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.18) 50%,
        rgba(255, 255, 255, 0.18) 75%,
        transparent 75%,
        transparent
      );
      background-size: 16px 16px;
    }

    &.is-animated {
      animation: fy-progress-stripes 1s linear infinite;
    }

    &.is-indeterminate {
      width: 40% !important;
      position: absolute;
      animation: fy-progress-indeterminate 1.5s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    }
  }

  &__text {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--fy-on-surface-variant);
    min-width: 32px;
    text-align: right;
  }

  /* Status */
  &--fy-success .fy-progress-bar__fill { background-color: var(--fy-theme-green, #10b981); }
  &--fy-warning .fy-progress-bar__fill { background-color: var(--fy-theme-yellow, #f59e0b); }
  &--fy-error .fy-progress-bar__fill { background-color: var(--fy-error, #ba1a1a); }
}

@keyframes fy-progress-stripes {
  from {
    background-position: 16px 0;
  }
  to {
    background-position: 0 0;
  }
}

@keyframes fy-progress-indeterminate {
  0% {
    left: -40%;
  }
  100% {
    left: 100%;
  }
}
</style>
