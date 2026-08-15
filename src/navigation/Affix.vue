<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type CSSProperties } from 'vue'

interface Props {
  offsetTop?: number
  offsetBottom?: number
  zIndex?: number
  target?: string
}

const props = withDefaults(defineProps<Props>(), {
  offsetTop: undefined,
  offsetBottom: undefined,
  zIndex: 100,
  target: undefined
})

const emit = defineEmits<{
  change: [fixed: boolean]
}>()

const rootRef = ref<HTMLElement | null>(null)
const isFixed = ref(false)
let targetEl: HTMLElement | Window = window
const width = ref<number | undefined>(undefined)
const height = ref<number | undefined>(undefined)

function handleScroll() {
  if (!rootRef.value) return
  const rect = rootRef.value.getBoundingClientRect()
  width.value = rect.width
  height.value = rect.height

  let fixed = false
  if (props.offsetTop !== undefined) {
    fixed = rect.top <= props.offsetTop
  } else if (props.offsetBottom !== undefined) {
    fixed = window.innerHeight - rect.bottom <= props.offsetBottom
  }

  if (isFixed.value !== fixed) {
    isFixed.value = fixed
    emit('change', fixed)
  }
}

const fixedStyle = computed<CSSProperties>(() => {
  if (!isFixed.value) return {}
  const styles: CSSProperties = {
    position: 'fixed',
    zIndex: props.zIndex,
    width: width.value ? `${width.value}px` : undefined
  }
  if (props.offsetTop !== undefined) {
    styles.top = `${props.offsetTop}px`
  } else if (props.offsetBottom !== undefined) {
    styles.bottom = `${props.offsetBottom}px`
  }
  return styles
})

onMounted(() => {
  if (props.target) {
    const el = document.querySelector(props.target) as HTMLElement
    if (el) targetEl = el
  }
  targetEl.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  targetEl.removeEventListener('scroll', handleScroll)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleScroll)
})
</script>

<template>
  <div ref="rootRef" class="ui-affix" :style="{ height: isFixed && height ? `${height}px` : undefined }">
    <div :class="['ui-affix__content', { 'is-affixed': isFixed }]" :style="fixedStyle">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-affix {
  position: relative;

  &__content.is-affixed {
    transition: box-shadow 0.2s var(--ease-soft);
    box-shadow: var(--shadow-pop);
  }
}
</style>
