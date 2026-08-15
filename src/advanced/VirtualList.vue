<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface VirtualListInstance {
  scrollToIndex: (index: number) => void
  scrollToTop: () => void
  scrollToBottom: () => void
  containerRef: any
}

export interface VirtualListProps<T = any> {
  items?: T[]
  itemSize?: number
  itemHeight?: number
  height?: number | string
  buffer?: number
  keyField?: string
}

const props = withDefaults(defineProps<VirtualListProps>(), {
  items: () => [],
  itemSize: 44,
  height: 320,
  buffer: 6,
  keyField: 'id'
})

const emit = defineEmits<{
  scroll: [event: Event, scrollTop: number]
  reachTop: []
  reachBottom: []
}>()

defineSlots<{
  default?: (props: { item: any; index: number }) => any
  empty?: () => any
}>()

const effectiveItemSize = computed(() => props.itemHeight ?? props.itemSize ?? 44)

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const containerHeight = ref(typeof props.height === 'number' ? props.height : (parseInt(String(props.height), 10) || 320))

const safeItems = computed(() => props.items || [])
const totalHeight = computed(() => safeItems.value.length * effectiveItemSize.value)

const startIndex = computed(() => {
  const rawStart = Math.floor(scrollTop.value / effectiveItemSize.value) - props.buffer
  return Math.max(0, rawStart)
})

const endIndex = computed(() => {
  const visibleCount = Math.ceil(containerHeight.value / effectiveItemSize.value)
  const rawEnd = Math.floor(scrollTop.value / effectiveItemSize.value) + visibleCount + props.buffer
  return Math.min(safeItems.value.length, rawEnd)
})

const visibleItems = computed(() => {
  return safeItems.value.slice(startIndex.value, endIndex.value).map((item, localIdx) => {
    const realIndex = startIndex.value + localIdx
    return {
      item,
      index: realIndex,
      top: realIndex * effectiveItemSize.value
    }
  })
})

const offsetY = computed(() => startIndex.value * effectiveItemSize.value)

function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop
  emit('scroll', e, target.scrollTop)
  if (target.scrollTop <= 0) {
    emit('reachTop')
  } else if (target.scrollTop + target.clientHeight >= target.scrollHeight - 2) {
    emit('reachBottom')
  }
}

function updateContainerHeight() {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
  }
}

function scrollToIndex(index: number) {
  if (!containerRef.value) return
  const targetTop = Math.min(
    Math.max(0, index * effectiveItemSize.value),
    totalHeight.value - containerHeight.value
  )
  containerRef.value.scrollTop = targetTop
}

function scrollToTop() {
  scrollToIndex(0)
}

function scrollToBottom() {
  if (!containerRef.value) return
  containerRef.value.scrollTop = totalHeight.value
}

function getScrollTop(): number {
  return containerRef.value?.scrollTop ?? 0
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateContainerHeight()
  if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateContainerHeight()
    })
    resizeObserver.observe(containerRef.value)
  } else {
    window.addEventListener('resize', updateContainerHeight)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  } else {
    window.removeEventListener('resize', updateContainerHeight)
  }
})

defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  getScrollTop,
  containerRef
})
</script>

<template>
  <div
    ref="containerRef"
    class="ui-virtual-list"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
    @scroll="handleScroll"
  >
    <template v-if="safeItems.length > 0">
      <!-- Phantom total scroll height element -->
      <div class="ui-virtual-list__phantom" :style="{ height: `${totalHeight}px` }" />

      <!-- Active visible items window with vertical translation -->
      <div
        class="ui-virtual-list__content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="vItem in visibleItems"
          :key="(vItem.item as any)?.[keyField] ?? vItem.index"
          class="ui-virtual-list__item"
          :style="{ height: `${effectiveItemSize}px` }"
        >
          <slot :item="vItem.item" :index="vItem.index">
            <div class="ui-virtual-list__default-row">
              <span>#{{ vItem.index + 1 }}</span>
              <span>{{ JSON.stringify(vItem.item) }}</span>
            </div>
          </slot>
        </div>
      </div>
    </template>
    <div v-else class="ui-virtual-list__empty">
      <slot name="empty">
        <span class="ui-virtual-list__empty-text">暂无数据</span>
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-virtual-list {
  width: 100%;
  overflow-y: auto;
  position: relative;
  border-radius: var(--r-lg);
  background: color-mix(in srgb, var(--surface-container-high) 35%, transparent);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  border: 1px solid color-mix(in srgb, var(--outline-variant) 35%, transparent);
  box-sizing: border-box;
  user-select: none;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--outline-variant) 50%, transparent);
    border-radius: 4px;

    &:hover {
      background: color-mix(in srgb, var(--primary) 50%, transparent);
    }
  }

  &__phantom {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: -1;
    pointer-events: none;
  }

  &__content {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
  }

  &__item {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 0 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 20%, transparent);
    transition: background 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--surface-container-highest) 50%, transparent);
    }
  }

  &__default-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: var(--font-size-xs);
    color: var(--on-surface);
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 120px;
    color: var(--outline);
    font-size: var(--font-size-sm);
  }
}
</style>
