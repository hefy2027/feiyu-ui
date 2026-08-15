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
    <transition name="ui-backtop-fade">
      <button
        v-if="visible"
        type="button"
        class="ui-backtop"
        :style="{
          right: typeof right === 'number' ? `${right}px` : right,
          bottom: typeof bottom === 'number' ? `${bottom}px` : bottom
        }"
        aria-label="回到顶部"
        @click="scrollToTop"
      >
        <slot>
          <span class="material-symbols-outlined ui-backtop__icon">arrow_upward</span>
        </slot>
      </button>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.ui-backtop {
  position: fixed;
  z-index: 200;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--surface-container-lowest) 90%, transparent);
  backdrop-filter: blur(24px) saturate(1.6);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-hi);
  color: var(--on-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.2s var(--ease-soft),
    background 0.2s var(--ease-soft),
    color 0.2s var(--ease-soft);

  &:hover {
    transform: translateY(-3px);
    color: var(--primary);
    background: color-mix(in srgb, var(--primary) 12%, transparent);
  }

  &:active {
    transform: translateY(0);
  }

  &__icon {
    font-size: 20px;
    line-height: 1;
  }
}

.ui-backtop-fade-enter-active,
.ui-backtop-fade-leave-active {
  transition: opacity 0.2s var(--ease-soft), transform 0.2s var(--ease-out);
}
.ui-backtop-fade-enter-from,
.ui-backtop-fade-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
</style>
