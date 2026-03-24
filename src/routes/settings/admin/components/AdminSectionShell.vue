<template>
  <section class="space-y-4">
    <div v-if="$slots.stats" class="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
      <slot name="stats" />
    </div>

    <div class="min-w-0 space-y-4">
      <slot />
    </div>
  </section>
</template>
