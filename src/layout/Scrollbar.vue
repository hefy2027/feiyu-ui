<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, type CSSProperties } from 'vue'

interface ScrollToOptions {
  top?: number
  left?: number
  behavior?: ScrollBehavior
}

interface Props {
  native?: boolean
  height?: string | number
  maxHeight?: string | number
  always?: boolean
  minSize?: number
  tag?: string
  wrapClass?: string
  wrapStyle?: CSSProperties | string
  viewClass?: string
  viewStyle?: CSSProperties | string
  noresize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: undefined,
  maxHeight: undefined,
  always: false,
  minSize: 20,
  tag: 'div',
  wrapClass: '',
  wrapStyle: undefined,
  viewClass: '',
  viewStyle: undefined,
  noresize: false
})

const emit = defineEmits<{
  scroll: [{ scrollTop: number; scrollLeft: number }]
}>()

const wrapRef = ref<HTMLElement | null>(null)
const viewRef = ref<HTMLElement | null>(null)

const thumbWidth = ref(0)
const thumbHeight = ref(0)
const moveX = ref(0)
const moveY = ref(0)

let isDragging = false
let dragDirection: 'vertical' | 'horizontal' = 'vertical'
let startPos = 0
let startScroll = 0

const containerStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  if (props.height !== undefined) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  if (props.maxHeight !== undefined) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }
  return style
})

function update() {
  if (!wrapRef.value) return
  const wrap = wrapRef.value
  const trackHeight = wrap.clientHeight
  const trackWidth = wrap.clientWidth
  const scrollHeight = wrap.scrollHeight
  const scrollWidth = wrap.scrollWidth

  const calculatedHeight = scrollHeight > trackHeight ? Math.max((trackHeight / scrollHeight) * trackHeight, props.minSize) : 0
  const calculatedWidth = scrollWidth > trackWidth ? Math.max((trackWidth / scrollWidth) * trackWidth, props.minSize) : 0

  thumbHeight.value = calculatedHeight
  thumbWidth.value = calculatedWidth

  const maxScrollTop = scrollHeight - trackHeight
  const maxScrollLeft = scrollWidth - trackWidth
  const maxThumbMoveY = trackHeight - calculatedHeight
  const maxThumbMoveX = trackWidth - calculatedWidth

  moveY.value = maxScrollTop > 0 && maxThumbMoveY > 0 ? (wrap.scrollTop / maxScrollTop) * maxThumbMoveY : 0
  moveX.value = maxScrollLeft > 0 && maxThumbMoveX > 0 ? (wrap.scrollLeft / maxScrollLeft) * maxThumbMoveX : 0
}

function handleScroll() {
  if (!wrapRef.value) return
  const wrap = wrapRef.value
  const maxScrollTop = wrap.scrollHeight - wrap.clientHeight
  const maxScrollLeft = wrap.scrollWidth - wrap.clientWidth
  const maxThumbMoveY = wrap.clientHeight - thumbHeight.value
  const maxThumbMoveX = wrap.clientWidth - thumbWidth.value

  moveY.value = maxScrollTop > 0 && maxThumbMoveY > 0 ? (wrap.scrollTop / maxScrollTop) * maxThumbMoveY : 0
  moveX.value = maxScrollLeft > 0 && maxThumbMoveX > 0 ? (wrap.scrollLeft / maxScrollLeft) * maxThumbMoveX : 0

  emit('scroll', { scrollTop: wrap.scrollTop, scrollLeft: wrap.scrollLeft })
}

function scrollTo(options: ScrollToOptions | number, yCoord?: number) {
  if (!wrapRef.value) return
  if (typeof options === 'number') {
    wrapRef.value.scrollTo({
      top: options,
      left: yCoord ?? 0,
      behavior: 'smooth'
    })
  } else {
    wrapRef.value.scrollTo(options)
  }
}

function setScrollTop(top: number) {
  if (!wrapRef.value) return
  wrapRef.value.scrollTop = top
}

function setScrollLeft(left: number) {
  if (!wrapRef.value) return
  wrapRef.value.scrollLeft = left
}

function handleThumbMousedown(e: MouseEvent, direction: 'vertical' | 'horizontal') {
  e.stopImmediatePropagation()
  isDragging = true
  dragDirection = direction
  if (direction === 'vertical') {
    startPos = e.clientY
    startScroll = wrapRef.value?.scrollTop || 0
  } else {
    startPos = e.clientX
    startScroll = wrapRef.value?.scrollLeft || 0
  }
  document.addEventListener('mousemove', handleDocumentMousemove)
  document.addEventListener('mouseup', handleDocumentMouseup)
  document.onselectstart = () => false
}

function handleDocumentMousemove(e: MouseEvent) {
  if (!isDragging || !wrapRef.value) return
  const wrap = wrapRef.value
  if (dragDirection === 'vertical') {
    const delta = e.clientY - startPos
    const maxThumbMoveY = wrap.clientHeight - thumbHeight.value
    const maxScrollTop = wrap.scrollHeight - wrap.clientHeight
    if (maxThumbMoveY > 0) {
      wrap.scrollTop = startScroll + (delta / maxThumbMoveY) * maxScrollTop
    }
  } else {
    const delta = e.clientX - startPos
    const maxThumbMoveX = wrap.clientWidth - thumbWidth.value
    const maxScrollLeft = wrap.scrollWidth - wrap.clientWidth
    if (maxThumbMoveX > 0) {
      wrap.scrollLeft = startScroll + (delta / maxThumbMoveX) * maxScrollLeft
    }
  }
}

