<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

interface Props {
  width?: number | string
  collapsedWidth?: number | string
  collapsed?: boolean
  bordered?: boolean
  showTrigger?: boolean | 'bar' | 'arrow-circle'
  collapseMode?: 'transform' | 'width'
}

const props = withDefaults(defineProps<Props>(), {
  width: 260,
  collapsedWidth: 64,
  collapsed: false,
  bordered: true,
  showTrigger: false,
  collapseMode: 'width'
})

const emit = defineEmits<{
  'update:collapsed': [val: boolean]
  collapse: [val: boolean]
}>()

const currentWidth = computed(() => {
  if (props.collapsed) {
    return typeof props.collapsedWidth === 'number' ? `${props.collapsedWidth}px` : props.collapsedWidth
  }
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})

function toggleCollapse() {
  const next = !props.collapsed
  emit('update:collapsed', next)
  emit('collapse', next)
}
</script>

<template>
  <aside
    :class="[
      'ui-layout-sider',
      {
        'ui-layout-sider--collapsed': collapsed,
        'ui-layout-sider--bordered': bordered
      }
    ]"
    :style="{ width: currentWidth, minWidth: currentWidth, maxWidth: currentWidth, flex: `0 0 ${currentWidth}` }"
  >
    <div class="ui-layout-sider__content">
      <slot />
    </div>

    <slot
      v-if="showTrigger || $slots.trigger"
      name="trigger"
      :collapsed="collapsed"
      :toggle-collapse="toggleCollapse"
    >
      <div
        class="ui-layout-sider__trigger"
        @click="toggleCollapse"
      >
        <span class="material-symbols-outlined">
          {{ collapsed ? 'chevron_right' : 'chevron_left' }}
        </span>
      </div>
    </slot>
  </aside>
</template>

<style scoped lang="scss">
.ui-layout-sider {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  transition: width 0.28s var(--ease-out), flex 0.28s var(--ease-out);

  &--bordered {
    border-right: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }

  &__trigger {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-top: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
    color: var(--outline);
    transition: color 0.15s ease, background 0.15s ease;

    &:hover {
      color: var(--primary);
      background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
    }
  }
}
</style>
