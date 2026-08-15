<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

interface Props {
  text: string
  keyword: string | string[]
  highlightClass?: string
  highlightStyle?: CSSProperties | string
  caseSensitive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  highlightClass: '',
  highlightStyle: undefined,
  caseSensitive: false
})

interface Chunk {
  text: string
  isHighlight: boolean
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const chunks = computed<Chunk[]>(() => {
  if (!props.text) return []
  const rawKeywords = Array.isArray(props.keyword) ? props.keyword : [props.keyword]
  const validKeywords = rawKeywords.filter((k) => typeof k === 'string' && k.trim() !== '')

  if (validKeywords.length === 0) {
    return [{ text: props.text, isHighlight: false }]
  }

  const escapedKeywords = validKeywords.map(escapeRegExp).join('|')
  const flags = props.caseSensitive ? 'g' : 'gi'
  const regex = new RegExp(`(${escapedKeywords})`, flags)

  const parts = props.text.split(regex)
  return parts.filter(Boolean).map((part) => {
    const isMatch = validKeywords.some((kw) =>
      props.caseSensitive ? part === kw : part.toLowerCase() === kw.toLowerCase()
    )
    return {
      text: part,
      isHighlight: isMatch
    }
  })
})
</script>

<template>
  <span class="ui-highlight">
    <template v-for="(chunk, index) in chunks" :key="index">
      <slot v-if="chunk.isHighlight" name="highlight" :text="chunk.text" :index="index">
        <mark
          :class="['ui-highlight__mark', highlightClass]"
          :style="highlightStyle"
        >{{ chunk.text }}</mark>
      </slot>
      <span v-else>{{ chunk.text }}</span>
    </template>
  </span>
</template>

<style scoped lang="scss">
.ui-highlight {
  display: inline;
  font-family: inherit;

  &__mark {
    background: color-mix(in srgb, var(--primary) 22%, transparent);
    color: var(--primary);
    border-radius: 4px;
    padding: 1px 4px;
    margin: 0 1px;
    font-weight: 600;
    border-bottom: 1.5px solid var(--primary);
  }
}
</style>
