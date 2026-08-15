<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, type Ref } from 'vue'

interface TabsContext {
  activeName: Ref<string | number>
  registerPane: (pane: { name: string | number; label: string; icon?: string; disabled?: boolean; closable?: boolean }) => void
  unregisterPane: (name: string | number) => void
}

interface Props {
  name: string | number
  label: string
  icon?: string
  disabled?: boolean
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  disabled: false,
  closable: false
})

const tabsContext = inject<TabsContext | null>('fy-tabs', null)

const isActive = computed(() => {
  return tabsContext?.activeName.value === props.name
})

onMounted(() => {
  if (tabsContext) {
    tabsContext.registerPane({
      name: props.name,
      label: props.label,
      icon: props.icon,
      disabled: props.disabled,
      closable: props.closable
    })
  }
})

onUnmounted(() => {
  if (tabsContext) {
    tabsContext.unregisterPane(props.name)
  }
})
</script>

<template>
  <div v-show="isActive" class="fy-tab-pane" role="tabpanel">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.fy-tab-pane {
  width: 100%;
  animation: pane-fade 0.2s var(--fy-ease-soft);
}

@keyframes pane-fade {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
