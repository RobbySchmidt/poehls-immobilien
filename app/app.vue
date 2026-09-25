<script setup lang="ts">
useHead({
  titleTemplate: (t) => (t ? `${t} · Pöhls Immobilien` : 'Pöhls Immobilien – Immobilien in Frankfurt und Rhein-Main'),
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease-out;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .page-enter-active, .page-leave-active { transition: none; }
}
</style>
