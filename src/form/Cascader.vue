<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

export interface CascaderOption {
  label: string
  value: string | number
  children?: CascaderOption[]
  disabled?: boolean
  icon?: string
}

interface Props {
  modelValue?: (string | number)[]
  options: CascaderOption[]
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  separator?: string
  checkStrictly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: '请选择',
  clearable: true,
  disabled: false,
  size: 'md',
  checkStrictly: false,
  block: false,
  separator: ' / '
})

const emit = defineEmits<{
  'update:modelValue': [val: (string | number)[]]
  change: [val: (string | number)[], selectedOptions: CascaderOption[]]
  clear: []
}>()

const isOpen = ref(false)
const cascaderRef = ref<HTMLElement | null>(null)
const formItem = inject<FormItemContext | null>('fy-form-item', null)

// Active selected path in current menu navigation
const activePath = ref<CascaderOption[]>([])

const displayLabels = computed(() => {
  if (!props.modelValue || props.modelValue.length === 0) return ''
  const labels: string[] = []
  let currentLevel = props.options

  for (const val of props.modelValue) {
    const match = currentLevel.find((o) => o.value === val)
    if (match) {
      labels.push(match.label)
      currentLevel = match.children || []
    } else {
      labels.push(String(val))
    }
  }
  return labels.join(props.separator)
})

// Compute columns to display in popover
const menuColumns = computed<CascaderOption[][]>(() => {
  const cols: CascaderOption[][] = [props.options]
  let currentChildren: CascaderOption[] | undefined = props.options

  for (let i = 0; i < activePath.value.length; i++) {
    const selected = activePath.value[i]
    if (selected && selected.children && selected.children.length > 0) {
      cols.push(selected.children)
    }
  }

  return cols
})

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    // Init active path from modelValue
    initActivePath()
  }
}

function initActivePath() {
  const path: CascaderOption[] = []
  let currentLevel = props.options

  for (const val of props.modelValue) {
    const match = currentLevel.find((o) => o.value === val)
    if (match) {
      path.push(match)
      currentLevel = match.children || []
    }
  }
  activePath.value = path
}

function handleSelectOption(opt: CascaderOption, colIndex: number) {
  if (opt.disabled) return

  // Truncate path up to colIndex and append opt
  const newPath = activePath.value.slice(0, colIndex)
  newPath.push(opt)
  activePath.value = newPath

  if (props.checkStrictly) {
    const vals = newPath.map((o) => o.value)
    emit('update:modelValue', vals)
    emit('change', vals, newPath)
    formItem?.validate('change')
  }

  // If leaf node (no children), finish selection
  if (!opt.children || opt.children.length === 0) {
    const vals = newPath.map((o) => o.value)
    emit('update:modelValue', vals)
    emit('change', vals, newPath)
    formItem?.validate('change')
    isOpen.value = false
  }
}

function handleClear(event: MouseEvent) {
  event.stopPropagation()
  emit('update:modelValue', [])
  emit('change', [], [])
  emit('clear')
  formItem?.validate('change')
  activePath.value = []
}

function handleClickOutside(event: MouseEvent) {
  if (cascaderRef.value && !cascaderRef.value.contains(event.target as Node)) {
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
    ref="cascaderRef"
    :class="[
      'fy-cascader',
      `fy-cascader--${size}`,
      {
        'fy-cascader--open': isOpen,
        'fy-cascader--disabled': disabled,
        'fy-cascader--block': block
      }
    ]"
  >
    <div class="fy-cascader__input-box" @click="toggleDropdown">
      <span v-if="displayLabels" class="fy-cascader__text">
        {{ displayLabels }}
      </span>
      <span v-else class="fy-cascader__placeholder">
        {{ placeholder }}
      </span>

      <button
        v-if="clearable && displayLabels && !disabled"
        type="button"
        class="fy-cascader__clear"
        aria-label="清空"
        @click.stop="handleClear"
      >
        <span class="material-symbols-outlined">cancel</span>
      </button>
      <span v-else class="material-symbols-outlined fy-cascader__arrow">
        expand_more
      </span>
    </div>

    <!-- Cascading Multi-Column Popover -->
    <transition name="fy-cascader-fade">
      <div v-if="isOpen" class="fy-cascader__dropdown" @click.stop>
        <div class="fy-cascader__columns">
          <div
            v-for="(col, colIdx) in menuColumns"
            :key="colIdx"
            class="fy-cascader__col"
          >
            <button
              v-for="opt in col"
              :key="String(opt.value)"
              type="button"
              :class="[
                'fy-cascader__item',
                {
                  'is-active': activePath[colIdx]?.value === opt.value,
                  'is-disabled': opt.disabled
                }
              ]"
              :disabled="opt.disabled"
              @click="handleSelectOption(opt, colIdx)"
            >
              <span v-if="opt.icon" class="material-symbols-outlined fy-cascader__item-icon">
                {{ opt.icon }}
              </span>
              <span class="fy-cascader__item-label">{{ opt.label }}</span>
              <span
                v-if="opt.children && opt.children.length > 0"
                class="material-symbols-outlined fy-cascader__item-arrow"
              >
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.fy-cascader {
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

    .fy-cascader__input-box {
      cursor: not-allowed;
      background: color-mix(in srgb, var(--fy-surface-container-low) 50%, transparent);
    }
  }

  /* Sizes */
  &--sm &__input-box {
    height: 32px;
    padding: 0 10px;
    font-size: var(--fy-font-size-xs);
    border-radius: var(--fy-r-sm);
  }

  &--md &__input-box {
    height: 40px;
    padding: 0 14px;
    font-size: var(--fy-font-size-base);
    border-radius: var(--fy-r-md);
  }

  &--lg &__input-box {
    height: 46px;
    padding: 0 16px;
    font-size: var(--fy-font-size-md);
    border-radius: var(--fy-r-lg);
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
    margin-left: 6px;
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
    margin-left: 6px;
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

  /* Cascader Popover */
  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 150;
    border-radius: var(--fy-r-lg);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--fy-glass-border);
    box-shadow: var(--fy-shadow-pop), inset 0 1px 0 var(--fy-glass-hi);
    overflow: hidden;
  }

  &__columns {
    display: flex;
    max-height: 240px;
  }

  &__col {
    width: 160px;
    overflow-y: auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-right: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);

    &:last-child {
      border-right: none;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--fy-r-sm);
    border: none;
    background: transparent;
    color: var(--fy-on-surface);
    font-size: var(--fy-font-size-sm);
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover:not(.is-disabled) {
      background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
    }

    &.is-active {
      color: var(--fy-primary);
      background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
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

  &__item-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__item-arrow {
    font-size: 18px;
    color: var(--fy-outline);
  }
}

.fy-cascader-fade-enter-active,
.fy-cascader-fade-leave-active {
  transition: opacity 0.18s var(--fy-ease-soft), transform 0.18s var(--fy-ease-out);
}
.fy-cascader-fade-enter-from,
.fy-cascader-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
