<script setup lang="ts">
interface Props {
  show?: boolean
  size?: 'sm' | 'md' | 'lg'
  description?: string
}

withDefaults(defineProps<Props>(), {
  show: true,
  size: 'md',
  description: ''
})
</script>

<template>
  <div :class="['fy-spin-container', { 'is-spinning': show && $slots.default }]">
    <slot />

    <transition name="fy-spin-fade">
      <div
        v-if="show"
        :class="[
          'fy-spin-mask',
          `fy-spin-mask--${size}`,
          { 'is-nested': !!$slots.default }
        ]"
      >
        <div class="fy-spin-body">
          <div class="fy-spin-spinner">
            <svg viewBox="0 0 50 50" class="fy-spin-svg">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                stroke-width="4.5"
                stroke-linecap="round"
                class="fy-spin-circle"
              />
            </svg>
          </div>
          <span v-if="description || $slots.description" class="fy-spin-description">
            <slot name="description">{{ description }}</slot>
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.fy-spin-container {
  position: relative;
  display: block;
  width: 100%;

  &.is-spinning > :not(.fy-spin-mask) {
    opacity: 0.45;
    pointer-events: none;
    user-select: none;
    filter: blur(1px);
    transition: opacity 0.2s ease, filter 0.2s ease;
  }
}

.fy-spin-mask {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fy-primary);
  padding: 12px;
  user-select: none;

  &.is-nested {
    position: absolute;
    inset: 0;
    z-index: 50;
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 70%, transparent);
    backdrop-filter: blur(4px);
    padding: 0;
    border-radius: inherit;
  }
}

.fy-spin-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.fy-spin-spinner {
  display: inline-flex;
  animation: fy-spin-rotate 1.2s linear infinite;
}

.fy-spin-svg {
  display: block;
}

.fy-spin-circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: fy-spin-dash 1.4s ease-in-out infinite;
}

.fy-spin-description {
  font-size: var(--fy-font-size-xs);
  font-weight: 700;
  color: var(--fy-on-surface-variant);
  letter-spacing: 0.02em;
}

/* Sizes */
.fy-spin-mask--sm .fy-spin-svg {
  width: 20px;
  height: 20px;
}
.fy-spin-mask--md .fy-spin-svg {
  width: 32px;
  height: 32px;
}
.fy-spin-mask--lg .fy-spin-svg {
  width: 48px;
  height: 48px;
}

@keyframes fy-spin-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fy-spin-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}

.fy-spin-fade-enter-active,
.fy-spin-fade-leave-active {
  transition: opacity 0.2s ease;
}
.fy-spin-fade-enter-from,
.fy-spin-fade-leave-to {
  opacity: 0;
}
</style>
