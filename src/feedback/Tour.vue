<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import Button from '../button/Button.vue'
import Space from '../layout/Space.vue'

export interface TourStep {
  title: string
  description: string
  target?: string | HTMLElement | (() => HTMLElement | null)
}

interface Props {
  steps: TourStep[]
  current?: number
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  current: 0,
  visible: false
})

const emit = defineEmits<{
  'update:current': [value: number]
  'update:visible': [value: boolean]
  finish: []
  change: [current: number]
  close: []
}>()

const activeIndex = ref(props.current)
const targetRect = ref<{ top: number; left: number; width: number; height: number } | null>(null)

const currentStep = computed<TourStep | undefined>(() => props.steps[activeIndex.value])
const isFirst = computed(() => activeIndex.value === 0)
const isLast = computed(() => activeIndex.value === props.steps.length - 1)

const popoverStyle = computed(() => {
  if (!targetRect.value) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }
  const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const topPos = Math.min(winHeight - 200, targetRect.value.top + targetRect.value.height + 16)
  const leftPos = Math.max(20, Math.min(winWidth - 380, targetRect.value.left))
  return {
    top: `${topPos}px`,
    left: `${leftPos}px`
  }
})

function updateTargetPosition() {
  if (!props.visible || !currentStep.value) {
    targetRect.value = null
    return
  }
  
  const targetProp = currentStep.value.target
  let element: HTMLElement | null = null

  if (typeof targetProp === 'function') {
    element = targetProp()
  } else if (typeof targetProp === 'string') {
    element = document.querySelector(targetProp)
  } else if (targetProp instanceof HTMLElement) {
    element = targetProp
  }

  if (element) {
    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    } catch {
      // ignore
    }
  }

  if (element) {
    const rect = element.getBoundingClientRect()
    targetRect.value = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  } else {
    targetRect.value = null
  }
}

function handleNext() {
  if (isLast.value) {
    emit('finish')
    close()
  } else {
    activeIndex.value += 1
    emit('update:current', activeIndex.value)
    emit('change', activeIndex.value)
    nextTick(updateTargetPosition)
  }
}

function handlePrev() {
  if (!isFirst.value) {
    activeIndex.value -= 1
    emit('update:current', activeIndex.value)
    emit('change', activeIndex.value)
    nextTick(updateTargetPosition)
  }
}

function close() {
  emit('update:visible', false)
  emit('close')
}

const cardStyle = computed(() => {
  if (targetRect.value) {
    const top = Math.min(window.innerHeight - 200, targetRect.value.top + targetRect.value.height + 16)
    const left = Math.max(20, Math.min(window.innerWidth - 380, targetRect.value.left))
    return {
      top: `${top}px`,
      left: `${left}px`
    }
  }
  return {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }
})

watch(() => props.current, (val) => {
  activeIndex.value = val
  nextTick(updateTargetPosition)
})

watch(() => props.visible, (val) => {
  if (val) {
    nextTick(updateTargetPosition)
  }
})

onMounted(() => {
  if (props.visible) {
    updateTargetPosition()
  }
  window.addEventListener('resize', updateTargetPosition)
  window.addEventListener('scroll', updateTargetPosition, true)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="ui-tour-overlay">
      <!-- Spotlight cutout / focus border -->
      <div
        v-if="targetRect"
        class="ui-tour-spotlight"
        :style="{
          top: `${targetRect.top - 4}px`,
          left: `${targetRect.left - 4}px`,
          width: `${targetRect.width + 8}px`,
          height: `${targetRect.height + 8}px`
        }"
      />

      <!-- Tour popover card -->
      <div
        class="ui-tour-card"
        :style="popoverStyle"
      >
        <div class="ui-tour-card__head">
          <div class="ui-tour-card__step-tag">
            步骤 {{ activeIndex + 1 }} / {{ steps.length }}
          </div>
          <button type="button" class="ui-tour-card__close" @click="close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="ui-tour-card__title">{{ currentStep?.title }}</div>
        <div class="ui-tour-card__desc">{{ currentStep?.description }}</div>

        <div class="ui-tour-card__foot">
          <div class="ui-tour-card__dots">
            <span
              v-for="(_, i) in steps"
              :key="i"
              :class="['ui-tour-card__dot', { 'is-active': i === activeIndex }]"
            />
          </div>
          <Space :size="8">
            <Button v-if="!isFirst" size="sm" variant="ghost" @click="handlePrev">
              上一步
            </Button>
            <Button size="sm" variant="primary" @click="handleNext">
              {{ isLast ? '完成导览' : '下一步' }}
            </Button>
          </Space>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.ui-tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(10, 12, 20, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  pointer-events: auto;
}

.ui-tour-spotlight {
  position: absolute;
  border-radius: var(--r-md);
  box-shadow:
    0 0 0 9999px rgba(10, 12, 20, 0.55),
    0 0 20px color-mix(in srgb, var(--primary) 60%, transparent);
  border: 2px solid var(--primary);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ui-tour-card {
  position: absolute;
  width: 340px;
  background: color-mix(in srgb, var(--surface-container-highest) 90%, transparent);
  backdrop-filter: blur(24px) saturate(1.5);
  -webkit-backdrop-filter: blur(24px) saturate(1.5);
  border: 1px solid var(--glass-border);
  border-radius: var(--r-xl);
  padding: 18px;
  box-shadow: var(--shadow-pop), 0 12px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 var(--glass-hi);
  user-select: none;
  z-index: 10000;
  transition: all 0.3s ease;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__step-tag {
    font-size: 11px;
    font-weight: 700;
    color: var(--primary);
    background: color-mix(in srgb, var(--primary) 14%, transparent);
    padding: 2px 8px;
    border-radius: 999px;
  }

  &__close {
    border: none;
    background: transparent;
    color: var(--outline);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;

    &:hover {
      color: var(--on-surface);
    }

    .material-symbols-outlined {
      font-size: 16px;
    }
  }

  &__title {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: var(--on-surface);
    margin-bottom: 6px;
  }

  &__desc {
    font-size: var(--font-size-xs);
    color: var(--on-surface-variant);
    line-height: 1.5;
    margin-bottom: 16px;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__dots {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--outline) 40%, transparent);
    transition: all 0.2s ease;

    &.is-active {
      width: 14px;
      border-radius: 4px;
      background: var(--primary);
    }
  }
}
</style>
