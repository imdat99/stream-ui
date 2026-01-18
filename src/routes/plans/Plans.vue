<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Choose Your Plan</h1>
    <div v-if="loading" class="flex justify-center">
      <div class="i-svg-spinners-180-ring-with-bg text-4xl"></div>
    </div>
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="plan in plans" :key="plan.id" class="border rounded-lg p-6 shadow-md bg-white dark:bg-gray-800 flex flex-col">
        <h2 class="text-xl font-semibold mb-2">{{ plan.name }}</h2>
        <div class="text-3xl font-bold mb-4">${{ plan.price }}<span class="text-sm font-normal text-gray-500">/{{ plan.cycle }}</span></div>
        <p class="text-gray-600 dark:text-gray-300 mb-6 flex-grow">{{ plan.description }}</p>
        
        <ul class="mb-6 space-y-2">
          <li class="flex items-center">
            <span class="i-heroicons-check-circle text-green-500 mr-2"></span>
            <span>Storage: {{ formatBytes(plan.storage_limit || 0) }}</span>
          </li>
          <li class="flex items-center">
            <span class="i-heroicons-check-circle text-green-500 mr-2"></span>
            <span>Max Duration: {{ formatDuration(plan.duration_limit || 0) }}</span>
          </li>
           <li class="flex items-center">
            <span class="i-heroicons-check-circle text-green-500 mr-2"></span>
            <span>Uploads: {{ plan.upload_limit }} / day</span>
          </li>
        </ul>

        <button 
          @click="subscribe(plan)" 
          class="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors disabled:opacity-50"
          :disabled="subscribing === plan.id"
        >
          <span v-if="subscribing === plan.id" class="i-svg-spinners-180-ring-with-bg mr-2"></span>
          {{ subscribing === plan.id ? 'Processing...' : 'Subscribe' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { client, type ModelPlan } from '@/api/client';

const plans = ref<ModelPlan[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const subscribing = ref<string | null>(null);

const fetchPlans = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await client.plans.plansList();
    if (response.data && Array.isArray(response.data)) {
        plans.value = response.data;
    } else {
        // Fallback or handle unexpected structure? 
        // Based on client.ts it returns response.data as ModelPlan[] directly in the custom wrapper? 
        // Wait, client.ts says: r.data = data. So if the response matches schema, it's inside data.
        // Let's re-read client.ts.
        // plansList defined as request<ResponseResponse & { data?: ModelPlan[] }>
        // So yes, response.data which is the body, and inside that, there is a data property.
        // wait, let's check client.ts generated code again.
        
        // plansList returns Promise<HttpResponse<...>>
        // HttpResponse has .data property which IS the body.
        // The body type is ResponseResponse & { data?: ModelPlan[] }
        // So we access response.data.data
        plans.value = response.data.data || [];
    }
  } catch (err: any) {
    console.error(err);
    error.value = err.message || 'Failed to load plans';
  } finally {
    loading.value = false;
  }
};

const subscribe = async (plan: ModelPlan) => {
  if (!plan.id) return;
  subscribing.value = plan.id;
  try {
     // Mock payment for now as per plan, or call API if ready
     // client.payments.paymentsCreate({ amount: plan.price || 0, plan_id: plan.id });
     await client.payments.paymentsCreate({
         amount: plan.price || 0,
         plan_id: plan.id
     });
     alert(`Successfully subscribed to ${plan.name}`);
  } catch (err: any) {
    console.error(err);
    alert('Failed to subscribe: ' + (err.message || 'Unknown error'));
  } finally {
    subscribing.value = null;
  }
};

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds: number) => {
    return `${Math.floor(seconds / 60)} mins`;
};

onMounted(() => {
  fetchPlans();
});
</script>
