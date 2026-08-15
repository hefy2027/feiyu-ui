<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '../button/Button.vue'
import Input from '../form/Input.vue'
import Checkbox from '../form/Checkbox.vue'
import Empty from '../display/Empty.vue'

export interface TransferOption {
  label: string
  value: string | number
  disabled?: boolean
  description?: string
  icon?: string
}

export interface TransferProps {
  modelValue?: (string | number)[]
  options: TransferOption[]
  titles?: [string, string]
  sourceTitle?: string
  targetTitle?: string
  filterable?: boolean
  filterPlaceholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<TransferProps>(), {
  modelValue: () => [],
  titles: () => ['源列表', '目标列表'],
  sourceTitle: undefined,
  targetTitle: undefined,
  filterable: true,
  filterPlaceholder: '搜索选项...',
  size: 'md',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  change: [value: (string | number)[], direction: 'left' | 'right', movedKeys: (string | number)[]]
}>()

defineSlots<{
  'left-header'?: () => any
  'right-header'?: () => any
  'left-item'?: (props: { item: TransferOption; checked: boolean; disabled: boolean }) => any
  'right-item'?: (props: { item: TransferOption; checked: boolean; disabled: boolean }) => any
  item?: (props: { item: TransferOption; checked: boolean; disabled: boolean; direction: 'left' | 'right' }) => any
  'left-empty'?: () => any
  'right-empty'?: () => any
}>()

const effectiveTitles = computed<[string, string]>(() => {
  return [
    props.sourceTitle ?? props.titles[0] ?? '源列表',
    props.targetTitle ?? props.titles[1] ?? '目标列表'
  ]
})

const leftSearch = ref('')
const rightSearch = ref('')

const leftChecked = ref<(string | number)[]>([])
const rightChecked = ref<(string | number)[]>([])

const targetValueSet = computed(() => new Set(props.modelValue))

const leftList = computed(() => {
  return props.options.filter((opt) => !targetValueSet.value.has(opt.value))
})

const rightList = computed(() => {
  return props.options.filter((opt) => targetValueSet.value.has(opt.value))
})

const filteredLeftList = computed(() => {
  if (!leftSearch.value.trim()) return leftList.value
  const q = leftSearch.value.trim().toLowerCase()
  return leftList.value.filter((opt) => opt.label.toLowerCase().includes(q))
})

const filteredRightList = computed(() => {
  if (!rightSearch.value.trim()) return rightList.value
  const q = rightSearch.value.trim().toLowerCase()
  return rightList.value.filter((opt) => opt.label.toLowerCase().includes(q))
})

const isLeftAllChecked = computed(() => {
  const enabledLeft = filteredLeftList.value.filter((o) => !o.disabled)
  if (enabledLeft.length === 0) return false
  return enabledLeft.every((o) => leftChecked.value.includes(o.value))
})

const isRightAllChecked = computed(() => {
  const enabledRight = filteredRightList.value.filter((o) => !o.disabled)
  if (enabledRight.length === 0) return false
  return enabledRight.every((o) => rightChecked.value.includes(o.value))
})

const isLeftIndeterminate = computed(() => {
  if (isLeftAllChecked.value || filteredLeftList.value.length === 0 || leftChecked.value.length === 0) return false
  return filteredLeftList.value.some((o) => leftChecked.value.includes(o.value))
})

const isRightIndeterminate = computed(() => {
  if (isRightAllChecked.value || filteredRightList.value.length === 0 || rightChecked.value.length === 0) return false
  return filteredRightList.value.some((o) => rightChecked.value.includes(o.value))
})

function handleToggleLeftAll() {
  if (isLeftAllChecked.value) {
    const filteredKeys = new Set(filteredLeftList.value.map((o) => o.value))
    leftChecked.value = leftChecked.value.filter((k) => !filteredKeys.has(k))
  } else {
    const enabledKeys = filteredLeftList.value.filter((o) => !o.disabled).map((o) => o.value)
    leftChecked.value = Array.from(new Set([...leftChecked.value, ...enabledKeys]))
  }
}

function handleToggleRightAll() {
  if (isRightAllChecked.value) {
    const filteredKeys = new Set(filteredRightList.value.map((o) => o.value))
    rightChecked.value = rightChecked.value.filter((k) => !filteredKeys.has(k))
  } else {
    const enabledKeys = filteredRightList.value.filter((o) => !o.disabled).map((o) => o.value)
    rightChecked.value = Array.from(new Set([...rightChecked.value, ...enabledKeys]))
  }
}

function moveToRight() {
  if (props.disabled || leftChecked.value.length === 0) return
  const newTargetValues = Array.from(new Set([...props.modelValue, ...leftChecked.value]))
  const moved = [...leftChecked.value]
  leftChecked.value = []
  emit('update:modelValue', newTargetValues)
  emit('change', newTargetValues, 'right', moved)
}

function moveToLeft() {
  if (props.disabled || rightChecked.value.length === 0) return
  const rightCheckedSet = new Set(rightChecked.value)
  const newTargetValues = props.modelValue.filter((val) => !rightCheckedSet.has(val))
  const moved = [...rightChecked.value]
  rightChecked.value = []
  emit('update:modelValue', newTargetValues)
  emit('change', newTargetValues, 'left', moved)
}

function toggleLeftItem(item: TransferOption) {
  if (item.disabled || props.disabled) return
  const idx = leftChecked.value.indexOf(item.value)
  if (idx > -1) {
    leftChecked.value.splice(idx, 1)
  } else {
    leftChecked.value.push(item.value)
  }
}

function toggleRightItem(item: TransferOption) {
  if (item.disabled || props.disabled) return
  const idx = rightChecked.value.indexOf(item.value)
  if (idx > -1) {
    rightChecked.value.splice(idx, 1)
  } else {
    rightChecked.value.push(item.value)
  }
}
</script>

<template>
  <div :class="['fy-transfer', `fy-transfer--${size}`, { 'fy-transfer--disabled': disabled }]">
    <!-- Left Source Panel -->
    <div class="fy-transfer__panel">
      <div class="fy-transfer__header">
        <slot name="left-header">
          <div class="fy-transfer__header-left" @click="handleToggleLeftAll">
            <Checkbox
              :model-value="isLeftAllChecked"
              :indeterminate="isLeftIndeterminate"
              :disabled="disabled || filteredLeftList.length === 0"
            />
            <span class="fy-transfer__title">{{ effectiveTitles[0] }}</span>
          </div>
        </slot>
        <span class="fy-transfer__count">{{ leftChecked.length }} / {{ filteredLeftList.length }}</span>
      </div>

