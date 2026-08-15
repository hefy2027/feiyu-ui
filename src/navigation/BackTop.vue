<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  visibilityHeight?: number
  right?: number | string
  bottom?: number | string
  target?: string
}

const props = withDefaults(defineProps<Props>(), {
  visibilityHeight: 200,
  right: 28,
  bottom: 28,
  target: undefined
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const visible = ref(false)
let targetEl: HTMLElement | Window = window

function getScrollTop(): number {
  if (targetEl === window) {
    return window.scrollY || document.documentElement.scrollTop || 0
  }
  return (targetEl as HTMLElement).scrollTop || 0
}

function handleScroll() {
  visible.value = getScrollTop() >= props.visibilityHeight
}

function scrollToTop(event: MouseEvent) {
  if (targetEl === window) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    (targetEl as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' })
  }
  emit('click', event)
}

onMounted(() => {
  if (props.target) {
    const el = document.querySelector(props.target) as HTMLElement
    if (el) targetEl = el
  }
  targetEl.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  targetEl.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <teleport to="body">
    <transition name="fy-backtop-fade">
      <button
        v-if="visible"
        type="button"
        class="fy-backtop"
        :style="{
          right: typeof right === 'number' ? `${right}px` : right,
          bottom: typeof bottom === 'number' ? `${bottom}px` : bottom
        }"
        aria-label="回到顶部"
        @click="scrollToTop"
      >
        <slot>
          <span class="material-symbols-outlined fy-backtop__icon">arrow_upward</span>
        </slot>
      </button>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.fy-backtop {
  position: fixed;
  z-index: 200;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--fy-surface-container-lowest) 90%, transparent);
  backdrop-filter: blur(24px) saturate(1.6);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  border: 1px solid var(--fy-glass-border);
  box-shadow: var(--fy-shadow-pop), inset 0 1px 0 var(--fy-glass-hi);
  color: var(--fy-on-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.2s var(--fy-ease-soft),
    background 0.2s var(--fy-ease-soft),
    color 0.2s var(--fy-ease-soft);

  &:hover {
    transform: translateY(-3px);
    color: var(--fy-primary);
    background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
  }

  &:active {
    transform: translateY(0);
  }

  &__icon {
    font-size: 20px;
    line-height: 1;
  }
}

.fy-backtop-fade-enter-active,
.fy-backtop-fade-leave-active {
  transition: opacity 0.2s var(--fy-ease-soft), transform 0.2s var(--fy-ease-out);
}
.fy-backtop-fade-enter-from,
.fy-backtop-fade-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
</style>
