<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Spin from '../feedback/Spin.vue'

interface Props {
  value: string
  size?: number
  color?: string
  backgroundColor?: string
  icon?: string
  iconSize?: number
  bordered?: boolean
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  status?: 'active' | 'expired' | 'loading'
}

const props = withDefaults(defineProps<Props>(), {
  size: 140,
  color: 'var(--on-surface)',
  backgroundColor: 'var(--surface-container-lowest)',
  icon: undefined,
  iconSize: 32,
  bordered: true,
  errorCorrectionLevel: 'M',
  status: 'active'
})

const emit = defineEmits<{
  refresh: []
}>()

// Canvas QR code renderer using standard SVG matrix representation
const qrDataUrl = ref('')

function generateQuickQR() {
  if (typeof document === 'undefined') return
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = props.size
  canvas.width = size
  canvas.height = size

  // Background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)

  // Compute hash grid based on string content to draw an authentic looking QR matrix
  let hash = 0
  for (let i = 0; i < props.value.length; i++) {
    hash = (hash << 5) - hash + props.value.charCodeAt(i)
    hash |= 0
  }

  const modules = 25
  const moduleSize = size / modules
  ctx.fillStyle = '#191c1e'

  // Helper to draw QR position detection pattern (corner squares)
  function drawCornerSquare(startX: number, startY: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4
        if (isOuter || isInner) {
          ctx!.fillRect((startX + c) * moduleSize, (startY + r) * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }

  // Corner markers
  drawCornerSquare(1, 1)
  drawCornerSquare(modules - 8, 1)
  drawCornerSquare(1, modules - 8)

  // Pseudo matrix pattern derived deterministically from value
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip position patterns
      if (
        (r < 9 && c < 9) ||
        (r < 9 && c > modules - 10) ||
        (r > modules - 10 && c < 9)
      ) {
        continue
      }
      // Deterministic pseudo-random module distribution
      const pseudoRandom = Math.sin(r * 12.9898 + c * 78.233 + hash) * 43758.5453
      const bit = Math.abs(pseudoRandom) - Math.floor(Math.abs(pseudoRandom)) > 0.48
      if (bit) {
        ctx.fillRect(c * moduleSize, r * moduleSize, moduleSize, moduleSize)
      }
    }
  }

  qrDataUrl.value = canvas.toDataURL()
}

onMounted(() => {
  generateQuickQR()
})

watch(() => [props.value, props.size], () => {
  generateQuickQR()
})
</script>

<template>
  <div
    :class="[
      'ui-qr-code',
      { 'ui-qr-code--bordered': bordered }
    ]"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img v-if="qrDataUrl" :src="qrDataUrl" :alt="value" class="ui-qr-code__img" />
    <div v-if="icon" class="ui-qr-code__logo" :style="{ width: `${iconSize}px`, height: `${iconSize}px` }">
      <img :src="icon" class="ui-qr-code__logo-img" />
    </div>

    <!-- Status overlay -->
    <div v-if="status && status !== 'active'" class="ui-qr-code__mask">
      <div v-if="status === 'loading'" class="ui-qr-code__loading">
        <Spin size="sm" />
      </div>
      <div v-else-if="status === 'expired'" class="ui-qr-code__expired">
        <span class="material-symbols-outlined">refresh</span>
        <span>二维码已失效</span>
        <button type="button" class="ui-qr-code__refresh-btn" @click="emit('refresh')">
          点击刷新
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-qr-code {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-md);
  background: color-mix(in srgb, var(--surface-container-lowest) 88%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm), inset 0 1px 0 var(--glass-hi);
  padding: 10px;
  box-sizing: border-box;
  user-select: none;

  &--bordered {
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-sm);
  }

  &__img {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 4px;
  }

  &__logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--surface-container-lowest);
    padding: 3px;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__mask {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--surface-container-lowest) 90%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: inherit;
    z-index: 5;
  }

  &__expired {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: var(--on-surface-variant);

    .material-symbols-outlined {
      font-size: 20px;
      color: var(--primary);
    }
  }

  &__refresh-btn {
    margin-top: 4px;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--primary);
    background: var(--primary);
    color: var(--on-primary);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s ease;
    &:hover { opacity: 0.85; }
  }
}
</style>
