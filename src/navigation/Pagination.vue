<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Props {
  page?: number
  currentPage?: number
  pageSize?: number | string
  total: number
  pageSizes?: (number | string)[]
  showTotal?: boolean
  showSizePicker?: boolean
  showQuickJumper?: boolean
  disabled?: boolean
  simple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  page: undefined,
  currentPage: undefined,
  pageSize: 10,
  pageSizes: () => [5, 8, 10, 20, 50, 'all'],
  showTotal: true,
  showSizePicker: true,
  showQuickJumper: false,
  disabled: false,
  simple: false
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:currentPage': [currentPage: number]
  'update:pageSize': [pageSize: number | string]
  change: [page: number, pageSize: number | string]
}>()

const effectivePage = computed(() => {
  return props.page ?? props.currentPage ?? 1
})

const numericPageSize = computed(() => {
  if (props.pageSize === 'all') return Math.max(1, props.total)
  const num = Number(props.pageSize)
  return Number.isFinite(num) && num > 0 ? num : 10
})

const totalPages = computed(() => {
  if (props.pageSize === 'all') return 1
  return Math.max(1, Math.ceil(props.total / numericPageSize.value))
})

const shownFrom = computed(() => {
  if (!props.total) return 0
  return Math.min(props.total, (effectivePage.value - 1) * numericPageSize.value + 1)
})

const shownTo = computed(() => {
  if (props.pageSize === 'all') return props.total
  return Math.min(effectivePage.value * numericPageSize.value, props.total)
})

