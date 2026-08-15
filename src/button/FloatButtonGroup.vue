<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import FloatButton, { type FloatButtonShape, type FloatButtonType } from './FloatButton.vue'

interface Props {
  trigger?: 'click' | 'hover'
  icon?: string
  activeIcon?: string
  type?: FloatButtonType
  shape?: FloatButtonShape
  tooltip?: string
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  trigger: 'click',
  icon: 'apps',
  activeIcon: 'close',
  type: 'primary',
  shape: 'circle',
  tooltip: '快捷操作',
  open: undefined
})

const emit = defineEmits<{
  'update:open': [val: boolean]
  change: [val: boolean]
}>()

const innerOpen = ref(false)
const isControlled = computed(() => props.open !== undefined)
const isOpen = computed({
  get: () => (isControlled.value ? Boolean(props.open) : innerOpen.value),
  set(val: boolean) {
    if (!isControlled.value) {
      innerOpen.value = val
    }
    emit('update:open', val)
    emit('change', val)
  }
})

const groupRef = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  if (props.trigger === 'click' && isOpen.value && groupRef.value && !groupRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleClickOutside)
})

function toggle() {
  isOpen.value = !isOpen.value
}

function handleMouseEnter() {
  if (props.trigger === 'hover') {
    isOpen.value = true
  }
}

function handleMouseLeave() {
  if (props.trigger === 'hover') {
    isOpen.value = false
  }
}
</script>

<template>
  <div
    ref="groupRef"
    class="ui-float-btn-group"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <Transition name="group-slide">
      <div v-show="isOpen" class="ui-float-btn-group__menu">
        <slot />
      </div>
    </Transition>

    <slot name="trigger" :open="isOpen" :toggle="toggle">
      <FloatButton
        :type="type"
        :shape="shape"
        :tooltip="tooltip"
        @click="trigger === 'click' ? toggle() : undefined"
      >
        <slot name="icon" :open="isOpen">
          <span
            class="material-symbols-outlined ui-float-btn-group__main-icon"
            :class="{ 'is-open': isOpen }"
          >
            {{ isOpen ? activeIcon : icon }}
          </span>
        </slot>
      </FloatButton>
    </slot>
  </div>
</template>

<style scoped lang="scss">
.ui-float-btn-group {
  display: inline-flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 12px;
  position: relative;

  &__menu {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 10px;
  }

  &__main-icon {
    font-size: 22px;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

    &.is-open {
      transform: rotate(90deg);
    }
  }
}

/* Transitions */
.group-slide-enter-active,
.group-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.group-slide-enter-from,
.group-slide-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.85);
}
</style>