function handleDocumentMouseup() {
  isDragging = false
  document.removeEventListener('mousemove', handleDocumentMousemove)
  document.removeEventListener('mouseup', handleDocumentMouseup)
  document.onselectstart = null
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    update()
    if (!props.noresize && wrapRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        update()
      })
      resizeObserver.observe(wrapRef.value)
      if (viewRef.value) {
        resizeObserver.observe(viewRef.value)
      }
    }
  })
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  handleDocumentMouseup()
})

function handleTrackClick(e: MouseEvent, direction: 'vertical' | 'horizontal') {
  if (!wrapRef.value) return
  const target = e.currentTarget as HTMLElement
  const wrap = wrapRef.value
  const rect = target.getBoundingClientRect()
  if (direction === 'vertical') {
    const clickPosition = e.clientY - rect.top
    const maxThumbMoveY = rect.height - thumbHeight.value
    const maxScrollTop = wrap.scrollHeight - wrap.clientHeight
    const targetThumbPos = clickPosition - thumbHeight.value / 2
    const clampedPos = Math.max(0, Math.min(targetThumbPos, maxThumbMoveY))
    if (maxThumbMoveY > 0) {
      wrap.scrollTop = (clampedPos / maxThumbMoveY) * maxScrollTop
    }
  } else {
    const clickPosition = e.clientX - rect.left
    const maxThumbMoveX = rect.width - thumbWidth.value
    const maxScrollLeft = wrap.scrollWidth - wrap.clientWidth
    const targetThumbPos = clickPosition - thumbWidth.value / 2
    const clampedPos = Math.max(0, Math.min(targetThumbPos, maxThumbMoveX))
    if (maxThumbMoveX > 0) {
      wrap.scrollLeft = (clampedPos / maxThumbMoveX) * maxScrollLeft
    }
  }
}

defineExpose({
  wrapRef,
  update,
  scrollTo,
  setScrollTop,
  setScrollLeft
})
</script>

<template>
  <div :class="['fy-scrollbar', { 'is-always': always, 'is-native': native }]" :style="containerStyle">
    <div
      ref="wrapRef"
      :class="['fy-scrollbar__wrap', wrapClass]"
      :style="wrapStyle"
      @scroll="handleScroll"
    >
      <component
        :is="tag"
        ref="viewRef"
        :class="['fy-scrollbar__view', viewClass]"
        :style="viewStyle"
      >
        <slot />
      </component>
    </div>

    <!-- Vertical Bar -->
    <div
      v-if="!native && thumbHeight > 0"
      class="fy-scrollbar__bar is-vertical"
      @click="handleTrackClick($event, 'vertical')"
    >
      <div
        class="fy-scrollbar__thumb"
        :style="{
          height: `${thumbHeight}px`,
          transform: `translateY(${moveY}px)`
        }"
        @mousedown="handleThumbMousedown($event, 'vertical')"
      />
    </div>

    <!-- Horizontal Bar -->
    <div
      v-if="!native && thumbWidth > 0"
      class="fy-scrollbar__bar is-horizontal"
      @click="handleTrackClick($event, 'horizontal')"
    >
      <div
        class="fy-scrollbar__thumb"
        :style="{
          width: `${thumbWidth}px`,
          transform: `translateX(${moveX}px)`
        }"
        @mousedown="handleThumbMousedown($event, 'horizontal')"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-scrollbar {
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;

  &__wrap {
    overflow: auto;
    max-height: inherit;
    height: 100%;
    scrollbar-width: none; // Firefox
    &::-webkit-scrollbar {
      display: none; // Chrome, Safari
    }
  }

  &.is-native &__wrap {
    scrollbar-width: auto;
    &::-webkit-scrollbar {
      display: block;
    }
  }

  &__view {
    box-sizing: border-box;
    width: 100%;
  }

  &__bar {
    position: absolute;
    right: 2px;
    bottom: 2px;
    z-index: 10;
    border-radius: var(--fy-r-full);
    opacity: 0;
    transition: opacity 0.25s var(--fy-ease-soft);
    pointer-events: auto;
    cursor: pointer;

    &.is-vertical {
      top: 2px;
      width: 6px;
      > div {
        width: 100%;
      }
    }

    &.is-horizontal {
      left: 2px;
      height: 6px;
      > div {
        height: 100%;
      }
    }
  }

  &__thumb {
    position: relative;
    display: block;
    width: 0;
    height: 0;
    cursor: pointer;
    border-radius: inherit;
    background-color: color-mix(in srgb, var(--fy-outline) 45%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: background-color 0.2s var(--fy-ease-soft);
    pointer-events: auto;

    &:hover {
      background-color: color-mix(in srgb, var(--fy-primary) 75%, transparent);
    }
  }

  &:hover &__bar,
  &.is-always &__bar {
    opacity: 1;
  }
}
</style>
