<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

interface Props {
  bordered?: boolean
  height?: number | string
  position?: 'static' | 'absolute' | 'sticky' | 'fixed'
  fixed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  height: undefined,
  position: 'static',
  fixed: false
})

const effectivePosition = computed(() => {
  if (props.fixed) return 'fixed'
  return props.position
})

const headerStyle = computed<CSSProperties>(() => {
  const pos = effectivePosition.value
  const styles: CSSProperties = { position: pos }
  if (pos === 'sticky' || pos === 'fixed') {
    styles.top = 0
    styles.zIndex = 50
  }
  if (props.height !== undefined) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return styles
})
</script>

<template>
  <header
    :class="[
      'ui-layout-header',
      {
        'ui-layout-header--bordered': bordered,
        'ui-layout-header--fixed': fixed || position === 'fixed',
        'ui-layout-header--sticky': position === 'sticky'
      }
    ]"
    :style="headerStyle"
  >
    <slot />
  </header>
</template>

<style scoped lang="scss">
.ui-layout-header {
  box-sizing: border-box;
  width: 100%;
  flex-shrink: 0;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  &--bordered {
    border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
  }

  &--fixed,
  &--sticky {
    position: sticky;
    top: 0;
    z-index: 50;
  }
}
</style>
