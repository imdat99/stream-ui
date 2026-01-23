<script setup lang="ts">
import { client, type ModelPlan } from '@/api/client';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import useSWRV from '@/lib/swr';
import { useAuthStore } from '@/stores/auth';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import ProgressBar from 'primevue/progressbar';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import { computed, ref } from 'vue';

const auth = useAuthStore();
const plans = ref<ModelPlan[]>([]);
const error = ref<string | null>(null);
const subscribing = ref<string | null>(null);
const showManageDialog = ref(false);
const cancelling = ref(false);

// Mock Payment History Data
const paymentHistory = ref([
    { id: 'inv_001', date: 'Oct 24, 2025', amount: 9.99, plan: 'Basic Plan', status: 'success', invoiceId: 'INV-2025-001' },
    { id: 'inv_002', date: 'Nov 24, 2025', amount: 9.99, plan: 'Basic Plan', status: 'success', invoiceId: 'INV-2025-002' },
    { id: 'inv_003', date: 'Dec 24, 2025', amount: 19.99, plan: 'Pro Plan', status: 'failed', invoiceId: 'INV-2025-003' },
    { id: 'inv_004', date: 'Jan 24, 2026', amount: 19.99, plan: 'Pro Plan', status: 'pending', invoiceId: 'INV-2026-001' },
]);

// Computed Usage (Mock if not in store)
const storageUsed = computed(() => auth.user?.storage_used || 0); // bytes
// Default limit 10GB if no plan
const storageLimit = computed(() => 10737418240); 
const storagePercentage = computed(() => Math.min(Math.round((storageUsed.value / storageLimit.value) * 100), 100));

const uploadsUsed = ref(12);
const uploadsLimit = ref(50);
const uploadsPercentage = computed(() => Math.min(Math.round((uploadsUsed.value / uploadsLimit.value) * 100), 100));

const currentPlanId = computed(() => {
    if (auth.user?.plan_id) return auth.user.plan_id;
    if (Array.isArray(plans.value) && plans.value.length > 0) return plans.value[0].id; // Fallback to first plan
    return undefined;
}); 

const currentPlan = computed(() => {
    if (!Array.isArray(plans.value)) return undefined;
    return plans.value.find(p => p.id === currentPlanId.value);
});
const { isLoading } = useSWRV("plans", client.plans.plansList)
// const fetchPlans = async () => {
//   loading.value = true;
//   error.value = null;
//   try {
//     const response = await client.plans.plansList();
//     if (response.data && Array.isArray(response.data)) {
//         plans.value = response.data;
//     } else if (response.data && Array.isArray((response.data as any).data)) {
//         // Handle paginated or wrapped response
//         plans.value = (response.data as any).data;
//     } else {
//         plans.value = [];
//     }
//   } catch (err: any) {
//     console.error(err);
//     error.value = err.message || 'Failed to load plans';
//   } finally {
//     loading.value = false;
//   }
// };

