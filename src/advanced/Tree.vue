<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Checkbox from '../form/Checkbox.vue'

export interface TreeOption {
  key: string | number
  label: string
  children?: TreeOption[]
  disabled?: boolean
  icon?: string
  prefixIcon?: string
  suffixIcon?: string
}

export interface TreeProps {
  data: TreeOption[]
  checkedKeys?: (string | number)[]
  selectedKeys?: (string | number)[]
  expandedKeys?: (string | number)[]
  defaultExpandAll?: boolean
  checkable?: boolean
  selectable?: boolean
  multiple?: boolean
  cascade?: boolean
  pattern?: string
  blockNode?: boolean
  showLine?: boolean
}

const props = withDefaults(defineProps<TreeProps>(), {
  checkedKeys: () => [],
  selectedKeys: () => [],
  expandedKeys: () => [],
  defaultExpandAll: false,
  checkable: false,
  selectable: true,
  multiple: false,
  cascade: true,
  pattern: '',
  blockNode: true,
  showLine: true
})

const emit = defineEmits<{
  'update:checkedKeys': [keys: (string | number)[]]
  'update:selectedKeys': [keys: (string | number)[]]
  'update:expandedKeys': [keys: (string | number)[]]
  nodeClick: [node: TreeOption]
  check: [keys: (string | number)[], node: TreeOption]
  select: [keys: (string | number)[], node: TreeOption]
  expand: [keys: (string | number)[], node: TreeOption, expanded: boolean]
}>()

defineSlots<{
  label?: (props: { node: TreeOption }) => any
  prefix?: (props: { node: TreeOption }) => any
  suffix?: (props: { node: TreeOption }) => any
}>()

function collectAllExpandableKeys(nodes: TreeOption[]): (string | number)[] {
  const keys: (string | number)[] = []
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      keys.push(node.key)
      keys.push(...collectAllExpandableKeys(node.children))
    }
  }
  return keys
}

const innerExpandedKeys = ref<(string | number)[]>([...props.expandedKeys])

onMounted(() => {
  if (props.defaultExpandAll && props.expandedKeys.length === 0) {
    innerExpandedKeys.value = collectAllExpandableKeys(props.data)
    emit('update:expandedKeys', [...innerExpandedKeys.value])
  }
})

watch(
  () => props.expandedKeys,
  (val) => {
    innerExpandedKeys.value = [...val]
  }
)

function isNodeExpanded(node: TreeOption): boolean {
  if (props.pattern.trim()) return true
  return innerExpandedKeys.value.includes(node.key)
}

function toggleExpand(node: TreeOption) {
  const idx = innerExpandedKeys.value.indexOf(node.key)
  let isExpanding = false
  if (idx > -1) {
    innerExpandedKeys.value.splice(idx, 1)
  } else {
    innerExpandedKeys.value.push(node.key)
    isExpanding = true
  }
  emit('update:expandedKeys', [...innerExpandedKeys.value])
  emit('expand', [...innerExpandedKeys.value], node, isExpanding)
}

function isNodeSelected(node: TreeOption): boolean {
  return props.selectedKeys.includes(node.key)
}

function isNodeChecked(node: TreeOption): boolean {
  return props.checkedKeys.includes(node.key)
}

function handleSelect(node: TreeOption) {
  if (node.disabled || !props.selectable) return
  emit('nodeClick', node)
  if (props.multiple) {
    const current = [...props.selectedKeys]
    const idx = current.indexOf(node.key)
    if (idx > -1) {
      current.splice(idx, 1)
    } else {
      current.push(node.key)
    }
    emit('update:selectedKeys', current)
    emit('select', current, node)
  } else {
    const next = isNodeSelected(node) ? [] : [node.key]
    emit('update:selectedKeys', next)
    emit('select', next, node)
  }
}

function getAllDescendantKeys(node: TreeOption): (string | number)[] {
  const keys: (string | number)[] = [node.key]
  if (node.children) {
    for (const child of node.children) {
      keys.push(...getAllDescendantKeys(child))
    }
  }
  return keys
}

function handleCheck(node: TreeOption) {
  if (node.disabled || !props.checkable) return
  const isChecked = isNodeChecked(node)
  let nextChecked = [...props.checkedKeys]

  if (props.cascade) {
    const targetKeys = getAllDescendantKeys(node)
    if (isChecked) {
      const targetSet = new Set(targetKeys)
      nextChecked = nextChecked.filter((k) => !targetSet.has(k))
    } else {
      nextChecked = Array.from(new Set([...nextChecked, ...targetKeys]))
    }
  } else {
    const idx = nextChecked.indexOf(node.key)
    if (idx > -1) {
      nextChecked.splice(idx, 1)
    } else {
      nextChecked.push(node.key)
    }
  }

  emit('update:checkedKeys', nextChecked)
  emit('check', nextChecked, node)
}

