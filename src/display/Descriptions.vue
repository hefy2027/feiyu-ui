<script setup lang="ts">
import { computed, provide, type Ref, type CSSProperties } from 'vue'

export interface DescriptionsContext {
  column: Ref<number>
  bordered: Ref<boolean>
  size: Ref<'sm' | 'md' | 'lg'>
  labelPlacement: Ref<'left' | 'top'>
  labelStyle?: Ref<CSSProperties | string | undefined>
  contentStyle?: Ref<CSSProperties | string | undefined>
}

interface Props {
  title?: string
  column?: number
  bordered?: boolean
  size?: 'sm' | 'md' | 'lg'
  labelPlacement?: 'left' | 'top'
  labelStyle?: CSSProperties | string
  contentStyle?: CSSProperties | string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  column: 3,
  bordered: true,
  size: 'md',
  labelPlacement: 'left',
  labelStyle: undefined,
  contentStyle: undefined
})

provide<DescriptionsContext>('ui-descriptions', {
  column: computed(() => props.column),
  bordered: computed(() => props.bordered),
  size: computed(() => props.size),
  labelPlacement: computed(() => props.labelPlacement),
  labelStyle: computed(() => props.labelStyle),
  contentStyle: computed(() => props.contentStyle)
})
</script>

<template>
  <div
    :class="[
      'ui-descriptions',
      `ui-descriptions--${size}`,
      `ui-descriptions--${labelPlacement}`,
      { 'ui-descriptions--bordered': bordered }
    ]"
  >
    <div v-if="title || $slots.header || $slots.title || $slots.extra" class="ui-descriptions__header">
      <div class="ui-descriptions__title">
        <slot name="title">
          <slot name="header">{{ title }}</slot>
        </slot>
      </div>
      <div v-if="$slots.extra" class="ui-descriptions__extra">
        <slot name="extra" />
      </div>
    </div>

    <div class="ui-descriptions__table" :style="{ gridTemplateColumns: `repeat(${column}, minmax(0, 1fr))` }">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-descriptions {
  width: 100%;
  box-sizing: border-box;
  font-size: var(--font-size-sm);
  color: var(--on-surface);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 800;
    color: var(--on-surface);
  }

  &__extra {
    font-size: var(--font-size-xs);
    color: var(--outline);
  }

  &__table {
    display: grid;
    width: 100%;
    border-radius: var(--r-md);
    overflow: hidden;
    background: color-mix(in srgb, var(--surface-container-lowest) 75%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  &--bordered &__table {
    border: 1px solid color-mix(in srgb, var(--outline-variant) 35%, transparent);
  }
}
</style>
