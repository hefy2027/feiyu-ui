<script setup lang="ts">
interface Props {
  name?: string
  label?: string
}

defineProps<Props>()
</script>

<template>
  <div class="ui-carousel-item" :data-name="name">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-carousel-item {
  flex: 0 0 100%;
  width: 100%;
  min-width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
}
</style>
