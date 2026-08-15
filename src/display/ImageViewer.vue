<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type CSSProperties } from 'vue'

interface Props {
  urlList: string[]
  initialIndex?: number
  zIndex?: number
  maskClosable?: boolean
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
  zIndex: 2000,
  maskClosable: true,
  show: false
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
  switch: [index: number]
}>()

const activeIndex = ref(props.initialIndex)
const scale = ref(1)
const rotate = ref(0)
const flipHorizontal = ref(1)

watch(
  () => props.initialIndex,
  (val) => {
    activeIndex.value = val
    resetTransform()
  }
)

watch(
  () => props.show,
  (val) => {
    if (val) {
      activeIndex.value = props.initialIndex
      resetTransform()
    }
  }
)

const currentImgSrc = computed(() => {
  return props.urlList[activeIndex.value] || ''
})

const previewImageStyle = computed<CSSProperties>(() => {
  return {
    transform: `scale(${scale.value}) rotate(${rotate.value}deg) scaleX(${flipHorizontal.value})`,
    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  }
})

function resetTransform() {
  scale.value = 1
  rotate.value = 0
  flipHorizontal.value = 1
}

function handleClose() {
  emit('update:show', false)
  emit('close')
}

function handleMaskClick() {
  if (props.maskClosable) {
    handleClose()
  }
}

function prev() {
  if (props.urlList.length <= 1) return
  activeIndex.value = (activeIndex.value - 1 + props.urlList.length) % props.urlList.length
  resetTransform()
  emit('switch', activeIndex.value)
}

function next() {
  if (props.urlList.length <= 1) return
  activeIndex.value = (activeIndex.value + 1) % props.urlList.length
  resetTransform()
  emit('switch', activeIndex.value)
}

function zoomIn() {
  scale.value = Math.min(4, Number((scale.value + 0.25).toFixed(2)))
}

function zoomOut() {
  scale.value = Math.max(0.25, Number((scale.value - 0.25).toFixed(2)))
}

function rotateLeft() {
  rotate.value -= 90
}

function rotateRight() {
  rotate.value += 90
}

function toggleFlip() {
  flipHorizontal.value = flipHorizontal.value === 1 ? -1 : 1
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.show) return
  if (e.key === 'Escape') {
    handleClose()
  } else if (e.key === 'ArrowLeft') {
    prev()
  } else if (e.key === 'ArrowRight') {
    next()
  } else if (e.key === 'ArrowUp') {
    zoomIn()
  } else if (e.key === 'ArrowDown') {
    zoomOut()
  }
}

function handleWheel(e: WheelEvent) {
  e.preventDefault()
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

defineExpose({
  prev,
  next,
  zoomIn,
  zoomOut,
  rotateLeft,
  rotateRight,
  resetTransform,
  close: handleClose
})
</script>

<template>
  <teleport to="body">
    <transition name="fy-image-viewer-fade">
      <div
        v-if="show"
        class="fy-image-viewer"
        :style="{ zIndex }"
        @click="handleMaskClick"
        @wheel="handleWheel"
      >
        <!-- Index indicator / Counter -->
        <div v-if="urlList.length > 1" class="fy-image-viewer__counter" @click.stop>
          {{ activeIndex + 1 }} / {{ urlList.length }}
        </div>

        <!-- Top Toolbar -->
        <div class="fy-image-viewer__toolbar" @click.stop>
          <button type="button" class="fy-image-viewer__btn" title="缩小" @click="zoomOut">
            <span class="material-symbols-outlined">zoom_out</span>
          </button>
          <button type="button" class="fy-image-viewer__btn" title="放大" @click="zoomIn">
            <span class="material-symbols-outlined">zoom_in</span>
          </button>
          <button type="button" class="fy-image-viewer__btn" title="向左旋转" @click="rotateLeft">
            <span class="material-symbols-outlined">rotate_left</span>
          </button>
          <button type="button" class="fy-image-viewer__btn" title="向右旋转" @click="rotateRight">
            <span class="material-symbols-outlined">rotate_right</span>
          </button>
          <button type="button" class="fy-image-viewer__btn" title="水平镜像翻转" @click="toggleFlip">
            <span class="material-symbols-outlined">flip</span>
          </button>
          <button type="button" class="fy-image-viewer__btn" title="重置缩放与角度" @click="resetTransform">
            <span class="material-symbols-outlined">restart_alt</span>
          </button>
          <button
            type="button"
            class="fy-image-viewer__btn fy-image-viewer__btn--close"
            title="关闭 (Esc)"
            @click="handleClose"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Prev / Next Navigation Arrows -->
        <template v-if="urlList.length > 1">
          <button
            type="button"
            class="fy-image-viewer__arrow fy-image-viewer__arrow--prev"
            title="上一张 (←)"
            @click.stop="prev"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            class="fy-image-viewer__arrow fy-image-viewer__arrow--next"
            title="下一张 (→)"
            @click.stop="next"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </template>

        <!-- Image Canvas -->
        <div class="fy-image-viewer__canvas" @click.stop>
          <img
            :src="currentImgSrc"
            alt="Preview"
            class="fy-image-viewer__img"
            :style="previewImageStyle"
          />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.fy-image-viewer {
  position: fixed;
  inset: 0;
  background: rgba(10, 12, 16, 0.82);
  backdrop-filter: blur(28px) saturate(1.5);
  -webkit-backdrop-filter: blur(28px) saturate(1.5);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  overflow: hidden;

  &__counter {
    position: absolute;
    top: 24px;
    left: 24px;
    padding: 6px 14px;
    border-radius: var(--fy-r-full);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 85%, transparent);
    backdrop-filter: blur(16px);
    border: 1px solid var(--fy-glass-border);
    color: var(--fy-on-surface);
    font-size: var(--fy-font-size-sm);
    font-weight: 700;
    z-index: 10;
  }

  &__toolbar {
    position: absolute;
    top: 24px;
    right: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: var(--fy-r-full);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 88%, transparent);
    backdrop-filter: blur(20px);
    border: 1px solid var(--fy-glass-border);
    box-shadow: var(--fy-shadow-pop);
    z-index: 10;
  }

  &__btn {
    border: none;
    background: transparent;
    color: var(--fy-on-surface);
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
      color: var(--fy-primary);
    }

    .material-symbols-outlined {
      font-size: 20px;
    }

    &--close:hover {
      color: var(--fy-error);
    }
  }

  &__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--fy-glass-border);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 80%, transparent);
    backdrop-filter: blur(14px);
    color: var(--fy-on-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--fy-shadow-pop);
    transition: all 0.2s var(--fy-ease-soft);

    &:hover {
      background: var(--fy-surface-container-lowest);
      color: var(--fy-primary);
      transform: translateY(-50%) scale(1.1);
    }

    &--prev {
      left: 24px;
    }

    &--next {
      right: 24px;
    }

    .material-symbols-outlined {
      font-size: 28px;
    }
  }

  &__canvas {
    max-width: 90vw;
    max-height: 85vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  &__img {
    max-width: 90vw;
    max-height: 85vh;
    object-fit: contain;
    border-radius: var(--fy-r-md);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
    user-select: none;
  }
}

.fy-image-viewer-fade-enter-active,
.fy-image-viewer-fade-leave-active {
  transition: opacity 0.24s var(--fy-ease-soft);
}
.fy-image-viewer-fade-enter-from,
.fy-image-viewer-fade-leave-to {
  opacity: 0;
}
</style>
