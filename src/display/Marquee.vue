<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

export type MarqueeDirection = 'left' | 'right' | 'up' | 'down'

interface Props {
  direction?: MarqueeDirection
  duration?: number
  pauseOnHover?: boolean
  gap?: number | string
  gradient?: boolean
  gradientColor?: string
  gradientWidth?: number | string
  repeat?: number
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'left',
  duration: 25,
  pauseOnHover: true,
  gap: 24,
  gradient: true,
  gradientColor: 'var(--fy-surface-container-lowest, #ffffff)',
  gradientWidth: 40,
  repeat: 4
})

const isVertical = computed(() => props.direction === 'up' || props.direction === 'down')

const formattedGap = computed(() => {
  return typeof props.gap === 'number' ? `${props.gap}px` : props.gap
})

const formattedGradientWidth = computed(() => {
  return typeof props.gradientWidth === 'number' ? `${props.gradientWidth}px` : props.gradientWidth
})

const containerStyle = computed<CSSProperties>(() => {
  return {
    '--marquee-duration': `${props.duration}s`,
    '--marquee-gap': formattedGap.value,
    '--gradient-width': formattedGradientWidth.value,
    '--gradient-color': props.gradientColor
  } as CSSProperties
})
</script>

<template>
  <div
    :class="[
      'fy-marquee',
      `fy-marquee--${direction}`,
      {
        'is-vertical': isVertical,
        'pause-on-hover': pauseOnHover,
        'has-gradient': gradient
      }
    ]"
    :style="containerStyle"
  >
    <div v-if="gradient && !isVertical" class="fy-marquee__gradient fy-marquee__gradient--start" />
    <div v-if="gradient && !isVertical" class="fy-marquee__gradient fy-marquee__gradient--end" />

    <div class="fy-marquee__track">
      <div
        v-for="idx in repeat"
        :key="idx"
        class="fy-marquee__group"
        :aria-hidden="idx > 1"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-marquee {
  position: relative;
  display: flex;
  width: 100%;
  overflow: hidden;
  user-select: none;
  box-sizing: border-box;

  &.is-vertical {
    height: 100%;
    flex-direction: column;
  }

  &__track {
    display: flex;
    width: max-content;
    gap: var(--marquee-gap);
  }

  &__group {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: var(--marquee-gap);
    flex-shrink: 0;
    min-width: 100%;
  }

  &--left &__track {
    animation: fy-marquee-left var(--marquee-duration) linear infinite;
  }

  &--right &__track {
    animation: fy-marquee-right var(--marquee-duration) linear infinite;
  }

  &--up &__track {
    flex-direction: column;
    animation: fy-marquee-up var(--marquee-duration) linear infinite;
  }

  &--down &__track {
    flex-direction: column;
    animation: fy-marquee-down var(--marquee-duration) linear infinite;
  }

  &.pause-on-hover:hover &__track {
    animation-play-state: paused;
  }

  &__gradient {
    position: absolute;
    top: 0;
    bottom: 0;
    width: var(--gradient-width);
    z-index: 2;
    pointer-events: none;

    &--start {
      left: 0;
      background: linear-gradient(to right, var(--gradient-color), transparent);
    }

    &--end {
      right: 0;
      background: linear-gradient(to left, var(--gradient-color), transparent);
    }
  }
}

@keyframes fy-marquee-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-50% - var(--marquee-gap) / 2));
  }
}

@keyframes fy-marquee-right {
  from {
    transform: translateX(calc(-50% - var(--marquee-gap) / 2));
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fy-marquee-up {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-50% - var(--marquee-gap) / 2));
  }
}

@keyframes fy-marquee-down {
  from {
    transform: translateY(calc(-50% - var(--marquee-gap) / 2));
  }
  to {
    transform: translateY(0);
  }
}
</style>
