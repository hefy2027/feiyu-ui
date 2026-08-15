<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

export type ProgressType = 'line' | 'circle' | 'dashboard'
export type ProgressStatus = 'default' | 'success' | 'warning' | 'error'

interface Props {
  type?: ProgressType
  percentage?: number
  status?: ProgressStatus
  strokeWidth?: number
  color?: string
  showIndicator?: boolean
  showInfo?: boolean
  format?: (p: number) => string | number
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'line',
  percentage: 0,
  status: 'default',
  strokeWidth: 6,
  color: undefined,
  showIndicator: undefined,
  showInfo: undefined,
  format: (p: number) => `${p}%`,
  size: 120
})

const isShowIndicator = computed(() => {
  if (props.showIndicator !== undefined) return props.showIndicator
  if (props.showInfo !== undefined) return props.showInfo
  return true
})

const clampedPercentage = computed(() => {
  return Math.min(100, Math.max(0, props.percentage))
})

// Circle SVG geometry
const radius = computed(() => (50 - props.strokeWidth / 2))
const circumference = computed(() => 2 * Math.PI * radius.value)

const strokeDashoffset = computed(() => {
  if (props.type === 'dashboard') {
    const totalLength = circumference.value * 0.75
    return totalLength - (clampedPercentage.value / 100) * totalLength
  }
  return circumference.value - (clampedPercentage.value / 100) * circumference.value
})

const strokeDasharray = computed(() => {
  if (props.type === 'dashboard') {
    return `${circumference.value * 0.75} ${circumference.value * 0.25}`
  }
  return `${circumference.value} ${circumference.value}`
})

const strokeColor = computed(() => {
  if (props.color) return props.color
  switch (props.status) {
    case 'success':
      return 'var(--fy-theme-green, #10b981)'
    case 'warning':
      return 'var(--fy-theme-yellow, #f59e0b)'
    case 'error':
      return 'var(--fy-error, #ba1a1a)'
    default:
      return 'var(--fy-primary)'
  }
})
</script>

<template>
  <div
    :class="[
      'fy-progress',
      `fy-progress--${type}`,
      `fy-progress--${status}`
    ]"
  >
    <!-- Line Progress -->
    <template v-if="type === 'line'">
      <div class="fy-progress__rail" :style="{ height: `${strokeWidth}px` }">
        <div
          class="fy-progress__fill"
          :style="{
            width: `${clampedPercentage}%`,
            backgroundColor: strokeColor
          }"
        />
      </div>
      <span v-if="isShowIndicator" class="fy-progress__indicator">
        <slot>{{ format(clampedPercentage) }}</slot>
      </span>
    </template>

    <!-- Circle & Dashboard Progress -->
    <template v-else>
      <div
        class="fy-progress__circle-wrap"
        :style="{ width: `${size}px`, height: `${size}px` }"
      >
        <svg viewBox="0 0 100 100" class="fy-progress__svg">
          <!-- Track Background -->
          <circle
            cx="50"
            cy="50"
            :r="radius"
            fill="none"
            stroke="color-mix(in srgb, var(--fy-surface-container-high) 80%, transparent)"
            :stroke-width="strokeWidth"
            :stroke-dasharray="type === 'dashboard' ? strokeDasharray : undefined"
            :class="['fy-progress__circle-track', { 'is-dashboard': type === 'dashboard' }]"
          />

          <!-- Active Value Fill -->
          <circle
            cx="50"
            cy="50"
            :r="radius"
            fill="none"
            :stroke="strokeColor"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="strokeDasharray"
            :stroke-dashoffset="strokeDashoffset"
            :class="['fy-progress__circle-bar', { 'is-dashboard': type === 'dashboard' }]"
          />
        </svg>

        <!-- Center Indicator Content -->
        <div v-if="isShowIndicator" class="fy-progress__circle-content">
          <slot>{{ format(clampedPercentage) }}</slot>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.fy-progress {
  display: inline-flex;
  align-items: center;
  user-select: none;
  box-sizing: border-box;

  /* Line */
  &--line {
    width: 100%;
    gap: 10px;
  }

  &__rail {
    flex: 1;
    background: color-mix(in srgb, var(--fy-surface-container-high) 80%, transparent);
    border-radius: var(--fy-r-full);
    overflow: hidden;
    position: relative;
  }

  &__fill {
    height: 100%;
    border-radius: var(--fy-r-full);
    transition: width 0.35s var(--fy-ease-soft);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &__indicator {
    font-size: var(--fy-font-size-xs);
    font-weight: 800;
    color: var(--fy-on-surface);
    min-width: 38px;
    text-align: right;
  }

  /* Circle & Dashboard */
  &__circle-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .is-dashboard {
    transform-origin: 50% 50%;
    transform: rotate(-45deg);
  }

  &__circle-bar {
    transition: stroke-dashoffset 0.4s var(--fy-ease-soft);
  }

  &__circle-content {
    position: absolute;
    font-size: 16px;
    font-weight: 800;
    font-family: var(--fy-font-display);
    color: var(--fy-on-surface);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
