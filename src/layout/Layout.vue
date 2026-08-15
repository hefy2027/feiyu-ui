<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

interface Props {
  hasSider?: boolean
  embedded?: boolean
  position?: 'static' | 'absolute' | 'relative'
  direction?: 'row' | 'column'
}

const props = withDefaults(defineProps<Props>(), {
  hasSider: false,
  embedded: false,
  position: 'static',
  direction: undefined
})

const isRow = computed(() => {
  if (props.direction) return props.direction === 'row'
  return props.hasSider
})

const layoutStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    position: props.position,
    display: 'flex',
    flexDirection: isRow.value ? 'row' : 'column',
    boxSizing: 'border-box'
  }
  if (props.position === 'absolute') {
    styles.width = '100%'
    styles.height = '100%'
  }
  return styles
})
</script>

<template>
  <div
    :class="[
      'ui-layout',
      {
        'ui-layout--has-sider': hasSider || isRow,
        'ui-layout--embedded': embedded
      }
    ]"
    :style="layoutStyle"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-layout {
  box-sizing: border-box;
  flex: auto;
  min-width: 0;
  min-height: 0;
  width: 100%;
  transition: background-color 0.25s ease;

  &--has-sider {
    flex-direction: row;
  }

  &--embedded {
    background: color-mix(in srgb, var(--surface-container-low) 50%, transparent);
  }
}
</style>
