<script setup lang="ts">
import { ArrowUp } from '@lucide/vue'

// "Back to top" bottom right, appears after scrolling roughly one screen down.
const { t } = useI18n()
const route = useRoute()
const getRouteBaseName = useRouteBaseName()
const visible = ref(false)
// available listings have a fixed contact bar at the bottom below lg – sit above it
const aboveBar = computed(() => getRouteBaseName(route) === 'angebote-slug')

const update = () => { visible.value = window.scrollY > window.innerHeight * 0.8 }
onMounted(() => {
  update()
  window.addEventListener('scroll', update, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', update))
</script>

<template>
  <Button
    variant="outline"
    size="icon-pill"
    class="fixed right-4 z-30 bg-background/90 shadow-md backdrop-blur-sm transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none md:right-6"
    :class="[
      aboveBar ? 'bottom-24 lg:bottom-6' : 'bottom-4 md:bottom-6',
      visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
    ]"
    :aria-label="t('common.toTop')"
    :aria-hidden="!visible"
    :tabindex="visible ? 0 : -1"
    @click="scrollToTop"
  >
    <ArrowUp class="size-5" aria-hidden="true" />
  </Button>
</template>
