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
  <div :class="['ui-spin-container', { 'is-spinning': show && $slots.default }]">
    <slot />

    <transition name="ui-spin-fade">
      <div
        v-if="show"
        :class="[
          'ui-spin-mask',
          `ui-spin-mask--${size}`,
          { 'is-nested': !!$slots.default }
        ]"
      >
        <div class="ui-spin-body">
          <div class="ui-spin-spinner">
            <svg viewBox="0 0 50 50" class="ui-spin-svg">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                stroke-width="4.5"
                stroke-linecap="round"
                class="ui-spin-circle"
              />
            </svg>
          </div>
          <span v-if="description || $slots.description" class="ui-spin-description">
            <slot name="description">{{ description }}</slot>
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.ui-spin-container {
  position: relative;
  display: block;
  width: 100%;

  &.is-spinning > :not(.ui-spin-mask) {
    opacity: 0.45;
    pointer-events: none;
    user-select: none;
    filter: blur(1px);
    transition: opacity 0.2s ease, filter 0.2s ease;
  }
}

.ui-spin-mask {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  padding: 12px;
  user-select: none;

  &.is-nested {
    position: absolute;
    inset: 0;
    z-index: 50;
    background: color-mix(in srgb, var(--surface-container-lowest) 70%, transparent);
    backdrop-filter: blur(4px);
    padding: 0;
    border-radius: inherit;
  }
}

.ui-spin-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.ui-spin-spinner {
  display: inline-flex;
  animation: ui-spin-rotate 1.2s linear infinite;
}

.ui-spin-svg {
  display: block;
}

.ui-spin-circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: ui-spin-dash 1.4s ease-in-out infinite;
}

.ui-spin-description {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--on-surface-variant);
  letter-spacing: 0.02em;
}

/* Sizes */
.ui-spin-mask--sm .ui-spin-svg {
  width: 20px;
  height: 20px;
}
.ui-spin-mask--md .ui-spin-svg {
  width: 32px;
  height: 32px;
}
.ui-spin-mask--lg .ui-spin-svg {
  width: 48px;
  height: 48px;
}

@keyframes ui-spin-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes ui-spin-dash {
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

.ui-spin-fade-enter-active,
.ui-spin-fade-leave-active {
  transition: opacity 0.2s ease;
}
.ui-spin-fade-enter-from,
.ui-spin-fade-leave-to {
  opacity: 0;
}
</style>