      <div v-if="filterable" class="fy-transfer__filter">
        <Input
          v-model="leftSearch"
          size="sm"
          prefix-icon="search"
          :placeholder="filterPlaceholder"
          clearable
          block
        />
      </div>

      <div class="fy-transfer__list">
        <template v-if="filteredLeftList.length > 0">
          <div
            v-for="item in filteredLeftList"
            :key="String(item.value)"
            :class="[
              'fy-transfer__item',
              {
                'is-checked': leftChecked.includes(item.value),
                'is-disabled': item.disabled || disabled
              }
            ]"
            @click="toggleLeftItem(item)"
          >
            <slot name="left-item" :item="item" :checked="leftChecked.includes(item.value)" :disabled="item.disabled || disabled">
              <slot name="item" :item="item" :checked="leftChecked.includes(item.value)" :disabled="item.disabled || disabled" direction="left">
                <Checkbox :model-value="leftChecked.includes(item.value)" :disabled="item.disabled || disabled" />
                <span v-if="item.icon" class="material-symbols-outlined fy-transfer__item-icon">{{ item.icon }}</span>
                <div class="fy-transfer__item-label-wrap">
                  <span class="fy-transfer__item-label">{{ item.label }}</span>
                  <span v-if="item.description" class="fy-transfer__item-desc">{{ item.description }}</span>
                </div>
              </slot>
            </slot>
          </div>
        </template>
        <slot v-else name="left-empty">
          <Empty size="sm" description="无匹配项" />
        </slot>
      </div>
    </div>

    <!-- Middle Action Buttons -->
    <div class="fy-transfer__actions">
      <Button
        variant="primary"
        size="sm"
        :disabled="disabled || leftChecked.length === 0"
        @click="moveToRight"
      >
        <span class="material-symbols-outlined">chevron_right</span>
      </Button>
      <Button
        variant="primary"
        size="sm"
        :disabled="disabled || rightChecked.length === 0"
        @click="moveToLeft"
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </Button>
    </div>

    <!-- Right Target Panel -->
    <div class="fy-transfer__panel">
      <div class="fy-transfer__header">
        <slot name="right-header">
          <div class="fy-transfer__header-left" @click="handleToggleRightAll">
            <Checkbox
              :model-value="isRightAllChecked"
              :indeterminate="isRightIndeterminate"
              :disabled="disabled || filteredRightList.length === 0"
            />
            <span class="fy-transfer__title">{{ effectiveTitles[1] }}</span>
          </div>
        </slot>
        <span class="fy-transfer__count">{{ rightChecked.length }} / {{ filteredRightList.length }}</span>
      </div>

      <div v-if="filterable" class="fy-transfer__filter">
        <Input
          v-model="rightSearch"
          size="sm"
          prefix-icon="search"
          :placeholder="filterPlaceholder"
          clearable
          block
        />
      </div>

      <div class="fy-transfer__list">
        <template v-if="filteredRightList.length > 0">
          <div
            v-for="item in filteredRightList"
            :key="String(item.value)"
            :class="[
              'fy-transfer__item',
              {
                'is-checked': rightChecked.includes(item.value),
                'is-disabled': item.disabled || disabled
              }
            ]"
            @click="toggleRightItem(item)"
          >
            <slot name="right-item" :item="item" :checked="rightChecked.includes(item.value)" :disabled="item.disabled || disabled">
              <slot name="item" :item="item" :checked="rightChecked.includes(item.value)" :disabled="item.disabled || disabled" direction="right">
                <Checkbox :model-value="rightChecked.includes(item.value)" :disabled="item.disabled || disabled" />
                <span v-if="item.icon" class="material-symbols-outlined fy-transfer__item-icon">{{ item.icon }}</span>
                <div class="fy-transfer__item-label-wrap">
                  <span class="fy-transfer__item-label">{{ item.label }}</span>
                  <span v-if="item.description" class="fy-transfer__item-desc">{{ item.description }}</span>
                </div>
              </slot>
            </slot>
          </div>
        </template>
        <slot v-else name="right-empty">
          <Empty size="sm" description="暂无选中项" />
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-transfer {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  user-select: none;
  box-sizing: border-box;

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &__panel {
    width: 220px;
    height: 300px;
    display: flex;
    flex-direction: column;
    border-radius: var(--fy-r-lg);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 82%, transparent);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border: 1px solid var(--fy-glass-border);
    box-shadow: var(--fy-shadow-sm), inset 0 1px 0 var(--fy-glass-hi);
    overflow: hidden;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
    background: color-mix(in srgb, var(--fy-surface-container-high) 35%, transparent);
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  &__title {
    font-size: var(--fy-font-size-sm);
    font-weight: 700;
    color: var(--fy-on-surface);
  }

  &__count {
    font-size: var(--fy-font-size-xs);
    font-weight: 600;
    color: var(--fy-outline);
  }

  &__filter {
    padding: 8px 10px;
    border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 20%, transparent);
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: var(--fy-r-sm);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover:not(.is-disabled) {
      background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
    }

    &.is-checked {
      color: var(--fy-primary);
      font-weight: 700;
    }

    &.is-disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__item-icon {
    font-size: 18px;
    color: inherit;
  }

  &__item-label-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__item-label {
    font-size: var(--fy-font-size-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__item-desc {
    font-size: 11px;
    color: var(--fy-outline);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;

    &__panel {
      width: 100%;
    }

    &__actions {
      flex-direction: row;
      justify-content: center;
    }
  }
}
</style>
