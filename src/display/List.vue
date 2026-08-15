<script setup lang="ts">
interface Props {
  bordered?: boolean
  hoverable?: boolean
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  bordered: true,
  hoverable: true,
  size: 'md'
})
</script>

<template>
  <div
    :class="[
      'ui-list',
      `ui-list--${size}`,
      {
        'ui-list--bordered': bordered,
        'ui-list--hoverable': hoverable
      }
    ]"
  >
    <div v-if="$slots.header" class="ui-list__header">
      <slot name="header" />
    </div>

    <div class="ui-list__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="ui-list__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-list {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-radius: var(--r-lg);
  background: color-mix(in srgb, var(--surface-container-lowest) 78%, transparent);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  overflow: hidden;

  &--bordered {
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-sm);
  }

  &__header {
    padding: 14px 18px;
    font-size: var(--font-size-base);
    font-weight: 800;
    color: var(--on-surface);
    border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
    background: color-mix(in srgb, var(--surface-container-high) 30%, transparent);
  }

  &__footer {
    padding: 12px 18px;
    font-size: var(--font-size-xs);
    color: var(--outline);
    border-top: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
    background: color-mix(in srgb, var(--surface-container-high) 20%, transparent);
  }

  &__body {
    display: flex;
    flex-direction: column;
  }
}
</style>
