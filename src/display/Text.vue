<script setup lang="ts">
export type TextType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
export type TextDepth = 1 | 2 | 3 | '1' | '2' | '3'

interface Props {
  type?: TextType
  depth?: TextDepth
  strong?: boolean
  italic?: boolean
  underline?: boolean
  delete?: boolean
  code?: boolean
  mark?: boolean
  truncate?: boolean
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | number
  tag?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  depth: undefined,
  strong: false,
  italic: false,
  underline: false,
  delete: false,
  code: false,
  mark: false,
  truncate: false,
  size: undefined,
  tag: 'span'
})
</script>

<template>
  <component
    :is="tag"
    :class="[
      'fy-text',
      `fy-text--${type}`,
      typeof size === 'string' ? `fy-text--size-${size}` : '',
      depth ? `fy-text--depth-${depth}` : '',
      {
        'fy-text--strong': strong,
        'fy-text--italic': italic,
        'fy-text--underline': underline,
        'fy-text--delete': props.delete,
        'fy-text--code': code,
        'fy-text--mark': mark,
        'fy-text--truncate': truncate
      }
    ]"
    :style="typeof size === 'number' ? { fontSize: `${size}px` } : undefined"
  >
    <slot />
  </component>
</template>

<style scoped lang="scss">
.fy-text {
  display: inline;
  font-family: inherit;
  color: var(--fy-on-surface);
  transition: color 0.15s ease;

  /* Types */
  &--fy-primary { color: var(--fy-primary); }
  &--fy-info { color: var(--fy-theme-blue); }
  &--fy-success { color: var(--fy-status-done); }
  &--fy-warning { color: var(--fy-status-review); }
  &--fy-error { color: var(--fy-error); }

  /* Depths */
  &--depth-1 { color: var(--fy-on-surface); }
  &--depth-2 { color: var(--fy-on-surface-variant); }
  &--depth-3 { color: var(--fy-outline); }

  /* Sizes */
  &--size-xs { font-size: var(--fy-font-size-xs); }
  &--size-sm { font-size: var(--fy-font-size-sm); }
  &--size-base { font-size: var(--fy-font-size-base); }
  &--size-lg { font-size: var(--fy-font-size-lg); }
  &--size-xl { font-size: var(--fy-font-size-xl); }

  /* Modifiers */
  &--strong { font-weight: 700; }
  &--italic { font-style: italic; }
  &--underline { text-decoration: underline; text-underline-offset: 3px; }
  &--delete { text-decoration: line-through; opacity: 0.75; }
  
  &--code {
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 0.88em;
    background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
    padding: 2px 5px;
    border-radius: 4px;
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
  }

  &--mark {
    background: color-mix(in srgb, var(--fy-primary) 18%, transparent);
    color: var(--fy-primary);
    padding: 1px 4px;
    border-radius: 3px;
  }

  &--truncate {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
