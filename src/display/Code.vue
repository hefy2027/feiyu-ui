<script setup lang="ts">
import { ref, computed } from 'vue'
import Tooltip from '../feedback/Tooltip.vue'

interface Props {
  code?: string
  language?: string
  showLineNumbers?: boolean
  copyable?: boolean
  wordWrap?: boolean
  inline?: boolean
  trim?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  code: '',
  language: 'typescript',
  showLineNumbers: false,
  copyable: true,
  wordWrap: false,
  inline: false,
  trim: true
})

const emit = defineEmits<{
  copy: [code: string]
}>()

const copied = ref(false)
let copyTimer: number | null = null

const codeContent = computed(() => {
  return props.trim ? props.code.trim() : props.code
})

const lines = computed(() => {
  return codeContent.value ? codeContent.value.split('\n') : []
})

async function handleCopy() {
  if (!codeContent.value) return
  try {
    await navigator.clipboard.writeText(codeContent.value)
    emit('copy', codeContent.value)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    // fallback
  }
}
</script>

<template>
  <code v-if="inline" class="fy-code-inline">
    <slot>{{ code }}</slot>
  </code>

  <div
    v-else
    :class="[
      'fy-code-block',
      { 'fy-code-block--wrap': wordWrap }
    ]"
  >
    <div class="fy-code-block__header">
      <div class="fy-code-block__lang">
        <span class="fy-code-block__dot fy-code-block__dot--red" />
        <span class="fy-code-block__dot fy-code-block__dot--yellow" />
        <span class="fy-code-block__dot fy-code-block__dot--green" />
        <span class="fy-code-block__lang-text">{{ language }}</span>
      </div>

      <div v-if="copyable" class="fy-code-block__actions">
        <Tooltip :content="copied ? '已复制！' : '复制代码'" placement="top">
          <button
            type="button"
            class="fy-code-block__copy-btn"
            aria-label="复制代码"
            @click="handleCopy"
          >
            <span class="material-symbols-outlined">
              {{ copied ? 'done' : 'content_copy' }}
            </span>
          </button>
        </Tooltip>
      </div>
    </div>

    <div class="fy-code-block__body">
      <div v-if="showLineNumbers" class="fy-code-block__lines" aria-hidden="true">
        <span v-for="(_, idx) in lines" :key="idx" class="fy-code-block__line-num">
          {{ idx + 1 }}
        </span>
      </div>
      <pre class="fy-code-block__pre"><code class="fy-code-block__code"><slot>{{ codeContent }}</slot></code></pre>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-code-inline {
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  font-size: 0.88em;
  font-weight: 600;
  color: var(--fy-primary);
  background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--fy-primary) 22%, transparent);
}

.fy-code-block {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--fy-r-lg);
  background: color-mix(in srgb, var(--fy-surface-container-highest) 75%, transparent);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
  overflow: hidden;
  margin: 8px 0;
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    background: color-mix(in srgb, var(--fy-surface-container-high) 50%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
  }

  &__lang {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    &--red { background: #ff5f56; }
    &--yellow { background: #ffbd2e; }
    &--green { background: #27c93f; }
  }

  &__lang-text {
    margin-left: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--fy-outline);
    letter-spacing: 0.05em;
  }

  &__copy-btn {
    border: none;
    background: transparent;
    color: var(--fy-outline);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--fy-surface-container-highest) 80%, transparent);
      color: var(--fy-on-surface);
    }

    .material-symbols-outlined {
      font-size: 16px;
    }
  }

  &__body {
    display: flex;
    padding: 12px 16px;
    overflow-x: auto;
  }

  &__lines {
    display: flex;
    flex-direction: column;
    padding-right: 14px;
    margin-right: 14px;
    border-right: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
    user-select: none;
  }

  &__line-num {
    font-size: 12px;
    line-height: 1.6;
    color: color-mix(in srgb, var(--fy-outline) 50%, transparent);
    text-align: right;
  }

  &__pre {
    margin: 0;
    padding: 0;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.6;
    color: var(--fy-on-surface);
  }

  &__code {
    font-family: inherit;
  }

  &--wrap &__pre {
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
