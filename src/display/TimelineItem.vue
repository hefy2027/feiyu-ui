<script setup lang="ts">
import { inject, computed, type StyleValue } from 'vue'
import type { TimelineContext } from './Timeline.vue'

export type TimelineItemType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

interface Props {
  title?: string
  content?: string
  time?: string
  type?: TimelineItemType
  color?: string
  lineType?: 'solid' | 'dashed' | 'dotted'
  icon?: string
  hollow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  content: '',
  time: '',
  type: 'default',
  color: undefined,
  lineType: 'solid',
  icon: undefined,
  hollow: false
})

const timelineContext = inject<TimelineContext | null>('fy-timeline', null)
const isHorizontal = computed(() => timelineContext?.horizontal.value ?? false)

const dotStyle = computed<StyleValue>(() => {
  if (props.color) {
    return {
      backgroundColor: props.hollow ? 'var(--fy-surface-container-lowest)' : props.color,
      borderColor: props.color
    }
  }
  return {}
})
</script>

<template>
  <div
    :class="[
      'fy-timeline-item',
      `fy-timeline-item--${type}`,
      `fy-timeline-item--line-${lineType}`,
      {
        'is-horizontal': isHorizontal,
        'is-hollow': hollow
      }
    ]"
  >
    <!-- Timeline Axis Dot & Line -->
    <div class="fy-timeline-item__axis">
      <div class="fy-timeline-item__dot" :style="dotStyle">
        <slot name="icon">
          <span v-if="icon" class="material-symbols-outlined fy-timeline-item__icon">{{ icon }}</span>
        </slot>
      </div>
      <div class="fy-timeline-item__line" />
    </div>

    <!-- Content Box -->
    <div class="fy-timeline-item__body">
      <div v-if="time || $slots.time" class="fy-timeline-item__time">
        <slot name="time">{{ time }}</slot>
      </div>

      <div v-if="title || $slots.title" class="fy-timeline-item__title">
        <slot name="title">{{ title }}</slot>
      </div>

      <div v-if="content || $slots.default" class="fy-timeline-item__content">
        <slot>{{ content }}</slot>
      </div>

      <div v-if="$slots.extra" class="fy-timeline-item__extra">
        <slot name="extra" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-timeline-item {
  position: relative;
  display: flex;
  padding-bottom: 24px;

  &:last-child {
    padding-bottom: 0;

    .fy-timeline-item__line {
      display: none;
    }
  }

  &__axis {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 14px;
    position: relative;
    flex-shrink: 0;
  }

  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--fy-outline);
    background: var(--fy-surface-container-lowest);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--fy-surface-container-lowest) 80%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  &__line {
    position: absolute;
    top: 14px;
    bottom: -10px;
    width: 2px;
    background: color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
  }

  &--line-dashed &__line {
    background: transparent;
    border-left: 2px dashed color-mix(in srgb, var(--fy-outline-variant) 50%, transparent);
  }

  &--line-dotted &__line {
    background: transparent;
    border-left: 2px dotted color-mix(in srgb, var(--fy-outline-variant) 50%, transparent);
  }

  &__icon {
    font-size: 10px;
  }

  &.is-hollow &__dot {
    background: var(--fy-surface-container-lowest) !important;
    border-width: 2px;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__time {
    font-size: var(--fy-font-size-xs);
    color: var(--fy-outline);
    font-weight: 500;
  }

  &__title {
    font-size: var(--fy-font-size-base);
    font-weight: 700;
    color: var(--fy-on-surface);
    line-height: 1.3;
  }

  &__content {
    font-size: var(--fy-font-size-sm);
    color: var(--fy-on-surface-variant);
    line-height: 1.5;
  }

  &__extra {
    margin-top: 4px;
  }

  /* Types */
  &--fy-primary {
    .fy-timeline-item__dot {
      border-color: var(--fy-primary);
      background: var(--fy-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fy-primary) 20%, transparent);
    }
  }

  &--fy-info {
    .fy-timeline-item__dot {
      border-color: var(--fy-theme-blue, #3b82f6);
      background: var(--fy-theme-blue, #3b82f6);
    }
  }

  &--fy-success {
    .fy-timeline-item__dot {
      border-color: var(--fy-theme-green, #10b981);
      background: var(--fy-theme-green, #10b981);
    }
  }

  &--fy-warning {
    .fy-timeline-item__dot {
      border-color: var(--fy-theme-yellow, #f59e0b);
      background: var(--fy-theme-yellow, #f59e0b);
    }
  }

  &--fy-error {
    .fy-timeline-item__dot {
      border-color: var(--fy-error);
      background: var(--fy-error);
    }
  }

  /* Horizontal */
  &.is-horizontal {
    flex-direction: column;
    padding-bottom: 0;
    padding-right: 28px;
    flex: 1;

    .fy-timeline-item__axis {
      flex-direction: row;
      margin-right: 0;
      margin-bottom: 12px;
    }

    .fy-timeline-item__line {
      top: 5px;
      left: 14px;
      right: -14px;
      bottom: auto;
      width: auto;
      height: 2px;
    }

    &.fy-timeline-item--line-dashed .fy-timeline-item__line {
      border-left: none;
      border-top: 2px dashed color-mix(in srgb, var(--fy-outline-variant) 50%, transparent);
    }
  }
}
</style>
