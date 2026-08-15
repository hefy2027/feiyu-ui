<script setup lang="ts">
import { ref, computed, provide, type Ref } from 'vue'
import ImageViewer from './ImageViewer.vue'

export interface ImageItem {
  src: string
  previewSrc?: string
}

export interface ImageGroupContext {
  previewDisabled: Ref<boolean>
  registerImage: (item: ImageItem) => () => void
  openPreview: (src: string) => void
}

interface Props {
  gap?: number | string
  previewDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  gap: 8,
  previewDisabled: false
})

const registeredImages = ref<ImageItem[]>([])
const isViewerOpen = ref(false)
const activeIndex = ref(0)

function registerImage(item: ImageItem) {
  registeredImages.value.push(item)
  return () => {
    const idx = registeredImages.value.indexOf(item)
    if (idx !== -1) {
      registeredImages.value.splice(idx, 1)
    }
  }
}

function openPreview(src: string) {
  const idx = registeredImages.value.findIndex((img) => img.src === src || img.previewSrc === src)
  activeIndex.value = idx !== -1 ? idx : 0
  isViewerOpen.value = true
}

provide<ImageGroupContext>('ui-image-group', {
  previewDisabled: computed(() => props.previewDisabled),
  registerImage,
  openPreview
})

const urlList = computed(() => registeredImages.value.map((img) => img.previewSrc || img.src))
</script>

<template>
  <div class="ui-image-group" :style="{ gap: typeof gap === 'number' ? `${gap}px` : gap }">
    <slot />

    <!-- Unified Group Image Viewer -->
    <ImageViewer v-model:show="isViewerOpen" :url-list="urlList" :initial-index="activeIndex" />
  </div>
</template>

<style scoped lang="scss">
.ui-image-group {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>
