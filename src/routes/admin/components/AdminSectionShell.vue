<template>
  <section class="space-y-6">
    <div v-if="$slots.stats" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <slot name="stats" />
    </div>

    <div class="min-w-0">
      <slot />
    </div>
  </section>
</template>
