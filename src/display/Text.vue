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
      'ui-text',
      `ui-text--${type}`,
      typeof size === 'string' ? `ui-text--size-${size}` : '',
      depth ? `ui-text--depth-${depth}` : '',
      {
        'ui-text--strong': strong,
        'ui-text--italic': italic,
        'ui-text--underline': underline,
        'ui-text--delete': props.delete,
        'ui-text--code': code,
        'ui-text--mark': mark,
        'ui-text--truncate': truncate
      }
    ]"
    :style="typeof size === 'number' ? { fontSize: `${size}px` } : undefined"
  >
    <slot />
  </component>
</template>

<style scoped lang="scss">
.ui-text {
  display: inline;
  font-family: inherit;
  color: var(--on-surface);
  transition: color 0.15s ease;

  /* Types */
  &--primary { color: var(--primary); }
  &--info { color: var(--theme-blue); }
  &--success { color: var(--status-done); }
  &--warning { color: var(--status-review); }
  &--error { color: var(--error); }

  /* Depths */
  &--depth-1 { color: var(--on-surface); }
  &--depth-2 { color: var(--on-surface-variant); }
  &--depth-3 { color: var(--outline); }

  /* Sizes */
  &--size-xs { font-size: var(--font-size-xs); }
  &--size-sm { font-size: var(--font-size-sm); }
  &--size-base { font-size: var(--font-size-base); }
  &--size-lg { font-size: var(--font-size-lg); }
  &--size-xl { font-size: var(--font-size-xl); }

  /* Modifiers */
  &--strong { font-weight: 700; }
  &--italic { font-style: italic; }
  &--underline { text-decoration: underline; text-underline-offset: 3px; }
  &--delete { text-decoration: line-through; opacity: 0.75; }
  
  &--code {
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 0.88em;
    background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
    padding: 2px 5px;
    border-radius: 4px;
    border: 1px solid color-mix(in srgb, var(--outline-variant) 30%, transparent);
  }

  &--mark {
    background: color-mix(in srgb, var(--primary) 18%, transparent);
    color: var(--primary);
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
