<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label?: string
  title?: string
  value?: string | number
  prefix?: string
  suffix?: string
  precision?: number
  trend?: 'up' | 'down'
  trendValue?: string | number
  color?: string
  groupSeparator?: boolean
  decimalSeparator?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  title: '',
  value: '',
  prefix: '',
  suffix: '',
  precision: undefined,
  trend: undefined,
  trendValue: undefined,
  color: undefined,
  groupSeparator: false,
  decimalSeparator: '.'
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number' && props.precision !== undefined) {
    const fixed = props.value.toFixed(props.precision)
    if (!props.groupSeparator) return fixed
    const [intPart, decPart] = fixed.split('.')
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return decPart !== undefined ? `${formattedInt}${props.decimalSeparator}${decPart}` : formattedInt
  }
  return String(props.value ?? '')
})
</script>

<template>
  <div class="fy-statistic">
    <div v-if="label || title || $slots.label || $slots.title" class="fy-statistic__label">
      <slot name="title">
        <slot name="label">{{ label || title }}</slot>
      </slot>
    </div>

    <div class="fy-statistic__value-wrap" :style="{ color }">
      <span v-if="prefix || $slots.prefix" class="fy-statistic__prefix">
        <slot name="prefix">{{ prefix }}</slot>
      </span>

      <span class="fy-statistic__value">
        <slot>{{ formattedValue }}</slot>
      </span>

      <span v-if="suffix || $slots.suffix" class="fy-statistic__suffix">
        <slot name="suffix">{{ suffix }}</slot>
      </span>
    </div>

    <div
      v-if="trend || trendValue !== undefined || $slots.trend"
      :class="['fy-statistic__trend', `fy-statistic__trend--${trend}`]"
    >
      <slot name="trend">
        <span v-if="trend === 'up'" class="material-symbols-outlined fy-statistic__trend-icon">
          trending_up
        </span>
        <span v-else-if="trend === 'down'" class="material-symbols-outlined fy-statistic__trend-icon">
          trending_down
        </span>
        <span class="fy-statistic__trend-text">{{ trendValue }}</span>
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-statistic {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  user-select: none;

  &__label {
    font-size: var(--fy-font-size-xs);
    font-weight: 700;
    color: var(--fy-outline);
    letter-spacing: 0.02em;
  }

  &__value-wrap {
    display: flex;
    align-items: baseline;
    gap: 4px;
    color: var(--fy-on-surface);
  }

  &__prefix {
    font-size: 16px;
    font-weight: 700;
    color: var(--fy-outline);
  }

  &__value {
    font-family: var(--fy-font-display);
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  &__suffix {
    font-size: 13px;
    font-weight: 600;
    color: var(--fy-outline);
  }

  &__trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 700;
    margin-top: 2px;

    &--up {
      color: var(--fy-theme-green, #10b981);
    }

    &--down {
      color: var(--fy-error, #ba1a1a);
    }
  }

  &__trend-icon {
    font-size: 16px;
    line-height: 1;
  }
}
</style>
