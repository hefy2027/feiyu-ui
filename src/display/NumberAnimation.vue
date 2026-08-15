<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Props {
  from?: number
  to: number
  duration?: number
  precision?: number
  showSeparator?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  from: 0,
  duration: 1200,
  precision: 0,
  showSeparator: true
})

const emit = defineEmits<{
  finish: []
}>()

const displayNum = ref(props.from)

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function playAnimation() {
  const startVal = props.from
  const endVal = props.to
  const startTime = performance.now()
  const duration = props.duration

  function update(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(1, elapsed / duration)
    const currentRatio = easeOutCubic(progress)
    displayNum.value = startVal + (endVal - startVal) * currentRatio

    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      displayNum.value = endVal
      emit('finish')
    }
  }

  requestAnimationFrame(update)
}

const formattedNumber = computed(() => {
  const fixed = displayNum.value.toFixed(props.precision)
  if (!props.showSeparator) return fixed
  const [integerPart, decimalPart] = fixed.split('.')
  const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decimalPart !== undefined ? `${withCommas}.${decimalPart}` : withCommas
})

onMounted(() => {
  playAnimation()
})

watch(() => props.to, () => {
  playAnimation()
})
</script>

<template>
  <span class="ui-number-animation">
    {{ formattedNumber }}
  </span>
</template>

<style scoped lang="scss">
.ui-number-animation {
  display: inline-block;
  font-family: inherit;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
</style>
