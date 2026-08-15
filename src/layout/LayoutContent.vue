<script setup lang="ts">
import { computed, type CSSProperties, type StyleValue } from 'vue'

interface Props {
  contentStyle?: StyleValue
  nativeScrollbar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  contentStyle: undefined,
  nativeScrollbar: true
})
</script>

<template>
  <main
    :class="[
      'ui-layout-content',
      { 'is-native-scrollbar': nativeScrollbar }
    ]"
    :style="contentStyle"
  >
    <slot />
  </main>
</template>

<style scoped lang="scss">
.ui-layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 0;
  min-width: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: auto;
  padding: 26px 28px 36px;
  scrollbar-width: thin;
}
</style>
