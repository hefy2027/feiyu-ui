<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { TaskTheme } from '../types'

interface Props {
  theme?: TaskTheme | 'default'
  title?: string
  subtitle?: string
  hoverable?: boolean
  glass?: boolean
  bordered?: boolean
  size?: 'sm' | 'md' | 'lg'
  headerStyle?: CSSProperties | string
  contentStyle?: CSSProperties | string
  footerStyle?: CSSProperties | string
}

withDefaults(defineProps<Props>(), {
  theme: 'default',
  title: '',
  subtitle: '',
  hoverable: false,
  glass: true,
  bordered: true,
  size: 'md'
})
</script>

<template>
  <div
    :class="[
      'ui-card',
      `ui-card--${theme}`,
      `ui-card--${size}`,
      {
        'ui-card--hoverable': hoverable,
        'ui-card--glass': glass,
        'ui-card--bordered': bordered
      }
    ]"
  >
    <div
      v-if="title || subtitle || $slots.header || $slots.title || $slots.subtitle || $slots.actions || $slots.extra"
      class="ui-card__header"
      :style="headerStyle"
    >
      <slot name="header">
        <div class="ui-card__title-wrap">
          <h3 v-if="title || $slots.title" class="ui-card__title">
            <slot name="title">{{ title }}</slot>
          </h3>
          <p v-if="subtitle || $slots.subtitle" class="ui-card__subtitle">
            <slot name="subtitle">{{ subtitle }}</slot>
          </p>
        </div>
      </slot>

      <div v-if="$slots.actions || $slots.extra" class="ui-card__actions">
        <slot name="extra">
          <slot name="actions" />
        </slot>
      </div>
    </div>

    <div class="ui-card__body" :style="contentStyle">
      <slot />
    </div>

    <div v-if="$slots.footer" class="ui-card__footer" :style="footerStyle">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-card {
  position: relative;
  border-radius: var(--r-xl);
  padding: 20px;
  background: color-mix(in srgb, var(--surface-container-lowest) 78%, transparent);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-card), inset 0 1px 0 var(--glass-hi);
  display: flex;
  flex-direction: column;
  gap: 14px;
  isolation: isolate;
  transition:
    transform 0.25s var(--ease-out),
    box-shadow 0.25s var(--ease-out),
    border-color 0.25s var(--ease-soft);

  &:has([class*="--open"]),
  &:has(.is-open),
  &:has([class*="__dropdown"]),
  &:has([class*="__popover"]) {
    z-index: 40;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background-image: var(--noise);
    background-size: 150px 150px;
    opacity: 0.35;
    mix-blend-mode: overlay;
    pointer-events: none;
  }

  &--glass {
    backdrop-filter: blur(24px) saturate(1.5);
    -webkit-backdrop-filter: blur(24px) saturate(1.5);
  }

  &:not(&--bordered) {
    border-color: transparent;
  }

  /* Sizes */
  &--sm {
    padding: 14px;
    gap: 10px;
  }

  &--lg {
    padding: 26px;
    gap: 18px;
  }

  &--hoverable:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lift);
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  &__title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 800;
    color: var(--on-surface);
    letter-spacing: -0.02em;
  }

  &__subtitle {
    font-size: var(--font-size-xs);
    color: var(--on-surface-variant);
    font-weight: 500;
    margin-top: 2px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__body {
    flex: 1;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
  }

  /* Themes (Candy-tinted borders) */
  &--blue { border-top: 3.5px solid var(--theme-blue); }
  &--purple { border-top: 3.5px solid var(--theme-purple); }
  &--red { border-top: 3.5px solid var(--theme-red); }
  &--yellow { border-top: 3.5px solid var(--theme-yellow); }
  &--green { border-top: 3.5px solid var(--theme-green); }
  &--pink { border-top: 3.5px solid var(--theme-pink); }
  &--cyan { border-top: 3.5px solid var(--theme-cyan); }
}
</style>
