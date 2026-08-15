<script setup lang="ts">
import { computed, inject } from 'vue'
import type { MenuContext } from './Menu.vue'

interface Props {
  title?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  label: ''
})

const menuContext = inject<MenuContext | null>('ui-menu', null)
const isCollapsed = computed(() => menuContext?.collapsed.value ?? false)
const effectiveTitle = computed(() => props.title || props.label || '')
</script>

<template>
  <div class="ui-menu-group">
    <div v-if="!isCollapsed && (effectiveTitle || $slots.title)" class="ui-menu-group__title">
      <slot name="title">{{ effectiveTitle }}</slot>
    </div>
    <div class="ui-menu-group__list">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-menu-group {
  display: flex;
  flex-direction: column;

  &__title {
    font-size: var(--font-size-xs);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--outline);
    padding: 18px 14px 8px;
    user-select: none;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}
</style>
