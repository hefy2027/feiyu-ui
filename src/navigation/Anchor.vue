<script setup lang="ts">
import { ref, computed, provide, onMounted, onUnmounted, type Ref } from 'vue'

export interface AnchorContext {
  activeHref: Ref<string>
  selectHref: (href: string) => void
  registerLink: (href: string) => void
  unregisterLink: (href: string) => void
}

interface Props {
  offsetTop?: number
  bound?: number
  container?: string | HTMLElement
}

const props = withDefaults(defineProps<Props>(), {
  offsetTop: 0,
  bound: 15,
  container: undefined
})

const emit = defineEmits<{
  change: [href: string]
}>()

const activeHref = ref('')
const registeredHrefs = ref<string[]>([])

function registerLink(href: string) {
  if (href && !registeredHrefs.value.includes(href)) {
    registeredHrefs.value.push(href)
  }
}

function unregisterLink(href: string) {
  registeredHrefs.value = registeredHrefs.value.filter((h) => h !== href)
}

function handleScroll() {
  if (registeredHrefs.value.length === 0) return
  let currentActive = ''

  for (const href of registeredHrefs.value) {
    try {
      const target = document.querySelector(href)
      if (target) {
        const top = target.getBoundingClientRect().top
        if (top <= props.offsetTop + props.bound + 10) {
          currentActive = href
        }
      }
    } catch {
      // ignore invalid selector
    }
  }

  if (currentActive && activeHref.value !== currentActive) {
    activeHref.value = currentActive
    emit('change', currentActive)
  }
}

function selectHref(href: string) {
  activeHref.value = href
  emit('change', href)
  const target = document.querySelector(href)
  if (target) {
    const top = target.getBoundingClientRect().top + window.scrollY - props.offsetTop
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

provide<AnchorContext>('fy-anchor', {
  activeHref,
  selectHref,
  registerLink,
  unregisterLink
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="fy-anchor">
    <div class="fy-anchor__rail">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-anchor {
  position: relative;
  display: flex;
  flex-direction: column;
  user-select: none;

  &__rail {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-left: 12px;
    border-left: 2px solid color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
  }
}
</style>
