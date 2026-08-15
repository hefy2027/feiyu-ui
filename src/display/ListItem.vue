<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
  description?: string
  disabled?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  indent?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  disabled: false,
  collapsible: false,
  defaultCollapsed: false,
  indent: 0
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  collapseChange: [collapsed: boolean]
}>()

const isCollapsed = ref(props.defaultCollapsed)

function toggleCollapse() {
  if (!props.collapsible) return
  isCollapsed.value = !isCollapsed.value
  emit('collapseChange', isCollapsed.value)
}

function handleItemClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <div
    :class="[
      'ui-list-item-group',
      {
        'is-collapsible': collapsible,
        'is-collapsed': isCollapsed
      }
    ]"
  >
    <div
      :class="[
        'ui-list-item',
        {
          'is-disabled': disabled,
          'is-collapsible': collapsible
        }
      ]"
      :style="indent ? { paddingLeft: `${18 + indent * 20}px` } : undefined"
      @click="handleItemClick"
    >
      <!-- Collapsible Chevron -->
      <button
        v-if="collapsible"
        type="button"
        class="ui-list-item__toggle"
        :class="{ 'is-expanded': !isCollapsed }"
        aria-label="展开/收起子项"
        @click.stop="toggleCollapse"
      >
        <span class="material-symbols-outlined">chevron_right</span>
      </button>

      <!-- Prefix / Avatar Slot -->
      <div v-if="$slots.prefix || $slots.avatar" class="ui-list-item__prefix">
        <slot name="avatar">
          <slot name="prefix" />
        </slot>
      </div>

      <!-- Main Content -->
      <div class="ui-list-item__main">
        <div v-if="title || $slots.title" class="ui-list-item__title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="description || $slots.description" class="ui-list-item__desc">
          <slot name="description">{{ description }}</slot>
        </div>
        <!-- Default Content -->
        <div v-if="$slots.default" class="ui-list-item__content">
          <slot />
        </div>
      </div>

      <!-- Extra Content -->
      <div v-if="$slots.extra" class="ui-list-item__extra" @click.stop>
        <slot name="extra" />
      </div>

      <!-- Suffix / Actions Slot -->
      <div v-if="$slots.suffix || $slots.actions" class="ui-list-item__suffix" @click.stop>
        <slot name="actions">
          <slot name="suffix" />
        </slot>
      </div>
    </div>

    <!-- Nested Child Items / Sublist -->
    <div
      v-if="$slots.children || $slots.nested || $slots.sublist"
      v-show="!isCollapsed"
      class="ui-list-item__nested"
    >
      <slot name="children">
        <slot name="nested">
          <slot name="sublist" />
        </slot>
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-list-item-group {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);

  &:last-child {
    border-bottom: none;
  }
}

.ui-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  transition: background 0.15s ease;

  .ui-list--hoverable &:hover:not(.is-disabled) {
    background: color-mix(in srgb, var(--surface-container-high) 45%, transparent);
  }

  &.is-disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--on-surface-variant);
    cursor: pointer;
    border-radius: var(--r-sm);
    transition: transform 0.2s ease, background 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--surface-container-highest) 60%, transparent);
      color: var(--on-surface);
    }

    .material-symbols-outlined {
      font-size: 18px;
      transition: transform 0.2s ease;
    }

    &.is-expanded .material-symbols-outlined {
      transform: rotate(90deg);
    }
  }

  &__prefix {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__title {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: var(--on-surface);
  }

  &__desc {
    font-size: var(--font-size-sm);
    color: var(--on-surface-variant);
    line-height: 1.4;
  }

  &__content {
    margin-top: 4px;
  }

  &__extra {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__suffix {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__nested {
    padding-left: 28px;
    background: color-mix(in srgb, var(--surface-container-low) 40%, transparent);
    border-top: 1px dashed color-mix(in srgb, var(--outline-variant) 20%, transparent);

    :deep(.ui-list) {
      border: none;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    :deep(.ui-list-item) {
      padding-left: 8px;
    }
  }
}
</style>
