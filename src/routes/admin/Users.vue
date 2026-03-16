<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type ListUsersResponse = Awaited<ReturnType<typeof rpcClient.listAdminUsers>>;
type AdminUserRow = NonNullable<ListUsersResponse["users"]>[number];

const roleOptions = ["USER", "ADMIN"] as const;
const roleFilterOptions = ["", ...roleOptions] as const;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminUserRow[]>([]);
const total = ref(0);
const limit = ref(12);
const page = ref(1);
const selectedRow = ref<AdminUserRow | null>(null);
const search = ref("");
const appliedSearch = ref("");
const roleFilter = ref<(typeof roleFilterOptions)[number]>("");

const createOpen = ref(false);
const editOpen = ref(false);
const roleOpen = ref(false);
const deleteOpen = ref(false);

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
const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / limit.value)));
const selectedMeta = computed(() => {
  if (!selectedRow.value) return [];
  return [
    { label: "Role", value: selectedRow.value.role || "USER" },
    { label: "Plan", value: selectedRow.value.planName || selectedRow.value.planId || "Free" },
    { label: "Videos", value: String(selectedRow.value.videoCount ?? 0) },
    { label: "Wallet", value: String(selectedRow.value.walletBalance ?? 0) },
    { label: "Created", value: formatDate(selectedRow.value.createdAt) },
  ];
});

const summary = computed(() => {
  const adminCount = rows.value.filter((row) => String(row.role || "").toUpperCase() === "ADMIN").length;
  return [
    { label: "Visible users", value: rows.value.length },
    { label: "Admin accounts", value: adminCount },
    { label: "Selected page", value: page.value },
    { label: "Total records", value: total.value },
  ];
});

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
  actionError.value = null;
};

const syncSelectedRow = () => {
  if (!selectedRow.value?.id) return;
  const fresh = rows.value.find((row) => row.id === selectedRow.value?.id);
  if (fresh) selectedRow.value = fresh;
};

const loadUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminUsers({
      page: page.value,
      limit: limit.value,
      search: appliedSearch.value.trim() || undefined,
      role: roleFilter.value || undefined,
    });
    rows.value = response.users ?? [];
    total.value = response.total ?? rows.value.length;
    limit.value = response.limit ?? limit.value;
    page.value = response.page ?? page.value;
    syncSelectedRow();
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin users";
  } finally {
    loading.value = false;
  }
};

const applyFilters = async () => {
  page.value = 1;
  appliedSearch.value = search.value;
  await loadUsers();
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
    if (page.value > 1 && rows.value.length === 1) page.value -= 1;
    await loadUsers();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to delete user";
  } finally {
    submitting.value = false;
  }
};

const previousPage = async () => {
  if (page.value <= 1) return;
  page.value -= 1;
  await loadUsers();
};

