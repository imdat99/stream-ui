<script setup lang="ts">
import { client, type ModelPlan } from '@/api/client';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import { useAuthStore } from '@/stores/auth';
import { computed, onMounted, ref } from 'vue';
import CurrentPlanCard from './components/CurrentPlanCard.vue';
import EditPlanDialog from './components/EditPlanDialog.vue';
import ManageSubscriptionDialog from './components/ManageSubscriptionDialog.vue';
import PlanList from './components/PlanList.vue';
import PlanPaymentHistory from './components/PlanPaymentHistory.vue';
import UsageStatsCard from './components/UsageStatsCard.vue';

const auth = useAuthStore();
const subscribing = ref<string | null>(null);
const showManageDialog = ref(false);
const cancelling = ref(false);
const isLoading = ref(true);
const plansData = ref<any>(null);

// Mock Payment History Data
const paymentHistory = ref([
    { id: 'inv_001', date: 'Oct 24, 2025', amount: 9.99, plan: 'Basic Plan', status: 'success', invoiceId: 'INV-2025-001' },
    { id: 'inv_002', date: 'Nov 24, 2025', amount: 9.99, plan: 'Basic Plan', status: 'success', invoiceId: 'INV-2025-002' },
    { id: 'inv_003', date: 'Dec 24, 2025', amount: 19.99, plan: 'Pro Plan', status: 'failed', invoiceId: 'INV-2025-003' },
    { id: 'inv_004', date: 'Jan 24, 2026', amount: 19.99, plan: 'Pro Plan', status: 'pending', invoiceId: 'INV-2026-001' },
]);

const fetchPlans = async () => {
    isLoading.value = true;
    try {
        plansData.value = await client.plans.plansList();
    } catch (e) {
        console.error('Failed to fetch plans', e);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchPlans();
});

// Computed Usage (Mock if not in store)
const storageUsed = computed(() => auth.user?.storage_used || 0); // bytes
const storageLimit = computed(() => 10737418240); 
const uploadsUsed = ref(12);
const uploadsLimit = ref(50);

const currentPlanId = computed(() => {
    if (auth.user?.plan_id) return auth.user.plan_id;
    if (Array.isArray(plansData.value?.data?.data?.plans) && plansData.value?.data?.data?.plans.length > 0) return plansData.value.data.data.plans[0].id;
    return undefined;
}); 

const currentPlan = computed(() => {
    if (!Array.isArray(plansData.value?.data?.data?.plans)) return undefined;
    return plansData.value.data.data.plans.find((p: ModelPlan) => p.id === currentPlanId.value);
});

const showEditDialog = ref(false);
const editingPlan = ref<ModelPlan>({});
const isSaving = ref(false);

const openEditPlan = (plan: ModelPlan) => {
    editingPlan.value = { ...plan };
    showEditDialog.value = true;
};

const savePlan = async (updatedPlan: ModelPlan) => {
    isSaving.value = true;
    try {
        if (!updatedPlan.id) return;
        
        await client.request({
            path: `/plans/${updatedPlan.id}`,
            method: 'PUT',
            body: updatedPlan
        });
        
        await fetchPlans();
        showEditDialog.value = false;
        alert('Plan updated successfully');
    } catch (e: any) {
        console.error('Failed to update plan', e);
        showEditDialog.value = false;
    } finally {
        isSaving.value = false;
    }
};

const subscribe = async (plan: ModelPlan) => {
  if (!plan.id) return;
  subscribing.value = plan.id;
  try {
     await client.payments.paymentsCreate({
         amount: plan.price || 0,
         plan_id: plan.id
     });
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert('Subscription has been canceled.');
        showManageDialog.value = false;
    } catch (e) {
        alert('Failed to cancel subscription.');
    } finally {
        cancelling.value = false;
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
            <CurrentPlanCard 
                :current-plan="currentPlan" 
                @manage="showManageDialog = true" 
            />

            <UsageStatsCard 
                :storage-used="storageUsed"
                :storage-limit="storageLimit"
                :uploads-used="uploadsUsed"
                :uploads-limit="uploadsLimit"
            />
        </div>
        
        <PlanList 
            :plans="plansData?.data?.data?.plans || []"
            :is-loading="!!isLoading"
            :current-plan-id="currentPlanId"
            :subscribing-plan-id="subscribing"
            :is-admin="auth.user?.role === 'admin'"
            @subscribe="subscribe"
            @edit="openEditPlan"
        />

        <PlanPaymentHistory :history="paymentHistory" />

        <ManageSubscriptionDialog 
            v-model:visible="showManageDialog"
            :current-plan="currentPlan"
            :cancelling="cancelling"
            @cancel-subscription="cancelSubscription"
        />
    </div>

    <EditPlanDialog 
        v-model:visible="showEditDialog"
        :plan="editingPlan"
        :loading="isSaving"
        @save="savePlan"
    />
  </div>
</template>
