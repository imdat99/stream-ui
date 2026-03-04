<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AlertTriangleIcon from '@/components/icons/AlertTriangleIcon.vue';
import { useAppConfirm } from '@/composables/useAppConfirm';

const confirm = useAppConfirm();
</script>

<template>
  <AppDialog
    :visible="confirm.visible.value"
    @update:visible="(v) => !v && confirm.close()"
    :title="confirm.header.value"
    maxWidthClass="max-w-md"
  >
    <div class="flex items-start gap-3">
      <div class="w-9 h-9 rounded-md bg-warning/10 flex items-center justify-center shrink-0">
        <AlertTriangleIcon class="w-5 h-5 text-warning" />
      </div>
      <p class="text-sm text-foreground/80 leading-relaxed">
        {{ confirm.message.value }}
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton
          variant="secondary"
          size="sm"
          :disabled="confirm.loading.value"
          @click="confirm.reject"
        >
          {{ confirm.rejectLabel.value }}
        </AppButton>
        <AppButton
          variant="danger"
          size="sm"
          :loading="confirm.loading.value"
          @click="confirm.accept"
        >
          {{ confirm.acceptLabel.value }}
        </AppButton>
      </div>
    </template>
  </AppDialog>
</template>
