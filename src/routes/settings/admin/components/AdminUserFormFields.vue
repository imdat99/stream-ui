<script setup lang="ts">
import AsyncSelect from '@/components/ui/AsyncSelect.vue';
import AdminInput from './AdminInput.vue';
import AdminSelect from './AdminSelect.vue';

defineProps<{
  mode: 'create' | 'edit';
  roleOptions: readonly string[];
  loadPlanOptions: () => Promise<{ label: string; value: string | number }[]>;
}>();

const email = defineModel<string>('email', { default: '' });
const username = defineModel<string>('username', { default: '' });
const role = defineModel<string>('role', { default: 'USER' });
const password = defineModel<string>('password', { default: '' });
const planId = defineModel<string>('planId', { default: '' });
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <div class="space-y-2 md:col-span-2">
      <label class="text-sm font-medium text-foreground/70">Email</label>
      <AdminInput v-model="email" placeholder="user@example.com" />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground/70">Username</label>
      <AdminInput v-model="username" placeholder="Optional" />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground/70">Role</label>
      <AdminSelect v-model="role">
        <option v-for="item in roleOptions" :key="item" :value="item">{{ item }}</option>
      </AdminSelect>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground/70">
        {{ mode === 'create' ? 'Password' : 'Reset password' }}
      </label>
      <AdminInput
        v-model="password"
        type="password"
        :placeholder="mode === 'create' ? 'Minimum 6 characters' : 'Leave blank to keep current'"
      />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground/70">Plan</label>
      <AsyncSelect
        v-model="planId"
        :load-options="loadPlanOptions"
        placeholder="Select a plan"
      />
    </div>
  </div>
</template>
