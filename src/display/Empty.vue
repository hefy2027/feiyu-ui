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
  <div :class="['fy-empty', `fy-empty--${size}`]">
    <div v-if="image || $slots.image" class="fy-empty__image-wrap">
      <slot name="image">
        <img
          :src="image"
          alt="empty"
          class="fy-empty__image"
          :style="{ width: typeof imageSize === 'number' ? `${imageSize}px` : imageSize }"
        />
      </slot>
    </div>
    <div v-else-if="showIcon" class="fy-empty__icon-wrap">
      <slot name="icon">
        <div class="fy-empty__icon-halo">
          <span class="material-symbols-outlined fy-empty__icon">{{ icon }}</span>
        </div>
      </slot>
    </div>

    <div class="fy-empty__description">
      <slot name="description">
        <p>{{ description }}</p>
      </slot>
    </div>

    <div v-if="$slots.extra || $slots.default" class="fy-empty__extra">
      <slot name="extra"><slot /></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-empty {
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
    background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
    backdrop-filter: blur(12px);
    border: 1px dashed color-mix(in srgb, var(--fy-outline-variant) 60%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
  }

  &__icon {
    font-size: 32px;
    color: var(--fy-outline);
    opacity: 0.8;
  }

  &__description {
    font-size: var(--fy-font-size-sm);
    font-weight: 600;
    color: var(--fy-outline);
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

    .fy-empty__icon-halo {
      width: 44px;
      height: 44px;
    }
    .fy-empty__icon {
      font-size: 22px;
    }
    .fy-empty__description {
      font-size: var(--fy-font-size-xs);
    }
    .fy-empty__extra {
      margin-top: 10px;
    }
  }

  &--lg {
    padding: 48px 24px;

    .fy-empty__icon-halo {
      width: 80px;
      height: 80px;
    }
    .fy-empty__icon {
      font-size: 40px;
    }
    .fy-empty__description {
      font-size: var(--fy-font-size-base);
    }
  }
}
</style>
