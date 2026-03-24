<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  router.replace({ name: 'settings-player-configs' });
});
</script>

<template>
  <div class="p-4 text-sm text-foreground/60">Redirecting...</div>
</template>
