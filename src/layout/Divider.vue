<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

export type DividerTitlePlacement = 'left' | 'center' | 'right'

interface Props {
  vertical?: boolean
  dashed?: boolean
  titlePlacement?: DividerTitlePlacement
}

const props = withDefaults(defineProps<Props>(), {
  vertical: false,
  dashed: false,
  titlePlacement: 'center'
})

const hasTitleSlot = computed(() => {
  return !props.vertical
})
</script>

<template>
  <div
    :class="[
      'fy-divider',
      vertical ? 'fy-divider--vertical' : 'fy-divider--horizontal',
      {
        'fy-divider--dashed': dashed,
        [`fy-divider--title-${titlePlacement}`]: !vertical && ($slots.default || $slots.title)
      }
    ]"
    role="separator"
    :aria-orientation="vertical ? 'vertical' : 'horizontal'"
  >
    <span
      v-if="!vertical && ($slots.default || $slots.title)"
      class="fy-divider__title"
    >
      <slot name="title"><slot /></slot>
    </span>
  </div>
</template>

<style scoped lang="scss">
.fy-divider {
  box-sizing: border-box;
  color: var(--fy-outline);
  font-size: var(--fy-font-size-sm);
  font-weight: 600;

  &--horizontal {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 16px 0;
    clear: both;

    &::before,
    &::after {
      content: '';
      flex: 1;
      border-top: 1px solid color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
      transition: border-color 0.2s var(--fy-ease-soft);
    }

    &:not([class*="fy-divider--title-"]) {
      border-top: 1px solid color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);

      &::before,
      &::after {
        display: none;
      }
    }

    &.fy-divider--dashed {
      border-top-style: dashed;

      &::before,
      &::after {
        border-top-style: dashed;
      }
    }
  }

  &--title-left {
    &::before {
      flex: 0 0 20px;
    }
    &::after {
      flex: 1;
    }
  }

  &--title-center {
    &::before,
    &::after {
      flex: 1;
    }
  }

  &--title-right {
    &::before {
      flex: 1;
    }
    &::after {
      flex: 0 0 20px;
    }
  }

  &__title {
    display: inline-block;
    padding: 0 14px;
    white-space: nowrap;
    user-select: none;
    letter-spacing: 0.02em;
  }

  &--vertical {
    display: inline-block;
    width: 1px;
    height: 0.9em;
    margin: 0 8px;
    vertical-align: middle;
    position: relative;
    top: -0.06em;
    background: color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
    transition: background 0.2s var(--fy-ease-soft);

    &.fy-divider--dashed {
      background: none;
      border-left: 1px dashed color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
    }
  }
}
</style>
