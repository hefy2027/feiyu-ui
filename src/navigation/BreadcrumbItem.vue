<script setup lang="ts">
import { inject, computed } from 'vue'
import type { BreadcrumbContext } from './Breadcrumb.vue'

interface Props {
  to?: string | object
  href?: string
  replace?: boolean
  icon?: string
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  to: undefined,
  href: undefined,
  replace: false,
  icon: undefined,
  clickable: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const breadcrumbContext = inject<BreadcrumbContext | null>('fy-breadcrumb', null)
const isLink = computed(() => !!props.to || !!props.href || props.clickable)

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <li class="fy-breadcrumb-item">
    <component
      :is="to ? 'RouterLink' : (href ? 'a' : 'span')"
      :to="to"
      :href="href"
      :replace="replace"
      :class="['fy-breadcrumb-item__link', { 'is-link': isLink }]"
      @click="handleClick"
    >
      <slot name="icon">
        <span v-if="icon" class="material-symbols-outlined fy-breadcrumb-item__icon">{{ icon }}</span>
      </slot>
      <slot />
    </component>

    <span class="fy-breadcrumb-item__separator" aria-hidden="true">
      <slot name="separator">
        <span
          v-if="breadcrumbContext?.separatorIcon.value"
          class="material-symbols-outlined fy-breadcrumb-item__separator-icon"
        >
          {{ breadcrumbContext.separatorIcon.value }}
        </span>
        <span v-else>{{ breadcrumbContext?.separator.value ?? '/' }}</span>
      </slot>
    </span>
  </li>
</template>

<style scoped lang="scss">
.fy-breadcrumb-item {
  display: inline-flex;
  align-items: center;
  font-size: var(--fy-font-size-sm);
  font-weight: 600;
  color: var(--fy-on-surface-variant);

  &__link {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s var(--fy-ease-soft);
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &.is-link {
      cursor: pointer;

      &:hover {
        color: var(--fy-primary);
      }
    }
  }

  &__icon {
    font-size: 16px;
    line-height: 1;
  }

  &:last-child &__link {
    color: var(--fy-on-surface);
    font-weight: 700;
    cursor: default;
  }

  &__separator {
    margin: 0 6px;
    color: var(--fy-outline-variant);
    display: inline-flex;
    align-items: center;
  }

  &:last-child &__separator {
    display: none;
  }

  &__separator-icon {
    font-size: 16px;
  }
}
</style>