const pageList = computed<(number | 'prev-more' | 'next-more')[]>(() => {
  const count = totalPages.value
  const current = effectivePage.value
  if (count <= 7) {
    return Array.from({ length: count }, (_, i) => i + 1)
  }
  const pages: (number | 'prev-more' | 'next-more')[] = [1]
  if (current > 4) {
    pages.push('prev-more')
  }
  const start = Math.max(2, current - 1)
  const end = Math.min(count - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  if (current < count - 3) {
    pages.push('next-more')
  }
  pages.push(count)
  return pages
})

function goto(p: number) {
  if (props.disabled) return
  const target = Math.min(Math.max(1, p), totalPages.value)
  if (target !== effectivePage.value) {
    emit('update:page', target)
    emit('update:currentPage', target)
    emit('change', target, props.pageSize)
  }
}

// Custom size picker state
const isSizePickerOpen = ref(false)
const sizePickerRef = ref<HTMLElement | null>(null)

function toggleSizePicker() {
  if (props.disabled) return
  isSizePickerOpen.value = !isSizePickerOpen.value
}

function isSizeSelected(s: number | string): boolean {
  if (props.pageSize === 'all' && s === 'all') return true
  if (props.pageSize === s) return true
  if (typeof props.pageSize === 'number' && typeof s === 'number') {
    return props.pageSize === s
  }
  return String(props.pageSize) === String(s)
}

function handleSizeSelect(s: number | string) {
  if (props.disabled) return
  isSizePickerOpen.value = false
  const newSize = s === 'all' ? 'all' : Number(s)
  emit('update:pageSize', newSize)
  emit('update:page', 1)
  emit('update:currentPage', 1)
  emit('change', 1, newSize)
}

const currentSizeLabel = computed(() => {
  if (props.pageSize === 'all') return '全部'
  return `${props.pageSize} 条/页`
})

function handleClickOutside(e: MouseEvent) {
  if (sizePickerRef.value && !sizePickerRef.value.contains(e.target as Node)) {
    isSizePickerOpen.value = false
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
    v-if="total > 0"
    :class="['ui-pagination', { 'is-disabled': disabled, 'is-simple': simple }]"
  >
    <div v-if="showTotal" class="ui-pagination__info">
      <slot name="total" :total="total" :from="shownFrom" :to="shownTo">
        显示 {{ shownFrom }}–{{ shownTo }}，共 {{ total }} 条
      </slot>
    </div>

    <div class="ui-pagination__controls">
      <button
        type="button"
        class="ui-pagination__btn"
        :disabled="disabled || effectivePage <= 1"
        aria-label="上一页"
        @click="goto(effectivePage - 1)"
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </button>

      <template v-if="!simple">
        <template v-for="(item, idx) in pageList" :key="idx">
          <button
            v-if="item === 'prev-more' || item === 'next-more'"
            type="button"
            class="ui-pagination__more-btn"
            :disabled="disabled"
            :aria-label="item === 'prev-more' ? '向前 5 页' : '向后 5 页'"
            @click="goto(item === 'prev-more' ? effectivePage - 5 : effectivePage + 5)"
          >
            <span class="ui-pagination__more-dots">•••</span>
            <span class="material-symbols-outlined ui-pagination__more-arrow">
              {{ item === 'prev-more' ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right' }}
            </span>
          </button>
          <button
            v-else
            type="button"
            :class="['ui-pagination__page', { 'is-active': item === effectivePage }]"
            :disabled="disabled"
            :aria-label="`第 ${item} 页`"
            @click="goto(item)"
          >
            {{ item }}
          </button>
        </template>
      </template>
      <template v-else>
        <span class="ui-pagination__simple-text">
          {{ effectivePage }} / {{ totalPages }}
        </span>
      </template>

      <button
        type="button"
        class="ui-pagination__btn"
        :disabled="disabled || effectivePage >= totalPages"
        aria-label="下一页"
        @click="goto(effectivePage + 1)"
      >
        <span class="material-symbols-outlined">chevron_right</span>
      </button>

      <!-- Modern Custom Glass Size Picker -->
      <div
        v-if="showSizePicker && pageSizes && pageSizes.length"
        ref="sizePickerRef"
        class="ui-pagination__size-picker"
      >
        <span class="ui-pagination__size-prefix">每页</span>
        <button
          type="button"
          class="ui-pagination__size-trigger"
          :class="{ 'is-open': isSizePickerOpen, 'is-disabled': disabled }"
          :disabled="disabled"
          @click.stop="toggleSizePicker"
        >
          <span class="ui-pagination__size-val">{{ currentSizeLabel }}</span>
          <span class="material-symbols-outlined ui-pagination__size-arrow">expand_more</span>
        </button>

        <transition name="ui-pagination-dropdown-fade">
          <div v-if="isSizePickerOpen" class="ui-pagination__size-menu" @click.stop>
            <div
              v-for="s in pageSizes"
              :key="String(s)"
              :class="['ui-pagination__size-option', { 'is-selected': isSizeSelected(s) }]"
              @click="handleSizeSelect(s)"
            >
              <span>{{ s === 'all' ? '全部' : `${s} 条/页` }}</span>
              <span v-if="isSizeSelected(s)" class="material-symbols-outlined ui-pagination__size-check">
                check
              </span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 18px;
  font-size: var(--font-size-sm);

  &__info {
    color: var(--on-surface-variant);
    font-weight: 500;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
  }

  &__btn,
  &__page {
    min-width: 32px;
    height: 32px;
    border-radius: var(--r-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: var(--on-surface-variant);
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
      color: var(--on-surface);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }

  &__page.is-active {
    background: var(--primary);
    color: var(--on-primary);
    box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--primary) 70%, transparent);
  }

  &__more-btn {
    min-width: 32px;
    height: 32px;
    border-radius: var(--r-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: var(--on-surface-variant);
    cursor: pointer;
    position: relative;
    transition: background 0.15s ease, color 0.15s ease;

    .ui-pagination__more-dots {
      letter-spacing: 1px;
      font-size: 11px;
      font-weight: bold;
    }

    .ui-pagination__more-arrow {
      display: none;
      font-size: 18px;
      color: var(--primary);
    }

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
      .ui-pagination__more-dots {
        display: none;
      }
      .ui-pagination__more-arrow {
        display: block;
      }
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  &__size-picker {
    position: relative;
    margin-left: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--outline);
    font-weight: 600;
  }

  &__size-prefix {
    font-size: var(--font-size-xs);
    color: var(--outline);
    user-select: none;
  }

  &__size-trigger {
    height: 32px;
    padding: 0 8px 0 10px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: var(--r-sm);
    background: color-mix(in srgb, var(--surface-container-high) 45%, transparent);
    border: 1px solid color-mix(in srgb, var(--outline-variant) 40%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: var(--on-surface);
    font-size: var(--font-size-xs);
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

    &:hover:not(:disabled) {
      border-color: color-mix(in srgb, var(--primary) 50%, transparent);
      background: color-mix(in srgb, var(--surface-container-high) 65%, transparent);
    }

    &.is-open {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent);

      .ui-pagination__size-arrow {
        transform: rotate(180deg);
        color: var(--primary);
      }
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__size-arrow {
    font-size: 16px;
    color: var(--outline);
    transition: transform 0.2s ease, color 0.2s ease;
  }

  &__size-menu {
    position: absolute;
    bottom: calc(100% + 6px);
    right: 0;
    min-width: 104px;
    z-index: 100;
    padding: 5px;
    border-radius: var(--r-md);
    background: color-mix(in srgb, var(--surface-container-lowest) 94%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-hi);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__size-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-radius: var(--r-sm);
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: var(--on-surface);
    cursor: pointer;
    user-select: none;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
    }

    &.is-selected {
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary);
      font-weight: 700;
    }
  }

  &__size-check {
    font-size: 15px;
    color: var(--primary);
  }
}

.ui-pagination-dropdown-fade-enter-active,
.ui-pagination-dropdown-fade-leave-active {
  transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.ui-pagination-dropdown-fade-enter-from,
.ui-pagination-dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.96);
}
</style>
