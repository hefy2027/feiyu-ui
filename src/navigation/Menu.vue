<script setup lang="ts">
import { provide, ref, computed, toRef, onMounted, onUnmounted, type Ref } from 'vue'

export interface MenuContext {
  activeKey: Ref<string | number>
  collapsed: Ref<boolean>
  mode: Ref<'vertical' | 'horizontal'>
  trigger: Ref<'click' | 'hover'>
  openedSubMenus: Ref<(string | number)[]>
  activePopupKey: Ref<string | number | null>
  selectItem: (key: string | number) => void
  toggleSubMenu: (key: string | number, parentPath?: (string | number)[]) => void
  openPopup: (key: string | number) => void
  closePopup: (key?: string | number) => void
}

interface Props {
  modelValue?: string | number
  value?: string | number
  mode?: 'vertical' | 'horizontal'
  collapsed?: boolean
  trigger?: 'click' | 'hover'
  defaultOpeneds?: (string | number)[]
  accordion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  value: undefined,
  mode: 'vertical',
  collapsed: false,
  trigger: 'click',
  defaultOpeneds: () => [],
  accordion: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'update:value': [value: string | number]
  select: [key: string | number]
  open: [key: string | number]
  close: [key: string | number]
}>()

const openedSubMenus = ref<(string | number)[]>([...props.defaultOpeneds])
const activePopupKey = ref<string | number | null>(null)

const currentActiveKey = computed(() => props.value !== undefined ? props.value : (props.modelValue ?? ''))

function selectItem(key: string | number) {
  emit('update:modelValue', key)
  emit('update:value', key)
  emit('select', key)
  activePopupKey.value = null
}

function toggleSubMenu(key: string | number, parentPath: (string | number)[] = []) {
  const idx = openedSubMenus.value.indexOf(key)
  if (idx !== -1) {
    // Close this submenu and all its descendants
    openedSubMenus.value = openedSubMenus.value.filter((k) => k !== key)
    emit('close', key)
  } else {
    if (props.accordion) {
      // In accordion mode: preserve all ancestors in parentPath,
      // keep only this key and its ancestors
      const newOpeneds = new Set([...parentPath, key])
      // Also keep descendants if already open (or reset)
      openedSubMenus.value = openedSubMenus.value.filter((k) => {
        return parentPath.includes(k)
      })
      if (!openedSubMenus.value.includes(key)) {
        openedSubMenus.value.push(key)
      }
    } else {
      if (!openedSubMenus.value.includes(key)) {
        openedSubMenus.value.push(key)
      }
    }
    emit('open', key)
  }
}

function openPopup(key: string | number) {
  activePopupKey.value = key
}

function closePopup(key?: string | number) {
  if (key === undefined || activePopupKey.value === key) {
    activePopupKey.value = null
  }
}

function handleGlobalClick() {
  activePopupKey.value = null
}

onMounted(() => {
  window.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick)
})

provide('ui-menu', {
  activeKey: currentActiveKey,
  collapsed: toRef(props, 'collapsed'),
  mode: toRef(props, 'mode'),
  trigger: toRef(props, 'trigger'),
  openedSubMenus,
  activePopupKey,
  selectItem,
  toggleSubMenu,
  openPopup,
  closePopup
})
</script>

<template>
  <nav
    :class="[
      'ui-menu',
      `ui-menu--${mode}`,
      { 'ui-menu--collapsed': collapsed }
    ]"
    role="menubar"
  >
    <slot />
  </nav>
</template>

<style scoped lang="scss">
.ui-menu {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  user-select: none;
  transition: width 0.3s var(--ease-soft);

  &--vertical {
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  &--horizontal {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  &--collapsed {
    align-items: center;
  }
}
</style>