const nextPage = async () => {
  if (page.value >= totalPages.value) return;
  page.value += 1;
  await loadUsers();
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const roleBadgeClass = (role?: string) => {
  const normalized = String(role || "USER").toUpperCase();
  if (normalized === "ADMIN") return "border-sky-200 bg-sky-50 text-sky-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
};

watch(roleFilter, async () => {
  page.value = 1;
  await loadUsers();
});

onMounted(loadUsers);
</script>

<template>
  <AdminSectionShell
    title="Admin Users"
    description="Manage account lifecycle, plan assignments and moderation from the current admin RPC contract."
    eyebrow="Identity"
    :badge="`${total} total users`"
  >
    <template #toolbar>
      <AppButton size="sm" variant="secondary" @click="loadUsers">Refresh</AppButton>
      <AppButton size="sm" @click="actionError = null; createOpen = true">Create user</AppButton>
    </template>

    <template #stats>
      <div
        v-for="item in summary"
        :key="item.label"
        class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
      >
        <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{{ item.label }}</div>
        <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ item.value }}</div>
      </div>
    </template>

    <template #aside>
      <div class="space-y-5">
        <div>
          <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Selected user</div>
          <div v-if="selectedRow" class="mt-3 space-y-4">
            <div>
              <div class="text-lg font-semibold text-white">{{ selectedRow.email }}</div>
              <div class="mt-1 text-sm text-slate-400">{{ selectedRow.username ? `@${selectedRow.username}` : selectedRow.id }}</div>
            </div>
            <div class="grid gap-3">
              <div v-for="item in selectedMeta" :key="item.label" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">{{ item.label }}</div>
                <div class="mt-1 text-sm font-medium text-white">{{ item.value }}</div>
              </div>
            </div>
            <div class="grid gap-2">
              <AppButton size="sm" @click="openEditDialog(selectedRow)">Edit profile</AppButton>
              <AppButton size="sm" variant="secondary" @click="openRoleDialog(selectedRow)">Change role</AppButton>
              <AppButton size="sm" variant="danger" @click="openDeleteDialog(selectedRow)">Delete user</AppButton>
            </div>
          </div>
          <div v-else class="mt-3 rounded-2xl border border-dashed border-white/15 px-4 py-5 text-sm leading-6 text-slate-400">
            Pick a row to inspect account metadata and trigger actions without leaving the list.
          </div>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] lg:min-w-[560px]">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Search</label>
            <AppInput v-model="search" placeholder="Search by email or username" @enter="applyFilters" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Role filter</label>
            <select v-model="roleFilter" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option v-for="role in roleFilterOptions" :key="role || 'all'" :value="role">{{ role || 'ALL' }}</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <AppButton size="sm" variant="ghost" @click="search = ''; appliedSearch = ''; roleFilter = ''; loadUsers()">Reset</AppButton>
          <AppButton size="sm" variant="secondary" @click="applyFilters">Apply filters</AppButton>
        </div>
      </div>

      <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-else class="overflow-hidden rounded-2xl border border-slate-200">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50/90 text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">User</th>
                <th class="px-4 py-3 font-semibold">Role</th>
                <th class="px-4 py-3 font-semibold">Plan</th>
                <th class="px-4 py-3 font-semibold">Videos</th>
                <th class="px-4 py-3 font-semibold">Created</th>
                <th class="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="border-t border-slate-200">
                <td colspan="6" class="px-4 py-10 text-center text-slate-500">Loading users...</td>
              </tr>
              <tr v-else-if="rows.length === 0" class="border-t border-slate-200">
                <td colspan="6" class="px-4 py-10 text-center text-slate-500">No users matched the current filters.</td>
              </tr>
              <tr
                v-for="row in rows"
                :key="row.id"
                class="border-t border-slate-200 transition-colors hover:bg-slate-50/70"
                :class="selectedRow?.id === row.id ? 'bg-sky-50/60' : ''"
              >
                <td class="px-4 py-3">
                  <button class="text-left" @click="selectedRow = row">
                    <div class="font-medium text-slate-900">{{ row.email }}</div>
                    <div class="mt-1 text-xs text-slate-500">{{ row.username ? `@${row.username}` : row.id }}</div>
                  </button>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]" :class="roleBadgeClass(row.role)">
                    {{ row.role || 'USER' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-700">{{ row.planName || row.planId || 'Free' }}</td>
                <td class="px-4 py-3 text-slate-700">{{ row.videoCount ?? 0 }}</td>
                <td class="px-4 py-3 text-slate-500">{{ formatDate(row.createdAt) }}</td>
                <td class="px-4 py-3">
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

        <div class="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div class="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Page {{ page }} of {{ totalPages }} · {{ total }} records
          </div>
          <div class="flex items-center gap-2">
            <AppButton size="sm" variant="secondary" :disabled="page <= 1 || loading" @click="previousPage">Previous</AppButton>
            <AppButton size="sm" variant="secondary" :disabled="page >= totalPages || loading" @click="nextPage">Next</AppButton>
          </div>
        </div>
      </div>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="createOpen" title="Create admin user" maxWidthClass="max-w-2xl" @close="actionError = null">
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
          <select v-model="createForm.role" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
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

  <AppDialog v-model:visible="editOpen" title="Edit user" maxWidthClass="max-w-2xl" @close="actionError = null">
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
          <select v-model="editForm.role" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
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
        <select v-model="roleForm.role" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
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
