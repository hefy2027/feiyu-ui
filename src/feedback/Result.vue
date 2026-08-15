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
  <div :class="['fy-result', `fy-result--${status}`, `fy-result--${size}`]">
    <div class="fy-result__icon-wrap">
      <slot name="icon">
        <div class="fy-result__icon-halo">
          <span class="material-symbols-outlined fy-result__icon">{{ statusIcon }}</span>
        </div>
      </slot>
    </div>

    <div v-if="title || $slots.title" class="fy-result__title">
      <slot name="title">{{ title }}</slot>
    </div>

    <div v-if="description || $slots.description" class="fy-result__description">
      <slot name="description">{{ description }}</slot>
    </div>

    <div v-if="$slots.extra || $slots.default" class="fy-result__extra">
      <slot name="extra"><slot /></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-result {
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
    font-family: var(--fy-font-display);
    font-size: 22px;
    font-weight: 800;
    color: var(--fy-on-surface);
    margin-bottom: 6px;
    letter-spacing: -0.02em;
  }

  &__description {
    font-size: var(--fy-font-size-base);
    font-weight: 500;
    color: var(--fy-on-surface-variant);
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
  &--fy-info {
    .fy-result__icon-halo {
      background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
      color: var(--fy-primary);
    }
  }
  &--fy-success {
    .fy-result__icon-halo {
      background: color-mix(in srgb, var(--fy-theme-green, #10b981) 14%, transparent);
      color: var(--fy-theme-green, #10b981);
    }
  }
  &--fy-warning {
    .fy-result__icon-halo {
      background: color-mix(in srgb, var(--fy-theme-yellow, #f59e0b) 14%, transparent);
      color: var(--fy-theme-yellow, #f59e0b);
    }
  }
  &--fy-error,
  &--500 {
    .fy-result__icon-halo {
      background: color-mix(in srgb, var(--fy-error) 12%, transparent);
      color: var(--fy-error);
    }
  }
  &--404,
  &--403 {
    .fy-result__icon-halo {
      background: color-mix(in srgb, var(--fy-surface-container-high) 80%, transparent);
      color: var(--fy-outline);
    }
  }

  /* Sizes */
  &--sm {
    padding: 24px 12px;
    .fy-result__icon-halo {
      width: 52px;
      height: 52px;
    }
    .fy-result__icon {
      font-size: 28px;
    }
    .fy-result__title {
      font-size: 18px;
    }
    .fy-result__description {
      font-size: var(--fy-font-size-sm);
    }
  }

  &--lg {
    padding: 60px 24px;
    .fy-result__icon-halo {
      width: 88px;
      height: 88px;
    }
    .fy-result__icon {
      font-size: 48px;
    }
    .fy-result__title {
      font-size: 26px;
    }
  }
}
</style>