function filterNode(node: TreeOption): boolean {
  if (!props.pattern.trim()) return true
  const q = props.pattern.trim().toLowerCase()
  if (node.label.toLowerCase().includes(q)) return true
  if (node.children) {
    return node.children.some((c) => filterNode(c))
  }
  return false
}
</script>

<template>
  <div :class="['ui-tree', { 'is-block-node': blockNode, 'has-line': showLine }]">
    <ul class="ui-tree__root">
      <template v-for="node in data" :key="String(node.key)">
        <li v-if="filterNode(node)" class="ui-tree__node">
          <!-- Node Row -->
          <div
            :class="[
              'ui-tree__node-content',
              {
                'is-selected': isNodeSelected(node),
                'is-disabled': node.disabled
              }
            ]"
            @click="handleSelect(node)"
          >
            <!-- Expand Arrow / Spacer -->
            <span
              v-if="node.children && node.children.length > 0"
              class="material-symbols-outlined ui-tree__arrow"
              :class="{ 'is-expanded': isNodeExpanded(node) }"
              @click.stop="toggleExpand(node)"
            >
              arrow_right
            </span>
            <span v-else class="ui-tree__arrow-spacer" />

            <!-- Checkbox -->
            <Checkbox
              v-if="checkable"
              :model-value="isNodeChecked(node)"
              :disabled="node.disabled"
              @click.stop="handleCheck(node)"
            />

            <!-- Custom Prefix Icon / Slot -->
            <slot name="prefix" :node="node">
              <span v-if="node.prefixIcon || node.icon" class="material-symbols-outlined ui-tree__node-icon">
                {{ node.prefixIcon || node.icon }}
              </span>
            </slot>

            <!-- Label -->
            <span class="ui-tree__node-label">
              <slot name="label" :node="node">{{ node.label }}</slot>
            </span>

            <!-- Custom Suffix Icon / Slot -->
            <slot name="suffix" :node="node">
              <span v-if="node.suffixIcon" class="material-symbols-outlined ui-tree__suffix-icon">
                {{ node.suffixIcon }}
              </span>
            </slot>
          </div>

          <!-- Nested Children -->
          <transition name="ui-tree-expand">
            <div v-if="node.children && node.children.length > 0 && isNodeExpanded(node)" class="ui-tree__children">
              <Tree
                :data="node.children"
                :checked-keys="checkedKeys"
                :selected-keys="selectedKeys"
                :expanded-keys="expandedKeys"
                :checkable="checkable"
                :selectable="selectable"
                :multiple="multiple"
                :cascade="cascade"
                :pattern="pattern"
                :block-node="blockNode"
                :show-line="showLine"
                @update:checked-keys="emit('update:checkedKeys', $event)"
                @update:selected-keys="emit('update:selectedKeys', $event)"
                @update:expanded-keys="emit('update:expandedKeys', $event)"
                @node-click="emit('nodeClick', $event)"
                @check="(keys, n) => emit('check', keys, n)"
                @select="(keys, n) => emit('select', keys, n)"
                @expand="(keys, n, exp) => emit('expand', keys, n, exp)"
              >
                <template v-if="$slots.label" #label="{ node: childNode }">
                  <slot name="label" :node="childNode" />
                </template>
                <template v-if="$slots.prefix" #prefix="{ node: childNode }">
                  <slot name="prefix" :node="childNode" />
                </template>
                <template v-if="$slots.suffix" #suffix="{ node: childNode }">
                  <slot name="suffix" :node="childNode" />
                </template>
              </Tree>
            </div>
          </transition>
        </li>
      </template>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.ui-tree {
  display: flex;
  flex-direction: column;
  width: 100%;
  user-select: none;
  font-size: var(--font-size-sm);
  color: var(--on-surface);

  &__root {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__node {
    display: flex;
    flex-direction: column;
  }

  &__node-content {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover:not(.is-disabled) {
      background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
    }

    &.is-selected {
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary);
      font-weight: 700;
    }

    &.is-disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__arrow {
    font-size: 20px;
    color: var(--outline);
    transition: transform 0.2s var(--ease-soft);
    cursor: pointer;
    flex-shrink: 0;

    &.is-expanded {
      transform: rotate(90deg);
    }
  }

  &__arrow-spacer {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  &__node-icon {
    font-size: 18px;
    color: inherit;
    flex-shrink: 0;
  }

  &__node-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
  }

  &__suffix-icon {
    font-size: 16px;
    color: var(--outline);
  }

  &__children {
    padding-left: 20px;
    position: relative;
    margin-left: 10px;
  }

  &.has-line &__children {
    border-left: 1px dashed color-mix(in srgb, var(--outline-variant) 35%, transparent);
  }
}

.ui-tree-expand-enter-active,
.ui-tree-expand-leave-active {
  transition: opacity 0.18s var(--ease-soft), transform 0.18s var(--ease-out);
}
.ui-tree-expand-enter-from,
.ui-tree-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
