<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import { computed, onMounted, reactive, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type AdminUserRow = any;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminUserRow[]>([]);
const roleOptions = ["USER", "ADMIN"];

const createOpen = ref(false);
const editOpen = ref(false);
const roleOpen = ref(false);
const deleteOpen = ref(false);
const selectedRow = ref<AdminUserRow | null>(null);

const createForm = reactive({
  email: "",
  username: "",
  password: "",
  role: "USER",
  planId: "",
});

const editForm = reactive({
  id: "",
  email: "",
  username: "",
  password: "",
  role: "USER",
  planId: "",
});

const roleForm = reactive({
  id: "",
  role: "USER",
});

const canCreate = computed(() => createForm.email.trim() && createForm.password.trim() && createForm.role.trim());
const canUpdate = computed(() => editForm.id.trim() && editForm.email.trim() && editForm.role.trim());
const canUpdateRole = computed(() => roleForm.id.trim() && roleForm.role.trim());

const normalizeOptional = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const resetCreateForm = () => {
  createForm.email = "";
  createForm.username = "";
  createForm.password = "";
  createForm.role = "USER";
  createForm.planId = "";
};

const closeDialogs = () => {
  createOpen.value = false;
  editOpen.value = false;
  roleOpen.value = false;
  deleteOpen.value = false;
  selectedRow.value = null;
  actionError.value = null;
};

const loadUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminUsers({ page: 1, limit: 20 });
    rows.value = response.users ?? [];
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin users";
  } finally {
    loading.value = false;
  }
};

const openEditDialog = (row: AdminUserRow) => {
  selectedRow.value = row;
  actionError.value = null;
  editForm.id = row.id || "";
  editForm.email = row.email || "";
  editForm.username = row.username || "";
  editForm.password = "";
  editForm.role = row.role || "USER";
  editForm.planId = row.planId || "";
  editOpen.value = true;
};

const openRoleDialog = (row: AdminUserRow) => {
  selectedRow.value = row;
  actionError.value = null;
  roleForm.id = row.id || "";
  roleForm.role = row.role || "USER";
  roleOpen.value = true;
};

const openDeleteDialog = (row: AdminUserRow) => {
  selectedRow.value = row;
  actionError.value = null;
  deleteOpen.value = true;
};

const submitCreate = async () => {
  if (!canCreate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.createAdminUser({
      email: createForm.email.trim(),
      username: normalizeOptional(createForm.username),
      password: createForm.password,
      role: createForm.role,
      planId: normalizeOptional(createForm.planId),
    });
    resetCreateForm();
    createOpen.value = false;
    await loadUsers();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to create user";
  } finally {
    submitting.value = false;
  }
};

const submitEdit = async () => {
  if (!canUpdate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.updateAdminUser({
      id: editForm.id,
      email: editForm.email.trim(),
      username: normalizeOptional(editForm.username),
      password: normalizeOptional(editForm.password),
      role: editForm.role,
      planId: normalizeOptional(editForm.planId),
    });
    editOpen.value = false;
    selectedRow.value = null;
    await loadUsers();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update user";
  } finally {
    submitting.value = false;
  }
};

const submitRole = async () => {
  if (!canUpdateRole.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.updateAdminUserRole({
      id: roleForm.id,
      role: roleForm.role,
    });
    roleOpen.value = false;
    selectedRow.value = null;
    await loadUsers();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update role";
  } finally {
    submitting.value = false;
  }
};

const submitDelete = async () => {
  if (!selectedRow.value?.id) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.deleteAdminUser({ id: selectedRow.value.id });
    deleteOpen.value = false;
    selectedRow.value = null;
    await loadUsers();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to delete user";
  } finally {
    submitting.value = false;
  }
};

onMounted(loadUsers);
</script>

<template>
  <AdminSectionShell
    title="Admin Users"
    description="User management data from admin gRPC service."
  >
    <div class="mb-4 flex justify-end">
      <AppButton size="sm" @click="actionError = null; createOpen = true">Create user</AppButton>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500">
            <th class="py-3 pr-4 font-medium">ID</th>
            <th class="py-3 pr-4 font-medium">Username</th>
            <th class="py-3 pr-4 font-medium">Email</th>
            <th class="py-3 pr-4 font-medium">Role</th>
            <th class="py-3 pr-4 font-medium">Plan</th>
            <th class="py-3 pr-4 font-medium">Videos</th>
            <th class="py-3 pr-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="border-b border-gray-100">
            <td colspan="7" class="py-6 text-center text-gray-500">Loading users...</td>
          </tr>
          <tr v-else-if="rows.length === 0" class="border-b border-gray-100">
            <td colspan="7" class="py-6 text-center text-gray-500">No users found.</td>
          </tr>
          <tr v-for="row in rows" :key="row.id" class="border-b border-gray-100 align-top">
            <td class="py-3 pr-4 text-gray-700">{{ row.id }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.username || '—' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.email }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.role || 'USER' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.planName || row.planId || '—' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.videoCount ?? 0 }}</td>
            <td class="py-3 text-right">
              <div class="flex justify-end gap-2">
                <AppButton size="sm" variant="secondary" @click="openEditDialog(row)">Edit</AppButton>
                <AppButton size="sm" variant="ghost" @click="openRoleDialog(row)">Role</AppButton>
                <AppButton size="sm" variant="danger" @click="openDeleteDialog(row)">Delete</AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="createOpen" title="Create admin user" maxWidthClass="max-w-lg" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Email</label>
          <AppInput v-model="createForm.email" placeholder="user@example.com" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Username</label>
          <AppInput v-model="createForm.username" placeholder="Optional" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Role</label>
          <select v-model="createForm.role" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Password</label>
          <AppInput v-model="createForm.password" type="password" placeholder="Minimum 6 characters" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Plan ID</label>
          <AppInput v-model="createForm.planId" placeholder="Optional" />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canCreate" @click="submitCreate">Create</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="editOpen" title="Edit user" maxWidthClass="max-w-lg" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Email</label>
          <AppInput v-model="editForm.email" placeholder="user@example.com" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Username</label>
          <AppInput v-model="editForm.username" placeholder="Optional" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Role</label>
          <select v-model="editForm.role" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Reset password</label>
          <AppInput v-model="editForm.password" type="password" placeholder="Leave blank to keep current" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Plan ID</label>
          <AppInput v-model="editForm.planId" placeholder="Optional" />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canUpdate" @click="submitEdit">Save</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="roleOpen" title="Update user role" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Role</label>
        <select v-model="roleForm.role" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
        </select>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canUpdateRole" @click="submitRole">Update role</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="deleteOpen" title="Delete user" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-gray-700">
        Delete <span class="font-medium">{{ selectedRow?.email || selectedRow?.id }}</span> and related data.
      </p>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton variant="danger" size="sm" :loading="submitting" @click="submitDelete">Delete</AppButton>
      </div>
    </template>
  </AppDialog>
</template>
