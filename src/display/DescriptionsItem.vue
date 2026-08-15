<script setup lang="ts">
import { inject, computed, type CSSProperties } from 'vue'
import type { DescriptionsContext } from './Descriptions.vue'

interface Props {
  label?: string
  span?: number
  labelStyle?: CSSProperties | string
  contentStyle?: CSSProperties | string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  span: 1,
  labelStyle: undefined,
  contentStyle: undefined
})

const descriptionsContext = inject<DescriptionsContext | null>('ui-descriptions', null)

const itemStyle = computed<CSSProperties>(() => {
  if (props.span > 1) {
    return {
      gridColumn: `span ${props.span} / span ${props.span}`
    }
  }
  return {}
})
</script>

<template>
  <div
    :class="[
      'ui-descriptions-item',
      `ui-descriptions-item--${descriptionsContext?.labelPlacement.value || 'left'}`
    ]"
    :style="itemStyle"
  >
    <span class="ui-descriptions-item__label" :style="labelStyle || descriptionsContext?.labelStyle?.value">
      <slot name="label">{{ label }}</slot>
    </span>
    <div class="ui-descriptions-item__content" :style="contentStyle || descriptionsContext?.contentStyle?.value">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-descriptions-item {
  display: flex;
  padding: 12px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
  font-size: var(--font-size-sm);
  box-sizing: border-box;

  &--left {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  &--top {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  &__label {
    font-weight: 700;
    color: var(--outline);
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__content {
    font-weight: 500;
    color: var(--on-surface);
    flex: 1;
    word-break: break-all;
  }
}
</style>
