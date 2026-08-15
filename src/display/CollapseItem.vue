<script setup lang="ts">
import { inject, computed } from 'vue'
import type { CollapseContext } from './Collapse.vue'

interface Props {
  name: string | number
  title?: string
  disabled?: boolean
  showArrow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  disabled: false,
  showArrow: true
})

const collapseContext = inject<CollapseContext | null>('fy-collapse', null)

const isExpanded = computed(() => {
  return collapseContext?.expandedNames.value.includes(props.name) ?? false
})

const arrowPlacement = computed(() => {
  return collapseContext?.arrowPlacement.value ?? 'left'
})

function handleHeaderClick() {
  if (props.disabled) return
  collapseContext?.toggleItem(props.name)
}
</script>

<template>
  <div
    :class="[
      'fy-collapse-item',
      {
        'is-expanded': isExpanded,
        'is-disabled': disabled
      }
    ]"
  >
    <div
      class="fy-collapse-item__header"
      :class="[`fy-collapse-item__header--arrow-${arrowPlacement}`]"
      role="button"
      :aria-expanded="isExpanded"
      @click="handleHeaderClick"
    >
      <slot v-if="showArrow && arrowPlacement === 'left'" name="arrow">
        <span
          class="material-symbols-outlined fy-collapse-item__arrow"
        >
          expand_more
        </span>
      </slot>

      <div class="fy-collapse-item__title">
        <slot name="title">{{ title }}</slot>
      </div>

      <div v-if="$slots.extra" class="fy-collapse-item__extra" @click.stop>
        <slot name="extra" />
      </div>

      <slot v-if="showArrow && arrowPlacement === 'right'" name="arrow">
        <span
          class="material-symbols-outlined fy-collapse-item__arrow"
        >
          expand_more
        </span>
      </slot>
    </div>

    <div class="fy-collapse-item__content-wrapper" :class="{ 'is-open': isExpanded }">
      <div class="fy-collapse-item__content">
        <div class="fy-collapse-item__content-inner">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-collapse-item {
  border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);

  &:last-child {
    border-bottom: none;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    font-size: var(--fy-font-size-base);
    font-weight: 700;
    color: var(--fy-on-surface);
    cursor: pointer;
    user-select: none;
    transition: background 0.2s var(--fy-ease-soft), color 0.2s var(--fy-ease-soft);

    &:hover {
      background: color-mix(in srgb, var(--fy-surface-container-high) 45%, transparent);
    }
  }

  &.is-disabled &__header {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background: transparent;
    }
  }

  &__title {
    flex: 1;
  }

  &__extra {
    font-size: var(--fy-font-size-xs);
    color: var(--fy-outline);
    font-weight: 500;
  }

  &__arrow {
    font-size: 20px;
    color: var(--fy-outline);
    transition: transform 0.24s var(--fy-ease-soft);
    flex-shrink: 0;
  }

  &.is-expanded > &__header > &__arrow {
    transform: rotate(180deg);
  }

  &__content-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.25s var(--fy-ease-soft);

    &.is-open {
      grid-template-rows: 1fr;
    }
  }

  &__content {
    overflow: hidden;
    padding: 0 18px 16px;
    color: var(--fy-on-surface-variant);
    font-size: var(--fy-font-size-sm);
    line-height: 1.6;
  }

  &__content-inner {
    padding-top: 4px;
  }
}
</style>
