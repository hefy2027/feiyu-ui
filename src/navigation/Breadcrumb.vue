<script setup lang="ts">
import { computed, provide, type Ref } from 'vue'

export interface BreadcrumbContext {
  separator: Ref<string>
  separatorIcon: Ref<string | undefined>
}

interface Props {
  separator?: string
  separatorIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  separator: '/',
  separatorIcon: undefined
})

provide<BreadcrumbContext>('ui-breadcrumb', {
  separator: computed(() => props.separator),
  separatorIcon: computed(() => props.separatorIcon)
})
</script>

<template>
  <nav class="ui-breadcrumb" aria-label="Breadcrumb">
    <ol class="ui-breadcrumb__list">
      <slot />
    </ol>
  </nav>
</template>

<style scoped lang="scss">
.ui-breadcrumb {
  display: flex;
  align-items: center;
  user-select: none;

  &__list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 4px;
  }
}
</style>
