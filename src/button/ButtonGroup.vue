<script setup lang="ts">
import { provide, computed } from 'vue'
import type { ButtonSize } from './Button.vue'

interface Props {
  size?: ButtonSize
  vertical?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: undefined,
  vertical: false
})

provide('buttonGroupSize', computed(() => props.size))
</script>

<template>
  <div
    :class="[
      'ui-button-group',
      { 'ui-button-group--vertical': vertical }
    ]"
    role="group"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-button-group {
  display: inline-flex;
  vertical-align: middle;
  position: relative;

  &:not(&--vertical) {
    flex-direction: row;

    :deep(.ui-button) {
      &:focus-visible {
        z-index: 2;
      }

      &:not(:first-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        margin-left: -1px;
      }

      &:not(:last-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      &:hover,
      &:active {
        z-index: 1;
      }
    }
  }

  &--vertical {
    flex-direction: column;

    :deep(.ui-button) {
      width: 100%;

      &:focus-visible {
        z-index: 2;
      }

      &:not(:first-child) {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        margin-top: -1px;
      }

      &:not(:last-child) {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }

      &:hover,
      &:active {
        z-index: 1;
      }
    }
  }
}
</style>
