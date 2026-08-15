<script setup lang="ts">
import { computed } from 'vue'
import Avatar from './Avatar.vue'
import type { Assignee } from '../types'

interface Props {
  users?: Assignee[]
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  vertical?: boolean
  expandOnHover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  users: () => [],
  max: 3,
  size: 'sm',
  vertical: false,
  expandOnHover: false
})

const visibleUsers = computed(() => {
  return props.users.slice(0, props.max)
})

const extraCount = computed(() => {
  return Math.max(0, props.users.length - props.max)
})
</script>

<template>
  <div :class="['ui-avatar-group', `ui-avatar-group--${size}`]">
    <slot>
      <Avatar
        v-for="u in visibleUsers"
        :key="u.id"
        :name="u.name"
        :initials="u.initials"
        :src="u.avatar"
        :size="size"
        class="ui-avatar-group__item"
      />
      <div
        v-if="extraCount > 0"
        :class="['ui-avatar-group__more', `ui-avatar-group__more--${size}`]"
        :title="`还有 ${extraCount} 位成员`"
      >
        +{{ extraCount }}
      </div>
    </slot>
  </div>
</template>

<style scoped lang="scss">
.ui-avatar-group {
  display: inline-flex;
  align-items: center;

  :deep(> .ui-avatar) {
    margin-left: -8px;
    box-shadow: 0 0 0 2px var(--surface);
    transition: transform 0.2s var(--ease-soft), z-index 0.2s;

    &:first-child {
      margin-left: 0;
    }
  }

  &--expand-on-hover:hover {
    :deep(> .ui-avatar:hover) {
      transform: translateY(-4px) scale(1.08);
      z-index: 10;
    }
  }

  &--vertical {
    flex-direction: column;

    :deep(> .ui-avatar),
    &__item,
    &__more {
      margin-left: 0;
      margin-top: -8px;

      &:first-child {
        margin-top: 0;
      }
    }
  }

  &__item {
    margin-left: -8px;
    box-shadow: 0 0 0 2px var(--surface);

    &:first-child {
      margin-left: 0;
    }
  }

  &__more {
    margin-left: -8px;
    box-shadow: 0 0 0 2px var(--surface);
    border-radius: var(--r-full);
    display: grid;
    place-items: center;
    background: var(--surface-container-high);
    color: var(--on-surface-variant);
    font-weight: 800;
    user-select: none;
    flex: none;

    &--sm {
      width: 28px;
      height: 28px;
      font-size: 11px;
    }

    &--md {
      width: 36px;
      height: 36px;
      font-size: 12px;
    }

    &--lg {
      width: 42px;
      height: 42px;
      font-size: 13px;
    }

    &--xl {
      width: 52px;
      height: 52px;
      font-size: 15px;
    }
  }
}
</style>
