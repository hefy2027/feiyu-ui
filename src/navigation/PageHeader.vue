<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon?: string
  title?: string
  content?: string
  subTitle?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'arrow_back',
  title: '返回',
  content: '',
  subTitle: '',
  subtitle: ''
})

const effectiveSubTitle = computed(() => props.subTitle || props.subtitle || '')

const emit = defineEmits<{
  back: []
}>()

function handleBack() {
  emit('back')
}
</script>

<template>
  <div class="fy-page-header">
    <!-- Breadcrumb Area -->
    <div v-if="$slots.breadcrumb" class="fy-page-header__breadcrumb">
      <slot name="breadcrumb" />
    </div>

    <!-- Main Header Bar -->
    <div class="fy-page-header__wrapper">
      <!-- Left Back Action -->
      <div class="fy-page-header__left" @click="handleBack">
        <div class="fy-page-header__back-btn" role="button" tabindex="0">
          <slot name="icon">
            <span v-if="icon" class="material-symbols-outlined fy-page-header__icon">{{ icon }}</span>
          </slot>
        </div>
        <div v-if="title || $slots.title" class="fy-page-header__title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div class="fy-page-header__divider" />
      </div>

      <!-- Content & Tags -->
      <div class="fy-page-header__main">
        <div class="fy-page-header__content">
          <slot name="content">{{ content }}</slot>
        </div>
        <div v-if="effectiveSubTitle || $slots.subTitle || $slots.subtitle" class="fy-page-header__subtitle">
          <slot name="subTitle">
            <slot name="subtitle">{{ effectiveSubTitle }}</slot>
          </slot>
        </div>
        <div v-if="$slots.tags" class="fy-page-header__tags">
          <slot name="tags" />
        </div>
      </div>

      <!-- Extra Actions on Right -->
      <div v-if="$slots.extra" class="fy-page-header__extra">
        <slot name="extra" />
      </div>
    </div>

    <!-- Sub Content / Body Slot -->
    <div v-if="$slots.default" class="fy-page-header__body">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-page-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;

  &__breadcrumb {
    margin-bottom: 2px;
  }

  &__wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  &__back-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--fy-r-md);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--fy-on-surface-variant);
    background: color-mix(in srgb, var(--fy-surface-container-high) 40%, transparent);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
    backdrop-filter: blur(12px) saturate(1.4);
    -webkit-backdrop-filter: blur(12px) saturate(1.4);
    box-shadow: inset 0 1px 0 var(--fy-glass-hi);
    cursor: pointer;
    transition: all 0.2s var(--fy-ease-soft);

    &:hover {
      color: var(--fy-primary);
      background: color-mix(in srgb, var(--fy-surface-container-high) 75%, transparent);
      box-shadow: var(--fy-shadow-sm), inset 0 1px 0 var(--fy-glass-hi);
      transform: translateX(-2px);
    }
  }

  &__icon {
    font-size: 18px;
    line-height: 1;
  }

  &__title {
    line-height: 1;
  }

  &__divider {
    width: 1px;
    height: 16px;
    background: color-mix(in srgb, var(--fy-outline-variant) 50%, transparent);
  }

  &__main {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  &__content {
    font-size: var(--fy-font-size-lg);
    font-weight: 700;
    color: var(--fy-on-surface);
    letter-spacing: -0.01em;
  }

  &__subtitle {
    font-size: var(--fy-font-size-sm);
    color: var(--fy-on-surface-variant);
    font-weight: 500;
  }

  &__tags {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__extra {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__body {
    margin-top: 4px;
  }
}
</style>