const subscribe = async (plan: ModelPlan) => {
  if (!plan.id) return;
  subscribing.value = plan.id;
  try {
     await client.payments.paymentsCreate({
         amount: plan.price || 0,
         plan_id: plan.id
     });
     // Update local state mock
     // In real app, we would re-fetch user profile
     alert(`Successfully subscribed to ${plan.name}`);
     
     paymentHistory.value.unshift({
         id: `inv_${Date.now()}`,
         date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
         amount: plan.price || 0,
         plan: plan.name || 'Unknown',
         status: 'success',
         invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`
     });
  } catch (err: any) {
    console.error(err);
    alert('Failed to subscribe: ' + (err.message || 'Unknown error'));
  } finally {
    subscribing.value = null;
  }
};

const cancelSubscription = async () => {
    cancelling.value = true;
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert('Subscription has been canceled.');
        showManageDialog.value = false;
    } catch (e) {
        alert('Failed to cancel subscription.');
    } finally {
        cancelling.value = false;
    }
};

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds?: number) => {
    if (!seconds) return '0 mins';
    return `${Math.floor(seconds / 60)} mins`;
};

const isPopular = (plan: ModelPlan) => {
    return plan.name?.toLowerCase().includes('pro') || plan.name?.toLowerCase().includes('premium');
};

const isCurrentComp = (plan: ModelPlan) => {
    return plan.id === currentPlanId.value;
}

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'success':
            return 'success';
        case 'failed':
            return 'danger';
        case 'pending':
            return 'warn';
        default:
            return 'info';
    }
};
</script>

<template>
  <div class="plans-page">
    <PageHeader 
        title="Subscription" 
        description="Manage your workspace plan and usage" 
        :breadcrumbs="[
            { label: 'Dashboard', to: '/' },
            { label: 'Subscription' }
        ]" 
    />
    
    <div class="content max-w-7xl mx-auto space-y-12 pb-12">
        
        <!-- Hero Section: Current Plan & Usage -->
        <div v-if="!isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Current Plan Card -->
            <div class="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 shadow-xl">
                 <!-- Background decorations -->
                 <div class="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                 <div class="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

                 <div class="relative z-10 flex flex-col h-full justify-between">
                     <div class="flex justify-between items-start">
                         <div>
                             <h2 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Current Plan</h2>
                             <h3 class="text-4xl font-bold text-white mb-2">{{ currentPlan?.name || 'Standard Plan' }}</h3>
                             <Tag value="Active" severity="success" class="px-3" rounded></Tag>
                         </div>
                         <div class="text-right">
                             <div class="text-3xl font-bold text-white">${{ currentPlan?.price || 0 }}<span class="text-lg text-gray-400 font-normal">/mo</span></div>
                             <p class="text-gray-400 text-sm mt-1">Next billing on Feb 24, 2026</p>
                         </div>
                     </div>
                     
                     <div class="mt-8 pt-8 border-t border-gray-700/50 flex gap-4">
                         <Button label="Manage Subscription" severity="secondary" class="bg-white/10 border-white/10 text-white hover:bg-white/20" @click="showManageDialog = true" />
                     </div>
                 </div>
            </div>

            <!-- Usage Stats Card -->
            <div class="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col justify-center">
                 <h3 class="text-lg font-bold text-gray-900 mb-6">Usage Statistics</h3>
                 
                 <div class="mb-6">
                     <div class="flex justify-between text-sm mb-2">
                         <span class="text-gray-600 font-medium">Storage</span>
                         <span class="text-gray-900 font-bold">{{ storagePercentage }}%</span>
                     </div>
                     <ProgressBar :value="storagePercentage" :showValue="false" style="height: 8px" :class="storagePercentage > 90 ? 'p-progressbar-danger' : ''"></ProgressBar>
                     <p class="text-xs text-gray-500 mt-2">{{ formatBytes(storageUsed) }} of {{ formatBytes(storageLimit) }} used</p>
                 </div>

                 <div>
                     <div class="flex justify-between text-sm mb-2">
                         <span class="text-gray-600 font-medium">Monthly Uploads</span>
                         <span class="text-gray-900 font-bold">{{ uploadsPercentage }}%</span>
                     </div>
                     <ProgressBar :value="uploadsPercentage" :showValue="false" style="height: 8px"></ProgressBar>
                     <p class="text-xs text-gray-500 mt-2">{{ uploadsUsed }} of {{ uploadsLimit }} uploads</p>
                 </div>
            </div>
        </div>
        
        <!-- Upgrade Section -->
        <section>
            <div class="flex items-center justify-between mb-8">
                 <h2 class="text-2xl font-bold text-gray-900">Upgrade your workspace</h2>
            </div>
            
             <!-- Loading State -->
             <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div v-for="i in 3" :key="i" class="h-full">
                    <Skeleton height="300px" borderRadius="16px"></Skeleton>
                </div>
             </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                 <div v-for="plan in plans" :key="plan.id" class="relative group h-full">
                     <div v-if="isPopular(plan) && !isCurrentComp(plan)" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md uppercase tracking-wide">
                        Recommended
                     </div>

                     <div :class="[
                        'relative bg-white rounded-2xl p-6 h-full border transition-all duration-200 flex flex-col',
                        isCurrentComp(plan) ? 'border-primary ring-1 ring-primary/50 bg-primary-50/10' : 'border-gray-200 hover:border-gray-300 hover:shadow-lg',
                        isPopular(plan) && !isCurrentComp(plan) ? 'shadow-md border-primary/20' : ''
                     ]">
                        <div class="mb-4">
                            <h3 class="text-xl font-bold text-gray-900">{{ plan.name }}</h3>
                            <p class="text-gray-500 text-sm min-h-[2.5rem] mt-2">{{ plan.description }}</p>
                        </div>
                        
                        <div class="mb-6">
                            <span class="text-4xl font-bold text-gray-900">${{ plan.price }}</span>
                            <span class="text-gray-500 text-sm">/{{ plan.cycle }}</span>
                        </div>

                         <ul class="space-y-3 mb-8 flex-grow">
                             <li class="flex items-center gap-3 text-sm text-gray-700">
                                <span class="i-heroicons-check-circle text-green-500 text-lg flex-shrink-0"></span>
                                {{ formatBytes(plan.storage_limit || 0) }} Storage
                            </li>
                             <li class="flex items-center gap-3 text-sm text-gray-700">
                                <span class="i-heroicons-check-circle text-green-500 text-lg flex-shrink-0"></span>
                                {{ formatDuration(plan.duration_limit) }} Max Duration
                            </li>
                             <li class="flex items-center gap-3 text-sm text-gray-700">
                                <span class="i-heroicons-check-circle text-green-500 text-lg flex-shrink-0"></span>
                                {{ plan.upload_limit }} Uploads / day
                            </li>
                        </ul>

                        <Button 
                            :label="isCurrentComp(plan) ? 'Current Plan' : (subscribing === plan.id ? 'Processing...' : 'Upgrade')" 
                            :icon="subscribing === plan.id ? 'i-svg-spinners-180-ring-with-bg' : ''"
                            class="w-full" 
                            :severity="isCurrentComp(plan) ? 'secondary' : 'primary'"
                            :outlined="isCurrentComp(plan)"
                            :disabled="!!subscribing || isCurrentComp(plan)"
                            @click="subscribe(plan)"
                        />
                     </div>
                 </div>
            </div>
        </section>

        <!-- Payment History Section -->
        <section>
             <h2 class="text-2xl font-bold mb-6 text-gray-900">Billing History</h2>
             <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                 <DataTable :value="paymentHistory" tableStyle="min-width: 50rem"
                    :pt="{
                        thead: { class: 'bg-gray-50 border-b border-gray-200' },
                        headerRow: { class: 'text-gray-500 text-xs font-semibold uppercase tracking-wider' },
                        bodyRow: { class: 'text-gray-700 hover:bg-gray-50/50' }
                    }"
                 >
                    <template #empty>
                        <div class="text-center py-8 text-gray-500">No payment history found.</div>
                    </template>
                    <Column field="date" header="Date" class="font-medium"></Column>
                    <Column field="amount" header="Amount">
                        <template #body="slotProps">
                            ${{ slotProps.data.amount }}
                        </template>
                    </Column>
                    <Column field="plan" header="Plan"></Column>
                    <Column field="status" header="Status">
                         <template #body="slotProps">
                            <Tag 
                                :value="slotProps.data.status" 
                                :severity="getStatusSeverity(slotProps.data.status)" 
                                class="capitalize px-2 py-0.5 text-xs" 
                                :rounded="true"
                            />
                        </template>
                    </Column>
                    <Column header="" style="width: 3rem">
                         <template #body>
                            <Button icon="i-heroicons-arrow-down-tray" text rounded severity="secondary" size="small" />
                         </template>
                    </Column>
                 </DataTable>
             </div>
        </section>

        <Dialog v-model:visible="showManageDialog" modal header="Manage Subscription" :style="{ width: '30rem' }">
            <div class="mb-4">
                <p class="text-gray-600 mb-4">You are currently subscribed to <span class="font-bold text-gray-900">{{ currentPlan?.name }}</span>.</p>
                <div class="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-500">Status</span>
                        <span class="text-sm font-medium text-green-600">Active</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-500">Renewal Date</span>
                        <span class="text-sm font-medium text-gray-900">Feb 24, 2026</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-500">Amount</span>
                        <span class="text-sm font-medium text-gray-900">${{ currentPlan?.price || 0 }}/mo</span>
                    </div>
                </div>
            </div>
            <p class="text-sm text-gray-600 mb-6">
                Canceling your subscription will downgrade you to the Free plan at the end of your current billing period.
            </p>
            <div class="flex justify-end gap-2">
                <Button label="Close" text severity="secondary" @click="showManageDialog = false" />
                <Button 
                    label="Cancel Subscription" 
                    severity="danger" 
                    :icon="cancelling ? 'i-svg-spinners-180-ring-with-bg' : 'i-heroicons-x-circle'" 
                    @click="cancelSubscription" 
                    :disabled="cancelling"
                />
            </div>
        </Dialog>
    </div>
  </div>
</template>
