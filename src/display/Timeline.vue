<script setup lang="ts">
import { computed, provide, type Ref } from 'vue'

export interface TimelineContext {
  horizontal: Ref<boolean>
  itemPlacement: Ref<'left' | 'right'>
}

interface Props {
  horizontal?: boolean
  itemPlacement?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  horizontal: false,
  itemPlacement: 'left'
})

provide<TimelineContext>('ui-timeline', {
  horizontal: computed(() => props.horizontal),
  itemPlacement: computed(() => props.itemPlacement)
})
</script>

<template>
  <div
    :class="[
      'ui-timeline',
      horizontal ? 'ui-timeline--horizontal' : 'ui-timeline--vertical',
      `ui-timeline--placement-${itemPlacement}`
    ]"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-timeline {
  display: flex;
  box-sizing: border-box;
  width: 100%;

  &--vertical {
    flex-direction: column;
  }

  &--horizontal {
    flex-direction: row;
    align-items: flex-start;
    overflow-x: auto;
  }
}
</style>
