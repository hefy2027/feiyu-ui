<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Spin from '../feedback/Spin.vue'

interface Props {
  disabled?: boolean
  distance?: number
  loading?: boolean
  hasMore?: boolean
  height?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  distance: 30,
  loading: false,
  hasMore: true,
  height: '300px'
})

const emit = defineEmits<{
  load: []
}>()

const scrollContainerRef = ref<HTMLElement | null>(null)

function handleScroll() {
  if (props.disabled || props.loading || !props.hasMore || !scrollContainerRef.value) return
  const el = scrollContainerRef.value
  const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  if (scrollBottom <= props.distance) {
    emit('load')
  }
}

onMounted(() => {
  scrollContainerRef.value?.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  scrollContainerRef.value?.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div
    ref="scrollContainerRef"
    class="fy-infinite-scroll"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
  >
    <slot />

    <div class="fy-infinite-scroll__footer">
      <div v-if="loading" class="fy-infinite-scroll__loading">
        <Spin size="sm" />
        <span>加载更多内容中...</span>
      </div>
      <div v-else-if="!hasMore" class="fy-infinite-scroll__no-more">
        <slot name="no-more">—— 已经到底啦 ——</slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-infinite-scroll {
  width: 100%;
  overflow-y: auto;
  position: relative;
  border-radius: var(--fy-r-lg);
  background: color-mix(in srgb, var(--fy-surface-container-high) 30%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
  padding: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--fy-outline-variant) 50%, transparent);
    border-radius: 4px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px 0 6px;
    font-size: var(--fy-font-size-xs);
    color: var(--fy-outline);
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--fy-primary);
    font-weight: 600;
  }

  &__no-more {
    font-weight: 500;
    color: var(--fy-outline);
  }
}
</style>
