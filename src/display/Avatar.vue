<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'

interface Props {
  name?: string
  initials?: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  border?: boolean
  shape?: 'circle' | 'square'
  color?: string
  backgroundColor?: string
  icon?: string
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  initials: '',
  src: '',
  size: 'md',
  border: true,
  shape: 'circle',
  color: undefined,
  backgroundColor: undefined,
  icon: undefined,
  fit: 'cover'
})

const emit = defineEmits<{
  error: [event: Event]
  click: [event: MouseEvent]
}>()

const imageError = ref(false)

const displayInitials = computed(() => {
  if (props.initials) return props.initials
  if (props.name) {
    const trimmed = props.name.trim()
    if (trimmed.length <= 2) return trimmed.toUpperCase()
    return trimmed.substring(0, 2).toUpperCase()
  }
  return '?'
})

const avatarStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {}
  if (typeof props.size === 'number') {
    style.width = `${props.size}px`
    style.height = `${props.size}px`
    style.fontSize = `${Math.max(10, Math.floor(props.size * 0.38))}px`
  }
  if (props.backgroundColor) {
    style.background = props.backgroundColor
  }
  if (props.color) {
    style.color = props.color
  }
  return style
})

function handleImageError(event: Event) {
  imageError.value = true
  emit('error', event)
}

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <div
    :class="[
      'ui-avatar',
      typeof size === 'string' ? `ui-avatar--${size}` : '',
      `ui-avatar--shape-${shape}`,
      { 'ui-avatar--border': border }
    ]"
    :style="avatarStyle"
    :title="name || displayInitials"
    @click="handleClick"
  >
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="name || displayInitials"
      class="ui-avatar__img"
      :style="{ objectFit: fit }"
      @error="handleImageError"
    />
    <slot v-else-if="$slots.icon || icon" name="icon">
      <span class="material-symbols-outlined ui-avatar__icon">{{ icon }}</span>
    </slot>
    <span v-else class="ui-avatar__fallback">
      <slot>{{ displayInitials }}</slot>
    </span>
  </div>
</template>

<style scoped lang="scss">
.ui-avatar {
  flex: none;
  border-radius: var(--r-full);
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(140deg, #8b5cf6, #6366f1);
  color: #fff;
  font-weight: 800;
  user-select: none;
  position: relative;

  &--border {
    border: 2px solid color-mix(in srgb, var(--outline-variant) 40%, transparent);
  }

  &--shape-circle {
    border-radius: var(--r-full);
  }

  &--shape-square {
    border-radius: var(--r-md);
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__fallback {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    letter-spacing: -0.02em;
  }

  &__icon {
    font-size: 1.3em;
    line-height: 1;
  }

  /* Sizes */
  &--sm {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }

  &--md {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  &--lg {
    width: 42px;
    height: 42px;
    font-size: 14px;
  }

  &--xl {
    width: 52px;
    height: 52px;
    font-size: 16px;
  }
}
</style>
