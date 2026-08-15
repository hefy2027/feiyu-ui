<script setup lang="ts">
import type { CSSProperties } from 'vue'

interface Props {
  description?: string
  icon?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  image?: string
  imageSize?: number | string
}

withDefaults(defineProps<Props>(), {
  description: '暂无数据',
  icon: 'inbox',
  size: 'md',
  showIcon: true,
  image: undefined,
  imageSize: undefined
})
</script>

<template>
  <div :class="['ui-empty', `ui-empty--${size}`]">
    <div v-if="image || $slots.image" class="ui-empty__image-wrap">
      <slot name="image">
        <img
          :src="image"
          alt="empty"
          class="ui-empty__image"
          :style="{ width: typeof imageSize === 'number' ? `${imageSize}px` : imageSize }"
        />
      </slot>
    </div>
    <div v-else-if="showIcon" class="ui-empty__icon-wrap">
      <slot name="icon">
        <div class="ui-empty__icon-halo">
          <span class="material-symbols-outlined ui-empty__icon">{{ icon }}</span>
        </div>
      </slot>
    </div>

    <div class="ui-empty__description">
      <slot name="description">
        <p>{{ description }}</p>
      </slot>
    </div>

    <div v-if="$slots.extra || $slots.default" class="ui-empty__extra">
      <slot name="extra"><slot /></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 16px;
  width: 100%;
  box-sizing: border-box;
  user-select: none;

  &__icon-wrap {
    margin-bottom: 12px;
  }

  &__image-wrap {
    margin-bottom: 14px;
    display: flex;
    justify-content: center;
  }

  &__image {
    max-width: 140px;
    height: auto;
  }

  &__icon-halo {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
    backdrop-filter: blur(12px);
    border: 1px dashed color-mix(in srgb, var(--outline-variant) 60%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
  }

  &__icon {
    font-size: 32px;
    color: var(--outline);
    opacity: 0.8;
  }

  &__description {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--outline);
    margin: 0;
    max-width: 280px;
    line-height: 1.5;

    p {
      margin: 0;
    }
  }

  &__extra {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  /* Sizes */
  &--sm {
    padding: 16px 8px;

    .ui-empty__icon-halo {
      width: 44px;
      height: 44px;
    }
    .ui-empty__icon {
      font-size: 22px;
    }
    .ui-empty__description {
      font-size: var(--font-size-xs);
    }
    .ui-empty__extra {
      margin-top: 10px;
    }
  }

  &--lg {
    padding: 48px 24px;

    .ui-empty__icon-halo {
      width: 80px;
      height: 80px;
    }
    .ui-empty__icon {
      font-size: 40px;
    }
    .ui-empty__description {
      font-size: var(--font-size-base);
    }
  }
}
</style>
