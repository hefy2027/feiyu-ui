<script setup lang="ts">
interface Props {
  value?: string
  block?: boolean
  fontSize?: number | string
}

withDefaults(defineProps<Props>(), {
  value: '',
  block: false,
  fontSize: undefined
})
</script>

<template>
  <span
    :class="[
      'fy-equation',
      { 'fy-equation--block': block }
    ]"
    :style="fontSize ? { fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize } : undefined"
  >
    <slot>{{ value }}</slot>
  </span>
</template>

<style scoped lang="scss">
.fy-equation {
  font-family: 'KaTeX_Math', 'Cambria Math', 'Latin Modern Math', 'Times New Roman', serif;
  font-style: italic;
  font-variant-numeric: normal;
  color: var(--fy-on-surface);
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  padding: 0 2px;

  &--block {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px 20px;
    margin: 8px 0;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-high) 45%, transparent);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
    font-size: 1.15em;
  }
}
</style>
