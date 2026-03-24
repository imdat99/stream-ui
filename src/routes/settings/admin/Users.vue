<script setup lang="ts">
import { client, client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/ui/AppButton.vue";
import AppDialog from "@/components/ui/AppDialog.vue";
import AdminInput from "./components/AdminInput.vue";
import AdminSelect from "./components/AdminSelect.vue";
import AdminTable from "./components/AdminTable.vue";
import AdminSectionCard from "./components/AdminSectionCard.vue";
import { type ColumnDef } from "@tanstack/vue-table";
import { computed, h, onMounted, reactive, ref, watch } from "vue";
import AdminMetricCard from "./components/AdminMetricCard.vue";
import AdminPlaceholderTable from "./components/AdminPlaceholderTable.vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";
import AdminUserFormFields from "./components/AdminUserFormFields.vue";
import { useAdminPageHeader } from "./components/useAdminPageHeader";

type ListUsersResponse = Awaited<ReturnType<typeof rpcClient.listAdminUsers>>;
type AdminUserRow = NonNullable<ListUsersResponse["users"]>[number];
type GetAdminUserResponse = Awaited<ReturnType<typeof rpcClient.getAdminUser>>;
type AdminUserDetail = NonNullable<GetAdminUserResponse["user"]>;

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
const selectedDetail = ref<AdminUserDetail | null>(null);
const search = ref("");
const appliedSearch = ref("");
const roleFilter = ref<(typeof roleFilterOptions)[number]>("");

const createOpen = ref(false);
const detailOpen = ref(false);
const editOpen = ref(false);
const roleOpen = ref(false);
const deleteOpen = ref(false);
const referralOpen = ref(false);

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

const referralForm = reactive({
  id: "",
  refUsername: "",
  clearReferrer: false,
  referralEligible: true,
  rewardPercent: "",
  clearRewardPercent: false,
});

const canCreate = computed(() => createForm.email.trim() && createForm.password.trim() && createForm.role.trim());
const canUpdate = computed(() => editForm.id.trim() && editForm.email.trim() && editForm.role.trim());
const canUpdateRole = computed(() => roleForm.id.trim() && roleForm.role.trim());
const canUpdateReferral = computed(() => referralForm.id.trim());
const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / limit.value)));
const selectedMeta = computed(() => {
  if (!selectedDetail.value?.user && !selectedRow.value) return [];
  const user = selectedDetail.value?.user || selectedRow.value;
  const referral = selectedDetail.value?.referral;
  return [
    { label: "Role", value: user?.role || "USER" },
    { label: "Plan", value: user?.planName || user?.planId || "Free" },
    { label: "Videos", value: String(user?.videoCount ?? 0) },
    { label: "Wallet", value: String(user?.walletBalance ?? 0) },
    { label: "Referrer", value: referral?.referrer?.username ? `@${referral.referrer.username}` : referral?.referrer?.email || "—" },
    { label: "Reward", value: referral?.rewardGranted ? `${referral.rewardAmount ?? 0} USD` : "Pending / none" },
    { label: "Created", value: formatDate(user?.createdAt) },
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

const planOptionsLoader = () =>
  client.listPlans().then((plans) =>
    (plans?.plans || []).map((plan) => ({ label: plan.name!, value: plan.id! })),
  );

const resetCreateForm = () => {
  createForm.email = "";
  createForm.username = "";
  createForm.password = "";
  createForm.role = "USER";
  createForm.planId = "";
};

const closeDialogs = () => {
  createOpen.value = false;
  detailOpen.value = false;
  editOpen.value = false;
  roleOpen.value = false;
  deleteOpen.value = false;
  actionError.value = null;
};

const syncSelectedRow = () => {
  if (!selectedRow.value?.id) return;
  const fresh = rows.value.find((row) => row.id === selectedRow.value?.id);
  if (fresh && (detailOpen.value || editOpen.value || roleOpen.value || deleteOpen.value)) selectedRow.value = fresh;
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

const loadUserDetail = async (userId: string) => {
  const response = await rpcClient.getAdminUser({ id: userId });
  selectedDetail.value = response.user ?? null;
  return selectedDetail.value;
};

const openDetailDialog = async (row: AdminUserRow) => {
  selectedRow.value = row;
  selectedDetail.value = null;
  actionError.value = null;
  detailOpen.value = true;
  try {
    await loadUserDetail(row.id || '');
  } catch (err: any) {
    actionError.value = err?.message || 'Failed to load user details';
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

const openReferralDialog = async (row: AdminUserRow) => {
  selectedRow.value = row;
  actionError.value = null;
  referralOpen.value = true;
  referralForm.id = row.id || '';
  referralForm.refUsername = '';
  referralForm.clearReferrer = false;
  referralForm.rewardPercent = '';
  referralForm.clearRewardPercent = false;
  try {
    const detail = await loadUserDetail(row.id || '');
    referralForm.referralEligible = detail?.referral?.referralEligible ?? true;
    referralForm.rewardPercent = detail?.referral?.rewardOverridePercent != null ? String(detail.referral.rewardOverridePercent) : '';
  } catch (err: any) {
    actionError.value = err?.message || 'Failed to load referral settings';
  }
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
    selectedDetail.value = null;
    if (page.value > 1 && rows.value.length === 1) page.value -= 1;
    await loadUsers();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to delete user";
  } finally {
    submitting.value = false;
  }
};

const submitReferral = async () => {
  if (!canUpdateReferral.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    const rewardPercent = referralForm.rewardPercent.trim();
    const response = await rpcClient.updateAdminUserReferralSettings({
      id: referralForm.id,
      refUsername: referralForm.clearReferrer ? undefined : normalizeOptional(referralForm.refUsername),
      clearReferrer: referralForm.clearReferrer || undefined,
      referralEligible: referralForm.referralEligible,
      referralRewardBps: referralForm.clearRewardPercent || rewardPercent === '' ? undefined : Math.round(Number(rewardPercent) * 100),
      clearReferralRewardBps: referralForm.clearRewardPercent || undefined,
    });
    selectedDetail.value = response.user ?? null;
    referralOpen.value = false;
    await loadUsers();
  } catch (err: any) {
    actionError.value = err?.message || 'Failed to update referral settings';
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
  return "border-border bg-muted/40 text-foreground/70";
};

const columns = computed<ColumnDef<AdminUserRow>[]>(() => [
  {
    id: "user",
    header: "User",
    accessorFn: (row) => row.email || row.id || "",
    cell: ({ row }) => h(
      "button",
      {
        class: "text-left",
        onClick: () => {
          openDetailDialog(row.original);
        },
      },
      [
        h("div", { class: "font-medium text-foreground" }, row.original.email || row.original.id || "—"),
        h("div", { class: "mt-1 text-xs text-foreground/60" }, row.original.username ? `@${row.original.username}` : row.original.id || "—"),
      ]
    ),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "role",
    header: "Role",
    accessorFn: (row) => row.role || "USER",
    cell: ({ row }) => h(
      "span",
      {
        class: `inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${roleBadgeClass(row.original.role)}`,
      },
      row.original.role || "USER"
    ),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "plan",
    header: "Plan",
    accessorFn: (row) => row.planName || row.planId || "Free",
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, row.original.planName || row.original.planId || "Free"),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "videos",
    header: "Videos",
    accessorFn: (row) => row.videoCount ?? 0,
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, String(row.original.videoCount ?? 0)),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "created",
    header: "Created",
    accessorFn: (row) => row.createdAt || "",
    cell: ({ row }) => h("span", { class: "text-foreground/60" }, formatDate(row.original.createdAt)),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => h("div", { class: "flex justify-end gap-2" }, [
      h(AppButton, { size: "sm", variant: "secondary", onClick: () => openEditDialog(row.original) }, { default: () => "Edit" }),
      h(AppButton, { size: "sm", variant: "ghost", onClick: () => openRoleDialog(row.original) }, { default: () => "Role" }),
      h(AppButton, { size: "sm", variant: "ghost", onClick: () => openReferralDialog(row.original) }, { default: () => "Referral" }),
      h(AppButton, { size: "sm", variant: "danger", onClick: () => openDeleteDialog(row.original) }, { default: () => "Delete" }),
    ]),
    meta: {
      headerClass: "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3 text-right",
    },
  },
]);

watch(roleFilter, async () => {
  page.value = 1;
  await loadUsers();
});

useAdminPageHeader(() => ({
  eyebrow: 'Access',
  badge: loading.value ? 'Syncing user directory' : `${total.value} records loaded`,
  actions: [
    {
      label: 'Refresh',
      variant: 'secondary',
      loading: loading.value,
      onClick: loadUsers,
    },
    {
      label: 'Create user',
      onClick: () => {
        actionError.value = null;
        createOpen.value = true;
      },
    },
  ],
}));

onMounted(loadUsers);
</script>

<template>
  <AdminSectionShell>

    <template #stats>
      <AdminMetricCard
        v-for="item in summary"
        :key="item.label"
        :label="item.label"
        :value="item.value"
      />
    </template>

    <div class="space-y-4">
      <AdminSectionCard title="Filters" description="Find users by email, username or role." bodyClass="p-5">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] lg:min-w-[560px]">
            <div class="space-y-2">
              <label class="text-xs font-medium text-foreground/60">Search</label>
              <AdminInput v-model="search" placeholder="Search by email or username" @enter="applyFilters" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-medium text-foreground/60">Role filter</label>
              <AdminSelect v-model="roleFilter">
                <option v-for="role in roleFilterOptions" :key="role || 'all'" :value="role">{{ role || 'ALL' }}</option>
              </AdminSelect>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <AppButton size="sm" variant="ghost" @click="search = ''; appliedSearch = ''; roleFilter = ''; loadUsers()">Reset</AppButton>
            <AppButton size="sm" variant="secondary" @click="applyFilters">Apply filters</AppButton>
          </div>
        </div>
      </AdminSectionCard>

      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <AdminSectionCard v-else title="Users" :description="`${total} records across ${totalPages} pages.`" bodyClass="">
        <AdminPlaceholderTable v-if="loading" :columns="['User', 'Role', 'Plan', 'Videos', 'Created', 'Actions']" :rows="limit" />

        <template v-else>
          <AdminTable
            :data="rows"
            :columns="columns"
            :get-row-id="(row) => row.id || row.email || ''"
            wrapperClass="border-x-0 border-t-0 rounded-none bg-transparent"
            tableClass="w-full"
            headerRowClass="bg-muted/30"
            bodyRowClass="border-b border-border hover:bg-muted/30"
          >
            <template #empty>
              <div class="px-6 py-12 text-center">
                <p class="mb-1 text-sm text-foreground/60">No users matched the current filters.</p>
                <p class="text-xs text-foreground/40">Try clearing the search term or switching the selected role.</p>
              </div>
            </template>
          </AdminTable>

          <div class="flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div class="text-xs text-foreground/55">
              Page {{ page }} of {{ totalPages }} · {{ total }} records
            </div>
            <div class="flex items-center gap-2">
              <AppButton size="sm" variant="secondary" :disabled="page <= 1 || loading" @click="previousPage">Previous</AppButton>
              <AppButton size="sm" variant="secondary" :disabled="page >= totalPages || loading" @click="nextPage">Next</AppButton>
            </div>
          </div>
        </template>
      </AdminSectionCard>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="createOpen" title="Create admin user" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <AdminUserFormFields
        mode="create"
        v-model:email="createForm.email"
        v-model:username="createForm.username"
        v-model:role="createForm.role"
        v-model:password="createForm.password"
        v-model:plan-id="createForm.planId"
        :role-options="roleOptions"
        :load-plan-options="planOptionsLoader"
      />
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canCreate" @click="submitCreate">Create</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="detailOpen" title="User details" maxWidthClass="max-w-lg" @close="actionError = null">
    <div v-if="selectedRow" class="space-y-4">
      <div>
        <div class="text-lg font-semibold text-foreground">{{ selectedRow.email }}</div>
        <div class="mt-1 text-sm text-foreground/60">{{ selectedRow.username ? `@${selectedRow.username}` : 'No username' }}</div>
      </div>

      <div class="grid gap-3">
        <div v-for="item in selectedMeta" :key="item.label" class="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div class="text-[11px] font-medium text-foreground/55">{{ item.label }}</div>
          <div class="mt-1 text-sm font-medium text-foreground">{{ item.value }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" @click="detailOpen = false">Close</AppButton>
        <AppButton size="sm" @click="detailOpen = false; selectedRow && openReferralDialog(selectedRow)">Referral</AppButton>
        <AppButton size="sm" @click="detailOpen = false; selectedRow && openEditDialog(selectedRow)">Edit</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="editOpen" title="Edit user" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <AdminUserFormFields
        mode="edit"
        v-model:email="editForm.email"
        v-model:username="editForm.username"
        v-model:role="editForm.role"
        v-model:password="editForm.password"
        v-model:plan-id="editForm.planId"
        :role-options="roleOptions"
        :load-plan-options="planOptionsLoader"
      />
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
        <label class="text-sm font-medium text-foreground/70">Role</label>
        <AdminSelect v-model="roleForm.role">
          <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
        </AdminSelect>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canUpdateRole" @click="submitRole">Update role</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="referralOpen" title="Referral settings" maxWidthClass="max-w-lg" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground/70">Referrer username</label>
        <AdminInput v-model="referralForm.refUsername" placeholder="alice" :disabled="referralForm.clearReferrer" />
      </div>
      <label class="flex items-center gap-2 text-sm text-foreground/70">
        <input v-model="referralForm.clearReferrer" type="checkbox" />
        Clear current referrer
      </label>
      <label class="flex items-center gap-2 text-sm text-foreground/70">
        <input v-model="referralForm.referralEligible" type="checkbox" />
        Referral eligible
      </label>
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground/70">Reward override percent</label>
        <AdminInput v-model="referralForm.rewardPercent" placeholder="5" :disabled="referralForm.clearRewardPercent" />
      </div>
      <label class="flex items-center gap-2 text-sm text-foreground/70">
        <input v-model="referralForm.clearRewardPercent" type="checkbox" />
        Clear reward override
      </label>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canUpdateReferral" @click="submitReferral">Save referral</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="deleteOpen" title="Delete user" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-foreground/70">
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
