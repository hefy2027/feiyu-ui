<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue?: number
  current?: number
  autoplay?: boolean
  interval?: number
  dotPlacement?: 'top' | 'bottom' | 'left' | 'right'
  dotType?: 'dot' | 'line'
  showArrow?: 'always' | 'hover' | 'never'
  showDots?: boolean
  direction?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  current: undefined,
  autoplay: false,
  interval: 4000,
  dotPlacement: 'bottom',
  dotType: 'dot',
  showArrow: 'hover',
  showDots: true,
  direction: 'horizontal'
})

const emit = defineEmits<{
  'update:modelValue': [index: number]
  'update:current': [index: number]
  change: [index: number]
}>()

const currentIndex = ref(props.modelValue ?? props.current ?? 0)
const slideCount = ref(0)
const carouselRef = ref<HTMLElement | null>(null)
let autoPlayTimer: number | null = null

function updateSlideCount() {
  if (carouselRef.value) {
    const track = carouselRef.value.querySelector('.fy-carousel__track')
    if (track) {
      slideCount.value = track.children.length
    }
  }
}

function updateIndex(newIdx: number) {
  currentIndex.value = newIdx
  emit('update:modelValue', newIdx)
  emit('update:current', newIdx)
  emit('change', newIdx)
}

function next() {
  if (slideCount.value <= 1) return
  const nextIdx = (currentIndex.value + 1) % slideCount.value
  updateIndex(nextIdx)
}

function prev() {
  if (slideCount.value <= 1) return
  const prevIdx = (currentIndex.value - 1 + slideCount.value) % slideCount.value
  updateIndex(prevIdx)
}

function goTo(index: number) {
  if (index >= 0 && index < slideCount.value) {
    updateIndex(index)
  }
}

function startAutoPlay() {
  if (!props.autoplay) return
  stopAutoPlay()
  autoPlayTimer = window.setInterval(() => {
    next()
  }, props.interval)
}

function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

onMounted(() => {
  updateSlideCount()
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})

watch(() => props.modelValue, (val) => {
  if (val !== undefined && val !== currentIndex.value) {
    currentIndex.value = val
  }
})

watch(() => props.current, (val) => {
  if (val !== undefined && val !== currentIndex.value) {
    currentIndex.value = val
  }
})

defineExpose({
  next,
  prev,
  goTo,
  getCurrentIndex: () => currentIndex.value
})
</script>

<template>
  <div
    ref="carouselRef"
    :class="[
      'fy-carousel',
      `fy-carousel--dots-${dotPlacement}`,
      `fy-carousel--dot-${dotType}`,
      `fy-carousel--dir-${direction}`,
      `fy-carousel--arrow-${showArrow}`
    ]"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
  >
    <!-- Slides Track -->
    <div
      class="fy-carousel__track"
      :style="{
        transform: direction === 'vertical'
          ? `translateY(-${currentIndex * 100}%)`
          : `translateX(-${currentIndex * 100}%)`
      }"
    >
      <slot />
    </div>

    <!-- Arrows -->
    <button
      v-if="showArrow !== 'never'"
      type="button"
      class="fy-carousel__arrow fy-carousel__arrow--prev"
      aria-label="上一页"
      @click="prev"
    >
      <span class="material-symbols-outlined">{{ direction === 'vertical' ? 'keyboard_arrow_up' : 'chevron_left' }}</span>
    </button>

    <button
      v-if="showArrow !== 'never'"
      type="button"
      class="fy-carousel__arrow fy-carousel__arrow--next"
      aria-label="下一页"
      @click="next"
    >
      <span class="material-symbols-outlined">{{ direction === 'vertical' ? 'keyboard_arrow_down' : 'chevron_right' }}</span>
    </button>

    <!-- Dots Indicators -->
    <div v-if="showDots && slideCount > 1" class="fy-carousel__dots">
      <button
        v-for="i in slideCount"
        :key="i"
        type="button"
        :class="['fy-carousel__dot', { 'is-active': currentIndex === i - 1 }]"
        :aria-label="`第 ${i} 页`"
        @click="goTo(i - 1)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--fy-r-xl);
  user-select: none;
  box-sizing: border-box;

  &__track {
    display: flex;
    width: 100%;
    transition: transform 0.4s var(--fy-ease-out);

    .fy-carousel--dir-vertical & {
      flex-direction: column;
    }

    :deep(> *) {
      flex: 0 0 100%;
      width: 100%;
      min-width: 100%;
    }
  }

  /* Arrows */
  &__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--fy-glass-border);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 80%, transparent);
    backdrop-filter: blur(14px);
    color: var(--fy-on-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s var(--fy-ease-soft);
    box-shadow: var(--fy-shadow-sm);

    &:hover {
      background: var(--fy-surface-container-lowest);
      color: var(--fy-primary);
      transform: translateY(-50%) scale(1.1);
    }

    &--prev {
      left: 12px;
    }

    &--next {
      right: 12px;
    }

    .material-symbols-outlined {
      font-size: 22px;
    }
  }

  &--arrow-hover &__arrow {
    opacity: 0;
    pointer-events: none;
  }

  &--arrow-hover:hover &__arrow {
    opacity: 1;
    pointer-events: auto;
  }

  /* Dots */
  &__dots {
    position: absolute;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: var(--fy-r-full);
    border: none;
    background: color-mix(in srgb, var(--fy-outline) 40%, transparent);
    cursor: pointer;
    padding: 0;
    transition: all 0.25s var(--fy-ease-soft);

    &.is-active {
      width: 22px;
      background: var(--fy-primary);
    }
  }

  &--dots-bottom &__dots {
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
  }

  &--dots-top &__dots {
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
