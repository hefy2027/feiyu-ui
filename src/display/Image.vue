<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted, type CSSProperties } from 'vue'
import type { ImageGroupContext } from './ImageGroup.vue'

interface Props {
  src: string
  alt?: string
  previewSrc?: string
  width?: string | number
  height?: string | number
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  previewDisabled?: boolean
  fallback?: string
  lazy?: boolean
  radius?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  previewSrc: undefined,
  width: undefined,
  height: undefined,
  objectFit: 'cover',
  previewDisabled: false,
  fallback: undefined,
  lazy: false,
  radius: undefined
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
  click: [event: MouseEvent]
}>()

const groupContext = inject<ImageGroupContext | null>('ui-image-group', null)

const isError = ref(false)
const isLoaded = ref(false)
const isPreviewOpen = ref(false)
const scale = ref(1)
const rotate = ref(0)

const imgStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    objectFit: props.objectFit
  }
  if (props.width !== undefined) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height !== undefined) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  if (props.radius !== undefined) {
    styles.borderRadius = typeof props.radius === 'number' ? `${props.radius}px` : props.radius
  }
  return styles
})

const previewImageStyle = computed<CSSProperties>(() => {
  return {
    transform: `scale(${scale.value}) rotate(${rotate.value}deg)`
  }
})

function handleImgError(event: Event) {
  isError.value = true
  emit('error', event)
}

function handleImgLoad(event: Event) {
  isLoaded.value = true
  emit('load', event)
}

function handleImageClick(event: MouseEvent) {
  emit('click', event)
  if (props.previewDisabled || groupContext?.previewDisabled.value || isError.value) return

  if (groupContext) {
    groupContext.openPreview(props.src)
  } else {
    openPreview()
  }
}

function openPreview() {
  scale.value = 1
  rotate.value = 0
  isPreviewOpen.value = true
}

function closePreview() {
  isPreviewOpen.value = false
}

function zoomIn() {
  scale.value = Math.min(3, scale.value + 0.25)
}

function zoomOut() {
  scale.value = Math.max(0.5, scale.value - 0.25)
}

function rotateLeft() {
  rotate.value -= 90
}

function rotateRight() {
  rotate.value += 90
}

function resetTransform() {
  scale.value = 1
  rotate.value = 0
}

let unregister: (() => void) | null = null
onMounted(() => {
  if (groupContext) {
    unregister = groupContext.registerImage({
      src: props.src,
      previewSrc: props.previewSrc
    })
  }
})

onUnmounted(() => {
  unregister?.()
})
</script>

<template>
  <div
    class="ui-image"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: typeof radius === 'number' ? `${radius}px` : radius
    }"
  >
    <img
      :src="isError && fallback ? fallback : src"
      :alt="alt"
      :loading="lazy ? 'lazy' : undefined"
      :style="imgStyle"
      :class="['ui-image__img', { 'is-previewable': !previewDisabled && !isError }]"
      @click="handleImageClick"
      @load="handleImgLoad"
      @error="handleImgError"
    />

    <div v-if="!previewDisabled && !isError" class="ui-image__overlay" @click="handleImageClick">
      <span class="material-symbols-outlined ui-image__overlay-icon">visibility</span>
    </div>

    <!-- Lightbox Modal (for standalone image) -->
    <teleport to="body">
      <transition name="ui-image-fade">
        <div v-if="!groupContext && isPreviewOpen" class="ui-image-lightbox" @click="closePreview">
          <!-- Top Control Toolbar -->
          <div class="ui-image-lightbox__toolbar" @click.stop>
            <button type="button" class="ui-image-lightbox__btn" title="缩小" @click="zoomOut">
              <span class="material-symbols-outlined">zoom_out</span>
            </button>
            <button type="button" class="ui-image-lightbox__btn" title="放大" @click="zoomIn">
              <span class="material-symbols-outlined">zoom_in</span>
            </button>
            <button type="button" class="ui-image-lightbox__btn" title="向左旋转" @click="rotateLeft">
              <span class="material-symbols-outlined">rotate_left</span>
            </button>
            <button type="button" class="ui-image-lightbox__btn" title="向右旋转" @click="rotateRight">
              <span class="material-symbols-outlined">rotate_right</span>
            </button>
            <button type="button" class="ui-image-lightbox__btn" title="重置" @click="resetTransform">
              <span class="material-symbols-outlined">restart_alt</span>
            </button>
            <button type="button" class="ui-image-lightbox__btn ui-image-lightbox__btn--close" title="关闭" @click="closePreview">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Full Preview Container -->
          <div class="ui-image-lightbox__canvas" @click.stop>
            <img
              :src="previewSrc || src"
              :alt="alt"
              class="ui-image-lightbox__img"
              :style="previewImageStyle"
            />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped lang="scss">
.ui-image {
  position: relative;
  display: inline-flex;
  border-radius: var(--r-md);
  overflow: hidden;
  vertical-align: middle;
  background: color-mix(in srgb, var(--surface-container-high) 50%, transparent);

  &__img {
    width: 100%;
    height: 100%;
    display: block;
    transition: transform 0.25s var(--ease-soft);

    &.is-previewable {
      cursor: pointer;
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  &__overlay-icon {
    color: #ffffff;
    font-size: 24px;
  }
}

/* Lightbox View */
.ui-image-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(10, 12, 14, 0.78);
  backdrop-filter: blur(28px) saturate(1.4);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

  &__toolbar {
    position: absolute;
    top: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    border-radius: var(--r-full);
    background: color-mix(in srgb, var(--surface-container-lowest) 88%, transparent);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-pop);
    z-index: 1010;
  }

  &__btn {
    border: none;
    background: transparent;
    color: var(--on-surface);
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
      color: var(--primary);
    }

    .material-symbols-outlined {
      font-size: 20px;
    }

    &--close:hover {
      color: var(--error);
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
    border-radius: var(--r-md);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
    transition: transform 0.2s var(--ease-soft);
  }
}

.ui-image-fade-enter-active,
.ui-image-fade-leave-active {
  transition: opacity 0.22s var(--ease-soft);
}
.ui-image-fade-enter-from,
.ui-image-fade-leave-to {
  opacity: 0;
}
</style>
