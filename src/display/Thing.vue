<script setup lang="ts">
interface Props {
  title?: string
  titleExtra?: string
  description?: string
  content?: string
  avatar?: string
  avatarText?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  titleExtra: '',
  description: '',
  content: '',
  avatar: '',
  avatarText: ''
})
</script>

<template>
  <div class="ui-thing">
    <div v-if="avatar || avatarText || $slots.avatar" class="ui-thing__avatar">
      <slot name="avatar">
        <img v-if="avatar" :src="avatar" class="ui-thing__avatar-img" alt="avatar" />
        <div v-else class="ui-thing__avatar-text">{{ avatarText }}</div>
      </slot>
    </div>

    <div class="ui-thing__main">
      <div v-if="title || titleExtra || $slots.header || $slots.title || $slots['header-extra'] || $slots.titleExtra" class="ui-thing__header">
        <div class="ui-thing__title">
          <slot name="header">
            <slot name="title">{{ title }}</slot>
          </slot>
        </div>
        <div v-if="titleExtra || $slots['header-extra'] || $slots.titleExtra" class="ui-thing__header-extra">
          <slot name="header-extra">
            <slot name="titleExtra">{{ titleExtra }}</slot>
          </slot>
        </div>
      </div>

      <div v-if="description || $slots.description" class="ui-thing__desc">
        <slot name="description">{{ description }}</slot>
      </div>

      <div v-if="content || $slots.default" class="ui-thing__content">
        <slot>{{ content }}</slot>
      </div>

      <div v-if="$slots.footer || $slots.action || $slots.actions || $slots.extra" class="ui-thing__footer">
        <div v-if="$slots.footer" class="ui-thing__footer-content">
          <slot name="footer" />
        </div>
        <div class="ui-thing__action">
          <slot name="action">
            <slot name="actions">
              <slot name="extra" />
            </slot>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-thing {
  display: flex;
  gap: 14px;
  width: 100%;
  font-family: inherit;
  color: var(--on-surface);

  &__avatar {
    flex-shrink: 0;
  }

  &__avatar-img {
    width: 42px;
    height: 42px;
    border-radius: var(--r-md);
    object-fit: cover;
    border: 1px solid color-mix(in srgb, var(--outline-variant) 40%, transparent);
  }

  &__avatar-text {
    width: 42px;
    height: 42px;
    border-radius: var(--r-md);
    background: color-mix(in srgb, var(--primary) 15%, transparent);
    color: var(--primary);
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__title {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: var(--on-surface);
    letter-spacing: -0.01em;
  }

  &__header-extra {
    font-size: var(--font-size-xs);
    color: var(--outline);
  }

  &__desc {
    font-size: var(--font-size-xs);
    color: var(--on-surface-variant);
    line-height: 1.5;
  }

  &__content {
    font-size: var(--font-size-sm);
    color: var(--on-surface);
    margin-top: 4px;
    line-height: 1.6;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
  }

  &__action {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
