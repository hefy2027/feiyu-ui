<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Tree, { type TreeOption } from './Tree.vue'
import Tag from '../display/Tag.vue'

export interface TreeSelectProps {
  modelValue?: string | number | (string | number)[]
  options: TreeOption[]
  placeholder?: string
  multiple?: boolean
  checkable?: boolean
  cascade?: boolean
  clearable?: boolean
  filterable?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  defaultExpandAll?: boolean
  maxTagCount?: number
}

const props = withDefaults(defineProps<TreeSelectProps>(), {
  modelValue: undefined,
  placeholder: '请选择',
  multiple: false,
  checkable: false,
  cascade: true,
  clearable: true,
  filterable: true,
  disabled: false,
  size: 'md',
  block: false,
  defaultExpandAll: false,
  maxTagCount: undefined
})

const emit = defineEmits<{
  'update:modelValue': [val: any]
  change: [val: any, node?: TreeOption | TreeOption[]]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

defineSlots<{
  prefix?: () => any
  tag?: (props: { node: TreeOption; index: number; handleClose: (e: MouseEvent) => void }) => any
  header?: () => any
  footer?: () => any
  empty?: () => any
}>()

const isOpen = ref(false)
const treeSelectRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')

function findNodeByKey(key: string | number, list: TreeOption[]): TreeOption | null {
  for (const item of list) {
    if (item.key === key) return item
    if (item.children) {
      const res = findNodeByKey(key, item.children)
      if (res) return res
    }
  }
  return null
}

const selectedNodes = computed<TreeOption[]>(() => {
  if (props.modelValue === undefined || props.modelValue === null) return []
  const keys = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
  const nodes: TreeOption[] = []
  for (const k of keys) {
    const n = findNodeByKey(k, props.options)
    if (n) nodes.push(n)
  }
  return nodes
})

const selectedKeysArray = computed<(string | number)[]>(() => {
  if (props.modelValue === undefined || props.modelValue === null) return []
  return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
})

const displayedNodes = computed(() => {
  if (props.maxTagCount && props.maxTagCount > 0) {
    return selectedNodes.value.slice(0, props.maxTagCount)
  }
  return selectedNodes.value
})

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function handleTreeSelect(keys: (string | number)[], node: TreeOption) {
  if (props.multiple) {
    emit('update:modelValue', keys)
    const nodes = keys.map((k) => findNodeByKey(k, props.options)).filter(Boolean) as TreeOption[]
    emit('change', keys, nodes)
  } else {
    const val = keys[0] ?? ''
    emit('update:modelValue', val)
    emit('change', val, node)
    isOpen.value = false
  }
}

function handleTreeCheck(keys: (string | number)[]) {
  emit('update:modelValue', keys)
  const nodes = keys.map((k) => findNodeByKey(k, props.options)).filter(Boolean) as TreeOption[]
  emit('change', keys, nodes)
}

function removeTag(node: TreeOption, event: MouseEvent) {
  event.stopPropagation()
  if (Array.isArray(props.modelValue)) {
    const updated = props.modelValue.filter((k) => k !== node.key)
    emit('update:modelValue', updated)
    const nodes = updated.map((k) => findNodeByKey(k, props.options)).filter(Boolean) as TreeOption[]
    emit('change', updated, nodes)
  }
}

function handleClear(event: MouseEvent) {
  event.stopPropagation()
  const emptyVal = props.multiple ? [] : ''
  emit('update:modelValue', emptyVal)
  emit('change', emptyVal)
  emit('clear')
}

function handleClickOutside(event: MouseEvent) {
  if (treeSelectRef.value && !treeSelectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div
    ref="treeSelectRef"
    :class="[
      'fy-tree-select',
      `fy-tree-select--${size}`,
      {
        'fy-tree-select--open': isOpen,
        'fy-tree-select--disabled': disabled,
        'fy-tree-select--block': block
      }
    ]"
  >
    <!-- Input Display Box -->
    <div class="fy-tree-select__input-box" @click="toggleDropdown">
      <div v-if="$slots.prefix" class="fy-tree-select__prefix">
        <slot name="prefix" />
      </div>

      <!-- Multi Tags -->
      <div v-if="multiple && selectedNodes.length > 0" class="fy-tree-select__tags">
        <template v-for="(n, idx) in displayedNodes" :key="String(n.key)">
          <slot name="tag" :node="n" :index="idx" :handle-close="(e: MouseEvent) => removeTag(n, e)">
            <Tag
              size="sm"
              theme="blue"
              closable
              @close="removeTag(n, $event)"
            >
              {{ n.label }}
            </Tag>
          </slot>
        </template>
        <Tag
          v-if="maxTagCount && selectedNodes.length > maxTagCount"
          size="sm"
          theme="default"
        >
          +{{ selectedNodes.length - maxTagCount }}
        </Tag>
      </div>

      <!-- Single Label -->
      <span v-else-if="!multiple && selectedNodes.length > 0" class="fy-tree-select__text">
        {{ selectedNodes[0].label }}
      </span>

      <!-- Placeholder -->
      <span v-else class="fy-tree-select__placeholder">
        {{ placeholder }}
      </span>

      <!-- Actions -->
      <button
        v-if="clearable && selectedNodes.length > 0 && !disabled"
        type="button"
        class="fy-tree-select__clear"
        aria-label="清空"
        @click="handleClear"
      >
        <span class="material-symbols-outlined">cancel</span>
      </button>
      <span v-else class="material-symbols-outlined fy-tree-select__arrow">
        expand_more
      </span>
    </div>

    <!-- Dropdown Tree Popover -->
    <transition name="fy-tree-select-fade">
      <div v-if="isOpen" class="fy-tree-select__dropdown" @click.stop>
        <div v-if="$slots.header" class="fy-tree-select__dropdown-header">
          <slot name="header" />
        </div>

        <!-- Search Filter -->
        <div v-if="filterable" class="fy-tree-select__search">
          <input
            v-model="searchQuery"
            placeholder="搜索节点..."
            class="fy-tree-select__search-input"
          />
        </div>

        <!-- Tree Container -->
        <div class="fy-tree-select__tree-wrap">
          <Tree
            :data="options"
            :selected-keys="!checkable ? selectedKeysArray : []"
            :checked-keys="checkable ? selectedKeysArray : []"
            :checkable="checkable"
            :selectable="!checkable"
            :multiple="multiple"
            :cascade="cascade"
            :pattern="searchQuery"
            :default-expand-all="defaultExpandAll"
            @select="handleTreeSelect"
            @check="handleTreeCheck"
          />
        </div>

        <div v-if="$slots.footer" class="fy-tree-select__dropdown-footer">
          <slot name="footer" />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.fy-tree-select {
  position: relative;
  display: inline-flex;
  font-family: inherit;
  user-select: none;

  &--open {
    z-index: 50;
  }

  &--block {
    display: flex;
    width: 100%;
  }

  &__input-box {
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-high) 42%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
    min-height: 40px;
    padding: 4px 12px;
    box-sizing: border-box;
    gap: 6px;
    transition:
      border-color 0.2s var(--fy-ease-soft),
      box-shadow 0.2s var(--fy-ease-soft),
      background 0.2s var(--fy-ease-soft);
  }

  &--open &__input-box {
    border-color: color-mix(in srgb, var(--fy-primary) 55%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--fy-primary) 14%, transparent);
  }

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;

    .fy-tree-select__input-box {
      cursor: not-allowed;
      background: color-mix(in srgb, var(--fy-surface-container-low) 50%, transparent);
    }
  }

  /* Sizes */
  &--sm &__input-box {
    min-height: 32px;
    padding: 2px 8px;
    font-size: var(--fy-font-size-xs);
    border-radius: var(--fy-r-sm);
  }

  &--md &__input-box {
    min-height: 40px;
    padding: 4px 12px;
    font-size: var(--fy-font-size-base);
    border-radius: var(--fy-r-md);
  }

  &--lg &__input-box {
    min-height: 46px;
    padding: 6px 14px;
    font-size: var(--fy-font-size-md);
    border-radius: var(--fy-r-lg);
  }

  &__tags {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__text {
    flex: 1;
    color: var(--fy-on-surface);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__placeholder {
    flex: 1;
    color: var(--fy-outline);
  }

  &__arrow {
    font-size: 20px;
    color: var(--fy-outline);
    transition: transform 0.2s var(--fy-ease-soft);
  }

  &--open &__arrow {
    transform: rotate(180deg);
  }

  &__clear {
    border: none;
    background: none;
    color: var(--fy-outline);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      color: var(--fy-on-surface);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }

  /* Dropdown Popover */
  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 150;
    min-width: 220px;
    padding: 8px;
    border-radius: var(--fy-r-lg);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--fy-glass-border);
    box-shadow: var(--fy-shadow-pop), inset 0 1px 0 var(--fy-glass-hi);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__prefix {
    display: inline-flex;
    align-items: center;
  }

  &__search {
    padding: 4px 6px;
  }

  &__search-input {
    width: 100%;
    height: 30px;
    padding: 0 8px;
    border-radius: var(--fy-r-sm);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
    background: color-mix(in srgb, var(--fy-surface-container-high) 50%, transparent);
    color: var(--fy-on-surface);
    font: inherit;
    font-size: var(--fy-font-size-xs);
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: var(--fy-primary);
    }
  }

  &__tree-wrap {
    max-height: 240px;
    overflow-y: auto;
    padding: 4px 2px;
  }

  &__dropdown-header {
    padding: 4px 8px;
    font-size: var(--fy-font-size-xs);
    border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
  }

  &__dropdown-footer {
    padding: 4px 8px;
    font-size: var(--fy-font-size-xs);
    border-top: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
  }
}

.fy-tree-select-fade-enter-active,
.fy-tree-select-fade-leave-active {
  transition: opacity 0.18s var(--fy-ease-soft), transform 0.18s var(--fy-ease-out);
}
.fy-tree-select-fade-enter-from,
.fy-tree-select-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
</style>
