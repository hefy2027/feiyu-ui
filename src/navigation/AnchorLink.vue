<script setup lang="ts">
import { inject, computed, onMounted, onUnmounted } from 'vue'
import type { AnchorContext } from './Anchor.vue'

interface Props {
  title?: string
  href: string
}

const props = withDefaults(defineProps<Props>(), {
  title: ''
})

const anchorContext = inject<AnchorContext | null>('fy-anchor', null)

const isActive = computed(() => {
  return anchorContext?.activeHref.value === props.href
})

function handleClick(event: MouseEvent) {
  event.preventDefault()
  anchorContext?.selectHref(props.href)
}

onMounted(() => {
  if (props.href) {
    anchorContext?.registerLink(props.href)
  }
})

onUnmounted(() => {
  if (props.href) {
    anchorContext?.unregisterLink(props.href)
  }
})
</script>

<template>
  <div :class="['fy-anchor-link', { 'is-active': isActive }]">
    <a :href="href" class="fy-anchor-link__title" @click="handleClick">
      <slot>{{ title }}</slot>
    </a>
    <div v-if="$slots.default" class="fy-anchor-link__children">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-anchor-link {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 2px 0;

  &__title {
    font-size: var(--fy-font-size-sm);
    color: var(--fy-on-surface-variant);
    text-decoration: none;
    transition: color 0.15s ease;
    cursor: pointer;
    line-height: 1.5;

    &:hover {
      color: var(--fy-primary);
    }
  }

  &.is-active > &__title {
    color: var(--fy-primary);
    font-weight: 700;
  }

  &__children {
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}
</style>
