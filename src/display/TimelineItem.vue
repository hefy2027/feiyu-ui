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

const timelineContext = inject<TimelineContext | null>('ui-timeline', null)
const isHorizontal = computed(() => timelineContext?.horizontal.value ?? false)

const dotStyle = computed<StyleValue>(() => {
  if (props.color) {
    return {
      backgroundColor: props.hollow ? 'var(--surface-container-lowest)' : props.color,
      borderColor: props.color
    }
  }
  return {}
})
</script>

<template>
  <div
    :class="[
      'ui-timeline-item',
      `ui-timeline-item--${type}`,
      `ui-timeline-item--line-${lineType}`,
      {
        'is-horizontal': isHorizontal,
        'is-hollow': hollow
      }
    ]"
  >
    <!-- Timeline Axis Dot & Line -->
    <div class="ui-timeline-item__axis">
      <div class="ui-timeline-item__dot" :style="dotStyle">
        <slot name="icon">
          <span v-if="icon" class="material-symbols-outlined ui-timeline-item__icon">{{ icon }}</span>
        </slot>
      </div>
      <div class="ui-timeline-item__line" />
    </div>

    <!-- Content Box -->
    <div class="ui-timeline-item__body">
      <div v-if="time || $slots.time" class="ui-timeline-item__time">
        <slot name="time">{{ time }}</slot>
      </div>

      <div v-if="title || $slots.title" class="ui-timeline-item__title">
        <slot name="title">{{ title }}</slot>
      </div>

      <div v-if="content || $slots.default" class="ui-timeline-item__content">
        <slot>{{ content }}</slot>
      </div>

      <div v-if="$slots.extra" class="ui-timeline-item__extra">
        <slot name="extra" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-timeline-item {
  position: relative;
  display: flex;
  padding-bottom: 24px;

  &:last-child {
    padding-bottom: 0;

    .ui-timeline-item__line {
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
    border: 2px solid var(--outline);
    background: var(--surface-container-lowest);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--surface-container-lowest) 80%, transparent);
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
    background: color-mix(in srgb, var(--outline-variant) 45%, transparent);
  }

  &--line-dashed &__line {
    background: transparent;
    border-left: 2px dashed color-mix(in srgb, var(--outline-variant) 50%, transparent);
  }

  &--line-dotted &__line {
    background: transparent;
    border-left: 2px dotted color-mix(in srgb, var(--outline-variant) 50%, transparent);
  }

  &__icon {
    font-size: 10px;
  }

  &.is-hollow &__dot {
    background: var(--surface-container-lowest) !important;
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
    font-size: var(--font-size-xs);
    color: var(--outline);
    font-weight: 500;
  }

  &__title {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: var(--on-surface);
    line-height: 1.3;
  }

  &__content {
    font-size: var(--font-size-sm);
    color: var(--on-surface-variant);
    line-height: 1.5;
  }

  &__extra {
    margin-top: 4px;
  }

  /* Types */
  &--primary {
    .ui-timeline-item__dot {
      border-color: var(--primary);
      background: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent);
    }
  }

  &--info {
    .ui-timeline-item__dot {
      border-color: var(--theme-blue, #3b82f6);
      background: var(--theme-blue, #3b82f6);
    }
  }

  &--success {
    .ui-timeline-item__dot {
      border-color: var(--theme-green, #10b981);
      background: var(--theme-green, #10b981);
    }
  }

  &--warning {
    .ui-timeline-item__dot {
      border-color: var(--theme-yellow, #f59e0b);
      background: var(--theme-yellow, #f59e0b);
    }
  }

  &--error {
    .ui-timeline-item__dot {
      border-color: var(--error);
      background: var(--error);
    }
  }

  /* Horizontal */
  &.is-horizontal {
    flex-direction: column;
    padding-bottom: 0;
    padding-right: 28px;
    flex: 1;

    .ui-timeline-item__axis {
      flex-direction: row;
      margin-right: 0;
      margin-bottom: 12px;
    }

    .ui-timeline-item__line {
      top: 5px;
      left: 14px;
      right: -14px;
      bottom: auto;
      width: auto;
      height: 2px;
    }

    &.ui-timeline-item--line-dashed .ui-timeline-item__line {
      border-left: none;
      border-top: 2px dashed color-mix(in srgb, var(--outline-variant) 50%, transparent);
    }
  }
}
</style>
