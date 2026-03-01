<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';
import UserIcon from '@/components/icons/UserIcon.vue';

const auth = useAuthStore();
const toast = useToast();

const props = defineProps<{
    editing: boolean;
    username: string;
    email: string;
    saving: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:username', value: string): void;
    (e: 'update:email', value: string): void;
    (e: 'start-edit'): void;
    (e: 'cancel-edit'): void;
    (e: 'save'): void;
    (e: 'change-password'): void;
}>();

const storageUsed = computed(() => auth.user?.storage_used || 0);
const storageLimit = computed(() => 10737418240);

const storagePercentage = computed(() =>
    Math.min(Math.round((storageUsed.value / storageLimit.value) * 100), 100)
);

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-foreground">Profile Information</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                Manage your personal information and account details.
            </p>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-6">
            <!-- User Avatar & Name -->
            <div class="flex items-center gap-4 pb-4 border-b border-border">
                <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserIcon class="w-8 h-8 text-primary" :filled="true" />
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-foreground">{{ auth.user?.username || 'User' }}</h3>
                    <p class="text-sm text-foreground/60">{{ auth.user?.email || '' }}</p>
                </div>
            </div>

            <!-- Form Fields -->
            <div class="grid gap-6 max-w-2xl">
                <div class="grid gap-2">
                    <label for="username" class="text-sm font-medium text-foreground">Username</label>
                    <IconField>
                        <InputIcon>
                            <UserIcon class="w-5 h-5" />
                        </InputIcon>
                        <InputText
                            id="username"
                            :model-value="username"
                            :readonly="!editing"
                            :class="['w-full', editing ? 'bg-surface' : 'bg-muted/30']"
                            @update:model-value="emit('update:username', String($event))"
                        />
                    </IconField>
                </div>
                <div class="grid gap-2">
                    <label for="email" class="text-sm font-medium text-foreground">Email Address</label>
                    <IconField>
                        <InputIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="20" height="16" x="2" y="4" rx="2"/>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                            </svg>
                        </InputIcon>
                        <InputText
                            id="email"
                            :model-value="email"
                            :readonly="!editing"
                            :class="['w-full', editing ? 'bg-surface' : 'bg-muted/30']"
                            @update:model-value="emit('update:email', $event|| '')"
                        />
                    </IconField>
                </div>
            </div>

            <!-- Storage Usage -->
            <div class="pt-4 border-t border-border">
                <div class="flex items-center gap-4 mb-3">
                    <div class="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" x2="12" y1="3" y2="15"/>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-foreground">Storage Usage</p>
                        <p class="text-xs text-foreground/60 mt-0.5">{{ formatBytes(storageUsed) }} of {{ formatBytes(storageLimit) }} used</p>
                    </div>
                    <span class="text-sm font-semibold text-foreground">{{ storagePercentage }}%</span>
                </div>
                <ProgressBar :value="storagePercentage" :showValue="false" style="height: 6px" />
            </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-muted/30 border-t border-border flex items-center gap-3">
            <template v-if="editing">
                <Button
                    label="Save Changes"
                    size="small"
                    :loading="saving"
                    @click="emit('save')"
                    class="press-animated"
                />
                <Button
                    label="Cancel"
                    size="small"
                    text
                    severity="secondary"
                    @click="emit('cancel-edit')"
                    :disabled="saving"
                    class="press-animated"
                />
            </template>
            <template v-else>
                <Button
                    label="Edit Profile"
                    size="small"
                    @click="emit('start-edit')"
                    class="press-animated"
                />
                <Button
                    label="Change Password"
                    size="small"
                    text
                    severity="secondary"
                    @click="emit('change-password')"
                    class="press-animated"
                />
            </template>
        </div>
    </div>
</template>
