<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

interface Props {
  bordered?: boolean
  height?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  height: undefined
})

const footerStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {}
  if (props.height !== undefined) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return styles
})
</script>

<template>
  <footer
    :class="[
      'fy-layout-footer',
      { 'fy-layout-footer--bordered': bordered }
    ]"
    :style="footerStyle"
  >
    <slot />
  </footer>
</template>

<style scoped lang="scss">
.fy-layout-footer {
  box-sizing: border-box;
  width: 100%;
  flex-shrink: 0;
  padding: 16px 24px;
  font-size: var(--fy-font-size-xs);
  color: var(--fy-outline);
  display: flex;
  align-items: center;
  justify-content: space-between;

  &--bordered {
    border-top: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);
  }
}
</style>
