<script setup lang="ts">
import { computed } from 'vue'

export type ResultStatus = 'info' | 'success' | 'warning' | 'error' | '404' | '403' | '500'

interface Props {
  status?: ResultStatus
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  status: 'info',
  title: '',
  description: '',
  size: 'md'
})

const statusIcon = computed(() => {
  switch (props.status) {
    case 'success':
      return 'check_circle'
    case 'warning':
      return 'warning'
    case 'error':
      return 'cancel'
    case '404':
      return 'explore_off'
    case '403':
      return 'lock'
    case '500':
      return 'dns'
    default:
      return 'info'
  }
})
</script>

<template>
  <div :class="['ui-result', `ui-result--${status}`, `ui-result--${size}`]">
    <div class="ui-result__icon-wrap">
      <slot name="icon">
        <div class="ui-result__icon-halo">
          <span class="material-symbols-outlined ui-result__icon">{{ statusIcon }}</span>
        </div>
      </slot>
    </div>

    <div v-if="title || $slots.title" class="ui-result__title">
      <slot name="title">{{ title }}</slot>
    </div>

    <div v-if="description || $slots.description" class="ui-result__description">
      <slot name="description">{{ description }}</slot>
    </div>

    <div v-if="$slots.extra || $slots.default" class="ui-result__extra">
      <slot name="extra"><slot /></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  user-select: none;
  width: 100%;
  box-sizing: border-box;

  &__icon-wrap {
    margin-bottom: 16px;
  }

  &__icon-halo {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    backdrop-filter: blur(16px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }

  &__icon {
    font-size: 38px;
  }

  &__title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 800;
    color: var(--on-surface);
    margin-bottom: 6px;
    letter-spacing: -0.02em;
  }

  &__description {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--on-surface-variant);
    max-width: 400px;
    line-height: 1.5;
  }

  &__extra {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Status theme colors */
  &--info {
    .ui-result__icon-halo {
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary);
    }
  }
  &--success {
    .ui-result__icon-halo {
      background: color-mix(in srgb, var(--theme-green, #10b981) 14%, transparent);
      color: var(--theme-green, #10b981);
    }
  }
  &--warning {
    .ui-result__icon-halo {
      background: color-mix(in srgb, var(--theme-yellow, #f59e0b) 14%, transparent);
      color: var(--theme-yellow, #f59e0b);
    }
  }
  &--error,
  &--500 {
    .ui-result__icon-halo {
      background: color-mix(in srgb, var(--error) 12%, transparent);
      color: var(--error);
    }
  }
  &--404,
  &--403 {
    .ui-result__icon-halo {
      background: color-mix(in srgb, var(--surface-container-high) 80%, transparent);
      color: var(--outline);
    }
  }

  /* Sizes */
  &--sm {
    padding: 24px 12px;
    .ui-result__icon-halo {
      width: 52px;
      height: 52px;
    }
    .ui-result__icon {
      font-size: 28px;
    }
    .ui-result__title {
      font-size: 18px;
    }
    .ui-result__description {
      font-size: var(--font-size-sm);
    }
  }

  &--lg {
    padding: 60px 24px;
    .ui-result__icon-halo {
      width: 88px;
      height: 88px;
    }
    .ui-result__icon {
      font-size: 48px;
    }
    .ui-result__title {
      font-size: 26px;
    }
  }
}
</style>
