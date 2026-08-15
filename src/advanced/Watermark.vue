<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

export interface WatermarkProps {
  content?: string | string[]
  image?: string
  width?: number
  height?: number
  rotate?: number
  zIndex?: number
  xGap?: number
  yGap?: number
  fontColor?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string | number
  opacity?: number
  cross?: boolean
  fullscreen?: boolean
  antiTamper?: boolean
}

const props = withDefaults(defineProps<WatermarkProps>(), {
  content: '一览 Yilan',
  image: undefined,
  width: 32,
  height: 32,
  rotate: -22,
  zIndex: 9,
  xGap: 48,
  yGap: 48,
  fontColor: undefined,
  opacity: 0.18,
  fontSize: 14,
  cross: true
})

const containerRef = ref<HTMLElement | null>(null)
const base64Url = ref('')
let mutationObserver: MutationObserver | null = null
const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

function generateWatermark() {
  if (typeof document === 'undefined') return

  if (props.image) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.referrerPolicy = 'no-referrer'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const w = props.width || img.width || 120
      const h = props.height || img.height || 64
      const canvasWidth = w + props.xGap
      const canvasHeight = h + props.yGap

      canvas.width = canvasWidth
      canvas.height = canvasHeight

      ctx.translate(canvasWidth / 2, canvasHeight / 2)
      ctx.rotate((props.rotate * Math.PI) / 180)
      ctx.globalAlpha = props.opacity ?? 1
      ctx.drawImage(img, -w / 2, -h / 2, w, h)
      base64Url.value = canvas.toDataURL()
    }
    img.src = props.image
    return
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const fontSize = props.fontSize
  const font = `${props.fontWeight || 'normal'} ${fontSize}px "Plus Jakarta Sans", "Noto Sans SC", sans-serif`
  ctx.font = font

  const contents = Array.isArray(props.content) ? props.content : [props.content]
  let maxTextWidth = 0
  for (const text of contents) {
    const metrics = ctx.measureText(text)
    maxTextWidth = Math.max(maxTextWidth, metrics.width)
  }

  const textBlockHeight = contents.length * (fontSize + 6)
  const rad = (Math.abs(props.rotate) * Math.PI) / 180
  const sin = Math.sin(rad)
  const cos = Math.cos(rad)

  // 旋转后的外接矩形尺寸计算，防止文字边缘被裁切
  const rotatedWidth = maxTextWidth * cos + textBlockHeight * sin
  const rotatedHeight = maxTextWidth * sin + textBlockHeight * cos

  const canvasWidth = Math.ceil(rotatedWidth + props.xGap)
  const canvasHeight = Math.ceil(rotatedHeight + props.yGap)

  canvas.width = canvasWidth * dpr
  canvas.height = canvasHeight * dpr

  ctx.scale(dpr, dpr)
  ctx.translate(canvasWidth / 2, canvasHeight / 2)
  ctx.rotate((props.rotate * Math.PI) / 180)

  let drawColor = props.fontColor
  if (!drawColor && containerRef.value) {
    // 默认自适应当前主题文字色彩
    const computedColor = getComputedStyle(containerRef.value).color
    drawColor = computedColor || 'rgba(128, 128, 140, 1)'
  } else if (!drawColor) {
    drawColor = 'rgba(128, 128, 140, 1)'
  }

  ctx.fillStyle = drawColor
  ctx.globalAlpha = props.opacity ?? 1
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const totalTextHeight = contents.length * (fontSize + 4)
  contents.forEach((text, i) => {
    const y = -totalTextHeight / 2 + i * (fontSize + 6) + fontSize / 2
    ctx.fillText(text, 0, y)
  })

  base64Url.value = canvas.toDataURL()
}

onMounted(() => {
  generateWatermark()
  if (props.antiTamper && typeof MutationObserver !== 'undefined' && containerRef.value) {
    mutationObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList' || m.type === 'attributes') {
          generateWatermark()
          break
        }
      }
    })
    mutationObserver.observe(containerRef.value, {
      attributes: true,
      childList: true,
      subtree: true
    })
  }
})

onUnmounted(() => {
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }
})

watch(
  () => [props.content, props.image, props.fontColor, props.fontSize, props.fontFamily, props.fontWeight, props.rotate, props.xGap, props.yGap, props.opacity, props.width, props.height],
  () => {
    generateWatermark()
  }
)
</script>

<template>
  <div
    ref="containerRef"
    :class="['ui-watermark', { 'ui-watermark--fullscreen': fullscreen }]"
  >
    <slot />
    <div
      class="ui-watermark__overlay"
      :style="{
        zIndex: zIndex,
        backgroundImage: `url(${base64Url})`,
        backgroundRepeat: 'repeat'
      }"
    />
  </div>
</template>

<style scoped lang="scss">
.ui-watermark {
  position: relative;
  width: 100%;
  height: 100%;

  &--fullscreen {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
}
</style>
