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
  <div class="fy-thing">
    <div v-if="avatar || avatarText || $slots.avatar" class="fy-thing__avatar">
      <slot name="avatar">
        <img v-if="avatar" :src="avatar" class="fy-thing__avatar-img" alt="avatar" />
        <div v-else class="fy-thing__avatar-text">{{ avatarText }}</div>
      </slot>
    </div>

    <div class="fy-thing__main">
      <div v-if="title || titleExtra || $slots.header || $slots.title || $slots['header-extra'] || $slots.titleExtra" class="fy-thing__header">
        <div class="fy-thing__title">
          <slot name="header">
            <slot name="title">{{ title }}</slot>
          </slot>
        </div>
        <div v-if="titleExtra || $slots['header-extra'] || $slots.titleExtra" class="fy-thing__header-extra">
          <slot name="header-extra">
            <slot name="titleExtra">{{ titleExtra }}</slot>
          </slot>
        </div>
      </div>

      <div v-if="description || $slots.description" class="fy-thing__desc">
        <slot name="description">{{ description }}</slot>
      </div>

      <div v-if="content || $slots.default" class="fy-thing__content">
        <slot>{{ content }}</slot>
      </div>

      <div v-if="$slots.footer || $slots.action || $slots.actions || $slots.extra" class="fy-thing__footer">
        <div v-if="$slots.footer" class="fy-thing__footer-content">
          <slot name="footer" />
        </div>
        <div class="fy-thing__action">
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
.fy-thing {
  display: flex;
  gap: 14px;
  width: 100%;
  font-family: inherit;
  color: var(--fy-on-surface);

  &__avatar {
    flex-shrink: 0;
  }

  &__avatar-img {
    width: 42px;
    height: 42px;
    border-radius: var(--fy-r-md);
    object-fit: cover;
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
  }

  &__avatar-text {
    width: 42px;
    height: 42px;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-primary) 15%, transparent);
    color: var(--fy-primary);
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
    font-size: var(--fy-font-size-base);
    font-weight: 700;
    color: var(--fy-on-surface);
    letter-spacing: -0.01em;
  }

  &__header-extra {
    font-size: var(--fy-font-size-xs);
    color: var(--fy-outline);
  }

  &__desc {
    font-size: var(--fy-font-size-xs);
    color: var(--fy-on-surface-variant);
    line-height: 1.5;
  }

  &__content {
    font-size: var(--fy-font-size-sm);
    color: var(--fy-on-surface);
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
